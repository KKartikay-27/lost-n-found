# Baseline

| | |
|---|---|
| Student | Kumar Kartikay |
| Project | Lost & Found — DevOps for a personal full-stack app |
| Repository | https://github.com/KKartikay-27/lost-n-found |
| Baseline commit | [`d484255e0c36018eb4650d1921ed53024f7ed018`](https://github.com/KKartikay-27/lost-n-found/commit/d484255e0c36018eb4650d1921ed53024f7ed018) (also tagged `baseline`) |

## Application

A mobile app for reporting lost and found items. Users register, post an item
(title, description, type lost/found, location, optional Cloudinary image),
browse and filter the feed, and mark their own items resolved.

- `backend/` — Node.js 20+ / Express 5 REST API, MongoDB via Mongoose, JWT auth,
  bcrypt password hashing, Cloudinary signed-upload endpoint.
- `frontend/` — Expo / React Native client (unchanged by this project).

## DevOps features already present at the baseline

Essentially none:

- No Dockerfile or container image; run with `npm run dev` (nodemon) against a local MongoDB.
- No CI, tests, linting, or dependency/security scanning.
- No Kubernetes, Helm, or deployment configuration.
- No health endpoints, metrics, structured logging, or tracing (`console.log` only).
- Configuration via a local `.env`; `.env.example` present and `.env` git-ignored.
- `npm audit` on the baseline reported 11 vulnerabilities (1 critical, 8 high) in
  runtime dependencies (express/body-parser/path-to-regexp/qs, mongoose).
