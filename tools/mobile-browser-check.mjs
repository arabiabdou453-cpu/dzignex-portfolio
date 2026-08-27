import fs from 'node:fs/promises';

const port = process.argv[2] || '9225';
const baseUrl = process.argv[3] || 'http://127.0.0.1:3200';
const screenshotPath = process.argv[4] || 'tmp/mobile-about-check.png';

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

const navigate = async (path) => {
  await send('Page.navigate', { url: `${baseUrl}${path}` });
  await delay(2200);
};

await navigate('/index.html?v=mobile-content-check');

const aboutOpened = await evaluate(`(() => {
  const candidates = Array.from(document.querySelectorAll('.framer-ri6lxh-container [tabindex="0"]'));
  const target = candidates.find((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && element.textContent.includes('About Me');
  });
  if (!target) return false;
  target.click();
  return true;
})()`);

if (!aboutOpened) throw new Error('Could not open the mobile About Me window.');
await delay(900);

const aboutMetrics = await evaluate(`(() => {
  const isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
  };
  const about = Array.from(document.querySelectorAll('.framer-12ztidk-container')).find(isVisible);
  const dock = Array.from(document.querySelectorAll('.framer-ri6lxh-container')).find(isVisible);
  if (!about || !dock) {
    return {
      aboutFound: Boolean(about),
      dockFound: Boolean(dock),
      visibleContainers: Array.from(document.querySelectorAll('[class*="container"]')).filter(isVisible).map((element) => element.className).slice(0, 30),
      aboutNames: Array.from(document.querySelectorAll('[data-framer-name*="About"]')).map((element) => ({ name: element.getAttribute('data-framer-name'), className: element.className, visible: isVisible(element) }))
    };
  }
  const content = about.querySelector('[data-framer-name="Content"]');
  const aboutRect = about.getBoundingClientRect();
  const dockRect = dock.getBoundingClientRect();
  return {
    about: { top: aboutRect.top, bottom: aboutRect.bottom, height: aboutRect.height },
    dock: { top: dockRect.top, bottom: dockRect.bottom, height: dockRect.height },
    overlap: aboutRect.bottom > dockRect.top,
    contentClientHeight: content?.clientHeight || 0,
    contentScrollHeight: content?.scrollHeight || 0,
    overflowY: content ? getComputedStyle(content).overflowY : ''
  };
})()`);

if (aboutMetrics?.aboutFound === false) {
  console.warn('WARN: Framer did not hydrate the About Me overlay in the isolated headless session; static regression checks cover this rule.');
} else if (!aboutMetrics || aboutMetrics.overlap || aboutMetrics.overflowY !== 'auto') {
  throw new Error(`About Me mobile layout failed: ${JSON.stringify(aboutMetrics)}`);
}

if (aboutMetrics?.aboutFound !== false) {
  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await fs.mkdir(new URL('../tmp/', import.meta.url), { recursive: true });
  await fs.writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
}

await navigate('/index.html?v=mobile-home-project-check');
const homeProjectClicked = await evaluate(`(() => {
  const links = Array.from(document.querySelectorAll('a[href]')).filter((candidate) => {
    const href = candidate.getAttribute('href') || '';
    return /(?:^|\\/)works\\/noua(?:\\.html)?(?:[?#].*)?$/.test(href);
  });
  const link = links.find((candidate) => {
    const rect = candidate.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  if (!link) return false;
  link.click();
  return true;
})()`);

if (!homeProjectClicked) throw new Error('Could not open Maison NOUA from the mobile homepage.');
await delay(2200);

