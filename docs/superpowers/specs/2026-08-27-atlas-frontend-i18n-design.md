# ATLAS Frontend Internationalization Design

## Summary

ATLAS will support English (`en`) and Bahasa Indonesia (`id`) throughout the frontend while preserving every existing route, API contract, query, mutation, authorization boundary, and assessment behavior. English remains the canonical source language, default locale, and runtime fallback. Bahasa Indonesia translations will be authored in source-controlled catalogs; the application will not call an automatic translation service.

This change is presentation-only. It applies to every user role—student, instructor, and administrator—as well as the public landing and authentication experiences. Locale is user-interface state persisted in the browser and read by the Next.js frontend server. It is not academic state and will never be stored in the ATLAS backend.

## Scope

The implementation will localize static frontend text in:

- the authenticated application shell, navigation, breadcrumbs, workspace labels, account menu, and accessibility labels;
- authentication, account, validation, loading, empty, success, confirmation, and frontend fallback-error states;
- student dashboards, courses, assessments, learning progress, results, and AI tutor controls;
- instructor course offerings, enrollment, student, learning-record, progress, history, and result views;
- administrator curriculum, course, offering, academic-term, concept, learning-objective, question, question-bank, import, and user interfaces;
- the public landing header, hero, interactive examples, guides, project content, footer, calls to action, and accessibility copy; and
- low-risk date and number presentation that already exists in the frontend.

The implementation will not translate or modify backend-provided or user-authored content, including course titles and descriptions, learning-objective and concept descriptions, question prompts, answer options, rubrics, answers, AI feedback, chat messages, names, imported content, or API error messages returned by the backend.

Backend/domain values such as `progress`, `review`, `created`, `running`, `completed`, `canceled`, `student`, `instructor`, `admin`, `mcq`, and `essay` remain unchanged. Components will translate only their rendered presentation labels.

No file under `atlas-backend/` will be modified.

## Selected Architecture

The frontend will use `next-intl` 4.x with its Next.js App Router request configuration and no locale-based routing. This provides a single translation API for Server and Client Components, ICU message interpolation and pluralization, locale-aware formatting, and an established provider boundary without introducing `/en` or `/id` URL segments.

The implementation will add:

- `src/i18n/config.ts` for supported locales, the default locale, the locale cookie name, locale metadata, and runtime locale validation;
- `src/i18n/messages.ts` for loading a selected catalog with English fallback behavior;
- `src/i18n/request.ts` for request-scoped locale and message resolution;
- `src/messages/en.json` for canonical English messages;
- `src/messages/id.json` for complete Bahasa Indonesia messages;
- `src/components/language-switcher.tsx` for the reusable selector; and
- focused infrastructure, catalog-validation, switcher, and integration tests.

`next.config.ts` will register the `next-intl` plugin and point it at the request configuration. No middleware or proxy route is required.

`src/app/layout.tsx` will resolve the request locale, provide the resolved messages through `NextIntlClientProvider`, and set the document `lang` attribute to the same locale. Existing theme, query, authentication, and active-role providers will remain in their current logical order inside the translation provider.

Reading a request cookie in the root layout makes routes request-rendered. This is an accepted tradeoff because it enables the persisted locale and correct translated server output and `html lang` value on the initial response without changing route structure. No TanStack Query or API data-fetching semantics will change.

## Catalog Design

English and Indonesian catalogs will have identical nested key structures. Keys will be grouped by user-facing responsibility instead of by individual component filename. Expected top-level namespaces include:

- `common`
- `navigation`
- `roles`
- `auth`
- `account`
- `dashboard`
- `student`
- `assessment`
- `course`
- `chat`
- `instructor`
- `admin`
- `landing`
- `footer`
- `errors`
- `accessibility`

Reusable terms and actions belong in `common`; feature-specific sentences remain in the relevant feature namespace. Interpolated counts and plural forms will use ICU syntax rather than manual locale checks. Components must not contain scattered `locale === "id"` branches or duplicate English and Indonesian component trees.

Indonesian terminology will be natural and consistent for an academic application. Core choices include `Dasbor`, `Mata Kuliah Saya`, `Asesmen`, `Asesmen Formatif`, `Progres Pembelajaran`, `Tujuan Pembelajaran`, `Konsep`, `Soal`, `Bank Soal`, `Pengajar`, `Mahasiswa`, `Periode Akademik`, and `Umpan Balik`. Context will determine whether mastery is presented as `Tuntas` or `Dikuasai`; each context will remain internally consistent. Assessment mode `review` will use `Tinjauan` consistently.

English messages are loaded as the base catalog and the selected locale overlays them. A missing Indonesian message therefore renders its English value safely. Development and tests will additionally detect missing, orphaned, or interpolation-incompatible keys so catalog drift is corrected before release.

## Locale Resolution and Persistence

The locale cookie will be named `atlas_locale`. Supported values are strictly `en` and `id`. An absent, malformed, or unsupported value resolves to `en`.

