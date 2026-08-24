# macOS Window Controls Design

## Scope

Enhance the three existing red, yellow, and green dots in every desktop portfolio window (About, Notes, and all project windows) without changing layout, responsive behavior, mobile behavior, content, links, imagery, toast, or Framer structure.

## Behavior

- Reuse the original three dots; never create replacement or overlapping controls.
- Hovering any one of the three dots reveals macOS-style symbols on all three dots immediately. Leaving the group restores the plain dots immediately.
- Red closes the current window, yellow minimizes/restores it, and green enters/exits fullscreen.
- The behavior is active only at viewport widths of 810px or greater.
- Reopening a window through the original dock/project icon restores it to its normal state.
- The symbols use a strong near-black `#3a241f`, full opacity, and a heavier 10px weight while remaining centered inside the original dots.
- Hovering within 6px of the combined three-dot bounds reveals all three symbols; moving outside that nearby zone hides them within 35ms.
- The click tolerance is 3px around each original dot and must never create duplicate or overlapping visual controls.

## Implementation

Use one desktop-only stylesheet and one dependency-free script. The script scans known Framer window containers, identifies the original controls by their exact computed colors, groups exactly three unique controls, and wires each element once. A MutationObserver handles windows mounted later by Framer.

## Safety

No image source, responsive rule, toast code, project link, content, or mobile markup is changed. Existing duplicate-control experiments are removed to prevent overlapping controls and competing click handlers.
