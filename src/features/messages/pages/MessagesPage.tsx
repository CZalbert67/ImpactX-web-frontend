import { useMemo, useState } from "react";
import { CheckCheck, MessageCircle, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router";
import { AppApiError } from "@/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
  useMarkQuickMessageRead,
  useQuickMessageHistory,
  useQuickMessageTemplates,
  useQuickMessageUnreadCount,
  useSendQuickMessage,
  useUpdateQuickMessageTemplate,
} from "@/features/messages/hooks";
import type { QuickMessageTemplate } from "@/features/messages/types";
import { useMonitoringRelationships } from "@/features/monitoring/hooks";

function messageOf(error: unknown): string {
  return error instanceof AppApiError ? error.message : "No se pudo completar la operación.";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function MessagesPage() {
  const { user } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const relationships = useMonitoringRelationships();
  const templates = useQuickMessageTemplates();
  const unread = useQuickMessageUnreadCount();
  const requestedRecipient = searchParams.get("recipient") ?? "";
  const sendMessage = useSendQuickMessage();
  const createTemplate = useCreateQuickMessageTemplate();
  const updateTemplate = useUpdateQuickMessageTemplate();
  const deleteTemplate = useDeleteQuickMessageTemplate();
  const markRead = useMarkQuickMessageRead();

  const [templateId, setTemplateId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuickMessageTemplate | null>(null);
  const [templateText, setTemplateText] = useState("");
  const [sortOrder, setSortOrder] = useState("100");
  const [deleteCandidate, setDeleteCandidate] = useState<QuickMessageTemplate | null>(null);

  const currentProfileId = user?.publicProfileId ?? user?.id ?? "";
  const recipients = useMemo(() => {
    const values = relationships.data ?? [];
    const map = new Map<string, { id: string; label: string }>();
    for (const relation of values) {
      if (relation.status !== "Accepted" || !relation.permissions.sendMessages) continue;
      const isMonitor = relation.monitorPublicProfileId === currentProfileId;
      const id = isMonitor ? relation.monitoredPublicProfileId : relation.monitorPublicProfileId;
      const username = isMonitor ? relation.monitoredUsername : relation.monitorUsername;
      const name = isMonitor ? relation.monitoredName : relation.monitorName;
      if (id) map.set(id, { id, label: name || username || id });
    }
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [relationships.data, currentProfileId]);

  const recipient = recipients.some((value) => value.id === requestedRecipient)
    ? requestedRecipient
    : "";
  const selectedTemplateId =
    templateId || templates.data?.[0]?.publicTemplateId || "";
  const history = useQuickMessageHistory(recipient || null);

  const firstError = [sendMessage.error, createTemplate.error, updateTemplate.error, deleteTemplate.error, markRead.error].find(Boolean);
  const busy = sendMessage.isPending || createTemplate.isPending || updateTemplate.isPending || deleteTemplate.isPending || markRead.isPending;

  const changeRecipient = (value: string) => {
    setSearchParams(value ? { recipient: value } : {}, { replace: true });
  };

  const send = () => {
    if (!recipient || !selectedTemplateId) return;
    sendMessage.mutate(
      { recipientPublicProfileId: recipient, publicTemplateId: selectedTemplateId },
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
    if (!text || text.length > 160 || !Number.isInteger(order) || order < 0 || order > 1000) {
      setNotice("La plantilla requiere texto de 1 a 160 caracteres y orden entre 0 y 1000.");
      return;
    }
    const input = { text, sortOrder: order };
    if (editingTemplate) {
      updateTemplate.mutate(
        { publicTemplateId: editingTemplate.publicTemplateId, input },
        { onSuccess: () => { setEditorOpen(false); setNotice("Plantilla actualizada."); } },
      );
    } else {
      createTemplate.mutate(input, {
        onSuccess: () => { setEditorOpen(false); setNotice("Plantilla personalizada creada."); },
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageCircle}
        title="Mensajes rápidos"
        description="Envía únicamente plantillas oficiales o personalizadas dentro de relaciones aceptadas. No existe texto libre al enviar."
        actions={<Badge tone={unread.data ? "warning" : "neutral"}>{unread.data ?? 0} sin leer</Badge>}
      />

      {notice ? <Alert tone={notice.startsWith("La plantilla requiere") ? "warning" : "success"}>{notice}</Alert> : null}
      {firstError ? <Alert tone="error">{messageOf(firstError)}</Alert> : null}

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <FormField label="Destinatario" hint="Solo relaciones aceptadas con permiso de mensajería.">
            {(fieldId) => (
              <Select
                id={fieldId}
                value={recipient}
                onChange={(event) => changeRecipient(event.target.value)}
                placeholder="Selecciona una persona"
                options={recipients.map((value) => ({ value: value.id, label: value.label }))}
              />
            )}
          </FormField>
          <FormField label="Plantilla">
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
            disabled={!recipient || !templateId}
            onClick={send}
          >
            Enviar
          </Button>
        </div>
        {recipients.length === 0 ? (
          <Alert tone="info" className="mt-4">
            No hay destinatarios habilitados. Acepta una relación de monitoreo y activa el permiso de mensajes.
          </Alert>
        ) : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Historial {recipient ? "de conversación" : "general"}</h2>
            {history.isFetching ? <Badge tone="neutral">Actualizando…</Badge> : null}
          </div>
          {history.isPending ? <div className="skeleton h-56" /> : null}
          {history.isError ? <ErrorState description={messageOf(history.error)} onRetry={() => void history.refetch()} /> : null}
          {history.data && history.data.length === 0 ? <EmptyState icon={MessageCircle} title="Sin mensajes" description="Los mensajes enviados y recibidos aparecerán aquí." /> : null}
          {history.data && history.data.length > 0 ? (
            <ul className="space-y-3">
              {[...history.data].sort((a, b) => new Date(b.sentAtUtc).getTime() - new Date(a.sentAtUtc).getTime()).map((message) => {
                const mine = message.senderPublicProfileId === currentProfileId;
                return (
                  <li key={message.publicMessageId} className={`rounded-xl border border-line p-3 ${mine ? "ml-6 bg-panel-soft" : "mr-6 bg-panel-raised"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted">{mine ? `Para @${message.recipientUsername}` : `De @${message.senderUsername}`}</p>
                        <p className="mt-1 font-medium">{message.text}</p>
                      </div>
                      <Badge tone={message.isRead ? "success" : "warning"}>{message.isRead ? "Leído" : "Nuevo"}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                      <span>{formatDate(message.sentAtUtc)}</span>
                      {!mine && !message.isRead ? (
                        <Button size="sm" variant="ghost" leftIcon={<CheckCheck className="size-3.5" aria-hidden="true" />} disabled={busy} onClick={() => markRead.mutate(message.publicMessageId, { onSuccess: () => setNotice("Mensaje marcado como leído.") })}>
                          Marcar leído
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Plantillas</h2>
              <p className="mt-1 text-xs text-muted">Máximo 10 plantillas personalizadas activas.</p>
            </div>
            <Button size="sm" leftIcon={<Plus className="size-4" aria-hidden="true" />} onClick={openCreate}>Nueva</Button>
          </div>
          {templates.isPending ? <div className="skeleton h-48" /> : null}
          {templates.isError ? <ErrorState description={messageOf(templates.error)} onRetry={() => void templates.refetch()} /> : null}
          {templates.data ? (
            <ul className="space-y-2">
              {templates.data.map((template) => (
                <li key={template.publicTemplateId} className="rounded-lg border border-line bg-panel-soft p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2"><Badge tone={template.isSystem ? "brand" : "neutral"}>{template.isSystem ? "Oficial" : "Personal"}</Badge><span className="text-xs text-muted">Orden {template.sortOrder}</span></div>
                      <p className="mt-2 text-sm font-medium">{template.text}</p>
                    </div>
                    {!template.isSystem ? (
                      <div className="flex">
                        <Button size="sm" variant="ghost" aria-label="Editar plantilla" onClick={() => openEdit(template)}><Pencil className="size-4" aria-hidden="true" /></Button>
                        <Button size="sm" variant="ghost" className="text-error" aria-label="Eliminar plantilla" onClick={() => setDeleteCandidate(template)}><Trash2 className="size-4" aria-hidden="true" /></Button>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>

      <Modal open={editorOpen} onClose={busy ? () => undefined : () => setEditorOpen(false)} title={editingTemplate ? "Editar plantilla" : "Nueva plantilla"} description="El texto se guarda como plantilla; al enviar no se permite escribir texto libre.">
        <div className="space-y-4">
          {(createTemplate.isError || updateTemplate.isError) ? <Alert tone="error">{messageOf(createTemplate.error ?? updateTemplate.error)}</Alert> : null}
          <FormField label="Texto" hint={`${templateText.length}/160 caracteres`}>
            {(fieldId) => <Input id={fieldId} value={templateText} maxLength={160} onChange={(event) => setTemplateText(event.target.value)} placeholder="Mensaje breve" />}
          </FormField>
          <FormField label="Orden" hint="Entre 0 y 1000.">
            {(fieldId) => <Input id={fieldId} type="number" min={0} max={1000} value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />}
          </FormField>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" disabled={busy} onClick={() => setEditorOpen(false)}>Cancelar</Button>
            <Button loading={createTemplate.isPending || updateTemplate.isPending} onClick={saveTemplate}>{editingTemplate ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Eliminar plantilla"
        description={deleteCandidate ? `Se eliminará la plantilla “${deleteCandidate.text}”. El historial de mensajes conservará su copia inmutable.` : ""}
        confirmLabel="Eliminar"
        danger
        loading={deleteTemplate.isPending}
        error={deleteTemplate.isError ? messageOf(deleteTemplate.error) : null}
        onConfirm={() => deleteCandidate && deleteTemplate.mutate(deleteCandidate.publicTemplateId, { onSuccess: () => { setDeleteCandidate(null); setNotice("Plantilla eliminada."); } })}
        onCancel={() => !deleteTemplate.isPending && setDeleteCandidate(null)}
      />
    </div>
  );
}
