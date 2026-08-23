import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/config/env", () => ({
  env: {
    apiUrl: "http://localhost:3000",
  },
}));

import { backendRequest } from "@/lib/api/backend-client";

describe("backendRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards FormData without JSON encoding or setting Content-Type", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Success",
          data: {
            imported: true,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const formData = new FormData();

    formData.append(
      "file",
      new File(
        [
          `[course]
code = "UM032EM000"
title = "Electromagnetics"
`,
        ],
        "curriculum.toml",
        {
          type: "application/toml",
        },
      ),
    );

    await backendRequest("/admin/import-curriculum", {
      method: "POST",
      bearerToken: "access-token",
      body: formData,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe("http://localhost:3000/admin/import-curriculum");

    expect(init?.body).toBe(formData);

    const headers = new Headers(init?.headers);

    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer access-token");

    // fetch itself must generate the multipart boundary.
    expect(headers.has("Content-Type")).toBe(false);
  });
});
