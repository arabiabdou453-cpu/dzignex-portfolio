const port = process.argv[2] || '9225';
const baseUrl = process.argv[3] || 'http://127.0.0.1:3200';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === 'page' && item.url.startsWith(baseUrl))
  || targets.find((item) => item.type === 'page');

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

const setViewport = async ({ width, height, mobile }) => {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
  await send('Emulation.setTouchEmulationEnabled', {
    enabled: mobile,
    maxTouchPoints: mobile ? 5 : 1
  });
};

const navigateHome = async (label) => {
  await send('Page.navigate', { url: `${baseUrl}/index.html?v=${label}` });
  await delay(6000);
};

const clickPoint = async ({ x, y }) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};

const openNotes = async () => {
  const result = await evaluate(`(() => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const candidates = Array.from(document.querySelectorAll('.framer-ri6lxh-container [tabindex="0"]'))
      .filter(isVisible);
    const target = candidates.find((element) => element.textContent.trim() === 'Notes')
      || candidates.find((element) => element.textContent.includes('Notes'));
    if (!target) return { opened: false, labels: candidates.map((element) => element.textContent.trim()) };
    const rect = target.getBoundingClientRect();
    return {
      opened: true,
      point: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      hydrated: target.dataset.hydrated || '',
      className: target.className,
      parentClassName: target.parentElement?.className || ''
    };
  })()`);
  if (!result.opened) throw new Error(`Could not open Notes: ${JSON.stringify(result)}`);
  await clickPoint(result.point);
  await delay(1000);
};

const selectNote = async (label) => {
  const selected = await evaluate(`(() => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const exact = Array.from(document.querySelectorAll('p, [tabindex="0"]'))
      .filter(isVisible)
      .find((element) => element.textContent.trim() === ${JSON.stringify(label)});
    if (!exact) {
      return {
        clicked: false,
        labels: Array.from(document.querySelectorAll('p, [tabindex="0"]'))
          .filter(isVisible)
          .map((element) => element.textContent.trim())
          .filter(Boolean)
          .slice(0, 80),
        body: document.body.innerText.slice(0, 4000)
      };
    }
    const clickable = exact.closest('[tabindex="0"]') || exact;
    const rect = clickable.getBoundingClientRect();
    return {
      clicked: true,
      point: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    };
  })()`);
  if (!selected.clicked) throw new Error(`Could not select the ${label} note: ${JSON.stringify(selected)}`);
  await clickPoint(selected.point);
  await delay(700);
  return evaluate('document.body.innerText');
};

const canonicalExperience = [
  'Dzignex Studio',
  'Co-Founder / Creative Director',
  '2023 — Present',
  'Independent Designer',
  'Brand & Visual Designer',
  '2020 — 2023'
];

const staleExperience = [
  'Wieden+Kennedy',
  'Lead creative direction for Nike',
  'Senior Designer AKQA'
];

const canonicalAbout = [
  'I’m Amine, a Brand Designer and Creative Director from Algeria.',
  'That’s where Dzignex Studio came from.',
  'you bring the problem, we build the right team to solve it.'
];

const assertMarkers = (text, markers, label) => {
  const missing = markers.filter((marker) => !text.includes(marker));
  if (missing.length > 0) throw new Error(`${label} is missing: ${missing.join(' | ')}`);
};

const collect = async (viewport, label) => {
  await setViewport(viewport);
  await navigateHome(`notes-parity-${label}`);
  await openNotes();
  const experience = await selectNote('Experience');
  assertMarkers(experience, canonicalExperience, `${label} Experience`);
  const stale = staleExperience.filter((marker) => experience.includes(marker));
  if (stale.length > 0) throw new Error(`${label} Experience still contains stale content: ${stale.join(' | ')}`);
  const about = await selectNote('About');
  assertMarkers(about, canonicalAbout, `${label} About`);
  return { experience, about };
};

try {
  const desktop = await collect({ width: 1536, height: 864, mobile: false }, 'desktop');
  const mobile = await collect({ width: 440, height: 956, mobile: true }, 'mobile');
  const narrowMobile = await collect({ width: 344, height: 882, mobile: true }, 'narrow mobile');

  const desktopExperienceMarkers = canonicalExperience.filter((marker) => desktop.experience.includes(marker));
  const mobileExperienceMarkers = canonicalExperience.filter((marker) => mobile.experience.includes(marker));
  const narrowMobileExperienceMarkers = canonicalExperience.filter((marker) => narrowMobile.experience.includes(marker));
  if (desktopExperienceMarkers.join('\n') !== mobileExperienceMarkers.join('\n')) {
    throw new Error('Desktop and mobile Experience content do not match.');
  }
  if (desktopExperienceMarkers.join('\n') !== narrowMobileExperienceMarkers.join('\n')) {
    throw new Error('Desktop and narrow-mobile Experience content do not match.');
  }

  console.log(JSON.stringify({
    desktopExperienceMarkers,
    mobileExperienceMarkers,
    narrowMobileExperienceMarkers,
    aboutMarkers: canonicalAbout
  }, null, 2));
} finally {
  socket.close();
}