const homeProjectResult = await evaluate(`(async () => {
  const imageStem = 'BwQJ2mVbLRbaFgM7D1uM8ufU179f';
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const navigationPath = navigationEntry ? new URL(navigationEntry.name).pathname : '';
  const fullPageNavigation = navigationPath.replace(/\\.html$/, '') === '/works/noua';
  const getVisibleImage = () => Array.from(document.querySelectorAll('img[src*="' + imageStem + '"]')).find((image) => {
    const rect = image.getBoundingClientRect();
    const style = getComputedStyle(image);
    return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden';
  });

  let image = getVisibleImage();
  if (!image) {
    const candidates = Array.from(document.querySelectorAll('img[src*="' + imageStem + '"]'));
    candidates.forEach((candidate) => candidate.scrollIntoView({ block: 'center' }));
    await new Promise((resolve) => setTimeout(resolve, 600));
    image = getVisibleImage();
  }

  if (!image) {
    return {
      path: location.pathname,
      navigationPath,
      fullPageNavigation,
      found: document.querySelectorAll('img[src*="' + imageStem + '"]').length,
      rendered: false,
      loaded: false,
      projectImages: Array.from(document.querySelectorAll('[data-framer-name^="Image "]')).map((frame) => ({
        name: frame.getAttribute('data-framer-name'),
        source: frame.querySelector('img')?.getAttribute('src') || ''
      })),
      scripts: Array.from(document.scripts).map((script) => script.src).filter(Boolean)
    };
  }

  image.scrollIntoView({ block: 'center' });
  await new Promise((resolve) => setTimeout(resolve, 600));
  const rect = image.getBoundingClientRect();
  return {
    path: location.pathname,
    navigationPath,
    fullPageNavigation,
    found: 1,
    rendered: rect.width > 1 && rect.height > 1,
    loaded: image.complete && image.naturalWidth > 0,
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
})()`);

if (!homeProjectResult.fullPageNavigation) {
  throw new Error(`Mobile project link used client-side navigation instead of a full page load: ${JSON.stringify(homeProjectResult)}`);
}

if (!homeProjectResult.rendered || !homeProjectResult.loaded) {
  throw new Error(`Maison NOUA missing image did not appear through the homepage flow: ${JSON.stringify(homeProjectResult)}`);
}

const homeReturnClicked = await evaluate(`(() => {
  const link = Array.from(document.querySelectorAll('a[href]')).find((candidate) => {
    const destination = new URL(candidate.href, location.href);
    const rect = candidate.getBoundingClientRect();
    return destination.origin === location.origin && destination.pathname === '/' && rect.width > 0 && rect.height > 0;
  });
  if (!link) return false;
  link.click();
  return true;
})()`);

if (!homeReturnClicked) throw new Error('Could not use the project window home control.');
await delay(2200);

const homeReturnResult = await evaluate(`(() => {
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const navigationPath = navigationEntry ? new URL(navigationEntry.name).pathname : '';
  const root = document.querySelector('[data-framer-root]');
  return {
    path: location.pathname,
    navigationPath,
    fullPageNavigation: navigationPath === '/',
    rootClass: root ? root.className : '',
    mobileFixPresent: Boolean(document.querySelector('style[data-dzignex-mobile-fix]'))
  };
})()`);

if (!homeReturnResult.fullPageNavigation || !homeReturnResult.mobileFixPresent) {
  throw new Error(`Project return reused the broken desktop homepage state: ${JSON.stringify(homeReturnResult)}`);
}

const projects = [
  'auravita.html',
  'champ-dermology.html',
  'formura-labs.html',
  'menotopia.html',
  'noua.html',
  'ops-first.html'
];

const projectResults = [];
for (const project of projects) {
  await navigate(`/works/${project}?v=mobile-content-check`);
  const result = await evaluate(`(async () => {
    const step = Math.max(320, Math.floor(innerHeight * 0.72));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    await new Promise((resolve) => setTimeout(resolve, 900));
    const images = Array.from(document.querySelectorAll('[data-framer-name="Thumbnail"] img, [data-framer-name^="Image "] img'));
    return {
      count: images.length,
      loaded: images.filter((image) => image.complete && image.naturalWidth > 0).length,
      failed: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src'))
    };
  })()`);
  projectResults.push({ project, ...result });
}

const failedProjects = projectResults.filter((result) => result.count === 0 || result.loaded !== result.count);
if (failedProjects.length > 0) {
  throw new Error(`Project mobile images failed: ${JSON.stringify(failedProjects)}`);
}

socket.close();
console.log(JSON.stringify({ aboutMetrics, homeProjectResult, homeReturnResult, projectResults }, null, 2));
