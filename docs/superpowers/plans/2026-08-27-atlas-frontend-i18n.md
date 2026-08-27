# ATLAS Frontend Internationalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete English and Bahasa Indonesia localization to the ATLAS frontend with a shared persistent language switcher and no changes to routes, backend content, or feature behavior.

**Architecture:** Use `next-intl` request configuration without locale-based routing. Resolve `en` or `id` from an `atlas_locale` cookie, provide synchronized English and Indonesian catalogs at the root layout, and refresh the current Server Component tree after a switch. Migrate only static presentation copy; backend values and domain enums remain unchanged and receive translated display labels only.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript 5, `next-intl` 4.13.7, Base UI-backed shadcn components, Vitest, Testing Library, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-27-atlas-frontend-i18n-design.md`

## Global Constraints

- Modify files under the `atlas/` frontend only; never modify `atlas-backend/`.
- Keep `/dashboard`, `/student/*`, `/instructor/*`, `/admin/*`, and all public/authentication routes unchanged.
- English (`en`) is the canonical source, default locale, and runtime fallback; Bahasa Indonesia uses locale code `id`.
- Persist only the UI locale in the `atlas_locale` browser cookie; do not add backend or user-profile persistence.
- Never translate backend-provided or user-authored course, curriculum, question, answer, rubric, AI, chat, name, or imported content.
- Never change API paths, payloads, response types, query keys, mutations, authorization, authentication, assessment state, scoring, mastery, validation rules, pagination, filtering, sorting, media, or rich-text behavior.
- Preserve backend/domain enum values (`progress`, `review`, `created`, `running`, `completed`, `canceled`, `student`, `instructor`, `admin`, `mcq`, `essay`); translate only rendered labels.
- Use translation catalogs and `next-intl`; do not add component-level `locale === "id"` branches, runtime translation APIs, or duplicated language-specific components.
- Update both catalogs in the same step and keep their leaf-key and ICU-variable structures identical.
- Existing English tests run with an explicit English provider; add Indonesian assertions only where they prove localization behavior.
- Every new behavior follows red-green-refactor, and every substantial slice ends with focused tests and a commit.

---

### Task 1: Localization Core, Catalog Contract, and Root Provider

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `next.config.ts`
- Modify: `src/app/layout.tsx`
- Create: `src/i18n/config.ts`
- Create: `src/i18n/config.test.ts`
- Create: `src/i18n/messages.ts`
- Create: `src/i18n/catalogs.test.ts`
- Create: `src/i18n/request.ts`
- Create: `src/messages/en.json`
- Create: `src/messages/id.json`
- Create: `src/test/render.tsx`

**Interfaces:**
- Produces: `type Locale = "en" | "id"`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_COOKIE_NAME`, `isLocale(value)`, and `resolveLocale(value)` from `@/i18n/config`.
- Produces: `mergeWithEnglish(messages): AbstractIntlMessages` and `loadMessages(locale): AbstractIntlMessages` from `@/i18n/messages`, with English recursively underneath the selected catalog.
- Produces: a request config that reads `atlas_locale` and returns `{locale, messages}`.
- Produces: `render(ui, {locale?, messages?, ...options})` from `@/test/render`, defaulting to English and re-exporting Testing Library utilities.
- Consumes later: all translated components use `useTranslations`, `useLocale`, or `useFormatter` inside the root `NextIntlClientProvider`.

- [ ] **Step 1: Install the selected localization dependency**

Run:

```bash
pnpm add next-intl@4.13.7
```

Expected: `package.json` and `pnpm-lock.yaml` add only `next-intl` and its resolved transitive dependencies.

- [ ] **Step 2: Write failing locale-resolution tests**

Create `src/i18n/config.test.ts` with literal expectations:

```ts
import {describe, expect, it} from "vitest";
import {DEFAULT_LOCALE, isLocale, resolveLocale} from "@/i18n/config";

describe("locale configuration", () => {
  it("defaults missing and unsupported values to English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
    expect(resolveLocale("fr")).toBe("en");
  });

  it("accepts only the supported English and Indonesian locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("id")).toBe(true);
    expect(isLocale("en-US")).toBe(false);
  });
});
```

- [ ] **Step 3: Run the config test and confirm RED**

Run: `pnpm test src/i18n/config.test.ts`

Expected: FAIL because `@/i18n/config` does not exist.

- [ ] **Step 4: Implement the locale contract**

Create `src/i18n/config.ts` with this public shape:

```ts
export const SUPPORTED_LOCALES = ["en", "id"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "atlas_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeLabels: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
```

Run: `pnpm test src/i18n/config.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing catalog synchronization and fallback tests**

Create `src/i18n/catalogs.test.ts`. Recursively flatten object leaves, extract ICU argument names with `/{([a-zA-Z][\w]*)[,}]/g`, and assert:

```ts
expect(flattenKeys(idMessages)).toEqual(flattenKeys(enMessages));
expect(interpolationArguments(idMessages)).toEqual(interpolationArguments(enMessages));
expect(loadMessages("id").common.save).toBe("Simpan");
expect(mergeWithEnglish({common: {save: "Simpan"}}).common.cancel).toBe("Cancel");
```

The production mutation caught by these tests is a missing/orphaned key, incompatible ICU variable name, or missing English runtime fallback.

- [ ] **Step 6: Run the catalog test and confirm RED**

Run: `pnpm test src/i18n/catalogs.test.ts`

Expected: FAIL because catalogs and the loader do not exist.

- [ ] **Step 7: Implement seed catalogs and recursive English fallback**

Create both JSON catalogs with matching seed namespaces and genuine translations needed by Tasks 1–2:

```json
{
  "metadata": {"description": "Adaptive formative assessment for conceptual learning"},
  "common": {"save": "Save", "cancel": "Cancel"},
  "language": {
    "label": "Language",
    "change": "Change language",
    "english": "English",
    "indonesian": "Bahasa Indonesia"
  }
}
```

```json
{
  "metadata": {"description": "Asesmen formatif adaptif untuk pembelajaran konseptual"},
  "common": {"save": "Simpan", "cancel": "Batalkan"},
  "language": {
    "label": "Bahasa",
    "change": "Ubah bahasa",
    "english": "English",
    "indonesian": "Bahasa Indonesia"
  }
}
```

Implement a non-mutating recursive object merge in `src/i18n/messages.ts`; arrays and scalar selected-locale values replace English values, while nested object keys inherit English values. Keep JSON loading centralized in this module.

Run: `pnpm test src/i18n/catalogs.test.ts`

Expected: PASS.

- [ ] **Step 8: Wire request configuration, Next.js plugin, root provider, metadata, and semantic language**

Implement `src/i18n/request.ts` with `getRequestConfig`, `cookies()`, `resolveLocale`, and `loadMessages`. Wrap the existing provider tree in `NextIntlClientProvider` from the async root layout, set `<html lang={locale}>`, and replace the static description with locale-aware `generateMetadata`. Preserve the existing fonts, classes, theme options, and provider order.

Update `next.config.ts` using:

```ts
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);
```

- [ ] **Step 9: Add the reusable translated test renderer**

Create `src/test/render.tsx` around Testing Library's real renderer:

```tsx
function TestIntlProvider({children, locale = "en", messages}: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages ?? loadMessages(locale)} timeZone="Asia/Jakarta">
      {children}
    </NextIntlClientProvider>
  );
}
```

Expose a render option for `locale` and `messages`; re-export `screen`, `fireEvent`, `waitFor`, `within`, `act`, and `renderHook` from Testing Library. Do not globally mock `next-intl`.

- [ ] **Step 10: Verify the core and commit**

Run:

```bash
pnpm test src/i18n/config.test.ts src/i18n/catalogs.test.ts src/test/setup.test.ts
pnpm exec tsc --noEmit
```

Expected: all selected tests and type checking PASS.

Commit:

```bash
git add package.json pnpm-lock.yaml next.config.ts src/app/layout.tsx src/i18n src/messages src/test/render.tsx
git commit -m "feat: add frontend localization core"
```

---

### Task 2: Persistent Shared Language Switcher and Header Integration

**Files:**
- Create: `src/i18n/client.ts`
- Create: `src/i18n/client.test.ts`
- Create: `src/components/language-switcher.tsx`
- Create: `src/components/language-switcher.test.tsx`
- Modify: `src/components/app-shell/app-header.tsx`
- Modify: `src/components/app-shell/app-header.test.tsx`
- Modify: `src/features/landing/components/landing-header.tsx`
- Create: `src/features/landing/components/landing-header.test.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/id.json`

**Interfaces:**
- Produces: `persistLocale(locale: Locale): void`, which writes `atlas_locale`, one-year max-age, `path=/`, and `SameSite=Lax`, then updates `document.documentElement.lang`.
- Produces: `LanguageSwitcher({compact?: boolean})`, which reads the active `next-intl` locale and refreshes the current route after persistence.
- Preserves: `AppHeader` breadcrumb hrefs and role-switch navigation; `LandingHeader` anchors and authentication hrefs.

- [ ] **Step 1: Read current shadcn component documentation**

Run:

```bash
pnpm dlx shadcn@latest docs dropdown-menu button
```

Use the installed Base UI `render` trigger API, put all `DropdownMenuItem` instances inside `DropdownMenuGroup`, and use the existing `Button` variants.

- [ ] **Step 2: Write and fail the persistence test**

In `src/i18n/client.test.ts`, clear `document.cookie`, call `persistLocale("id")`, and assert the readable cookie is `atlas_locale=id` and `document.documentElement.lang === "id"`. Repeat for `en`.

Run: `pnpm test src/i18n/client.test.ts`

Expected: FAIL because `persistLocale` does not exist.

- [ ] **Step 3: Implement minimal persistence and pass the test**

Build the cookie with `encodeURIComponent`, `LOCALE_COOKIE_MAX_AGE`, `path=/`, and `SameSite=Lax`. Do not read or write auth/session cookies.

Run: `pnpm test src/i18n/client.test.ts`

Expected: PASS.

- [ ] **Step 4: Write and fail switcher behavior tests**

Mock only `useRouter().refresh`. Render the real switcher with the Indonesian provider and assert the menu exposes `English` and `Bahasa Indonesia`, marks Indonesian selected, switching to English calls `persistLocale("en")`, changes representative provider content after rerender, and calls `refresh` once. Add the inverse English-to-Indonesian case.

Run: `pnpm test src/components/language-switcher.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 5: Implement the accessible shared switcher**

Compose `Button`, `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, and `DropdownMenuItem`. Use `Languages` or `Globe2` and `Check` from Lucide with `data-icon` rather than custom icon sizes inside `Button`. Use `aria-label={t("change")}` and `aria-current="true"` on the active menu item. Wrap refresh in `startTransition` and prevent duplicate selection work.

- [ ] **Step 6: Add failing header integration assertions**

Move these two tests to the English-default renderer from `@/test/render`. Extend the authenticated header test and add a landing header test that assert a button named by the translated change-language label is present. In the same tests, assert existing destinations remain `/dashboard`, `/login`, `/register`, `#capabilities`, `#progression`, `#guides-faq`, and `#project`; leave the `/admin/courses` breadcrumb path condition unchanged and cover its visible label here, then cover its navigation href in the sidebar test in Task 3.

Run:

```bash
pnpm test src/components/app-shell/app-header.test.tsx src/features/landing/components/landing-header.test.tsx
```

Expected: FAIL because neither header renders the switcher.

- [ ] **Step 7: Integrate the same switcher in both headers**

Place it before the theme toggle in `AppHeader`. In `LandingHeader`, render the same component in the desktop actions and mobile actions without moving the theme toggle, auth actions, or mobile sheet navigation. Make only minimal gap/visibility adjustments.

- [ ] **Step 8: Verify and commit**

Run:

```bash
pnpm test src/i18n/client.test.ts src/components/language-switcher.test.tsx src/components/app-shell/app-header.test.tsx src/features/landing/components/landing-header.test.tsx
pnpm exec tsc --noEmit
```

Expected: PASS.

Commit:

```bash
git add src/i18n/client.ts src/i18n/client.test.ts src/components/language-switcher.tsx src/components/language-switcher.test.tsx src/components/app-shell/app-header.tsx src/components/app-shell/app-header.test.tsx src/features/landing/components/landing-header.tsx src/features/landing/components/landing-header.test.tsx src/messages
git commit -m "feat: add persistent language switcher"
```

---

### Task 3: Application Shell, Authentication, Account, and Test Context

**Files:**
- Modify: `src/components/app-shell/app-header.tsx`
- Modify: `src/components/app-shell/app-sidebar.tsx`
- Modify: `src/components/ui/breadcrumb.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/components/ui/sidebar.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`
- Modify: `src/app/forgot-password/page.tsx`
- Modify: `src/app/reset-password/page.tsx`
- Modify: `src/app/(app)/account/page.tsx`
- Modify: `src/features/auth/login-form.tsx`
- Modify: `src/features/auth/components/register-form.tsx`
- Modify: `src/features/auth/components/forgot-password-form.tsx`
- Modify: `src/features/auth/components/reset-password-form.tsx`
- Modify: `src/features/auth/components/change-password-form.tsx`
- Modify: `src/components/app-shell/app-header.test.tsx`
- Modify: `src/features/auth/login-form.test.tsx`
- Modify: `src/features/auth/components/register-form.test.tsx`
- Modify: `src/features/auth/components/forgot-password-form.test.tsx`
- Modify: `src/features/auth/components/reset-password-form.test.tsx`
- Modify: `src/features/auth/components/change-password-form.test.tsx`
- Modify: `src/app/(app)/account/page.test.tsx`
- Modify: `src/app/register/page.test.tsx`
- Modify: `src/app/forgot-password/page.test.tsx`
- Modify: `src/app/reset-password/page.test.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/id.json`

**Interfaces:**
- Consumes: `useTranslations("navigation" | "roles" | "auth" | "account" | "accessibility")` and the English-default test renderer.
- Produces: translated route labels without changing `href`; translated schema factories with unchanged Zod constraints.

- [ ] **Step 1: Convert affected component tests to the explicit English render utility**

Change only the `render` import from `@testing-library/react` to `@/test/render`; retain direct Testing Library imports for utilities not re-exported if necessary. Run the shell/auth/account tests and confirm existing English assertions still pass before production copy migration.

- [ ] **Step 2: Add failing Indonesian shell and auth assertions**

Add focused tests proving `/admin/courses` displays `Mata Kuliah`, the workspace label displays `Ruang Kerja`, the account action displays `Akun Saya`, and the login form displays `Masuk ke ATLAS` under locale `id`. Assert the same links still point to their original paths.

Run:

```bash
pnpm test src/components/app-shell/app-header.test.tsx src/app/'(app)'/account/page.test.tsx src/features/auth/login-form.test.tsx
```

Expected: FAIL on Indonesian text.

- [ ] **Step 3: Add synchronized shell/auth/account messages**

Add complete English canonical and Indonesian translations for breadcrumbs, sidebar groups/items, role display labels, workspace menu, account/sign-out actions, theme labels, auth headings/descriptions/fields/actions/statuses, password help, and validation/fallback errors. Use ICU arguments for variable lengths or counts.

- [ ] **Step 4: Migrate shell and primitive accessibility copy**

Replace breadcrumb labels and role presentation maps with translator lookups. Keep `getBreadcrumbs` path conditions and hrefs identical by passing a translator into the label construction. Translate `Close`, `More`, `Sidebar`, `Displays the mobile sidebar`, and `Toggle Sidebar` accessibility text without altering primitive composition or behavior.

- [ ] **Step 5: Migrate auth/account components without changing validation**

For each module-level Zod schema, create `create...Schema(t)` returning the same fields, min/max values, refinements, and validation order with translated message arguments. Instantiate it from `useTranslations` with `useMemo`, keep inferred form types explicit where inference can no longer use a module constant, and leave mutation payloads and redirect paths unchanged. Preserve dynamic `ApiError.message`; translate only hardcoded fallback strings.

- [ ] **Step 6: Run the complete affected slice**

Run:

```bash
pnpm test src/components/app-shell src/features/auth src/app/login src/app/register src/app/forgot-password src/app/reset-password src/app/'(app)'/account
pnpm exec tsc --noEmit
```

Expected: all tests PASS in canonical English plus focused Indonesian cases.

- [ ] **Step 7: Commit**

```bash
git add src/components/app-shell src/components/ui/breadcrumb.tsx src/components/ui/dialog.tsx src/components/ui/sheet.tsx src/components/ui/sidebar.tsx src/app/login src/app/register src/app/forgot-password src/app/reset-password src/app/'(app)'/account src/features/auth src/messages
git commit -m "feat: localize application shell and authentication"
```

---

### Task 4: Student Dashboard, Courses, Assessments, Progress, and Results

**Files:**
- Modify: `src/features/dashboard/components/student-dashboard.tsx`
- Modify: `src/features/student-courses/components/course-list.tsx`
- Modify: `src/features/student-courses/components/course-card.tsx`
- Modify: `src/features/student-course/components/assessment-history.tsx`
- Modify: `src/features/student-course/components/assessment-options.tsx`
- Modify: `src/features/student-course/components/assessment-result-view.tsx`
- Modify: `src/features/student-course/components/assessment-runner.tsx`
- Modify: `src/features/student-course/components/cancel-assessment-button.tsx`
- Modify: `src/features/student-course/components/course-workspace.tsx`
- Modify: `src/features/student-course/components/learning-progress.tsx`
- Modify: `src/features/student-course/labels.ts`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/app/(app)/student/courses/page.tsx`
- Modify: `src/app/(app)/student/assessments/page.tsx`
- Modify: `src/features/dashboard/components/student-dashboard.test.tsx`
- Modify: `src/features/student-course/components/assessment-history.test.tsx`
- Modify: `src/features/student-course/components/assessment-options.test.tsx`
- Modify: `src/features/student-course/components/assessment-result-view.test.tsx`
- Modify: `src/features/student-course/components/assessment-runner.test.tsx`
- Modify: `src/features/student-course/components/course-workspace.test.tsx`
- Modify: `src/features/student-course/components/learning-progress.test.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/id.json`

**Interfaces:**
- Consumes: `useTranslations("dashboard" | "student" | "course" | "assessment" | "errors")`, `useFormatter`, and locale-safe presentation helpers.
- Preserves: option identity by `option_id`, assessment modes/status values, next-question and submission guards, query keys, mutation payloads, scoring/mastery display, and all backend text.

- [ ] **Step 1: Establish English test context and baseline**

Switch affected test render imports to `@/test/render` and run all dashboard/student-course tests before migration. Expected: PASS with current English behavior.

- [ ] **Step 2: Add failing localization and dynamic-content tests**

Add Indonesian assertions for `Dasbor`, `Mata Kuliah Saya`, `Lanjutkan asesmen`, `Progres Pembelajaran`, `Tujuan Pembelajaran`, `Tinjauan`, `Kirim jawaban`, and `Batalkan asesmen`. In the same localized renders, assert fixture course titles, question prompts, MCQ option text, essay answers, and backend feedback remain byte-for-byte unchanged.

Run:

```bash
pnpm test src/features/dashboard src/features/student-courses src/features/student-course
```

Expected: FAIL only on missing Indonesian UI strings.

- [ ] **Step 3: Add synchronized student and assessment catalogs**

Translate every static heading, action, status presentation, empty/loading/error message, tab, dialog, hint, counter, progress label, assessment mode, question type, and result label. Use ICU plurals for credits, attempts, questions, objectives, concepts, and mastered counts. Keep `Tinjauan` as the consistent translation of review mode.

- [ ] **Step 4: Migrate dashboard and course-list presentation**

Replace static text and hand-built English plurals with translation calls. Convert semester display to a presentation lookup without changing stored values. Never pass course code/title/description, instructor name, or academic content through `t`.

- [ ] **Step 5: Migrate assessment and progress presentation without logic edits**

Replace only string-returning helpers and rendered literals. Keep all conditions involving `status`, `mode`, `type`, `option_id`, `mastered_at`, `completed_at`, and query/mutation state unchanged. Preserve essay pending/duplicate-submission protections. Preserve backend `Error.message` and translate only fallback literals.

- [ ] **Step 6: Make existing date formatting locale-aware at presentation only**

Use `useFormatter().dateTime(new Date(value), options)` for the existing enrollment and learning-record dates in `course-workspace.tsx`. Keep the same timestamp inputs and do not supply a new timezone that changes the represented instant.

- [ ] **Step 7: Verify student behavior and commit**

Run:

```bash
pnpm test src/features/dashboard src/features/student-courses src/features/student-course
pnpm exec tsc --noEmit
```

Expected: all tests PASS, including existing `option_id`, mutation, state, and dynamic-content assertions.

Commit:

```bash
git add src/features/dashboard src/features/student-courses src/features/student-course src/app/'(app)'/dashboard src/app/'(app)'/student/courses src/app/'(app)'/student/assessments src/messages
git commit -m "feat: localize student learning and assessment views"
```

---

### Task 5: Student Chat and Rich-Text Controls

**Files:**
- Modify: `src/features/student-chat/components/chat-composer.tsx`
- Modify: `src/features/student-chat/components/chat-conversation.tsx`
- Modify: `src/features/student-chat/components/chat-empty-state.tsx`
- Modify: `src/features/student-chat/components/chat-session-sidebar.tsx`
- Modify: `src/features/student-chat/components/student-chat-workspace.tsx`
- Modify: `src/components/rich-text/atlas-rich-text-editor.tsx`
- Modify: `src/features/student-chat/components/student-chat-workspace.test.tsx`
- Modify: `src/components/rich-text/atlas-rich-text-editor.test.tsx`
- Modify: `src/components/rich-text/atlas-rich-text-viewer.test.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/id.json`

**Interfaces:**
- Consumes: `useTranslations("chat" | "common" | "errors" | "accessibility")`.
- Preserves: chat session IDs, titles returned by the backend, message bodies, AI responses, media payloads, upload behavior, mutation ordering, and rich-text document content.

- [ ] **Step 1: Run baseline tests with English provider**

Move translated component tests to `@/test/render`, then run:

```bash
pnpm test src/features/student-chat src/components/rich-text
```

Expected: PASS before production migration.

- [ ] **Step 2: Add a failing Indonesian chat presentation test**

Render a representative workspace in `id` and assert `Tutor AI`, `Mulai percakapan baru`, `Ketik pesan untuk tutor ATLAS Anda`, and image-control accessibility labels. Assert supplied fixture session titles, user messages, AI messages, and course names remain unchanged.

- [ ] **Step 3: Add catalog copy and migrate presentation**

Translate chat navigation, composer placeholders, upload states, archive/rename dialogs, empty/loading/fallback-error states, timestamps used only as UI labels, and rich-text image chooser/upload fallback text. Preserve any `error.message` received from API/media code and translate only the current literal fallback.

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm test src/features/student-chat src/components/rich-text
pnpm exec tsc --noEmit
```

Expected: PASS.

Commit:

```bash
git add src/features/student-chat src/components/rich-text src/messages
git commit -m "feat: localize chat and rich-text controls"
```

---

### Task 6: Instructor Surfaces

**Files:**
- Modify: `src/features/instructor-course-offerings/components/instructor-course-offering-detail.tsx`
- Modify: `src/features/instructor-course-offerings/components/instructor-course-offering-list.tsx`
- Modify: `src/features/instructor-course-offerings/components/instructor-enroll-student.tsx`
- Modify: `src/features/instructor-course-offerings/components/instructor-enrollment-list.tsx`
- Modify: `src/features/instructor-learning-records/components/instructor-assessment-history.tsx`
- Modify: `src/features/instructor-learning-records/components/instructor-assessment-result.tsx`
- Modify: `src/features/instructor-learning-records/components/instructor-learning-progress.tsx`
- Modify: `src/features/instructor-learning-records/components/instructor-learning-record-detail.tsx`
- Modify: `src/features/instructor-students/components/instructor-student-list.tsx`
- Modify: `src/features/instructor-course-offerings/components/instructor-course-offering-detail.test.tsx`
- Modify: `src/features/instructor-course-offerings/components/instructor-course-offering-list.test.tsx`
- Modify: `src/features/instructor-course-offerings/components/instructor-enroll-student.test.tsx`
- Modify: `src/features/instructor-course-offerings/components/instructor-enrollment-list.test.tsx`
- Modify: `src/features/instructor-learning-records/components/instructor-assessment-history.test.tsx`
- Modify: `src/features/instructor-learning-records/components/instructor-assessment-result.test.tsx`
- Modify: `src/features/instructor-learning-records/components/instructor-learning-record-detail.test.tsx`
- Modify: `src/features/instructor-students/components/instructor-student-list.test.tsx`
- Modify: relevant route wrappers under `src/app/(app)/instructor/` only if they contain static copy
- Modify: `src/messages/en.json`
- Modify: `src/messages/id.json`

**Interfaces:**
- Consumes: `useTranslations("instructor" | "assessment" | "course" | "common" | "errors")` and `useFormatter`.
- Preserves: enrollment mutations, learning-record IDs, assessment/result responses, backend student names/emails, curriculum content, pagination, and authorization.

- [ ] **Step 1: Establish baseline and add failing Indonesian coverage**

Switch affected test renders to `@/test/render`. Add representative assertions for `Penawaran Mata Kuliah`, `Mahasiswa`, `Daftarkan mahasiswa`, `Riwayat asesmen`, and `Progres Pembelajaran`; assert fixture course titles, student names, learning-objective text, question text, answers, and feedback are unchanged.

Run:

```bash
pnpm test src/features/instructor-course-offerings src/features/instructor-learning-records src/features/instructor-students
```

Expected: FAIL on Indonesian UI assertions only.

- [ ] **Step 2: Add synchronized instructor messages**

Translate all headings, table headers, labels, search/empty/loading/fallback-error states, actions, dialogs, assessment status/type/mode presentation, learning-progress labels, and accessibility strings. Use catalog keys for semester and enum presentation; do not transform backend values.

- [ ] **Step 3: Migrate instructor components presentation-only**

Use translation hooks in Client Components. Keep API-derived errors verbatim and translate only fallback branches. Replace the existing `Intl.DateTimeFormat(undefined, ...)` locale argument with the selected locale or `useFormatter` while retaining its date/time options and input values.

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm test src/features/instructor-course-offerings src/features/instructor-learning-records src/features/instructor-students
pnpm exec tsc --noEmit
```

Expected: PASS.

Commit:

```bash
git add src/features/instructor-course-offerings src/features/instructor-learning-records src/features/instructor-students src/app/'(app)'/instructor src/messages
git commit -m "feat: localize instructor views"
```

---

### Task 7: Administrator Surfaces

**Files:**
- Modify: `src/features/admin-academic-terms/components/academic-term-manager.tsx`
- Modify: `src/features/admin-academic-terms/components/create-academic-term-form.tsx`
- Modify: `src/features/admin-academic-terms/components/edit-academic-term-form.tsx`
- Modify: `src/features/admin-academic-terms/semester.ts`
- Modify: `src/features/admin-concepts/components/concept-library.tsx`
- Modify: `src/features/admin-concepts/components/create-concept-form.tsx`
- Modify: `src/features/admin-concepts/components/edit-concept-form.tsx`
- Modify: `src/features/admin-course-offerings/components/admin-course-offering-detail.tsx`
- Modify: `src/features/admin-course-offerings/components/admin-course-offering-manager.tsx`
- Modify: `src/features/admin-course-offerings/components/create-course-offering-form.tsx`
- Modify: `src/features/admin-course-offerings/components/edit-course-offering-form.tsx`
- Modify: `src/features/admin-courses/components/admin-course-detail.tsx`
- Modify: `src/features/admin-courses/components/admin-course-manager.tsx`
- Modify: `src/features/admin-courses/components/course-lifecycle-actions.tsx`
- Modify: `src/features/admin-courses/components/create-course-form.tsx`
- Modify: `src/features/admin-courses/components/edit-course-form.tsx`
- Modify: `src/features/admin-curriculum-import/components/curriculum-import.tsx`
- Modify: `src/features/admin-learning-objectives/components/create-learning-objective-form.tsx`
- Modify: `src/features/admin-learning-objectives/components/edit-learning-objective-form.tsx`
- Modify: `src/features/admin-learning-objectives/components/learning-objective-concept-level-manager.tsx`
- Modify: `src/features/admin-learning-objectives/components/learning-objective-concept-manager.tsx`
- Modify: `src/features/admin-learning-objectives/components/learning-objective-manager.tsx`
- Modify: `src/features/admin-learning-objectives/components/sortable-learning-objective-card.tsx`
- Modify: `src/features/admin-learning-objectives/components/sortable-learning-objective-concept-level.tsx`
- Modify: `src/features/admin-learning-objectives/components/sortable-learning-objective-concept.tsx`
- Modify: `src/features/admin-question-banks/components/create-question-bank-form.tsx`
- Modify: `src/features/admin-question-banks/components/delete-question-bank-button.tsx`
- Modify: `src/features/admin-question-banks/components/edit-question-bank-form.tsx`
- Modify: `src/features/admin-question-banks/components/question-bank-detail.tsx`
- Modify: `src/features/admin-question-banks/components/question-bank-list.tsx`
- Modify: `src/features/admin-question-banks/components/question-bank-question-browser.tsx`
- Modify: `src/features/admin-question-banks/components/question-bank-question-list.tsx`
- Modify: `src/features/admin-question-import/components/question-import.tsx`
- Modify: `src/features/admin-questions/components/admin-question-detail.tsx`
- Modify: `src/features/admin-questions/components/admin-question-edit.tsx`
- Modify: `src/features/admin-questions/components/admin-question-manager.tsx`
- Modify: `src/features/admin-questions/components/create-question-form.tsx`
- Modify: `src/features/admin-questions/components/edit-question-form.tsx`
- Modify: `src/features/admin-questions/components/essay-question-fields.tsx`
- Modify: `src/features/admin-questions/components/mcq-question-fields.tsx`
- Modify: `src/features/admin-questions/components/question-card.tsx`
- Modify: `src/features/admin-questions/components/question-common-fields.tsx`
- Modify: `src/features/admin-questions/components/question-content-detail.tsx`
- Modify: `src/features/admin-questions/components/question-detail-view.tsx`
- Modify: `src/features/admin-questions/components/question-library-filters.tsx`
- Modify: `src/features/admin-questions/components/question-lifecycle-actions.tsx`
- Modify: `src/features/admin-questions/components/question-placement-fields.tsx`
- Modify: `src/features/admin-questions/components/sortable-mcq-option.tsx`
- Modify: `src/features/admin-questions/schemas.ts`
- Modify: `src/features/admin-users/components/admin-user-delete.tsx`
- Modify: `src/features/admin-users/components/admin-user-detail.tsx`
- Modify: `src/features/admin-users/components/admin-user-list.tsx`
- Modify: `src/features/admin-users/components/admin-user-role-management.tsx`
- Modify: `src/features/admin-course-offerings/components/admin-course-offering-detail.test.tsx`
- Modify: `src/features/admin-course-offerings/components/admin-course-offering-manager.test.tsx`
- Modify: `src/features/admin-curriculum-import/components/curriculum-import.test.tsx`
- Modify: `src/features/admin-question-banks/components/question-bank-question-list.test.tsx`
- Modify: `src/features/admin-question-import/components/question-import.test.tsx`
- Modify: `src/features/admin-questions/components/admin-question-detail.test.tsx`
- Modify: `src/features/admin-questions/components/admin-question-edit.test.tsx`
- Modify: `src/features/admin-questions/components/create-question-form.test.tsx`
- Modify: `src/features/admin-questions/components/edit-question-form.test.tsx`
- Modify: `src/features/admin-questions/components/question-content-detail.test.tsx`
- Modify: `src/features/admin-questions/components/question-detail-view.test.tsx`
- Modify: `src/features/admin-questions/components/question-lifecycle-actions.test.tsx`
- Modify: `src/features/admin-users/components/admin-user-delete.test.tsx`
- Modify: `src/features/admin-users/components/admin-user-detail.test.tsx`
- Modify: `src/features/admin-users/components/admin-user-list.test.tsx`
- Modify: `src/features/admin-users/components/admin-user-role-management.test.tsx`
- Modify: `src/app/(app)/admin/curriculum-import/page.test.tsx`
- Modify: `src/app/(app)/admin/question-import/page.test.tsx`
- Modify: relevant route wrappers under `src/app/(app)/admin/` only if they contain static copy
- Modify: `src/messages/en.json`
- Modify: `src/messages/id.json`

**Interfaces:**
- Consumes: `useTranslations("admin" | "course" | "assessment" | "roles" | "common" | "errors")`.
- Preserves: every form field, Zod constraint/refinement, import payload, reorder operation, lifecycle mutation, query filter, pagination value, backend role value, question type, SOLO code, and API error string.

- [ ] **Step 1: Establish baseline and write failing representative tests**

Use `@/test/render` in affected tests. Add Indonesian assertions covering `Periode Akademik`, `Mata Kuliah`, `Penawaran Mata Kuliah`, `Konsep`, `Tujuan Pembelajaran`, `Soal`, `Bank Soal`, `Impor Kurikulum`, `Impor Soal`, `Pengguna`, create/edit/delete confirmations, table headings, and search placeholders. In the same tests, assert backend course/question/bank/user fixture content remains unchanged.

Run:

```bash
pnpm test src/features/admin-academic-terms src/features/admin-concepts src/features/admin-course-offerings src/features/admin-courses src/features/admin-curriculum-import src/features/admin-learning-objectives src/features/admin-question-banks src/features/admin-question-import src/features/admin-questions src/features/admin-users src/app/'(app)'/admin
```

Expected: FAIL on Indonesian presentation only.

- [ ] **Step 2: Add complete synchronized administrator catalog namespaces**

Translate every rendered heading, description, label, placeholder, help message, filter, status label, action, loading/empty/fallback-error state, modal, confirmation, import result, table header, pagination phrase, role label, and accessibility string. Keep example domain input placeholders such as course codes unchanged when they are examples rather than interface prose; translate surrounding explanatory text.

- [ ] **Step 3: Convert validation schemas without changing rules**

For schemas embedded in components and `admin-questions/schemas.ts`, introduce translator-accepting factories. Preserve the exact Zod shape, discriminated unions, min/max bounds, refinements, and error paths. Update form type aliases explicitly so no API payload shape changes.

- [ ] **Step 4: Migrate admin components in bounded groups**

Run focused tests after each group:

```bash
pnpm test src/features/admin-academic-terms src/features/admin-concepts
pnpm test src/features/admin-courses src/features/admin-course-offerings
pnpm test src/features/admin-learning-objectives
pnpm test src/features/admin-question-banks src/features/admin-question-import src/features/admin-questions
pnpm test src/features/admin-curriculum-import src/features/admin-users src/app/'(app)'/admin
```

For each group, change only presentation literals and presentation helpers. Do not edit `api/`, query files, or domain types.

- [ ] **Step 5: Verify the full administrator slice and commit**

Run:

```bash
pnpm test src/features/admin-academic-terms src/features/admin-concepts src/features/admin-course-offerings src/features/admin-courses src/features/admin-curriculum-import src/features/admin-learning-objectives src/features/admin-question-banks src/features/admin-question-import src/features/admin-questions src/features/admin-users src/app/'(app)'/admin
pnpm exec tsc --noEmit
```

Expected: PASS.

Commit:

```bash
git add src/features/admin-academic-terms src/features/admin-concepts src/features/admin-course-offerings src/features/admin-courses src/features/admin-curriculum-import src/features/admin-learning-objectives src/features/admin-question-banks src/features/admin-question-import src/features/admin-questions src/features/admin-users src/app/'(app)'/admin src/messages
git commit -m "feat: localize administrator views"
```

---

### Task 8: Landing Page, Accessibility Completion, Catalog Audit, and Full Verification

**Files:**
- Modify: `src/features/landing/components/capabilities-section.tsx`
- Modify: `src/features/landing/components/conceptual-learning-section.tsx`
- Modify: `src/features/landing/components/guides-faq-section.tsx`
- Modify: `src/features/landing/components/interactive-features-console.tsx`
- Modify: `src/features/landing/components/interactive-hero-logo.tsx`
- Modify: `src/features/landing/components/interactive-mascot.tsx`
- Modify: `src/features/landing/components/landing-footer.tsx`
- Modify: `src/features/landing/components/landing-header.tsx`
- Modify: `src/features/landing/components/landing-hero.tsx`
- Modify: `src/features/landing/components/learning-loop-section.tsx`
- Modify: `src/features/landing/components/perspectives-section.tsx`
- Modify: `src/features/landing/components/project-section.tsx`
- Modify: `src/app/page.tsx` only if translation context is needed for currently rendered copy
- Modify: remaining frontend components identified by the final audit
- Modify: `src/messages/en.json`
- Modify: `src/messages/id.json`
- Modify: `src/features/landing/components/landing-header.test.tsx`
- Create: `src/app/page.test.tsx`
- Modify: `src/i18n/catalogs.test.ts`

**Interfaces:**
- Consumes: `useTranslations("landing" | "footer" | "common" | "accessibility")` and the shared `LanguageSwitcher` already integrated in `LandingHeader`.
- Preserves: section IDs, public/auth hrefs, canvases, animation state, responsive layout, project/funding/publication URLs, and all interaction behavior.

- [ ] **Step 1: Write failing representative landing localization tests**

Render the currently mounted landing page sections in Indonesian and assert translated navigation, hero call to action, capability/demo copy, guides/FAQ, project labels, and footer. Assert external links, section anchors, product name `ATLAS`, organization names, publication titles, and personal/team names remain unchanged.

Run:

```bash
pnpm test src/features/landing src/app/page.test.tsx
```

If `src/app/page.test.tsx` does not exist, create it to render the real landing page with only external animation/canvas mechanics mocked, not the translated content components.

Expected: FAIL on Indonesian copy before migration.

- [ ] **Step 2: Add complete English and Indonesian landing catalogs**

Transcribe the existing English landing content exactly into the English catalog and author natural Indonesian translations. Keep icon names, component IDs, hrefs, and external URLs in code. For repeated card/item data, keep stable IDs and icons in code and translate `title`, `description`, `label`, and call-to-action keys. Use `t.rich` for sentences containing styled emphasis or embedded links so Indonesian word order remains natural.

- [ ] **Step 3: Migrate all existing landing and footer copy**

Cover `landing-header`, `landing-hero`, `interactive-features-console`, `guides-faq-section`, `project-section`, `landing-footer`, and the existing but currently unmounted capability, conceptual-learning, learning-loop, and perspectives components. Translate visible and screen-reader text, image alternative text, navigation labels, placeholders, status/demo labels, funding/team/publication headings, and calls to action. Do not redesign markup or animations.

- [ ] **Step 4: Run catalog contract and public-surface tests**

Run:

```bash
pnpm test src/i18n/catalogs.test.ts src/components/language-switcher.test.tsx src/features/landing src/app/page.test.tsx
```

Expected: PASS with matching catalog keys and ICU variables.

- [ ] **Step 5: Audit remaining frontend English literals**

Run targeted searches over production source:

```bash
rg -n '>[^<{]*[A-Za-z][^<{]*<' src/app src/components src/features -g '*.tsx' -g '!*.test.tsx' -g '!src/app/api/**'
rg -n '(aria-label|placeholder|title|alt|tooltip)="[A-Za-z]' src/app src/components src/features -g '*.tsx' -g '!*.test.tsx' -g '!src/app/api/**'
rg -n '"(Unable|Loading|Create|Edit|Delete|Save|Cancel|Search|No |Start|Continue|Submit|Retry|Close|Open|View|Account|Dashboard|Student|Instructor|Administrator)[^"]*"' src/app src/components src/features -g '*.tsx' -g '*.ts' -g '!*.test.*' -g '!src/app/api/**'
```

Inspect every hit. Leave only backend/dynamic content, developer/internal text, technical identifiers, brand/proper names, and domain constants. Move every remaining static user-facing English literal into both catalogs before proceeding.

- [ ] **Step 6: Run complete automated verification**

Run:

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Expected: all tests PASS, ESLint exits 0, TypeScript exits 0, and the production build completes. If the project has no formatter script, record that fact rather than installing or configuring an unrelated formatter.

- [ ] **Step 7: Run browser verification at desktop and mobile widths**

Start `pnpm dev`, then use the in-app browser at `http://localhost:3001` to verify:

1. First visit renders English with `<html lang="en">`.
2. Landing header switcher is keyboard-operable and exposes both languages.
3. Selecting Bahasa Indonesia keeps the current URL, changes representative landing copy, and sets `<html lang="id">`.
4. Reload and navigation preserve Indonesian.
5. Authenticated `AppHeader` contains the same switcher without disrupting theme or role controls.
6. Representative student, instructor, and administrator pages show translated static UI while fixture/backend data remains unchanged.
7. Assessment submission controls remain single-submit and selected MCQ behavior still uses the option UUID through the unchanged tests.
8. Switching back to English persists and restores English.
9. Desktop and narrow/mobile layouts have no overflow or clipped header controls.
10. The browser console contains no hydration, missing-message, or runtime errors.

- [ ] **Step 8: Inspect diff boundaries**

Run:

```bash
git diff --stat 5ac8067..HEAD
git diff 5ac8067..HEAD -- . ':(exclude)docs/superpowers'
git status --short
```

Confirm no path under `../atlas-backend/`, no frontend API route, and no query/API/type module changed unless it was already explicitly listed for presentation-only work. Confirm no route href, API path, query key, mutation payload, authorization condition, assessment state condition, or academic calculation changed.

- [ ] **Step 9: Commit final landing and audit corrections**

```bash
git add src/features/landing src/app/page.tsx src/messages src/i18n src/components
git commit -m "feat: complete frontend localization coverage"
```

- [ ] **Step 10: Re-run final evidence after the last commit**

Run again:

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
git status --short
```

Expected: every command exits 0 and the worktree is clean.
