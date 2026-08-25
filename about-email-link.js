(function () {
  'use strict';

  var emailAddress = 'hello@dzignex.me';
  var mailtoUrl = 'mailto:' + emailAddress;
  var emailTextSelector = [
    'a',
    '[data-nested-link]',
    '[data-framer-component-type="RichTextContainer"]',
    'p',
    'span'
  ].join(',');

  var normalizeText = function (value) {
    return value.replace(/\s+/g, ' ').trim().toLowerCase();
  };

  var containsEmailText = function (element) {
    return normalizeText(element.textContent || '').includes(emailAddress);
  };

  var isMailtoAnchor = function (element) {
    if (!(element instanceof HTMLAnchorElement)) return false;
    return (element.getAttribute('href') || '').toLowerCase().startsWith('mailto:');
  };

  var isEmailElement = function (element) {
    return isMailtoAnchor(element) || containsEmailText(element);
  };

  var updateEmailLinks = function () {
    document.querySelectorAll('a').forEach(function (anchor) {
      if (!isMailtoAnchor(anchor) && !containsEmailText(anchor)) return;
      anchor.setAttribute('href', mailtoUrl);
      anchor.removeAttribute('target');
    });

    document.querySelectorAll(emailTextSelector).forEach(function (element) {
      if (!containsEmailText(element) || element.closest('a')) return;
      element.classList.add('dzignex-about-email-link');
      element.setAttribute('role', 'link');
      element.setAttribute('tabindex', '0');
    });
  };

  var findEmailTarget = function (event) {
    var path = typeof event.composedPath === 'function'
      ? event.composedPath()
      : [event.target];

    return path.find(function (item) {
      if (!(item instanceof Element)) return false;
      if (!item.matches(emailTextSelector)) return false;

      var text = normalizeText(item.textContent || '');
      if (text.length > 100) return isMailtoAnchor(item);
      return isEmailElement(item);
    }) || null;
  };

  var openEmailComposer = function (event) {
    if (!findEmailTarget(event)) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    window.location.href = mailtoUrl;
  };

  document.addEventListener('click', openEmailComposer, true);
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    openEmailComposer(event);
  }, true);

  updateEmailLinks();
  window.setTimeout(updateEmailLinks, 250);
  window.setTimeout(updateEmailLinks, 800);
  new MutationObserver(updateEmailLinks).observe(document.body, { childList: true, subtree: true });
}());
