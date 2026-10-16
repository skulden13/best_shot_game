# Best shot

A TypeScript solver and interactive Tailwind interface for finding the best target on a field up to 11 × 11.

## Run locally

Requires Node.js 20.19+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Switch between the two requirement illustrations and select any of the four bonuses. Light red cells show affected pieces; a dark red marks the chosen target or targets. Coordinates are zero-based `(x, y)`.

```sh
npm test           # Tests based on examples and field editor tests
npm run typecheck
npm run build      # Type-check and produce dist/
```

## Publish to GitHub Pages

Build and publish `dist/` to the `gh-pages` branch on `origin`:

```sh
npm run deploy
```

## Tests

For running tests, call:
```sh
npm run test
```

## UI

The UI contains two examples from requirements, 11x11 game field with weights, the Shuffle button, Bonus switcher and results underneath. Under the game field there're the Edit Field and Apply Button.

### Edit field

The format is exactly 11 lines with 11 whitespace-separated tokens per line:

- `1`–`5` is regular piece priority.
- `B1`–`B5` is blocking piece priority (e.g. nut, stone).
- `0` is placed bonus (priority 0).
- `.` is empty cell.

**Shuffle** fills all 121 cells with random pieces, blockers, and bonuses. The text area always starts with the current field. Edit it and click **Apply field** to update the board and its optimal targets. Invalid input displays a row/column error and leaves the existing board intact. Selecting a bonus preserves uncommitted edits; selecting an example or shuffling replaces them.

