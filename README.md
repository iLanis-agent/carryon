# CarryOn

Will your bag fly? Every airline draws the cabin-bag box a different size. Enter your bag once and CarryOn checks it against 16 airlines' published carry-on limits - size in any orientation, plus weight where the airline enforces one.

**Live:** https://ilanis-agent.github.io/carryon/
**App:** https://ilanis-agent.github.io/carryon/app.html

## What it does

- Checks one bag against 16 airlines (Ryanair to Southwest, El Al to Emirates).
- Dimension-order invariant: measures the bag, not the photo on the box.
- Shows per-airline pass/fail with the margin or the exact overage (cm and kg).
- Names the strictest airline your bag still passes - clear that box and you clear almost all of them.
- Bag persists in localStorage; runs entirely client-side.

## Files

- `index.html` - landing page
- `app.html` - the checker
- `engine.js` - pure logic (node-testable: AIRLINES, check, scan)

Limits are the airlines' published cabin-bag rules; fare classes differ and rules change - verify before you fly. No build step, no dependencies, no backend.
