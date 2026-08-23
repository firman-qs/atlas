import type {
  AdminLearningObjectiveConcept,
  ReorderLearningObjectiveConceptsRequest,
  UpdateLearningObjectiveConceptSettingsRequest,
} from "@/features/admin-learning-objectives/concepts-types";
import type {
  AddLearningObjectiveConceptLevelRequest,
  AdminLearningObjectiveConceptLevel,
  ReorderLearningObjectiveConceptLevelsRequest,
  UpdateLearningObjectiveConceptLevelRequest,
} from "@/features/admin-learning-objectives/levels-types";
import { ApiError } from "@/lib/api/api-error";
import type { ApiResponse, PaginatedView } from "@/lib/api/types";

async function parseUnitResponse(response: Response): Promise<void> {
  let payload: ApiResponse<null>;

  try {
    payload = (await response.json()) as ApiResponse<null>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid learning-objective concept response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

async function parseSuccessfulResponse(response: Response): Promise<void> {
  let payload: ApiResponse<unknown>;

  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid learning-objective concept response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function listLearningObjectiveConcepts(
  learningObjectiveId: string,
): Promise<PaginatedView<AdminLearningObjectiveConcept>> {
  const params = new URLSearchParams({
    page: "1",
    page_size: "100",
  });

  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<PaginatedView<AdminLearningObjectiveConcept>>;

  try {
    payload = (await response.json()) as ApiResponse<
      PaginatedView<AdminLearningObjectiveConcept>
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid learning-objective concept list response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Learning-objective concept list response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function attachConceptToLearningObjective(
  learningObjectiveId: string,
  conceptId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<unknown>;

  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid concept attachment response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }
}

export async function updateLearningObjectiveConceptSettings(
  learningObjectiveId: string,
  conceptId: string,
  request: UpdateLearningObjectiveConceptSettingsRequest,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseUnitResponse(response);
}

export async function detachConceptFromLearningObjective(
  learningObjectiveId: string,
  conceptId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseUnitResponse(response);
}

export async function reorderLearningObjectiveConcepts(
  learningObjectiveId: string,
  request: ReorderLearningObjectiveConceptsRequest,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/reorder`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseUnitResponse(response);
}

export async function listLearningObjectiveConceptLevels(
  learningObjectiveId: string,
  conceptId: string,
): Promise<AdminLearningObjectiveConceptLevel[]> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}/levels`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  let payload: ApiResponse<AdminLearningObjectiveConceptLevel[]>;

  try {
    payload = (await response.json()) as ApiResponse<
      AdminLearningObjectiveConceptLevel[]
    >;
  } catch {
    throw new ApiError(
      response.status,
      "ATLAS returned an invalid concept-level response.",
    );
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(response.status, payload.message, payload);
  }

  if (!payload.data) {
    throw new ApiError(
      response.status,
      "Concept-level response did not contain data.",
      payload,
    );
  }

  return payload.data;
}

export async function addLearningObjectiveConceptLevel(
  learningObjectiveId: string,
  conceptId: string,
  request: AddLearningObjectiveConceptLevelRequest,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}/levels`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseSuccessfulResponse(response);
}

export async function updateLearningObjectiveConceptLevel(
  learningObjectiveId: string,
  conceptId: string,
  soloLevelId: string,
  request: UpdateLearningObjectiveConceptLevelRequest,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}/levels/${soloLevelId}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseSuccessfulResponse(response);
}

export async function removeLearningObjectiveConceptLevel(
  learningObjectiveId: string,
  conceptId: string,
  soloLevelId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}/levels/${soloLevelId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseUnitResponse(response);
}

export async function reorderLearningObjectiveConceptLevels(
  learningObjectiveId: string,
  conceptId: string,
  request: ReorderLearningObjectiveConceptLevelsRequest,
): Promise<void> {
  const response = await fetch(
    `/api/admin/learning-objectives/${learningObjectiveId}/concepts/${conceptId}/levels/reorder`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return parseUnitResponse(response);
}
