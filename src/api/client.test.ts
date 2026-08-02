import { describe, expect, it, vi } from "vitest";
import type { AxiosResponse } from "axios";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { TEST_ACCESS_TOKEN, TEST_REFRESH_TOKEN, TEST_USER } from "@/test/test-utils";

interface CapturedRequest {
  url?: string;
  method?: string;
  authorization?: string | null;
}

function installFakeAdapter(behavior: "ok" | "fail") {
  const captured: CapturedRequest[] = [];
  apiClient.defaults.adapter = async (config) => {
    captured.push({
      url: config.url,
      method: config.method,
      authorization:
        config.headers.get("Authorization") !== undefined
          ? (config.headers.get("Authorization") as string | null)
          : null,
    });

    if (behavior === "fail") {
      const err = new Error("Request failed with status code 500") as Error & {
        config?: unknown;
        response?: { status: number; data: unknown };
      };
      err.config = config;
      err.response = {
        status: 500,
        data: { type: "about:blank", title: "Error interno", status: 500 },
      };
      throw err;
    }

    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: config.headers,
      config,
    } as AxiosResponse;
  };

  return captured;
}

function seedAuthenticatedStore() {
  useAuthStore.setState({
    status: "authenticated",
    accessToken: TEST_ACCESS_TOKEN,
    refreshToken: TEST_REFRESH_TOKEN,
    user: TEST_USER,
  });
}

function resetStore() {
  useAuthStore.setState({
    status: "unauthenticated",
    accessToken: null,
    refreshToken: null,
    user: null,
  });
}

describe("cliente API", () => {
  it("agrega Authorization: Bearer <token> a peticiones autenticadas", async () => {
    seedAuthenticatedStore();
    const captured = installFakeAdapter("ok");

    await apiClient.get("/api/v1/profile");

    expect(captured[0]?.authorization).toBe(`Bearer ${TEST_ACCESS_TOKEN}`);
    resetStore();
  });

  it("no adjunta token a rutas públicas de auth", async () => {
    resetStore();
    const captured = installFakeAdapter("ok");
    await apiClient.post("/api/v1/auth/refresh", { refreshToken: "x" });
    expect(captured[0]?.authorization).toBeNull();
  });

  it("no registra tokens en consola al fallar", async () => {
    const spies = {
      log: vi.spyOn(console, "log").mockImplementation(() => undefined),
      info: vi.spyOn(console, "info").mockImplementation(() => undefined),
      debugFlag: vi.spyOn(console, "debug").mockImplementation(() => undefined),
    };
    seedAuthenticatedStore();
    installFakeAdapter("fail");

    await expect(apiClient.get("/api/v1/profile")).rejects.toThrow();

    const all = [
      ...spies.log.mock.calls,
      ...spies.info.mock.calls,
      ...spies.debugFlag.mock.calls,
    ]
      .flat()
      .map(String)
      .join(" ");

    expect(all).not.toContain(TEST_ACCESS_TOKEN);
    expect(all).not.toContain("refresh");

    spies.log.mockRestore();
    spies.info.mockRestore();
    spies.debugFlag.mockRestore();
    resetStore();
  });
});