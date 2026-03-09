# AMBER

AMBER is a code bundle for the AMBER project. The original design is available at [Figma](https://www.figma.com/design/aJSCTSd4gBkmcs6KPjo3Pk/AMBER).

## Demo

Live demo: [https://jahoi12345.github.io/AMBER-App/](https://jahoi12345.github.io/AMBER-App/)

## Running locally

Install dependencies:

```bash
npm i
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project structure

- `src/app/` – main app, pages, components, and lib
- `src/app/pages/user/` – user-facing views (home, messages, time landscape, novelty ideas)
- `src/app/pages/family/` – family views (home, stats, time landscape, messages)
- `src/app/components/` – shared UI and feature components
- `src/app/lib/` – data loading, time texture logic, and app context

Use the floating "Switch person" control (bottom-right) to change which person and date the app is showing when testing with the bundled demo data.
