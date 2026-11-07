# VoxNote AI - Voice Notes Frontend

React frontend for VoxNote AI, a voice-notes application with Hindi and English transcription. Record or upload audio, save notes into folders, search them, and export saved notes to PDF.

**Live site:** https://voice-notes-frontend-lemon.vercel.app/

## Features

- Voice recording and audio upload with save-failure recovery (failed audio stays in memory with Retry / Download / Discard)
- Notes dashboard with folders, tag filtering and search
- PDF export of saved notes (jsPDF)
- Google sign-in
- Hindi (Devanagari) UI font support with self-hosted fonts
- Android app via Capacitor (signed debug preview builds; web is the production release)

## Tech stack

- React 19 + Vite, JavaScript
- Capacitor 8 (Android)
- axios for the API, jsPDF for PDF export
- Google sign-in: @react-oauth/google, @capgo/capacitor-social-login

## Run locally

Requires Node 22.12+ (compatible with the current Vite version) and the backend API (see VoiceNotes-Backend).

```bash
npm ci
# set VITE_API_URL to the backend URL (defaults to http://127.0.0.1:8000)
npm run dev
npm run lint
npm run build
```

See UI-HANDOFF.md for the production deployment notes and Android preview details.
