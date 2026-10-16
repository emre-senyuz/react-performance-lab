# React Performance Lab

A local, interactive educational project with exactly two demos. Built with Vite, React, strict TypeScript, Tailwind CSS (Vite plugin), TanStack Virtual, and lucide-react. No backend, API, authentication, or synthetic performance scores.

## Run

Requires Node.js 20.19+ or 22.12+ (Node 24 is also supported) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

```sh
npm run build   # TypeScript checks and production bundle in dist/
npm run preview # Serve the production bundle locally
```

## Demo A — Virtualization

10,000 deterministic records with stable IDs. Search names, categories, cities, or IDs. TanStack Virtual renders fixed-height rows in a scroll container with five overscan rows at each edge. The matching count covers the full dataset; the mounted-row number is explicitly an estimate based on the rendered virtual entries (including overscan), not a DOM profiler. It excludes headers and containers.

Switch to Standard sample to render the first **at most 500 matching rows** without virtualization. The matching count still reflects all 10,000 records. Query and mode changes return the list to the top. Virtualization reduces mounted rows; it does not optimize the search itself.

## Demo B — Debouncing

Search 2,000 deterministic items. Immediate mode filters after each committed input change. Debounced mode waits 300 ms after the latest input or mode change; effect cleanup cancels the previous timer on changes or unmount. The controlled input always updates immediately.

The execution count starts at zero (initial data is already available). It increments once for each actual filtering call caused by input or mode changes, including clearing a query. A ref guards against StrictMode effect replay. Mode switching retains the counter for comparison; Reset experiments clears both demos and cancels pending debounce work. Returning to the already applied query before a timer runs requires no new filtering call. Counts describe committed input changes, not physical keystrokes.

Results display the applied query, pending state, matching count, and a fixed preview of up to six items. All 2,000 items are searched; only the preview is capped. This keeps result rendering bounded in both modes so the filtering comparison stays focused.

## Explore

1. Scroll Demo A and watch the mounted-row estimate stay bounded.
2. Switch to Standard sample and observe the 500-row maximum.
3. Type `Juniper` quickly in Demo B, pause, and inspect the execution counter.
4. Reset, switch to Immediate, and repeat. Switching mode itself counts as one filtering execution.

Timing and batching depend on your input and browser. No FPS, duration, or speedup claims are made.

## Screenshot

_Screenshot placeholder: add a screenshot of the desktop workbench here._

## Structure

- `src/main.tsx`: two demos, shared small UI components, and reset behavior.
- `src/data.ts`: deterministic data and pure filtering function.
- `src/styles.css`: Tailwind import and responsive visual styling.

The project intentionally has no tests, charts, profiling libraries, API, auth, or CI.