The language switcher will write the cookie with:

- `path=/`;
- `SameSite=Lax`; and
- a one-year maximum age.

After changing the cookie, the switcher will update `document.documentElement.lang` immediately and refresh the Next.js Server Component tree. The refreshed request configuration will supply the new catalog to the existing page without changing its pathname or navigation state. Selecting the currently active locale is a no-op.

Behavior is therefore:

1. A first visit with no locale cookie renders English.
2. Selecting Bahasa Indonesia persists `id` and refreshes the current route in Indonesian.
3. Client navigation and reloads preserve Indonesian because each render reads the same cookie.
4. Selecting English persists `en` and restores English on the same route.

Locale state is independent of authentication, active workspace role, theme, sidebar state, and backend session state.

## Language Switcher

`LanguageSwitcher` will be a Client Component using the existing shadcn/Base UI dropdown primitives and Lucide icon library. It will expose a compact globe trigger with the active language label where space permits and a menu containing exactly:

- English
- Bahasa Indonesia

The active locale will be indicated with a check mark and suitable accessible state. The trigger will have a translated `aria-label`; keyboard navigation and focus behavior will come from the existing dropdown primitive. Styling will use existing Button variants and semantic colors, work in light and dark mode, and avoid custom overlay or z-index behavior.

The same component implementation will be rendered:

- in the right side of `AppHeader`, before the theme and workspace controls; and
- in both responsive action arrangements of `LandingHeader`, without restructuring its navigation.

Existing theme toggles, sidebar triggers, breadcrumbs, role switching, authentication actions, and mobile-sheet behavior remain intact.

## Component Migration Strategy

Migration will proceed in controlled vertical slices:

1. localization infrastructure, provider, persistence, fallback, and tests;
2. the shared switcher and its two header integrations;
3. application shell, sidebar, breadcrumbs, auth, and account;
4. student dashboard, course, assessment, progress, result, and chat surfaces;
5. instructor surfaces;
6. administrator surfaces;
7. landing and footer content, shared accessibility strings, and final audit.

Client Components will use `useTranslations` and `useFormatter`. Server Components with static copy will use `getTranslations` only when needed. Existing links retain the same `href` values.

Presentation label tables will store stable translation keys or be created from the active translator. Domain enums will not be rewritten. Module-level Zod schemas containing English validation messages will become schema factories created from the active translator while preserving every field, rule, boundary, and refinement. This changes only the rendered validation message.

When a component currently renders an error supplied by an `Error` or `ApiError`, that dynamic message remains verbatim. Only the existing hardcoded fallback branch will become a translation lookup.

Existing frontend date presentation will receive the active locale through `next-intl` formatting where this does not change the input timestamp, timezone interpretation, or request/response representation. Formatting that cannot be changed without touching behavior will remain as-is and be documented in the completion report.

## Testing Strategy

All new behavior will be developed test-first. Focused tests will verify:

- `en` is the default and unsupported cookie values fall back to `en`;
- Indonesian messages override English while missing selected-locale messages fall back safely to English;
- English and Indonesian catalogs have identical leaf-key sets;
- interpolation variables are compatible across catalogs;
- the language switcher exposes both required language labels and indicates the current selection;
- selecting Indonesian changes representative UI copy and persists `atlas_locale=id`;
- selecting English restores English and persists `atlas_locale=en`;
- the authenticated header and landing header render the shared switcher;
- existing navigation links retain their current hrefs; and
- representative backend-provided values are rendered unchanged in both locales.

A test render utility will wrap translated Client Components in an English `NextIntlClientProvider` by default and allow an explicit Indonesian locale for localization tests. Existing component tests will use this utility only where a migrated component now requires translation context; their English behavioral assertions remain canonical.

After each slice, focused tests for the touched area will run. Final static verification will run:

```bash
pnpm test
pnpm lint
pnpm build
```

Browser verification at `http://localhost:3001` will cover public and authenticated headers, both locale transitions, reload persistence, representative student/instructor/admin pages, desktop and narrow layouts, keyboard operation of the switcher, correct `html lang`, unchanged navigation URLs, and absence of console errors.

## Final Audit and Completion Conditions

The final audit will search production frontend source for remaining visible English literals. Each result will be classified as:

- dynamic/backend or user-authored content that must remain unchanged;
- developer/internal text that is not rendered to users; or
- untranslated static frontend UI.

All third-category findings will be fixed before completion. The audit will avoid test fixtures, API/domain constants, backend error values, technical identifiers, logs, and imported academic content.

Before completion, `git diff --stat` and `git diff` will be inspected to confirm:

- no backend file changed;
- no API path, payload, response type, query key, mutation, validation rule, authorization condition, route, assessment condition, or learning-progress calculation changed;
- no unrelated redesign or refactor entered the diff;
- both catalogs are complete and synchronized; and
- the full test, lint, build, and applicable browser checks pass.
