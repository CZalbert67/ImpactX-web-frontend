import { describe, expect, it } from "vitest";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { STORAGE_KEYS } from "@/lib/constants";
import { makeSessionSnapshot } from "@/test/test-utils";

describe("AuthStore", () => {
  it("setSession persiste en sessionStorage y marca autenticado", () => {
    useAuthStore.getState().setSession(makeSessionSnapshot());

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user?.correo).toBe("maria@test.invalid");
    expect(window.sessionStorage.getItem(STORAGE_KEYS.session)).not.toBeNull();
  });

  it("restore recupera la sesión persistida", () => {
    useAuthStore.getState().setSession(makeSessionSnapshot());
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setSession(makeSessionSnapshot());
    useAuthStore.getState().restore();

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user?.nombre).toBe("María López");
  });

  it("clearSession limpia storage y estado", () => {
    useAuthStore.getState().setSession(makeSessionSnapshot());
    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.status).toBe("unauthenticated");
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });
});