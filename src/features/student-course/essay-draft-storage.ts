const ESSAY_DRAFT_VERSION = 1;
const ESSAY_DRAFT_KEY_PREFIX = "atlas:essay-draft:v1";

interface StoredEssayDraft {
  version: typeof ESSAY_DRAFT_VERSION;
  questionId: string;
  text: string;
}

function draftKey(userId: string, assessmentId: string): string {
  return `${ESSAY_DRAFT_KEY_PREFIX}:${userId}:${assessmentId}`;
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadEssayDraft(
  userId: string,
  assessmentId: string,
  questionId: string,
): string | null {
  const storage = browserStorage();

  if (!storage) {
    return null;
  }

  const key = draftKey(userId, assessmentId);

  try {
    const rawDraft = storage.getItem(key);

    if (!rawDraft) {
      return null;
    }

    const draft = JSON.parse(rawDraft) as Partial<StoredEssayDraft>;
    const text = draft.text;
    const isValidDraft =
      draft.version === ESSAY_DRAFT_VERSION &&
      typeof draft.questionId === "string" &&
      typeof text === "string";

    if (!isValidDraft || draft.questionId !== questionId) {
      return null;
    }

    return text;
  } catch {
    return null;
  }
}

export function saveEssayDraft(
  userId: string,
  assessmentId: string,
  questionId: string,
  text: string,
): boolean {
  const storage = browserStorage();

  if (!storage) {
    return false;
  }

  try {
    if (!text) {
      storage.removeItem(draftKey(userId, assessmentId));
      return false;
    }

    const draft: StoredEssayDraft = {
      version: ESSAY_DRAFT_VERSION,
      questionId,
      text,
    };

    storage.setItem(draftKey(userId, assessmentId), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearEssayDraft(
  userId: string,
  assessmentId: string,
): void {
  const storage = browserStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(draftKey(userId, assessmentId));
  } catch {
    // Draft cleanup must never interrupt the assessment flow.
  }
}
