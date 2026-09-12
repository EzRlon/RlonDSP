const wsUrl = process.argv[2];
const expression = process.argv[3];

if (!wsUrl || !expression) {
  console.error('usage: node dev_eval.js <wsUrl> <expression>');
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
const timeout = setTimeout(() => {
  console.error('timeout');
  process.exit(2);
}, 10000);

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    }
  }));
});

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id !== 1) return;
  clearTimeout(timeout);
  const result = message.result?.result;
  if (message.result?.exceptionDetails) {
    console.error(JSON.stringify(message.result.exceptionDetails, null, 2));
    process.exitCode = 3;
  } else if (result?.objectId) {
    console.log(JSON.stringify({ objectId: result.objectId, description: result.description }));
  } else {
    console.log(JSON.stringify(result?.value ?? result));
  }
  ws.close();
});

ws.addEventListener('error', (event) => {
  clearTimeout(timeout);
  console.error('websocket error', event.message || '');
  process.exit(4);
});
