# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

Buurekrom_Paths is a mobile-first web application for field and route mapping. Users can
draw field polygons on an interactive map, create routes to fields, and authenticate with
username/password.

## Documentation

The authoritative technical documentation lives in [`docs/`](docs/README.md).

## Code Conventions (always in context)

These rules must be applied on every edit without needing to re-read the docs:

- Use separate Request/Response DTOs — never expose entities directly.
- Always use `final`, except when something is not final.
- Always use Jakarta `@Nonnull` and `@Nullable` annotations.
- In public methods, check for nulls with `Objects.requireNonNull()` as a static import
  (e.g., `Objects.requireNonNull(field, "field")`).
- Only add comments if really needed (explain *why*, not *what*).
- Keep answers to the user as short as possible.

## Quick Commands

```bash
./mvnw clean install       # build
./mvnw spring-boot:run     # run
./mvnw test                # test
```

## Frontend

- Refer to [docs/DESIGN.md](docs/DESIGN.md) for the full design.