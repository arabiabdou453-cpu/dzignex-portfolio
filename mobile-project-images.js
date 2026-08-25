(function () {
  'use strict';

  var mobileQuery = window.matchMedia('(max-width: 809.98px)');
  if (!mobileQuery.matches) return;

  var projectImages = {
    'noua': [
      { file: 'BwQJ2mVbLRbaFgM7D1uM8ufU179f.jpg', width: 1920, height: 1464 }
    ],
    'champ-dermology': [
      { file: 'zIrvKdLWWRz2QRZ4pWN4BpVDlzk88ac.jpg', width: 1920, height: 1080 },
      { file: 'Z1t7ru4zclN8CCVd8f4do1zbzkd4f6.jpg', width: 1920, height: 1472 }
    ],
    'formura-labs': [
      { file: 'tH43mLMG1yOwugNhTO2TxZbl1488ac.png', width: 1920, height: 1080 },
      { file: 'CQ8ashP0sAwUdxlthDQAMncl65088ac.png', width: 1920, height: 1080 },
      { file: 'eyDutTnO5HXOrjBfiWkzukwfo5k88ac.png', width: 1920, height: 1080 }
    ],
    'auravita': [
      { file: '27W9Pbl1kZOETiSPIMQbDeL7zk4d9f.jpg', width: 1920, height: 1491 },
      { file: 'f8fVeUXNSRFaJP4qHrhG3wUNts4d9f.jpg', width: 1920, height: 1491 }
    ],
    'menotopia': [
      { file: 'bqntUTYcSWJ720pzKaO0Clcoh8179f.jpg', width: 1920, height: 1464 },
      { file: '8nujY1TOrwqZYivqYTN9VzodQU179f.jpg', width: 1920, height: 1464 }
    ],
    'ops-first': [
      { file: '8h0XbBOmeNos7JmzuytN4ojFRg88ac.jpg', width: 1920, height: 1080 },
      { file: 'jIHQ4Tty9tjzp3sDSfVhju4RY88ac.jpg', width: 1920, height: 1080 },
      { file: 'SxTtOBAAD13kSeSy8QK5JWb2gcd01.jpg', width: 3840, height: 2160 },
      { file: 'dTotGuWqG30Ssg1J2K8n7ycwVM88ac.jpg', width: 1920, height: 1080 }
    ]
  };

  var projectName = window.location.pathname
    .split('/')
    .pop()
    .replace(/\.html$/, '');
  var projectImageAnchors = {
    'noua': '5XPhG7FIpc5VWZDsBstLYFsrvs',
    'champ-dermology': 'SYRyKosptWQL0q2bZSWD6C0PNA',
    'formura-labs': 'xCop3iECgcUrvQj0PcnCTSU62Sc',
    'auravita': 'hbqSYXztSQIap3bbmJz1CWcr7c',
    'menotopia': 'vgAvkLG3pCz3r32dZkcRPq5I88',
    'ops-first': 'PXlWLXeiqy6gWIGSNeAH86vaFs'
  };
  var insertScheduled = false;

  var prepareImage = function (image) {
    if (image.dataset.dzignexMobileImageReady === 'true') return;

    var localSource = image.getAttribute('src');
    image.dataset.dzignexMobileImageReady = 'true';
    image.decoding = 'async';
    image.fetchPriority = 'low';

    image.addEventListener('error', function () {
      if (!localSource || !image.hasAttribute('srcset')) return;
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      image.src = localSource;
    }, { once: true });
  };

  var prepareImages = function (root) {
    root.querySelectorAll('img[loading="lazy"]').forEach(prepareImage);
  };

  var appendOmittedImages = function () {
    insertScheduled = false;
    document.querySelectorAll('[data-framer-name="Image 5"]').forEach(function (lastImage) {
      if (!lastImage.parentNode) return;

      var anchorImage = lastImage.querySelector('img');
      var anchorSource = anchorImage
        ? [anchorImage.currentSrc, anchorImage.getAttribute('src'), anchorImage.getAttribute('srcset')].join(' ')
        : '';
      var resolvedProjectName = projectImages[projectName]
        ? projectName
        : Object.keys(projectImageAnchors).find(function (candidate) {
          return anchorSource.indexOf(projectImageAnchors[candidate]) !== -1;
        });
      var omittedImages = projectImages[resolvedProjectName] || [];

      if (omittedImages.length === 0) return;

      var insertionPoint = lastImage.closest('.ssr-variant') || lastImage;
      var gallery = insertionPoint.parentElement;
      if (!gallery) return;

      omittedImages.forEach(function (imageData, index) {
        var imageStem = imageData.file.replace(/\.[^.]+$/, '');
        var existingImage = gallery.querySelector('img[src*="' + imageStem + '"]');

        if (existingImage) {
          var existingWrapper = existingImage.closest('[data-dzignex-mobile-extra-media]');
          if (existingWrapper) insertionPoint = existingWrapper;
          return;
        }

        var clone = (lastImage.closest('.ssr-variant') || lastImage).cloneNode(true);
        var imageFrame = clone.matches('[data-framer-name]')
          ? clone
          : clone.querySelector('[data-framer-name]');
        var image = clone.querySelector('img');

        if (!imageFrame || !image) return;

        clone.setAttribute('data-dzignex-mobile-extra-media', resolvedProjectName);
        imageFrame.setAttribute('data-framer-name', 'Image ' + (index + 6));
        imageFrame.style.height = 'auto';
        imageFrame.style.aspectRatio = imageData.width + ' / ' + imageData.height;

        var remoteFile = imageData.file.replace(/[a-f0-9]{4}(\.[^.]+)$/i, '$1');
        var remoteSource = 'https://framerusercontent.com/images/' + remoteFile;

        image.loading = 'lazy';
        image.decoding = 'async';
        image.fetchPriority = 'low';
        image.width = imageData.width;
        image.height = imageData.height;
        image.alt = '';
        image.srcset = [
          remoteSource + '?scale-down-to=512&width=' + imageData.width + '&height=' + imageData.height + ' 512w',
          remoteSource + '?scale-down-to=1024&width=' + imageData.width + '&height=' + imageData.height + ' 1024w',
          remoteSource + '?width=' + imageData.width + '&height=' + imageData.height + ' ' + imageData.width + 'w'
        ].join(',');
        image.src = '/framerusercontent.com/images/' + imageData.file;
        prepareImage(image);

        insertionPoint.insertAdjacentElement('afterend', clone);
        insertionPoint = clone;
      });
    });
  };

  var scheduleOmittedImages = function () {
    if (insertScheduled) return;
    insertScheduled = true;
    window.requestAnimationFrame(appendOmittedImages);
  };

  prepareImages(document);
  scheduleOmittedImages();

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (!(node instanceof Element)) return;
        if (node.matches('img[loading="lazy"]')) prepareImage(node);
        prepareImages(node);
      });
    });
    scheduleOmittedImages();
  }).observe(document.documentElement, { childList: true, subtree: true });
}());
