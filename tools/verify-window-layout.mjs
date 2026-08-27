import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const menotopia = await readFile(new URL('../works/menotopia.html', import.meta.url), 'utf8');
const menotopiaCover = await readFile(new URL('../framerusercontent.com/images/menotopia-presentation-cover-2.jpg', import.meta.url));
const mobileFix = source.match(/<style data-dzignex-mobile-fix>([\s\S]*?)<\/style>/);

assert.ok(mobileFix, 'The mobile window-fix stylesheet must exist.');

const css = mobileFix[1];
const fragileOverlaySiblingSelector = /\[data-framer-name="(?:AboutMeOverlay|NoteOverlay)"\]\s*\+\s*\.framer-(?:12ztidk|1vc6fcr)-container/;

assert.doesNotMatch(
  source,
  fragileOverlaySiblingSelector,
  'Mobile window behavior must not depend on a transient Framer overlay sibling.'
);

assert.match(
  css,
  /\.framer-JaU20\.framer-12ztidk-container\s*\{[^}]*width:\s*calc\(100vw\s*-\s*32px\)\s*!important;[^}]*top:\s*24px\s*!important;[^}]*left:\s*16px\s*!important;[^}]*transform:\s*none\s*!important;/s,
  'About Me must have a direct, viewport-safe mobile layout rule.'
);

assert.match(
  css,
  /\[data-framer-name="Content"\]\s*>\s*div:nth-child\(2\)\s*\{[^}]*gap:\s*12px\s*!important;/s,
  'The mobile About Me details must move closer to the portrait.'
);

assert.match(
  css,
  /div:nth-child\(2\)\s*>\s*div:first-child[^}]*\{[^}]*flex:\s*0\s+0\s+88px\s*!important;[^}]*width:\s*88px\s*!important;[^}]*height:\s*88px\s*!important;[^}]*transform:\s*translate\(-8px,\s*-10px\)\s*!important;/s,
  'The mobile portrait must be smaller, left-shifted, and aligned with NAME.'
);

assert.match(
  css,
  /div:first-child\s*>\s*div:nth-child\(2\)\s+p\s*\{[^}]*width:\s*auto\s*!important;[^}]*max-width:\s*none\s*!important;[^}]*white-space:\s*nowrap\s*!important;/s,
  'The mobile name value must have room to remain on one line.'
);

assert.doesNotMatch(
  menotopia,
  /\[data-framer-name="Thumbnail"\]\s+img\s*\{/,
  'No Menotopia thumbnail image may receive this presentation-only override.'
);

assert.match(
  menotopia,
  /\[data-framer-name="Image 1"\]\s*\{[^}]*aspect-ratio:\s*1920\s*\/\s*1464\s*!important;[^}]*\}\s*\[data-framer-name="Image 1"\]\s*>\s*\[data-framer-background-image-wrapper\]\s*\{[^}]*background:\s*url\(["']?\.\.\/framerusercontent\.com\/images\/menotopia-presentation-cover-2\.jpg["']?\)\s+center\s*\/\s*contain\s+no-repeat\s*!important;[^}]*\}\s*\[data-framer-name="Image 1"\]\s+img\s*\{[^}]*opacity:\s*0\s*!important;/s,
  'Only Menotopia Image 1 must render the designer-provided full-resolution source without cropping.'
);

assert.ok(menotopiaCover.byteLength > 1_000_000, 'The full-resolution Menotopia cover asset must be present.');

assert.match(
  css,
  /\.framer-JaU20\.framer-1vc6fcr-container\s*\{[^}]*width:\s*calc\(100vw\s*-\s*48px\)\s*!important;[^}]*height:\s*min\(620px,\s*calc\(100dvh\s*-\s*224px\s*-\s*env\(safe-area-inset-bottom,\s*0px\)\)\)\s*!important;[^}]*top:\s*50%\s*!important;[^}]*left:\s*50%\s*!important;[^}]*transform:\s*translate\(-50%,\s*-50%\)\s*!important;/s,
  'Notes must have a direct, viewport-safe mobile layout rule.'
);

console.log('Mobile About Me and Notes window selectors are stable.');
