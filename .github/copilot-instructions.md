## Purpose
This repository contains TypeScript-based backend utilities (minimal structure). These instructions give an AI coding agent just enough, practical knowledge to make useful changes without guessing project conventions.

## Big picture (what to know immediately)
- Location: source code lives under `src/`. Feature code is in `src/feature/` and shared types are in `src/types/`.
- Example service: `src/feature/NavigationService.ts` — a class-based service that exports a singleton instance (see bottom: `export default new NavigationService()`). New services should follow this pattern unless a different export is already used in adjacent files.
- Types: Shared shapes live in `src/types/` (e.g. `navigation.types.ts`). Prefer adding or updating types there rather than ad-hoc inline types.

## Architecture & data flow (concise)
- Services encapsulate logic and may call external APIs (e.g., `NavigationService.fetchFromApi` calls Naver Directions).
- Services manage internal state where needed; `NavigationService` uses an in-memory `Map` for caching with a TTL constant (`CACHE_TTL`). If you add caching, follow this pattern: Map keyed by serialized input, store {timestamp, data}.
- Error handling: network/API errors are logged locally (console.error) and then re-thrown or wrapped with a friendly message at the public method boundary (`getDirections` wraps lower-level errors). Keep this separation: low-level logs + high-level user-facing error messages.

## Project-specific conventions and patterns
- Singleton services: export default a single instance for consumability across the app (see `NavigationService.ts`).
- File roles:
  - `src/feature/*` — service and feature implementations.
  - `src/types/*` — exported interfaces and API response shapes.
- Naming: types use PascalCase and file names mirror exported concepts (e.g., `navigation.types.ts` exports `Coordinates`, `RouteInfo`).
- External API keys are read from environment variables (example in `NavigationService.ts`): `process.env.NAVER_CLIENT_ID`, `process.env.NAVER_CLIENT_SECRET`. Ensure these are present in the runtime env during local testing.

## Integration points & external dependencies
- network: `axios` is used for HTTP calls (see package.json dependency). Follow existing axios usage (typed response generics, `axios.isAxiosError` check).
- Naver Directions API: `NAVER_DIRECTIONS_API_URL` constant in `NavigationService.ts`. Keep request param formatting consistent (`start: "lon,lat"`).

## Build / run guidance (what we discovered)
- package.json contains dependencies but no scripts; the repo currently lacks explicit build/test scripts. Minimal discoverable steps:
  - Install deps: `npm install`
  - Because source is in TypeScript (`.ts`), confirm if a `tsconfig.json` exists. If not present, ask maintainers before adding a build step. If a build is required, typical commands are `npx tsc` (if TypeScript toolchain added) or run via a runtime like `ts-node` during development.

## What to change and examples (concrete)
- To add a new service similar to `NavigationService`:
  1. Create `src/feature/YourService.ts`.
  2. Keep a private cache Map if needed and a TTL constant.
  3. Export a singleton: `export default new YourService()`.
  4. Add related types to `src/types/your.types.ts`.

- To call an external API consistent with existing patterns:
  - Use `axios.get<T>(url, { params, headers })` with a response interface from `src/types`.
  - Validate `data.code === 0` (where applicable) and guard for missing arrays before indexing.

## Things the agent should NOT assume
- There are no discovered test or CI scripts—do not add or modify build CI configs without confirmation.
- There is no revealed runtime or framework (Express, Nest, etc.) in the inspected files. Changes that assume a server framework should be validated with the maintainer.

## Quick references (files worth reading)
- `src/feature/NavigationService.ts` — caching, API call patterns, env var usage, singleton export.
- `src/types/navigation.types.ts` — canonical type shapes for the navigation feature.
- `package.json` — declared dependencies (axios) and devDependencies (@types/node). No scripts discovered.
- `README.md` — repo-level placeholder (short Korean description). Consider updating with setup steps if you add build/test scripts.

## If you need to make assumptions
- If build/test scripts are required for your change, add them to `package.json` and update `README.md`, but note the addition in the PR description and ask maintainers to confirm env/tooling choices.

---
If any section above is unclear or you want more detail about test/build expectations, tell me which area to expand and I will iterate.
