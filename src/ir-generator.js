/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 * IR generator DSP core extracted from user-supplied "RLONMUSIC DSP-IR 1200".
 * Pure JS, no DOM dependency; runs on main thread.
 */
(function () {
'use strict';
/* =====================================================================
   RLONMUSIC DSP-IR 1200 · DSP CORE ENGINE (无 DOM 依赖，Worker/主线程共用)
   链序: IMPULSE → EQ9 → COMP → BASS → SUR3D → HP-SUR → CLARITY
         → ULTRA → TUBE → FDN → NORM → WMK → WAV
   ===================================================================== */

/* ---------------- Biquad ---------------- */
function Biquad(){
  this.b0=1;this.b1=0;this.b2=0;this.a0=1;this.a1=0;this.a2=0;
  this.x1=0;this.x2=0;this.y1=0;this.y2=0;
}
Biquad.prototype.reset=function(){ this.x1=this.x2=this.y1=this.y2=0; };
Biquad.prototype.norm=function(){ var a=this.a0; this.b0/=a;this.b1/=a;this.b2/=a;this.a1/=a;this.a2/=a; };
Biquad.prototype.peaking=function(f,q,g,fs){
  var A=Math.pow(10,g/40), w=2*Math.PI*f/fs, cw=Math.cos(w), sw=Math.sin(w), al=sw/(2*q);
  this.b0=1+al*A; this.b1=-2*cw; this.b2=1-al*A;
  this.a0=1+al/A; this.a1=-2*cw; this.a2=1-al/A; this.norm();
};
Biquad.prototype.lp2=function(f,fs){ /* Butterworth 2nd order */
  var w=2*Math.PI*f/fs, cw=Math.cos(w), sw=Math.sin(w), al=sw/Math.SQRT2;
  this.b0=(1-cw)/2; this.b1=1-cw; this.b2=(1-cw)/2;
  this.a0=1+al; this.a1=-2*cw; this.a2=1-al; this.norm();
};
Biquad.prototype.hp2=function(f,fs){
  var w=2*Math.PI*f/fs, cw=Math.cos(w), sw=Math.sin(w), al=sw/Math.SQRT2;
  this.b0=(1+cw)/2; this.b1=-(1+cw); this.b2=(1+cw)/2;
  this.a0=1+al; this.a1=-2*cw; this.a2=1-al; this.norm();
};
Biquad.prototype.onepole=function(f,fs){
  var g=1-Math.exp(-2*Math.PI*f/fs);
  this.b0=g; this.b1=0; this.b2=0; this.a0=1; this.a1=-(1-g); this.a2=0;
};
Biquad.prototype.process=function(x){
  var y=this.b0*x+this.b1*this.x1+this.b2*this.x2-this.a1*this.y1-this.a2*this.y2;
  this.x2=this.x1; this.x1=x; this.y2=this.y1; this.y1=y; return y;
};

/* ---------------- 9-Band Graphic EQ (RBJ peaking 串联) ---------------- */
var EQ_BANDS=[65,125,250,500,1000,2000,4000,8000,16700];
function GraphicEQ(fs){
  this.fs=fs; this.q=1.1; this.filts=[]; this.trim=1;
  for(var i=0;i<9;i++){ this.filts.push(new Biquad()); }
}
GraphicEQ.prototype.setGains=function(g,autoTrim){
  var i, mean=0;
  for(i=0;i<9;i++){ mean+=Math.abs(g[i]); }
  mean/=9;
  var trim=0;
  if(autoTrim){ trim=Math.max(-6,Math.min(6,-mean*0.6)); }
  this.trim=Math.pow(10,trim/20);
  for(i=0;i<9;i++){ this.filts[i].peaking(EQ_BANDS[i],this.q,g[i],this.fs); }
};
GraphicEQ.prototype.process=function(x){
  var i,v=x;
  for(i=0;i<9;i++){ v=this.filts[i].process(v); }
  return v*this.trim;
};

/* ---------------- Compressor (软拐点 + 自动补偿 + 软限幅) ---------------- */
function Compressor(){ this.env=0; }
Compressor.prototype.configure=function(p,fs){
  this.thr=p.thr; this.ratio=p.ratio; this.knee=p.knee;
  this.att=Math.exp(-1/(fs*(p.att/1000)));
  this.rel=Math.exp(-1/(fs*(p.rel/1000)));
  var makeupDb;
  if(p.autoMu){
    var gr0=(0-p.thr)*(1/p.ratio-1);
    makeupDb=Math.max(0,-gr0)+p.mu;
  } else { makeupDb=p.mu; }
  this.makeup=Math.pow(10,makeupDb/20);
  this.sc=p.sc;
};
Compressor.prototype.processBlock=function(src,dst,n){
  var i, env=this.env, thr=this.thr, ratio=this.ratio, knee=this.knee;
  var att=this.att, rel=this.rel, mu=this.makeup, sc=this.sc;
  var k2=knee/2;
  for(i=0;i<n;i++){
    var xi=src[i], lv=Math.abs(xi);
    var coef=lv>env?att:rel;
    env=coef*env+(1-coef)*lv;
    var ed=20*Math.log10(env+1e-12), gr=0;
    if(ed>thr-k2){
      if(knee>0 && ed<thr+k2){
        var t=ed-thr+k2;
        gr=(t*t)/(2*knee)*(1/ratio-1);
      } else { gr=(ed-thr)*(1/ratio-1); }
    }
    var y=xi*Math.pow(10,gr/20)*mu;
    if(sc){ y=Math.tanh(y); }
    dst[i]=y;
  }
  this.env=env;
};

/* ---------------- SuperBass (分频 + 谐波 + 包络跟踪) ---------------- */
function SuperBass(){ this.env=0; }
SuperBass.prototype.configure=function(p,fs){
  this.lp=new Biquad(); this.lp.lp2(p.xo,fs);
  this.hp=new Biquad(); this.hp.hp2(p.xo,fs);
  this.drive=p.drive; this.mode=p.mode; this.mix=p.mix; this.envTrk=p.env;
  this.att=Math.exp(-1/(fs*0.005)); this.rel=Math.exp(-1/(fs*0.12));
  this.tmpLp=new Float32Array(8192); this.tmpHp=new Float32Array(8192);
};
SuperBass.prototype.processBlock=function(src,dst,n){
  var i, env=this.env, att=this.att, rel=this.rel, drive=this.drive;
  var lp=this.lp, hp=this.hp, tmpLp=this.tmpLp, tmpHp=this.tmpHp, mix=this.mix, envTrk=this.envTrk;
  for(i=0;i<n;i++){
    var x=src[i];
    tmpLp[i]=lp.process(x); tmpHp[i]=hp.process(x);
  }
  var normL=0;
  for(i=0;i<n;i++){ var a=Math.abs(tmpLp[i]); if(a>normL){normL=a;} }
  for(i=0;i<n;i++){
    var a2=Math.abs(tmpLp[i]);
    var coef=a2>env?att:rel;
    env=coef*env+(1-coef)*a2;
    var dr=drive;
    if(envTrk){ dr=drive*(0.35+0.65*Math.min(1,env*4)); }
    var d=tmpLp[i]*dr, sh;
    if(this.mode==='natural'){ sh=Math.tanh(d); }
    else { sh=0.7*Math.tanh(d)+0.3*(d*d*(d>=0?1:-1)); }
    dst[i]=tmpHp[i]*(1-mix)+sh*mix;
  }
  if(normL>1e-6){
    var g=Math.min(1.2,0.5/normL); /* 保守电平保护 */
    for(i=0;i<n;i++){ dst[i]*=g; }
  }
  this.env=env;
};

/* ---------------- Allpass ---------------- */
function Allpass(g,d){ this.g=g; this.buf=new Float32Array(Math.max(1,d)); this.pos=0; }
Allpass.prototype.process=function(x){
  var p=this.pos, out=this.buf[p];
  var y=-x+out;
  this.buf[p]=x+out*this.g;
  this.pos=(p+1)%this.buf.length;
  return y;
};

/* ---------------- Surround3D (单声道→立体声 3D 宽幅) ---------------- */
function Surround3D(){}
Surround3D.prototype.configure=function(p,fs){
  this.delayS=Math.max(1,Math.round(p.delay/1000*fs));
  this.buf=new Float32Array(this.delayS+4); this.pos=0;
  this.ap0=new Allpass(0.31,187); this.ap1=new Allpass(0.27,311);
  this.width=p.width; this.mix=p.mix; this.apDepth=p.ap;
};
Surround3D.prototype.process=function(src,n,L,R){
  var i, dec, buf=this.buf, pos=this.pos, ds=this.delayS, w=this.width*0.007, mix=this.mix/100;
  var ap0=this.ap0, ap1=this.ap1, apDepth=this.apDepth/100;
  for(i=0;i<n;i++){
    var x=src[i];
    dec=x*(1-apDepth)+apDepth*ap1.process(ap0.process(x));
    buf[pos]=dec;
    var idx=(pos+ds)%buf.length;
    dec=buf[idx];
    pos++; if(pos>=buf.length){ pos=0; }
    var side=dec*w;
    L[i]=x*(1-mix)+(x+side)*mix;
    R[i]=x*(1-mix)+(x-side)*mix;
  }
  this.pos=pos;
};

/* ---------------- HeadphoneSurround (crossfeed / IR 卷积) ---------------- */
function HeadphoneSurround(){}
HeadphoneSurround.prototype.configure=function(p,fs){
  this.mode=p.mode; this.amt=p.amt/100; this.fs=fs;
  this.delayS=Math.max(1,Math.round(p.delay/1000*fs));
  this.bufL=new Float32Array(this.delayS+4); this.bufR=new Float32Array(this.delayS+4);
  this.posL=0; this.posR=0;
  this.lpL=new Biquad(); this.lpL.onepole(p.freq,fs);
  this.lpR=new Biquad(); this.lpR.onepole(p.freq,fs);
  /* IR 卷积核: 指数衰减扩散场 (确定性伪随机) */
  var K=128, h=new Float32Array(K), s=0x9E3779B9>>>0, i;
  for(i=1;i<K;i++){ s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0; h[i]=(s/4294967296*2-1)*Math.exp(-i/34); }
  h[0]=0.9;
  this.ir=h; this.irPos=0; this.irBufL=new Float32Array(K*2); this.irBufR=new Float32Array(K*2);
};
HeadphoneSurround.prototype.process=function(L,R,n){
  var i, amt=this.amt;
  var bufL=this.bufL, bufR=this.bufR, pL=this.posL, pR=this.posR, ds=this.delayS;
  var lpL=this.lpL, lpR=this.lpR;
  if(this.mode==='crossfeed'){
    for(i=0;i<n;i++){
      var lpR1=lpR.process(R[i]);
      bufR[pR]=lpR1;
      var idxR=(pR+ds)%bufR.length;
      var cfR=bufR[idxR]*amt*0.35;
      pR++; if(pR>=bufR.length){pR=0;}
      var lpL1=lpL.process(L[i]);
      bufL[pL]=lpL1;
      var idxL=(pL+ds)%bufL.length;
      var cfL=bufL[idxL]*amt*0.35;
      pL++; if(pL>=bufL.length){pL=0;}
      L[i]+=cfL; R[i]+=cfR;
    }
  } else {
    var ir=this.ir, K=ir.length, ibL=this.irBufL, ibR=this.irBufR, ip=this.irPos;
    for(i=0;i<n;i++){
      var tail=ip+K*2-1; if(tail>=K*2){tail-=K*2;}
      ibR[tail]=R[i]; ibL[tail]=L[i];
      var accL=0, accR=0, idx=tail, k;
      for(k=0;k<K;k++){
        accL+=ibR[idx]*ir[k];
        accR+=ibL[idx]*ir[k];
        idx--; if(idx<0){idx=K*2-1;}
      }
      ip++; if(ip>=K*2){ip=0;}
      L[i]+=accL*amt*0.5; R[i]+=accR*amt*0.5;
    }
    this.irPos=ip;
  }
  this.posL=pL; this.posR=pR;
};

/* ---------------- Clarity (动态高频补偿) ---------------- */
function Clarity(){ this.env=0; }
Clarity.prototype.configure=function(p,fs){
  this.hp=new Biquad(); this.hp.hp2(p.freq,fs);
  this.amt=Math.pow(10,p.amt/20)-1; this.thrLin=Math.pow(10,p.thr/20);
  this.att=Math.exp(-1/(fs*0.002)); this.rel=Math.exp(-1/(fs*0.08));
};
Clarity.prototype.process=function(L,R,n){
  var i, env=this.env, hp=this.hp, amt=this.amt, thr=this.thrLin;
  for(i=0;i<n;i++){
    var hb=hp.process(L[i]), a=Math.abs(hb);
    var coef=a>env?this.att:this.rel;
    env=coef*env+(1-coef)*a;
    var g=amt*Math.max(0,1-env/thr);
    L[i]+=hb*g;
    var hb2=hp.process(R[i]), a2=Math.abs(hb2);
    coef=a2>env?this.att:this.rel;
    env=coef*env+(1-coef)*a2;
    R[i]+=hb2*(amt*Math.max(0,1-env/thr));
  }
  this.env=env;
};

/* ---------------- UltrasonicFilter (4 阶 Butterworth 低通) ---------------- */
function UltrasonicFilter(){}
UltrasonicFilter.prototype.configure=function(f,fs){
  this.f0=new Biquad(); this.f0.lp2(f,fs);
  this.f1=new Biquad(); this.f1.lp2(f,fs);
};
UltrasonicFilter.prototype.process=function(L,R,n){
  var i;
  for(i=0;i<n;i++){ L[i]=this.f1.process(this.f0.process(L[i])); R[i]=this.f1.process(this.f0.process(R[i])); }
};

/* ---------------- TubeSim (双级 tanh 饱和) ---------------- */
function TubeSim(){}
TubeSim.prototype.configure=function(p,fs){
  this.drive=p.drive; this.bias=p.bias; this.mix=p.mix/100;
  this.norm=1/Math.max(1e-3,Math.tanh(this.drive+Math.abs(this.bias)*0.4));
};
TubeSim.prototype.process=function(L,R,n){
  var i, dr=this.drive, bias=this.bias, mix=this.mix, norm=this.norm;
  for(i=0;i<n;i++){
    var a=L[i], v=Math.tanh(dr*a+bias), w=Math.tanh(v*1.4+bias*0.5)*norm;
    L[i]=a*(1-mix)+w*mix;
    var b=R[i], v2=Math.tanh(dr*b+bias), w2=Math.tanh(v2*1.4+bias*0.5)*norm;
    R[i]=b*(1-mix)+w2*mix;
  }
};

/* ---------------- FDNReverb (8 通道 Householder FDN) ---------------- */
function FDNReverb(){}
FDNReverb.prototype.configure=function(p,fs){
  var base=[0.0297,0.0371,0.0411,0.0437,0.0503,0.0539,0.0587,0.0613];
  this.delays=[]; this.bufs=[]; this.poss=new Int32Array(8); this.gains=new Float32Array(8);
  this.damps=[]; var i;
  for(i=0;i<8;i++){
    var d=Math.max(8,Math.round(base[i]*p.size*fs));
    this.delays.push(d);
    this.bufs.push(new Float32Array(d));
    var g=Math.pow(10,-3*(d/fs)/p.t60);
    this.gains[i]=g;
    var dp=new Biquad(); dp.onepole(p.damp,fs); this.damps.push(dp);
  }
  this.preS=Math.max(0,Math.round(p.pre/1000*fs));
  this.preBuf=new Float32Array(this.preS+2); this.prePos=0;
  this.wet=p.wet/100;
  this.outG=0.25; this.inG=0.28;
  this.taps=new Float32Array(8); this.fb=new Float32Array(8);
};
FDNReverb.prototype.process=function(L,R,n){
  var i,k, wet=this.wet, outG=this.outG, inG=this.inG;
  var preBuf=this.preBuf, prePos=this.prePos, preS=this.preS;
  var taps=this.taps, fb=this.fb, poss=this.poss, gains=this.gains;
  var bufs=this.bufs, damps=this.damps;
  for(i=0;i<n;i++){
    /* 预延迟 (环形, 先读后写) */
    var srcL=L[i], srcR=R[i], dL=srcL, dR=srcR;
    if(preS>0){
      var r=(prePos+preS)%preBuf.length;
      dL=preBuf[r]; dR=preBuf[(r+1)%preBuf.length];
      preBuf[prePos]=srcL; preBuf[(prePos+1)%preBuf.length]=srcR;
      prePos=(prePos+2)%preBuf.length;
    }
    /* 读抽头 + 阻尼 */
    var sum=0;
    for(k=0;k<8;k++){
      var t=bufs[k][poss[k]];
      t=damps[k].process(t);
      taps[k]=t; sum+=t;
    }
    /* Householder 反馈: H = I - (2/8)·J */
    for(k=0;k<8;k++){
      fb[k]=(taps[k]-0.25*sum)*gains[k];
    }
    /* 写入 + 输入注入 */
    for(k=0;k<8;k++){
      var inj=(k<4?dL:dR)*inG;
      bufs[k][poss[k]]=fb[k]+inj;
      var np=poss[k]+1; if(np>=bufs[k].length){np=0;} poss[k]=np;
    }
    /* 输出: 偶线→L, 奇线→R */
    var oL=(taps[0]+taps[2]+taps[4]+taps[6])*outG;
    var oR=(taps[1]+taps[3]+taps[5]+taps[7])*outG;
    L[i]=srcL*(1-wet)+oL*wet;
    R[i]=srcR*(1-wet)+oR*wet;
  }
  this.prePos=prePos;
};

/* ---------------- Peak Normalize (联合峰值, -0.01 dBFS) ---------------- */
function jointPeak(L,R,n){
  var i,p=0;
  for(i=0;i<n;i++){ var a=Math.abs(L[i]),b=Math.abs(R[i]); if(a>p){p=a;} if(b>p){p=b;} }
  return p;
}
function normalizeTo(L,R,n,targetDb){
  var p=jointPeak(L,R,n);
  if(p<=0){ return -Infinity; }
  var g=Math.pow(10,targetDb/20)/p, i;
  for(i=0;i<n;i++){ L[i]*=g; R[i]*=g; }
  return 20*Math.log10(p);
}

/* ---------------- Watermark (LFSR-32 扩频 + BPSK LSB) ---------------- */
function Watermark(){}
Watermark.prototype.configure=function(msg,depth,bits){
  var bytes=[];
  for(var i=0;i<msg.length;i++){
    var c=msg.charCodeAt(i);
    if(c<128){ bytes.push(c); } else { bytes.push(c&0xff); }
  }
  if(bytes.length>30){ bytes=bytes.slice(0,30); }
  var bitsArr=[];
  function pushByte(b){ for(var k=7;k>=0;k--){ bitsArr.push((b>>k)&1); } }
  pushByte(bytes.length);
  var ck=0, j;
  for(j=0;j<bytes.length;j++){ pushByte(bytes[j]); ck^=bytes[j]; }
  pushByte(ck);
  this.bits=bitsArr;
  this.chips=[];
  var s=0x9E3779B9>>>0, bi;
  for(j=0;j<bitsArr.length;j++){
    for(bi=0;bi<64;bi++){
      s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;
      var pn=(s&1)?1:-1;
      this.chips.push((bitsArr[j]?1:-1)*pn);
    }
  }
  var lsb=Math.pow(2,1-bits);
  this.amp=lsb*depth*0.9;
};
Watermark.prototype.apply=function(L,R,n){
  var c=this.chips, cl=c.length, amp=this.amp, i;
  for(i=0;i<n;i++){
    var v=c[i%cl]*amp;
    L[i]+=v; R[i]+=v;
  }
};

/* ---------------- WAV 编码 (RIFF/WAVE + INFO/ICMT/ISFT) ---------------- */
function strBytes(s){
  var out=[];
  for(var i=0;i<s.length;i++){
    var c=s.charCodeAt(i);
    if(c<128){ out.push(c); } else if(c<2048){ out.push(192+(c>>6),128+(c&63)); }
    else { out.push(224+(c>>12),128+((c>>6)&63),128+(c&63)); }
  }
  return out;
}
function infoChunk(id,text){
  var b=strBytes(text);
  if(b.length%2){ b.push(0); }
  var out=[];
  out.push(id.charCodeAt(0),id.charCodeAt(1),id.charCodeAt(2),id.charCodeAt(3));
  out.push(b.length&255,(b.length>>8)&255,(b.length>>16)&255,(b.length>>24)&255);
  for(var i=0;i<b.length;i++){ out.push(b[i]); }
  return out;
}
function buildInfo(meta){
  var body=[73,78,70,79]; /* 'INFO' */
  body=body.concat(infoChunk('INAM',meta.name));
  body=body.concat(infoChunk('ICMT',meta.comment));
  body=body.concat(infoChunk('ISFT',meta.software));
  if(body.length%2){ body.push(0); }
  return body;
}
function encodeWav(L,R,fs,bits,meta){
  var n=L.length, ch=2, bp=bits/8, align=ch*bp, dataSize=n*align;
  var info=buildInfo(meta);
  var riffSize=36+dataSize+8+info.length;
  var buf=new ArrayBuffer(8+riffSize);
  var dv=new DataView(buf), o=0;
  function wstr(s){ for(var i=0;i<4;i++){ dv.setUint8(o++,s.charCodeAt(i)); } }
  wstr('RIFF'); dv.setUint32(o,riffSize,true); o+=4; wstr('WAVE');
  wstr('fmt '); dv.setUint32(o,16,true); o+=4;
  dv.setUint16(o,bits===32?3:1,true); o+=2;
  dv.setUint16(o,ch,true); o+=2;
  dv.setUint32(o,fs,true); o+=4;
  dv.setUint32(o,fs*align,true); o+=4;
  dv.setUint16(o,align,true); o+=2;
  dv.setUint16(o,bits,true); o+=2;
  wstr('data'); dv.setUint32(o,dataSize,true); o+=4;
  var i;
  if(bits===32){
    for(i=0;i<n;i++){ dv.setFloat32(o,L[i],true); o+=4; dv.setFloat32(o,R[i],true); o+=4; }
  } else if(bits===16){
    for(i=0;i<n;i++){
      var a=Math.max(-1,Math.min(1,L[i]))*32767, b=Math.max(-1,Math.min(1,R[i]))*32767;
      dv.setInt16(o,a<0?Math.ceil(a):Math.round(a),true); o+=2;
      dv.setInt16(o,b<0?Math.ceil(b):Math.round(b),true); o+=2;
    }
  } else { /* 24-bit */
    for(i=0;i<n;i++){
      var a2=Math.max(-1,Math.min(1,L[i]))*8388607, b2=Math.max(-1,Math.min(1,R[i]))*8388607;
      var ia=a2<0?Math.ceil(a2):Math.round(a2), ib=b2<0?Math.ceil(b2):Math.round(b2);
      dv.setUint8(o,ia&255); dv.setUint8(o+1,(ia>>8)&255); dv.setUint8(o+2,(ia>>16)&255); o+=3;
      dv.setUint8(o,ib&255); dv.setUint8(o+1,(ib>>8)&255); dv.setUint8(o+2,(ib>>16)&255); o+=3;
    }
  }
  wstr('LIST'); dv.setUint32(o,info.length,true); o+=4;
  for(i=0;i<info.length;i++){ dv.setUint8(o,info[i]); o++; }
  return buf;
}

/* ---------------- FFT + 预览 ---------------- */
function fft(re,im){
  var n=re.length, i,j;
  for(i=1,j=0;i<n;i++){
    var bit=n>>1;
    for(;j&bit;bit>>=1){ j^=bit; }
    j^=bit;
    if(i<j){ var tr=re[i]; re[i]=re[j]; re[j]=tr; var ti=im[i]; im[i]=im[j]; im[j]=ti; }
  }
  for(var len=2;len<=n;len<<=1){
    var ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang);
    for(i=0;i<n;i+=len){
      var cr=1,ci=0;
      for(j=0;j<len/2;j++){
        var uRe=re[i+j],uIm=im[i+j];
        var vRe=re[i+j+len/2]*cr-im[i+j+len/2]*ci;
        var vIm=re[i+j+len/2]*ci+im[i+j+len/2]*cr;
        re[i+j]=uRe+vRe; im[i+j]=uIm+vIm;
        re[i+j+len/2]=uRe-vRe; im[i+j+len/2]=uIm-vIm;
        var t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t;
      }
    }
  }
}
function makePreview(L,R,n,fs){
  /* 波形: 每通道 720 桶 min/max */
  var W=720, wave={l:[],r:[]};
  var step=Math.max(1,n/W), i;
  for(i=0;i<W;i++){
    var s=i*step, e=Math.min(n,s+step), mn=0,mx=0,mn2=0,mx2=0,k;
    for(k=s;k<e;k++){ var a=L[k]; if(a<mn){mn=a;} if(a>mx){mx=a;} var b=R[k]; if(b<mn2){mn2=b;} if(b>mx2){mx2=b;} }
    wave.l.push([mn,mx]); wave.r.push([mn2,mx2]);
  }
  /* 频谱: 首段 8192 窗 + Hann + log 分箱 */
  var N=8192, seg=new Float32Array(N);
  for(i=0;i<N;i++){ seg[i]=(i<n?(L[i]+R[i])*0.5:0)*(0.5-0.5*Math.cos(2*Math.PI*i/(N-1))); }
  var re=new Float32Array(N), im=new Float32Array(N);
  re.set(seg);
  fft(re,im);
  var spec=[], fMin=20, fMax=fs/2, bins=110;
  for(i=0;i<bins;i++){
    var f=fMin*Math.pow(fMax/fMin,i/(bins-1));
    var bin=Math.round(f/N*fs);
    var m2=0, k2;
    for(k2=Math.max(1,bin-1);k2<=Math.min(N/2,bin+1);k2++){ var m=re[k2]*re[k2]+im[k2]*im[k2]; if(m>m2){m2=m;} }
    var db=20*Math.log10(Math.sqrt(m2)+1e-12);
    spec.push({f:f,db:db});
  }
  return {wave:wave,spec:spec,N:N};
}

/* ---------------- 总渲染入口 ---------------- */
function renderIR(cfg,onProgress){
  var fs=cfg.sampleRate, n=Math.round(fs*cfg.length);
  var BLOCK=8192, nBlocks=Math.ceil(n/BLOCK), b, i, off, cnt;
  var total=nBlocks*2;
  function prog(done){ if(onProgress){ onProgress({done:done,total:total}); } }
  var x=new Float32Array(n);
  x[0]=cfg.impulseAmp;

  /* --- 单声道段: EQ → COMP → BASS --- */
  var eq=null, comp=null, bass=null;
  if(cfg.eq.en){ eq=new GraphicEQ(fs); eq.setGains(cfg.eq.gains,cfg.eq.autoTrim); }
  if(cfg.comp.en){ comp=new Compressor(); comp.configure(cfg.comp,fs); }
  if(cfg.bass.en){ bass=new SuperBass(); bass.configure(cfg.bass,fs); }
  var mono=new Float32Array(n);
  var tmp=new Float32Array(BLOCK), tmp2=new Float32Array(BLOCK);
  for(b=0;b<nBlocks;b++){
    off=b*BLOCK; cnt=Math.min(BLOCK,n-off);
    var src=x.subarray(off,off+cnt), dst=mono.subarray(off,off+cnt);
    for(i=0;i<cnt;i++){ dst[i]=src[i]; }
    if(eq){ for(i=0;i<cnt;i++){ dst[i]=eq.process(dst[i]); } }
    if(comp){ comp.processBlock(dst,dst,cnt); }
    if(bass){
      for(i=0;i<cnt;i++){ tmp[i]=dst[i]; }
      bass.processBlock(tmp,dst,cnt);
    }
    prog(b);
  }

  /* --- 立体声段: SUR3D → HP-SUR → CLARITY → ULTRA → TUBE → FDN --- */
  var L=new Float32Array(n), R=new Float32Array(n);
  var sur=null,hps=null,clar=null,ultra=null,tube=null,fdn=null;
  if(cfg.sur.en){ sur=new Surround3D(); sur.configure(cfg.sur,fs); }
  if(cfg.hps.en){ hps=new HeadphoneSurround(); hps.configure(cfg.hps,fs); }
  if(cfg.clar.en){ clar=new Clarity(); clar.configure(cfg.clar,fs); }
  if(cfg.ultra.en){ ultra=new UltrasonicFilter(); ultra.configure(cfg.ultra.freq,fs); }
  if(cfg.tube.en){ tube=new TubeSim(); tube.configure(cfg.tube,fs); }
  if(cfg.fdn.en){ fdn=new FDNReverb(); fdn.configure(cfg.fdn,fs); }
  for(b=0;b<nBlocks;b++){
    off=b*BLOCK; cnt=Math.min(BLOCK,n-off);
    var mSrc=mono.subarray(off,off+cnt);
    var oL=L.subarray(off,off+cnt), oR=R.subarray(off,off+cnt);
    if(sur){ sur.process(mSrc,cnt,tmp,tmp2); for(i=0;i<cnt;i++){ oL[i]=tmp[i]; oR[i]=tmp2[i]; } }
    else { for(i=0;i<cnt;i++){ oL[i]=mSrc[i]; oR[i]=mSrc[i]; } }
    if(hps){ hps.process(oL,oR,cnt); }
    if(clar){ clar.process(oL,oR,cnt); }
    if(ultra){ ultra.process(oL,oR,cnt); }
    if(tube){ tube.process(oL,oR,cnt); }
    if(fdn){ fdn.process(oL,oR,cnt); }
    prog(nBlocks+b);
  }

  /* --- 归一化 + 水印 --- */
  var peakBefore=jointPeak(L,R,n);
  var peakDb, peakInDb=20*Math.log10(peakBefore+1e-12);
  if(cfg.norm.en){ normalizeTo(L,R,n,-0.01); peakDb=20*Math.log10(jointPeak(L,R,n)+1e-12); }
  else { peakDb=peakInDb; }
  if(cfg.wmk.en){ wmApply(cfg,L,R,n); }
  var rmsSq=0;
  for(i=0;i<n;i++){ rmsSq+=L[i]*L[i]+R[i]*R[i]; }
  rmsSq/= (n*2);
  var rmsDb=10*Math.log10(rmsSq+1e-14);

  /* --- 元数据 + 编码 --- */
  var meta={ name:cfg.filename+'.wav', software:'RlonMusic DSP-IR 1200 v1.0', comment:cfg.comment };
  var wav=encodeWav(L,R,fs,cfg.bits,meta);
  var preview=makePreview(L,R,n,fs);
  prog(total);
  return { wav:wav, stats:{peakDb:peakDb,peakInDb:peakInDb,rmsDb:rmsDb,len:n,fs:fs,bits:cfg.bits}, preview:preview };
}
function wmApply(cfg,L,R,n){
  var wm=new Watermark();
  wm.configure(cfg.wmk.msg,cfg.wmk.depth,cfg.bits);
  wm.apply(L,R,n);
}
  window.IRGenerator = {
    renderIR: renderIR,
    encodeWav: encodeWav,
    DEFAULT_CONFIG: {
      sampleRate: 48000,
      length: 1.5,
      impulseAmp: 1.0,
      bits: 16,
      filename: 'rlondsp-pulse',
      comment: 'RlonDSP pulse',
      eq: { en: false, gains: [0,0,0,0,0,0,0,0,0], autoTrim: true },
      comp: { en: false, thr: -18, ratio: 3, knee: 6, att: 8, rel: 120, autoMu: true, mu: 0, sc: true },
      bass: { en: false, xo: 80, drive: 1.2, mode: 'natural', mix: 0.6, env: true },
      sur: { en: false, delay: 12, width: 1, mix: 40, ap: 30 },
      hps: { en: false, mode: 'crossfeed', amt: 50, delay: 0.8, freq: 700 },
      clar: { en: false, freq: 3000, amt: 6, thr: -30 },
      ultra: { en: false, freq: 20000 },
      tube: { en: false, drive: 1.0, bias: 0.1, mix: 30 },
      fdn: { en: true, pre: 35, size: 1, t60: 1.6, damp: 4200, wet: 40 },
      norm: { en: true },
      wmk: { en: false, msg: 'RlonDSP', depth: 1 }
    }
  };
})();
