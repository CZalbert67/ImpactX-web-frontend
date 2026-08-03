import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCheck,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { userSafeErrorMessage } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useSession } from "@/features/auth/hooks/useSession";
import {
  useCreateQuickMessageTemplate,
  useDeleteQuickMessageTemplate,
  useMarkConversationRead,
  useQuickMessageHistory,
  useQuickMessageRecipients,
  useQuickMessageTemplates,
  useQuickMessageUnreadCount,
  useSendQuickMessage,
  useUpdateQuickMessageTemplate,
} from "@/features/messages/hooks";
import type {
  QuickMessage,
  QuickMessageRecipient,
  QuickMessageTemplate,
} from "@/features/messages/types";

function messageOf(error: unknown): string {
  return userSafeErrorMessage(
    error,
    "No pudimos completar la operación. Inténtalo nuevamente.",
  );
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat("es-MX", sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { day: "2-digit", month: "short" }).format(date);
}

interface ConversationItem {
  recipient: QuickMessageRecipient;
  lastMessage: QuickMessage | null;
  unread: number;
}

export function MessagesPage() {
  const { user } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const recipientsQuery = useQuickMessageRecipients();
  const generalHistory = useQuickMessageHistory(null);
  const templates = useQuickMessageTemplates();
  const unread = useQuickMessageUnreadCount();
  const sendMessage = useSendQuickMessage();
  const markConversationRead = useMarkConversationRead();
  const createTemplate = useCreateQuickMessageTemplate();
  const updateTemplate = useUpdateQuickMessageTemplate();
  const deleteTemplate = useDeleteQuickMessageTemplate();

  const [search, setSearch] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<QuickMessageTemplate | null>(null);
  const [templateText, setTemplateText] = useState("");
  const [sortOrder, setSortOrder] = useState("100");
  const [deleteCandidate, setDeleteCandidate] =
    useState<QuickMessageTemplate | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentProfileId = user?.publicProfileId ?? user?.id ?? "";
  const recipients = recipientsQuery.data ?? [];
  const requestedRecipient = searchParams.get("recipient") ?? "";
  const recipient = recipients.some(
    (value) => value.recipientPublicProfileId === requestedRecipient,
  )
    ? requestedRecipient
    : recipients[0]?.recipientPublicProfileId ?? "";
  const selectedRecipient = recipients.find(
    (value) => value.recipientPublicProfileId === recipient,
  ) ?? null;
  const history = useQuickMessageHistory(recipient || null);

  const conversations = useMemo<ConversationItem[]>(() => {
    const allMessages = generalHistory.data ?? [];
    return recipients
      .map((recipientItem) => {
        const related = allMessages.filter(
          (message) =>
            message.senderPublicProfileId === recipientItem.recipientPublicProfileId
            || message.recipientPublicProfileId === recipientItem.recipientPublicProfileId,
        );
        related.sort(
          (a, b) =>
            new Date(b.sentAtUtc).getTime() - new Date(a.sentAtUtc).getTime(),
        );
        return {
          recipient: recipientItem,
          lastMessage: related[0] ?? null,
          unread: related.filter(
            (message) =>
              message.senderPublicProfileId === recipientItem.recipientPublicProfileId
              && message.recipientPublicProfileId === currentProfileId
              && !message.isRead,
          ).length,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage
          ? new Date(a.lastMessage.sentAtUtc).getTime()
          : 0;
        const bTime = b.lastMessage
          ? new Date(b.lastMessage.sentAtUtc).getTime()
          : 0;
        return bTime - aTime;
      });
  }, [generalHistory.data, recipients, currentProfileId]);

  const filteredConversations = conversations.filter(({ recipient: value }) => {
    const term = search.trim().toLocaleLowerCase("es-MX");
    if (!term) return true;
    return `${value.recipientName} ${value.recipientUsername}`
      .toLocaleLowerCase("es-MX")
      .includes(term);
  });

  const orderedMessages = useMemo(
    () => [...(history.data ?? [])].sort(
      (a, b) =>
        new Date(a.sentAtUtc).getTime() - new Date(b.sentAtUtc).getTime(),
    ),
    [history.data],
  );
  const hasUnreadInOpenConversation = orderedMessages.some(
    (message) =>
      message.senderPublicProfileId === recipient
      && message.recipientPublicProfileId === currentProfileId
      && !message.isRead,
  );

  useEffect(() => {
    if (
      !recipient
      || !hasUnreadInOpenConversation
      || markConversationRead.isPending
    ) {
      return;
    }

    markConversationRead.mutate(recipient);
  }, [
    recipient,
    hasUnreadInOpenConversation,
    markConversationRead.isPending,
    markConversationRead.mutate,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [recipient, orderedMessages.length]);

  const selectedTemplateId =
    templateId || templates.data?.[0]?.publicTemplateId || "";
  const firstError = [
    sendMessage.error,
    markConversationRead.error,
    createTemplate.error,
    updateTemplate.error,
    deleteTemplate.error,
  ].find(Boolean);
  const busy =
    createTemplate.isPending
    || updateTemplate.isPending
    || deleteTemplate.isPending;

  const selectConversation = (publicProfileId: string) => {
    setSearchParams({ recipient: publicProfileId }, { replace: true });
  };

  const send = () => {
    if (!recipient || !selectedTemplateId) return;
    sendMessage.mutate(
      {
        recipientPublicProfileId: recipient,
        publicTemplateId: selectedTemplateId,
      },
      { onSuccess: () => setNotice("Mensaje rápido enviado.") },
    );
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setTemplateText("");
    setSortOrder("100");
    setEditorOpen(true);
  };

  const openEdit = (template: QuickMessageTemplate) => {
    setEditingTemplate(template);
    setTemplateText(template.text);
    setSortOrder(String(template.sortOrder));
    setEditorOpen(true);
  };

  const saveTemplate = () => {
    const text = templateText.trim();
    const order = Number(sortOrder);
    if (
      !text
      || text.length > 160
      || !Number.isInteger(order)
      || order < 0
      || order > 1000
    ) {
      setNotice(
        "La plantilla requiere texto de 1 a 160 caracteres y orden entre 0 y 1000.",
      );
      return;
    }

    const input = { text, sortOrder: order };
    if (editingTemplate) {
      updateTemplate.mutate(
        { publicTemplateId: editingTemplate.publicTemplateId, input },
        {
          onSuccess: () => {
            setEditorOpen(false);
            setNotice("Plantilla actualizada.");
          },
        },
      );
    } else {
      createTemplate.mutate(input, {
        onSuccess: () => {
          setEditorOpen(false);
          setNotice("Plantilla personalizada creada.");
        },
      });
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={MessageCircle}
        title="Mensajes rápidos"
        description="Conversaciones por persona con mensajes oficiales o personalizados. No se permite texto libre al enviar."
        actions={
          <Badge tone={unread.data ? "warning" : "neutral"}>
            {unread.data ?? 0} sin leer
          </Badge>
        }
      />

      {notice ? (
        <Alert
          tone={notice.startsWith("La plantilla requiere") ? "warning" : "success"}
        >
          {notice}
        </Alert>
      ) : null}
      {firstError ? <Alert tone="error">{messageOf(firstError)}</Alert> : null}

      <div className="grid min-h-[38rem] overflow-hidden rounded-2xl border border-line bg-panel-raised shadow-sm lg:grid-cols-[20rem_1fr]">
        <aside className="border-b border-line lg:border-b-0 lg:border-r">
          <div className="border-b border-line p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Conversaciones</h2>
              <Button size="sm" variant="ghost" onClick={() => setTemplatesOpen(true)}>
                Plantillas
              </Button>
            </div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar persona"
                className="pl-9"
              />
            </div>
          </div>

          {recipientsQuery.isPending || generalHistory.isPending ? (
            <div className="m-4 skeleton h-48" />
          ) : null}
          {recipientsQuery.isError || generalHistory.isError ? (
            <div className="p-4">
              <ErrorState
                description={messageOf(
                  recipientsQuery.error ?? generalHistory.error,
                )}
                onRetry={() => {
                  void recipientsQuery.refetch();
                  void generalHistory.refetch();
                }}
              />
            </div>
          ) : null}
          {!recipientsQuery.isPending && filteredConversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={UserRound}
                title="Sin conversaciones"
                description="Necesitas una relación de monitoreo aceptada con permiso de mensajes."
              />
            </div>
          ) : null}
          <ul className="max-h-[34rem] overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const item = conversation.recipient;
              const selected = item.recipientPublicProfileId === recipient;
              return (
                <li key={item.recipientPublicProfileId}>
                  <button
                    type="button"
                    onClick={() => selectConversation(item.recipientPublicProfileId)}
                    className={`w-full border-b border-line px-4 py-3 text-left transition hover:bg-panel-soft ${selected ? "bg-panel-soft" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {item.recipientName || item.recipientUsername}
                        </p>
                        <p className="truncate text-xs text-muted">
                          @{item.recipientUsername}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[0.7rem] text-muted">
                          {conversation.lastMessage
                            ? formatTime(conversation.lastMessage.sentAtUtc)
                            : ""}
                        </span>
                        {conversation.unread > 0 ? (
                          <Badge tone="brand">{conversation.unread}</Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-2 truncate text-sm text-secondary">
                      {conversation.lastMessage?.text ?? "Sin mensajes todavía"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="flex min-w-0 flex-col">
          {!selectedRecipient ? (
            <div className="grid flex-1 place-items-center p-6">
              <EmptyState
                icon={MessageCircle}
                title="Selecciona una conversación"
                description="Elige una persona para ver su historial y enviar un mensaje rápido."
              />
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <h2 className="font-semibold">
                    {selectedRecipient.recipientName
                      || selectedRecipient.recipientUsername}
                  </h2>
                  <p className="text-xs text-muted">
                    @{selectedRecipient.recipientUsername}
                  </p>
                </div>
                {history.isFetching ? <Badge tone="neutral">Actualizando…</Badge> : null}
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-panel-soft/40 p-5">
                {history.isPending ? <div className="skeleton h-56" /> : null}
                {history.isError ? (
                  <ErrorState
                    description={messageOf(history.error)}
                    onRetry={() => void history.refetch()}
                  />
                ) : null}
                {history.data && history.data.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="Sin mensajes"
                    description="Envía una plantilla para iniciar la conversación."
                  />
                ) : null}
                {orderedMessages.map((message) => {
                  const mine =
                    message.senderPublicProfileId === currentProfileId;
                  return (
                    <div
                      key={message.publicMessageId}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl border border-line px-4 py-3 ${mine ? "bg-[var(--color-primary)] text-[var(--color-bg-main)]" : "bg-panel-raised text-primary"}`}
                      >
                        <p className="font-medium">{message.text}</p>
                        <div
                          className={`mt-2 flex items-center justify-end gap-1 text-[0.68rem] ${mine ? "opacity-75" : "text-muted"}`}
                        >
                          {formatTime(message.sentAtUtc)}
                          {mine ? (
                            <CheckCheck
                              className="size-3.5"
                              aria-label={message.isRead ? "Leído" : "Enviado"}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>

              <footer className="border-t border-line bg-panel-raised p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <FormField label="Mensaje rápido">
                    {(fieldId) => (
                      <Select
                        id={fieldId}
                        value={selectedTemplateId}
                        onChange={(event) => setTemplateId(event.target.value)}
                        placeholder="Selecciona un mensaje"
                        options={(templates.data ?? []).map((template) => ({
                          value: template.publicTemplateId,
                          label: `${template.isSystem ? "Oficial" : "Personal"}: ${template.text}`,
                        }))}
                      />
                    )}
                  </FormField>
                  <Button
                    leftIcon={<Send className="size-4" aria-hidden="true" />}
                    loading={sendMessage.isPending}
                    disabled={!selectedTemplateId}
                    onClick={send}
                  >
                    Enviar
                  </Button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>

      <Modal
        open={templatesOpen}
        onClose={() => !busy && setTemplatesOpen(false)}
        title="Plantillas de mensajes"
        description="Puedes crear hasta 10 plantillas personales."
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              leftIcon={<Plus className="size-4" aria-hidden="true" />}
              onClick={openCreate}
            >
              Nueva
            </Button>
          </div>
          {templates.isPending ? <div className="skeleton h-48" /> : null}
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
            {(templates.data ?? []).map((template) => (
              <li
                key={template.publicTemplateId}
                className="rounded-lg border border-line bg-panel-soft p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge tone={template.isSystem ? "brand" : "neutral"}>
                      {template.isSystem ? "Oficial" : "Personal"}
                    </Badge>
                    <p className="mt-2 text-sm font-medium">{template.text}</p>
                  </div>
                  {!template.isSystem ? (
                    <div className="flex">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Editar plantilla"
                        onClick={() => openEdit(template)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-error"
                        aria-label="Eliminar plantilla"
                        onClick={() => setDeleteCandidate(template)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      <Modal
        open={editorOpen}
        onClose={busy ? () => undefined : () => setEditorOpen(false)}
        title={editingTemplate ? "Editar plantilla" : "Nueva plantilla"}
        description="La plantilla se podrá usar en cualquier conversación autorizada."
      >
        <div className="space-y-4">
          <FormField label="Texto" hint={`${templateText.length}/160 caracteres`}>
            {(fieldId) => (
              <Input
                id={fieldId}
                value={templateText}
                maxLength={160}
                onChange={(event) => setTemplateText(event.target.value)}
                placeholder="Mensaje breve"
              />
            )}
          </FormField>
          <FormField label="Orden" hint="Entre 0 y 1000.">
            {(fieldId) => (
              <Input
                id={fieldId}
                type="number"
                min={0}
                max={1000}
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            )}
          </FormField>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setEditorOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              loading={createTemplate.isPending || updateTemplate.isPending}
              onClick={saveTemplate}
            >
              {editingTemplate ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Eliminar plantilla"
        description={
          deleteCandidate
            ? `Se eliminará la plantilla “${deleteCandidate.text}”.`
            : ""
        }
        confirmLabel="Eliminar"
        danger
        loading={deleteTemplate.isPending}
        error={deleteTemplate.isError ? messageOf(deleteTemplate.error) : null}
        onConfirm={() =>
          deleteCandidate
          && deleteTemplate.mutate(deleteCandidate.publicTemplateId, {
            onSuccess: () => {
              setDeleteCandidate(null);
              setNotice("Plantilla eliminada.");
            },
          })
        }
        onCancel={() =>
          !deleteTemplate.isPending && setDeleteCandidate(null)
        }
      />
    </div>
  );
}
