const port = process.argv[2] || '9225';
const baseUrl = process.argv[3] || 'http://127.0.0.1:3200';
const project = process.argv[4] || 'noua.html';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === 'page');
if (!target) throw new Error('No Chrome page target is available.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const entry = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) entry.reject(new Error(message.error.message));
  else entry.resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844
});
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url: `${baseUrl}/works/${project}?v=image-loading-test` });
await delay(2200);

const initial = await evaluate(`(() => {
  const images = Array.from(document.querySelectorAll(
    '[data-framer-name="Thumbnail"] img, [data-framer-name^="Image "] img'
  ));
  return {
    count: images.length,
    eager: images.filter((image) => image.loading === 'eager').length,
    lazy: images.filter((image) => image.loading === 'lazy').length,
    loaded: images.filter((image) => image.complete && image.naturalWidth > 0).length,
    appended: images.filter((image) => image.closest('[data-dzignex-mobile-extra-media]')).map((image) => ({
      loading: image.loading,
      fetchPriority: image.fetchPriority,
      source: image.getAttribute('src'),
      sourceSet: image.getAttribute('srcset'),
      sizes: image.getAttribute('sizes')
    }))
  };
})()`);

if (initial.count < 2) throw new Error(`Project gallery was not found: ${JSON.stringify(initial)}`);
if (initial.eager !== 0) {
  throw new Error(`Below-fold project images were forced to eager loading: ${JSON.stringify(initial)}`);
}
if (initial.lazy !== initial.count) {
  throw new Error(`Project gallery images must use native lazy loading: ${JSON.stringify(initial)}`);
}
if (initial.appended.some((image) => image.loading !== 'lazy' || image.fetchPriority !== 'low')) {
  throw new Error(`Appended mobile images must stay low-priority and lazy: ${JSON.stringify(initial.appended)}`);
}
if (initial.appended.some((image) => !image.sourceSet?.includes('scale-down-to=512') || !image.sourceSet.includes('scale-down-to=1024') || !image.sizes)) {
  throw new Error(`Appended mobile images must use responsive Framer variants: ${JSON.stringify(initial.appended)}`);
}

const afterScroll = await evaluate(`(async () => {
  const step = Math.max(320, Math.floor(innerHeight * 0.72));
  for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
    scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const images = Array.from(document.querySelectorAll(
    '[data-framer-name="Thumbnail"] img, [data-framer-name^="Image "] img'
  ));
  return {
    count: images.length,
    loaded: images.filter((image) => image.complete && image.naturalWidth > 0).length,
    failed: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src'))
  };
})()`);

if (afterScroll.loaded !== afterScroll.count) {
  throw new Error(`Lazy project images did not load after scrolling: ${JSON.stringify(afterScroll)}`);
}

socket.close();
console.log(JSON.stringify({ project, initial, afterScroll }, null, 2));
