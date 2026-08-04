import { describe, expect, it } from "vitest";
import { LIVE_QUERY_INTERVAL, liveQueryOptions } from "@/api/liveQuery";

describe("liveQueryOptions", () => {
  it("actualiza mensajes e invitaciones sin recarga manual", () => {
    expect(LIVE_QUERY_INTERVAL.messages).toBe(3_000);
    expect(LIVE_QUERY_INTERVAL.invitations).toBe(5_000);
    expect(liveQueryOptions(5_000)).toMatchObject({
      refetchInterval: 5_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
      staleTime: 0,
    });
  });
});
