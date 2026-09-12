// RlonDSP
// Copyright © 2026 RlonDSP. All rights reserved.
//
// 安装包打包配方之一：改写可执行文件的“文件属性”信息（产品名 / 公司 / 版本 / 版权）。
// 用途：把 7-Zip 自解压外壳的属性改写为 RlonDSP，再拼装成正式安装包。
//
// 编译方式（需要 .NET Framework 自带的编译器）：
//   csc /nologo /target:exe /out:VersionPatcher.exe VersionPatcher.cs
//
// 用法：
//   VersionPatcher.exe <可执行文件路径> <版本号，如 1.0.0.0>
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

class VersionPatcher
{
    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern IntPtr BeginUpdateResource(string pFileName, bool bDeleteExistingResources);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool UpdateResource(IntPtr hUpdate, IntPtr lpType, IntPtr lpName, ushort wLanguage, byte[] lpData, uint cbData);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool EndUpdateResource(IntPtr hUpdate, bool fDiscard);

    static byte[] U16Z(string s)
    {
        return Encoding.Unicode.GetBytes(s + "\0");
    }

    static void Pad4(List<byte> b)
    {
        while ((b.Count % 4) != 0) b.Add(0);
    }

    // 组装一个标准的版本信息节点
    static byte[] Block(string key, byte[] value, int valueLength, int type, List<byte[]> children)
    {
        var b = new List<byte>();
        b.Add(0); b.Add(0);                       // wLength（稍后回填）
        b.Add(0); b.Add(0);                       // wValueLength
        b.Add(0); b.Add(0);                       // wType
        b.AddRange(U16Z(key));
        Pad4(b);
        if (value != null)
        {
            b.AddRange(value);
            Pad4(b);
        }
        if (children != null)
        {
            for (int i = 0; i < children.Count; i++) b.AddRange(children[i]);
        }
        int len = b.Count;
        b[0] = (byte)(len & 0xFF);
        b[1] = (byte)((len >> 8) & 0xFF);
        b[2] = (byte)(valueLength & 0xFF);
        b[3] = (byte)((valueLength >> 8) & 0xFF);
        b[4] = (byte)(type & 0xFF);
        b[5] = (byte)((type >> 8) & 0xFF);
        return b.ToArray();
    }

    static byte[] StringNode(string name, string value)
    {
        return Block(name, U16Z(value), value.Length + 1, 1, null);
    }

    static byte[] FixedFileInfo(string version)
    {
        string[] p = version.Split('.');
        ushort major = ushort.Parse(p[0]);
        ushort minor = ushort.Parse(p[1]);
        ushort build = ushort.Parse(p[2]);
        ushort revision = ushort.Parse(p[3]);
        var b = new List<byte>();
        b.AddRange(BitConverter.GetBytes(0xFEEF04BDu));         // dwSignature
        b.AddRange(BitConverter.GetBytes(0x00010000u));         // dwStrucVersion
        b.AddRange(BitConverter.GetBytes((uint)((major << 16) | minor)));
        b.AddRange(BitConverter.GetBytes((uint)((build << 16) | revision)));
        b.AddRange(BitConverter.GetBytes((uint)((major << 16) | minor)));
        b.AddRange(BitConverter.GetBytes((uint)((build << 16) | revision)));
        b.AddRange(BitConverter.GetBytes(0x3Fu));               // dwFileFlagsMask
        b.AddRange(BitConverter.GetBytes(0u));                  // dwFileFlags
        b.AddRange(BitConverter.GetBytes(0x40004u));            // dwFileOS = NT/Win32
        b.AddRange(BitConverter.GetBytes(1u));                  // dwFileType = APP
        b.AddRange(BitConverter.GetBytes(0u));                  // dwFileSubtype
        b.AddRange(BitConverter.GetBytes(0u));                  // dwFileDateMS
        b.AddRange(BitConverter.GetBytes(0u));                  // dwFileDateLS
        return b.ToArray();
    }

    static void Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("usage: VersionPatcher <exe> <version>");
            Environment.Exit(1);
        }

        string file = args[0];
        string version = args[1];

        var strings = new List<byte[]>();
        strings.Add(StringNode("CompanyName", "RlonDSP"));
        strings.Add(StringNode("FileDescription", "RlonDSP Setup"));
        strings.Add(StringNode("FileVersion", version));
        strings.Add(StringNode("InternalName", "RlonDSP"));
        strings.Add(StringNode("LegalCopyright", "Copyright \u00A9 2026 RlonDSP"));
        strings.Add(StringNode("OriginalFilename", "RlonDSP-" + version.Substring(0, 3) + ".0-setup-x64.exe"));
        strings.Add(StringNode("ProductName", "RlonDSP"));
        strings.Add(StringNode("ProductVersion", version));

        var stringTable = Block("040904B0", null, 0, 1, strings);
        var stringFileInfo = Block("StringFileInfo", null, 0, 1, new List<byte[]> { stringTable });

        byte[] translation = new byte[] { 0x09, 0x04, 0xB0, 0x04 };
        var varNode = Block("Translation", translation, translation.Length, 0, null);
        var varFileInfo = Block("VarFileInfo", null, 0, 1, new List<byte[]> { varNode });

        var root = Block("VS_VERSION_INFO", FixedFileInfo(version), 52, 0,
                         new List<byte[]> { stringFileInfo, varFileInfo });

        IntPtr h = BeginUpdateResource(file, false);
        if (h == IntPtr.Zero)
            throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        try
        {
            if (!UpdateResource(h, (IntPtr)16, (IntPtr)1, 0x0409, root, (uint)root.Length))
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
            if (!EndUpdateResource(h, false))
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        }
        catch
        {
            EndUpdateResource(h, true);
            throw;
        }

        Console.WriteLine("version patched: " + file);
    }
}
