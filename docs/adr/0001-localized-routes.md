# Localized routes for German and English

RoomFull uses explicit locale URL segments (`/de/...` and `/en/...`) for the bilingual frontend, with German (`de`) as the default locale. This keeps shared links stable in the selected language and follows the standard Next.js App Router internationalization shape with a dynamic locale segment, instead of hiding language choice only in browser preferences or session state.

Requests without a locale segment redirect by precedence: saved language cookie, browser `Accept-Language`, then `de`. Explicit localized URLs are never rewritten to another locale.

The frontend has one canonical page tree under `app/[lang]`. Existing unlocalized paths remain usable only through locale-aware redirects, avoiding parallel route implementations for the same RoomFull workflows.

Only the locale segment is localized. Route paths and slugs stay technically stable across languages to keep routing simple and avoid a translated slug matrix in the MVP.
