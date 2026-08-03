import { describe, expect, it } from "vitest";
import { messagesApi } from "@/features/messages/api/messagesApi";

describe("contrato de conversaciones", () => {
  it("expone lectura completa por conversación", () => {
    expect(messagesApi).toHaveProperty("getRecipients");
    expect(messagesApi).toHaveProperty("getHistory");
    expect(messagesApi).toHaveProperty("markConversationRead");
  });
});
