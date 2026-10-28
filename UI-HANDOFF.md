# VoxNote UI refresh

28 Oct 2026. Based on VoiceNotes-Frontend main commit 2956401.

Production website deployed on 28 Oct 2026 through PR1, merge commit8955c0e56808e07cb3a468f2bb9e36fe1e86fc4c. Public site: https://voice-notes-frontend-lemon.vercel.app/ . Original main2956401 is preserved in Git history for rollback. Android remains a signed debug preview, not an original-release-key update.

## What changed
- Shared ink/mint/cream desktop and phone design, self-hosted fonts and consistent controls.
- Compact returning-user mobile view with Capture / Saved notes, folder drawer and meaning search.
- Recording controls occupy a separate layout row, not an overlay over note actions.
- Keyboard focus, control names, status/alert semantics, larger mobile targets and reduced motion.
- Note-save feedback, safer single-note delete, corrected tag-filter/reset behavior.
- Audio upload recovery: failed audio remains in memory, with Retry, Download and Discard. No auto-retry. If a response is lost, check saved notes first to avoid duplicate saves.
- Recording timer, blocked overlapping recordings, logout/leave warning while audio is pending where browser support permits.
- Android recovery export uses existing Filesystem/Share plugins only on an explicit Download tap.
- Debug builds use com.sarvagya.app.preview, name VoxNote Preview. Release package remains com.sarvagya.app.
- Lockfile gets two missing @emnapi packages; generated Android output excluded from lint.

## Run web
Use Node 22.12+ compatible with the current Vite version. Keep your own existing environment configuration.

    npm ci
    npm run dev
    npm run lint
    npm run build

VITE_API_URL is the backend origin. VITE_GOOGLE_CLIENT_ID is the public OAuth web client identifier. No passwords or tokens are bundled in this handoff. The preview APK uses the same public API and OAuth config recovered from the supplied app.

## Android build
Use JDK 21, Android SDK platform 36, Build Tools 36.0.0 and Android SDK licenses. With JAVA_HOME and ANDROID_HOME set:

    npm run build
    npx cap sync android
    cd android
    ./gradlew assembleDebug --no-daemon --max-workers=1 -Dorg.gradle.jvmargs=-Xmx640m -Pkotlin.compiler.execution.strategy=in-process

The delivered APK is a debug preview, NOT a release update. It installs beside the existing app. It has a different debug signing certificate from the original APK. Do not uninstall the existing app to install this preview. Do not use this key as a replacement release key. Google sign-in may require registering the preview package and certificate in the existing OAuth project. No OAuth settings were changed.

## Tests performed
- Clean npm ci, build, lint and whitespace check.
- API-intercepted browser tests: password login, create/edit, saved feedback, tags/reset, meaning search/reset, fake microphone recording/upload/refresh, delete cancel/confirm, TXT export.
- Failed 503 audio upload -> retained in memory -> download -> retry same audio -> saved without re-recording. No audio stored in localStorage.
- 320/390/768/1280 viewport overflow checks, final note actions above recorder, folder drawer and 390x430 short-height scrolling.
- axe automated WCAG tags: zero violations in tested 390px login and empty capture/saved views. Not a full accessibility audit.
- Android assembleDebug succeeded, package metadata and APK signature verified.

The qa scripts use fixture data and a fake microphone, not real credentials or production account mutations. Install playwright and @axe-core/playwright inside qa separately to run them; start Vite on 127.0.0.1:5173 first. They use /usr/bin/google-chrome by default; adjust that path for your machine.

## Still needs device/staging verification
- Real microphone permissions, denial, interruption, background/screen-lock behavior.
- Actual Android keyboard, safe areas and back navigation.
- Native Google login and native share/export, including recovery export.
- Real backend transcription, latency, expired auth and all OTP/register/reset flows without wasting SMS quota.
- Hindi/English/mixed speech and longer notes.

No physical Android device or emulator was used. Browser screenshots are not native-device proof.

## Known limits
- Recovery is memory-only. Closing/killing the app loses unsaved audio. Download or finish saving before leaving.
- Native Download creates a cache file only when explicitly requested, then opens Share. This is not automatic durable recovery.
- No server idempotency: a timed-out response may have saved already. Retry requires an explicit duplicate-risk warning.
- Existing large JS bundle warning and dependency audit findings remain. No broad automatic dependency upgrade was made.
- PDF letterhead added: repeated VoxNote header/footer, note titles, dates, folder/tags, continuation labels and page numbers. Browser-shaped imagery preserves Hindi; embedded-font text layer supports search/copy. Complex-script selection geometry can differ from visible text. This is not a tagged/accessibility-certified PDF. Very long exports use more memory; native long-export performance still needs device testing.
- No analytics, streaks, notifications, AI rewrite/chat or paid services were added. Frontend source is pushed and deployed to the existing Vercel production website. Original Android release signing identity remains unchanged.

For fixture QA, run Vite without a production API override (defaults to http://127.0.0.1:8000); the scripts intercept that origin. Run scripts from the source root, e.g. node qa/test-ui.mjs.

## Letterhead revision - 28 Oct 2026
Short1-page, long8-page, and mixed Hindi/English exports generated and pixel inspected. Text extraction recovered English and Hindi. Native Filesystem/Share path retained; actual PDF-share device test remains open. Updated APK signed with same debug certificate and preview package as prior test build, not original release.

## Final deployment verification
Production build tested with intercepted fixture API responses and a fake microphone: login, CRUD, tags, search, recording, delete, TXT, upload recovery, responsive320/390/768/1280 and short-height flows all pass. These are frontend tests, not proof of production transcription or real account authentication. Production login pixels inspected at mobile and desktop; correct API/OAuth public config found in built JavaScript; backend OpenAPI endpoint returned200. No real OTP was sent. Automated axe checks found zero violations in the three tested views, not certification.

Final preview APK SHA256: 062f68169de0b71ecd0e4d6d7b2c67924b66d42b77120fedef69ec06711df7f8. Same preview package and debug certificate as earlier preview. User reported saving works on their phone, but no full native-device QA is claimed.
