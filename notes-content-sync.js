(function () {
    'use strict';

    var mobileQuery = window.matchMedia('(max-width: 809.98px)');
    var scheduled = false;
    var textColor = 'var(--token-34d58044-5fb0-4480-9bc8-4e91d499d8e6, rgb(0, 0, 0))';

    var paragraph = function () {
        var element = document.createElement('p');
        element.className = 'framer-text framer-styles-preset-ifudpk';
        element.dataset.stylesPreset = 'SwamNyy5b';
        element.dir = 'auto';
        element.style.setProperty('--framer-text-color', textColor);
        return element;
    };

    var lineBreak = function () {
        return document.createElement('br');
    };

    var trailingBreak = function () {
        var element = paragraph();
        var breakElement = lineBreak();
        breakElement.className = 'trailing-break';
        element.appendChild(breakElement);
        return element;
    };

    var roleBlock = function (company, role, period) {
        var element = paragraph();
        var companyElement = document.createElement('strong');
        var roleElement = document.createElement('em');

        companyElement.textContent = company;
        roleElement.textContent = role;
        element.append(companyElement, lineBreak(), roleElement, lineBreak(), period);
        return element;
    };

    var textBlock = function (text) {
        var element = paragraph();
        element.textContent = text;
        return element;
    };

    var buildExperience = function () {
        var fragment = document.createDocumentFragment();
        var selectedWork = paragraph();
        var selectedWorkTitle = document.createElement('strong');

        selectedWorkTitle.textContent = 'Selected Work';
        selectedWork.appendChild(selectedWorkTitle);

        fragment.append(
            roleBlock('Dzignex Studio', 'Co-Founder / Creative Director', '2023 — Present'),
            textBlock('Started Dzignex with the idea of making creative work easier for clients. Today, I lead projects from the first idea to the final execution, bringing together designers, developers, 3D artists, motion designers, and other specialists when needed.'),
            trailingBreak(),
            roleBlock('Independent Designer', 'Brand & Visual Designer', '2020 — 2023'),
            textBlock('Started by working independently across graphic design and visual identity, gradually moving into branding, website design, packaging.'),
            textBlock('Working directly with clients taught me something that design school never could: good work starts with understanding the problem before opening the software.'),
            trailingBreak(),
            selectedWork,
            textBlock('Branding · Art Direction · Packaging · Digital Experiences · Campaigns')
        );

        return fragment;
    };

    var syncExperience = function () {
        scheduled = false;
        if (!mobileQuery.matches) return;

        document.querySelectorAll('[data-framer-name="(Mobile) Experience"]')
            .forEach(function (windowElement) {
                var experience = windowElement.querySelector('[data-framer-name="Experience"]');
                var content = experience && experience.querySelector('.framer-zco432');
                if (!content) return;

                var currentText = content.textContent || '';
                if (currentText.includes('Dzignex Studio')
                    && currentText.includes('Independent Designer')
                    && !currentText.includes('Wieden+Kennedy')) return;

                content.replaceChildren(buildExperience());
                content.dataset.dzignexExperienceSynced = 'true';
            });
    };

    var scheduleSync = function () {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(syncExperience);
    };

    var observer = new MutationObserver(scheduleSync);

    var start = function () {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-framer-name']
        });
        scheduleSync();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }

    if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', scheduleSync);
    }
}());
