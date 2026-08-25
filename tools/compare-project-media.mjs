const port = process.argv[2] || "9225";
const baseUrl = process.argv[3] || "http://127.0.0.1:3200";
const project = process.argv[4] || "noua.html";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No Chrome page target is available.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const entry = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) entry.reject(new Error(message.error.message));
  else entry.resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

await send("Page.enable");
await send("Runtime.enable");

const collect = async ({ width, height, mobile }) => {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
  await send("Page.navigate", { url: `${baseUrl}/works/${project}?v=media-compare` });
  await delay(2200);
  return evaluate(`(async () => {
    const step = Math.max(320, Math.floor(innerHeight * 0.72));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    scrollTo(0, 0);

    const ancestorNames = (element) => {
      const names = [];
      let current = element;
      while (current && current !== document.body) {
        const name = current.getAttribute?.('data-framer-name');
        if (name) names.push(name);
        current = current.parentElement;
      }
      return names;
    };

    return Array.from(document.querySelectorAll('img, video, iframe')).map((element, index) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const source = element.currentSrc || element.src || element.getAttribute('src') || '';
      return {
        index,
        tag: element.tagName,
        source: source.split('/').pop()?.split('?')[0] || source,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        rendered: rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden',
        names: ancestorNames(element)
      };
    });
  })()`);
};

const desktop = await collect({ width: 1440, height: 900, mobile: false });
const mobile = await collect({ width: 390, height: 844, mobile: true });

socket.close();
console.log(JSON.stringify({ project, desktop, mobile }, null, 2));
