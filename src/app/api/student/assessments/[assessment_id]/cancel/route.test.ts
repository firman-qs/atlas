import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticatedBackendRequest = vi.hoisted(() => vi.fn());
const authenticatedJsonResponse = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/authenticated-backend", () => ({
  authenticatedBackendRequest,
}));

vi.mock("@/lib/auth/authenticated-response", () => ({
  authenticatedJsonResponse,
}));

import { POST } from "@/app/api/student/assessments/[assessment_id]/cancel/route";

describe("POST /api/student/assessments/[assessment_id]/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards the cancellation request to the authenticated backend endpoint", async () => {
    const backendResult = {
      status: 200,
      ok: true,
      payload: {
        success: true,
        message: "Success",
        data: {
          id: "assessment-1",
          learning_record_id: "lr-1",
          learning_objective_id: "lo-1",

          question_bank_id: null,

          review_learning_objective_concept_id: null,
          review_loc_level_id: null,

          mode: "progress",
          status: "canceled",

          current_loc_level_id: null,
          current_question_id: null,
          current_cycle_number: null,

          started_at: "2026-08-23T01:00:00Z",
          completed_at: "2026-08-23T01:10:00Z",
        },
      },
    };

    const forwardedResponse = new Response(
      JSON.stringify(backendResult.payload),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    authenticatedBackendRequest.mockResolvedValue(backendResult);
    authenticatedJsonResponse.mockReturnValue(forwardedResponse);

    const request = new Request(
      "http://localhost/api/student/assessments/assessment-1/cancel",
      {
        method: "POST",
      },
    );

    const response = await POST(request as never, {
      params: Promise.resolve({
        assessment_id: "assessment-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/assessments/assessment-1/cancel",
      {
        method: "POST",
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);

    expect(response.status).toBe(200);
  });

  it("preserves a backend conflict response for an assessment that cannot be canceled", async () => {
    const backendResult = {
      status: 409,
      ok: false,
      payload: {
        success: false,
        message: "A completed assessment cannot be canceled.",
        data: null,
      },
    };

    const forwardedResponse = new Response(
      JSON.stringify(backendResult.payload),
      {
        status: 409,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    authenticatedBackendRequest.mockResolvedValue(backendResult);
    authenticatedJsonResponse.mockReturnValue(forwardedResponse);

    const request = new Request(
      "http://localhost/api/student/assessments/assessment-1/cancel",
      {
        method: "POST",
      },
    );

    const response = await POST(request as never, {
      params: Promise.resolve({
        assessment_id: "assessment-1",
      }),
    });

    expect(authenticatedBackendRequest).toHaveBeenCalledWith(
      request,
      "/assessments/assessment-1/cancel",
      {
        method: "POST",
      },
    );

    expect(authenticatedJsonResponse).toHaveBeenCalledWith(backendResult);
    expect(response.status).toBe(409);

    const payload = await response.json();

    expect(payload).toEqual({
      success: false,
      message: "A completed assessment cannot be canceled.",
      data: null,
    });
  });

  it("returns 502 when the assessment backend request fails", async () => {
    authenticatedBackendRequest.mockRejectedValue(
      new Error("backend unavailable"),
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = new Request(
      "http://localhost/api/student/assessments/assessment-1/cancel",
      {
        method: "POST",
      },
    );

    const response = await POST(request as never, {
      params: Promise.resolve({
        assessment_id: "assessment-1",
      }),
    });

    expect(response.status).toBe(502);

    expect(await response.json()).toEqual({
      success: false,
      message: "Assessment service is unavailable.",
      data: null,
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
