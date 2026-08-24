(function () {
  'use strict';

  var desktopQuery = window.matchMedia('(min-width: 810px)');
  if (!desktopQuery.matches) return;

  var windowSelector = [
    '.framer-JaU20.framer-1vc6fcr-container',
    '.framer-JaU20.framer-12ztidk-container',
    '.framer-JaU20.framer-ha8hdj-container',
    '.framer-JaU20.framer-1j87qxc-container',
    '.framer-JaU20.framer-19sm4vm-container',
    '.framer-JaU20.framer-1yx7z7l-container',
    '.framer-JaU20.framer-1438pfl-container',
    '.framer-JaU20.framer-1d8xa48-container'
  ].join(',');

  var controlDefinitions = {
    'rgb(253, 93, 92)': { type: 'close', label: 'Close window' },
    'rgb(250, 201, 0)': { type: 'minimize', label: 'Minimize window' },
    'rgb(52, 199, 90)': { type: 'fullscreen', label: 'Enter full screen' }
  };

  var hoverPadding = 6;
  var controlHitPadding = 3;

  var aboutWindowSelector = '.framer-JaU20.framer-12ztidk-container';

  var clearMinimizedPosition = function (windowElement) {
    windowElement.style.removeProperty('--dzignex-minimized-top');
    windowElement.style.removeProperty('--dzignex-minimized-left');
    windowElement.style.removeProperty('--dzignex-minimized-width');
  };

  var getDefinition = function (element) {
    var rect = element.getBoundingClientRect();
    if (rect.width < 7 || rect.width > 30 || rect.height < 7 || rect.height > 30) return null;
    return controlDefinitions[window.getComputedStyle(element).backgroundColor] || null;
  };

  var findGroup = function (controls, windowElement) {
    var candidate = controls[0].parentElement;
    while (candidate && candidate !== windowElement) {
      if (controls.every(function (control) { return candidate.contains(control); })) return candidate;
      candidate = candidate.parentElement;
    }
    return windowElement;
  };

  var clearWindowState = function (windowElement) {
    windowElement.classList.remove(
      'dzignex-window--minimized',
      'dzignex-window--fullscreen'
    );
    clearMinimizedPosition(windowElement);
  };

  var closeWindow = function (windowElement) {
    windowElement.classList.remove('dzignex-window--minimized', 'dzignex-window--fullscreen');
    windowElement.classList.add('dzignex-window-is-closed');
  };

  var toggleMinimize = function (windowElement) {
    windowElement.classList.remove('dzignex-window--fullscreen');
    var willMinimize = !windowElement.classList.contains('dzignex-window--minimized');

    if (willMinimize && windowElement.matches(aboutWindowSelector)) {
      var rect = windowElement.getBoundingClientRect();
      windowElement.style.setProperty('--dzignex-minimized-top', rect.top + 'px');
      windowElement.style.setProperty('--dzignex-minimized-left', rect.left + 'px');
      windowElement.style.setProperty('--dzignex-minimized-width', rect.width + 'px');
    }

    windowElement.classList.toggle('dzignex-window--minimized', willMinimize);
    if (!willMinimize) clearMinimizedPosition(windowElement);
  };

  var toggleFullscreen = function (windowElement, control) {
    windowElement.classList.remove('dzignex-window--minimized');
    clearMinimizedPosition(windowElement);
    var isFullscreen = windowElement.classList.toggle('dzignex-window--fullscreen');
    control.setAttribute('aria-label', isFullscreen ? 'Exit full screen' : 'Enter full screen');
  };

  var activateControl = function (control, event) {
    var windowElement = control.closest(windowSelector);
    var type = control.dataset.dzignexMacControlType;
    if (!windowElement || !type) return;
    if (type === 'close') return;

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    if (type === 'minimize') toggleMinimize(windowElement);
    if (type === 'fullscreen') toggleFullscreen(windowElement, control);
  };

  var findControlAtPoint = function (event) {
    if (event.target instanceof Element) {
      var directControl = event.target.closest('.dzignex-window-control');
      if (directControl) return directControl;
    }

    return Array.from(document.querySelectorAll('.dzignex-window-control')).find(function (control) {
      var rect = control.getBoundingClientRect();
      return event.clientX >= rect.left - controlHitPadding && event.clientX <= rect.right + controlHitPadding &&
        event.clientY >= rect.top - controlHitPadding && event.clientY <= rect.bottom + controlHitPadding;
    }) || null;
  };

  var getControlBounds = function (group) {
    var controls = Array.from(group.querySelectorAll('.dzignex-window-control'));
    if (controls.length !== 3) return null;

    return controls.reduce(function (bounds, control) {
      var rect = control.getBoundingClientRect();
      return {
        left: Math.min(bounds.left, rect.left),
        top: Math.min(bounds.top, rect.top),
        right: Math.max(bounds.right, rect.right),
        bottom: Math.max(bounds.bottom, rect.bottom)
      };
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
  };

  var clearControlHovers = function () {
    document.querySelectorAll('.dzignex-mac-control-group').forEach(function (group) {
      group.classList.remove('dzignex-mac-controls-hovered');
    });
  };

  var updateControlHovers = function (event) {
    document.querySelectorAll('.dzignex-mac-control-group').forEach(function (group) {
      var bounds = getControlBounds(group);
      var isNear = bounds &&
        event.clientX >= bounds.left - hoverPadding && event.clientX <= bounds.right + hoverPadding &&
        event.clientY >= bounds.top - hoverPadding && event.clientY <= bounds.bottom + hoverPadding;
      group.classList.toggle('dzignex-mac-controls-hovered', Boolean(isNear));
    });
  };

  var wireWindow = function (windowElement) {
    if (windowElement.dataset.dzignexMacControls === 'true') return;

    var controlsByType = {};
    Array.from(windowElement.querySelectorAll('*')).some(function (element) {
      var definition = getDefinition(element);
      if (definition && !controlsByType[definition.type]) controlsByType[definition.type] = element;
      return Object.keys(controlsByType).length === 3;
    });

    var types = ['close', 'minimize', 'fullscreen'];
    var controls = types.map(function (type) { return controlsByType[type]; });
    if (controls.some(function (control) { return !control; })) return;

    var group = findGroup(controls, windowElement);
    group.classList.add('dzignex-mac-control-group');

    controls.forEach(function (control, index) {
      var type = types[index];
      var definition = controlDefinitions[window.getComputedStyle(control).backgroundColor];
      control.classList.add('dzignex-window-control', 'dzignex-window-control--' + type);
      control.setAttribute('role', 'button');
      control.setAttribute('tabindex', '0');
      control.setAttribute('aria-label', definition.label);
      control.dataset.dzignexMacControlType = type;
      control.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') activateControl(control, event);
      });
    });
    windowElement.dataset.dzignexMacControls = 'true';
  };

  var scan = function () {
    document.querySelectorAll(windowSelector).forEach(wireWindow);
  };

  var suppressClickUntil = 0;

  window.addEventListener('pointermove', updateControlHovers, { passive: true });
  window.addEventListener('blur', clearControlHovers);
  document.addEventListener('mouseleave', clearControlHovers);

  window.addEventListener('pointerdown', function (event) {
    var control = findControlAtPoint(event);
    if (!control) return;
    if (control.dataset.dzignexMacControlType === 'close') return;
    suppressClickUntil = window.performance.now() + 800;
    activateControl(control, event);
  }, true);

  window.addEventListener('click', function (event) {
    if (window.performance.now() < suppressClickUntil) {
      suppressClickUntil = 0;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      return;
    }

    var control = findControlAtPoint(event);
    if (!control) return;
    if (control.dataset.dzignexMacControlType === 'close') return;
    activateControl(control, event);
  }, true);

  document.addEventListener('pointerdown', function (event) {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('.dzignex-window-control')) return;
    if (!event.target.closest('.framer-ri6lxh-container, a[href*="works/"], .framer-tgdpsi, .framer-dwufeu, .framer-1337xyp, .framer-1ccq42h, .framer-cwlefm, .framer-4ybn4b')) return;
    document.querySelectorAll(windowSelector).forEach(clearWindowState);
  }, true);

  scan();
  window.setTimeout(scan, 250);
  window.setTimeout(scan, 800);
  window.setTimeout(scan, 1600);
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}());
