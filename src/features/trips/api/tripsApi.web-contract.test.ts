import { describe, expect, it } from "vitest";
import { tripsApi } from "@/features/trips/api/tripsApi";

describe("contrato web de viajes", () => {
  it("solo expone consultas y no mutaciones de control", () => {
    expect(tripsApi).toHaveProperty("getTrips");
    expect(tripsApi).toHaveProperty("getActiveTrip");
    expect(tripsApi).toHaveProperty("getTripsSummary");
    expect(tripsApi).not.toHaveProperty("startTrip");
    expect(tripsApi).not.toHaveProperty("pauseTrip");
    expect(tripsApi).not.toHaveProperty("resumeTrip");
    expect(tripsApi).not.toHaveProperty("finishTrip");
  });
});
