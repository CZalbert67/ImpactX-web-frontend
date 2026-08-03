import { useMemo, useState } from "react";
import {
  Ban,
  Check,
  Contact,
  Copy,
  MailPlus,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { RelationshipGuide } from "@/features/relationships/components/RelationshipGuide";
import { Select } from "@/components/ui/Select";
import {
  useAcceptContactInvitation,
  useBlockContact,
  useContacts,
  useCreateContactInvitation,
  useDeleteContact,
  useMakePrimaryContact,
  useRejectContactInvitation,
  useUpdateContact,
} from "@/features/platform/hooks";
import type {
  ContactInvitationInput,
  ContactItem,
  ContactResponseInput,
} from "@/features/platform/types";
import { formatPlatformDate, platformError } from "@/features/platform/pages/shared";

type TargetType = "username" | "publicProfileId" | "email";
type ConfirmAction = { kind: "revoke" | "block"; contact: ContactItem } | null;

function statusTone(status: string): BadgeTone {
  if (status === "Accepted") return "success";
  if (status === "Pending") return "warning";
  if (["Rejected", "Revoked", "Blocked", "Expired"].includes(status)) return "error";
  return "neutral";
}

function contactLabel(contact: ContactItem): string {
  if (contact.isOwner) {
    return (
      contact.contactName ??
      contact.contactUsername ??
      contact.targetEmailHint ??
      "Contacto pendiente"
    );
  }
  return contact.ownerName || contact.ownerUsername || "Invitación recibida";
}

function contactHandle(contact: ContactItem): string {
  if (contact.isOwner) {
    return contact.contactUsername
      ? `@${contact.contactUsername}`
      : contact.targetEmailHint ?? contact.contactPublicProfileId ?? "Sin cuenta vinculada";
  }
  return contact.ownerUsername
    ? `@${contact.ownerUsername}`
    : contact.ownerPublicProfileId;
}

export function ContactsPage() {
  const query = useContacts();
  const createInvitation = useCreateContactInvitation();
  const accept = useAcceptContactInvitation();
  const reject = useRejectContactInvitation();
  const update = useUpdateContact();
  const revoke = useDeleteContact();
  const makePrimary = useMakePrimaryContact();
  const block = useBlockContact();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [targetType, setTargetType] = useState<TargetType>("username");
  const [target, setTarget] = useState("");
  const [relationship, setRelationship] = useState("");
  const [priority, setPriority] = useState<"Primary" | "Secondary">("Secondary");
  const [makePrimaryWhenAccepted, setMakePrimaryWhenAccepted] = useState(false);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [responseCode, setResponseCode] = useState("");
  const [editing, setEditing] = useState<ContactItem | null>(null);
  const [editRelationship, setEditRelationship] = useState("");
  const [editPriority, setEditPriority] = useState<"Primary" | "Secondary">("Secondary");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pendingIncoming = useMemo(
    () => query.data?.filter((item) => item.status === "Pending" && !item.isOwner) ?? [],
    [query.data],
  );

  const openInvitation = () => {
    setManualCode(null);
    setInviteOpen(true);
  };

  const closeInvitation = () => {
    setManualCode(null);
    setInviteOpen(false);
  };

  const submitInvitation = () => {
    const value = target.trim();
    if (!value) return;
    setManualCode(null);
    const input: ContactInvitationInput = {
      relationship: relationship.trim() || undefined,
      priority,
      makePrimaryWhenAccepted,
      [targetType]: value,
    };
    createInvitation.mutate(input, {
      onSuccess: (response) => {
        setManualCode(response.manualCode);
        setNotice("Invitación creada. El código se muestra una sola vez.");
        setTarget("");
      },
    });
  };

  const respondWithCode = (mode: "accept" | "reject") => {
    const code = responseCode.trim();
    if (!code) return;
    const payload: ContactResponseInput = { code };
    const mutation = mode === "accept" ? accept : reject;
    mutation.mutate(payload, {
      onSuccess: () => {
        setResponseCode("");
        setNotice(mode === "accept" ? "Invitación aceptada." : "Invitación rechazada.");
      },
    });
  };

  const openEdit = (contact: ContactItem) => {
    setEditing(contact);
    setEditRelationship(contact.relationship ?? "");
    setEditPriority(contact.priority === "Primary" ? "Primary" : "Secondary");
  };

  const busy =
    createInvitation.isPending ||
    accept.isPending ||
    reject.isPending ||
    update.isPending ||
    revoke.isPending ||
    makePrimary.isPending ||
    block.isPending;

  const mutationError =
    createInvitation.error ??
    accept.error ??
    reject.error ??
    update.error ??
    revoke.error ??
    makePrimary.error ??
    block.error;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Contact}
        title="Contactos de emergencia"
        description="Invita usuarios ImpactX y administra relaciones aceptadas. No se almacenan teléfonos de terceros en este contrato."
        actions={
          <Button leftIcon={<MailPlus className="size-4" />} onClick={openInvitation}>
            Crear invitación
          </Button>
        }
      />

      <RelationshipGuide />

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {mutationError ? <Alert tone="error">{platformError(mutationError)}</Alert> : null}

      {pendingIncoming.length > 0 ? (
        <Alert tone="warning" title="Invitaciones pendientes">
          Tienes {pendingIncoming.length} invitación(es) por responder.
        </Alert>
      ) : null}

      <Card>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-brand" aria-hidden="true" />
          <h2 className="font-semibold">Responder con código manual</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          Úsalo cuando la invitación se creó por correo o te compartieron el código fuera de la plataforma.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={responseCode}
            onChange={(event) => setResponseCode(event.target.value)}
            placeholder="Código de invitación"
            autoComplete="off"
          />
          <Button disabled={!responseCode.trim() || busy} onClick={() => respondWithCode("accept")}>
            Aceptar
          </Button>
          <Button
            variant="outline"
            disabled={!responseCode.trim() || busy}
            onClick={() => respondWithCode("reject")}
          >
            Rechazar
          </Button>
        </div>
      </Card>

      {query.isPending ? <div className="skeleton h-64" /> : null}
      {query.isError ? (
        <ErrorState
          title="No se pudieron cargar los contactos"
          description={platformError(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data?.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="Sin relaciones de emergencia"
          description="Crea una invitación o acepta un código para vincular un contacto."
          action={<Button onClick={openInvitation}>Crear invitación</Button>}
        />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.map((item) => (
            <Card key={item.publicContactId}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{contactLabel(item)}</p>
                  <p className="truncate text-sm text-secondary">{contactHandle(item)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                  {item.isPrimary ? (
                    <Badge tone="brand" icon={<Star className="size-3" />}>
                      Principal
                    </Badge>
                  ) : null}
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <span className="text-muted">Relación: </span>
                  <span>{item.relationship || "No especificada"}</span>
                </div>
                <div>
                  <span className="text-muted">Prioridad: </span>
                  <span>{item.priority === "Primary" ? "Principal" : "Secundaria"}</span>
                </div>
                <div>
                  <span className="text-muted">Tipo: </span>
                  <span>{item.isOwner ? "Invitación enviada" : "Invitación recibida"}</span>
                </div>
                <div>
                  <span className="text-muted">Actualizado: </span>
                  <span>{formatPlatformDate(item.updatedAtUtc)}</span>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.status === "Pending" && !item.isOwner ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        accept.mutate(
                          { publicContactId: item.publicContactId },
                          { onSuccess: () => setNotice("Invitación aceptada.") },
                        )
                      }
                    >
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        reject.mutate(
                          { publicContactId: item.publicContactId },
                          { onSuccess: () => setNotice("Invitación rechazada.") },
                        )
                      }
                    >
                      Rechazar
                    </Button>
                  </>
                ) : null}

                {item.isOwner && item.status === "Accepted" ? (
                  <>
                    {!item.isPrimary ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          makePrimary.mutate(item.publicContactId, {
                            onSuccess: () => setNotice("Contacto principal actualizado."),
                          })
                        }
                      >
                        Hacer principal
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Pencil className="size-4" />}
                      onClick={() => openEdit(item)}
                    >
                      Editar
                    </Button>
                  </>
                ) : null}

                {!["Revoked", "Rejected", "Blocked", "Expired"].includes(item.status) ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-warning"
                      leftIcon={<Ban className="size-4" />}
                      onClick={() => setConfirmAction({ kind: "block", contact: item })}
                    >
                      Bloquear
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error"
                      leftIcon={<Trash2 className="size-4" />}
                      onClick={() => setConfirmAction({ kind: "revoke", contact: item })}
                    >
                      Revocar
                    </Button>
                  </>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Modal open={inviteOpen} onClose={closeInvitation} title="Invitar contacto">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
            <Select
              value={targetType}
              onChange={(event) => setTargetType(event.target.value as TargetType)}
              options={[
                { value: "username", label: "Usuario" },
                { value: "publicProfileId", label: "Perfil público" },
                { value: "email", label: "Correo" },
              ]}
            />
            <Input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder={
                targetType === "email"
                  ? "persona@ejemplo.com"
                  : targetType === "username"
                    ? "usuario"
                    : "USR-..."
              }
            />
          </div>
          <Input
            value={relationship}
            onChange={(event) => setRelationship(event.target.value)}
            placeholder="Parentesco o relación"
            maxLength={100}
          />
          <Select
            value={priority}
            onChange={(event) => setPriority(event.target.value as "Primary" | "Secondary")}
            options={[
              { value: "Secondary", label: "Prioridad secundaria" },
              { value: "Primary", label: "Prioridad principal" },
            ]}
          />
          <label className="flex items-start gap-2.5 rounded-lg bg-panel-soft p-3 text-sm text-secondary">
            <Checkbox
              checked={makePrimaryWhenAccepted}
              onChange={(event) => setMakePrimaryWhenAccepted(event.target.checked)}
            />
            Convertirlo en principal cuando acepte.
          </label>
          {createInvitation.isError ? (
            <Alert tone="error">{platformError(createInvitation.error)}</Alert>
          ) : null}
          {manualCode ? (
            <Alert tone="info" title="Código manual de un solo uso">
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded bg-panel-raised px-2 py-1 text-primary">{manualCode}</code>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Copy className="size-3.5" />}
                  onClick={() => void navigator.clipboard?.writeText(manualCode)}
                >
                  Copiar
                </Button>
              </div>
            </Alert>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeInvitation}>
              Cerrar
            </Button>
            <Button
              loading={createInvitation.isPending}
              disabled={!target.trim()}
              onClick={submitInvitation}
            >
              Crear invitación
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Editar relación">
        <div className="space-y-4">
          <Input
            value={editRelationship}
            onChange={(event) => setEditRelationship(event.target.value)}
            placeholder="Parentesco o relación"
            maxLength={100}
          />
          <Select
            value={editPriority}
            onChange={(event) => setEditPriority(event.target.value as "Primary" | "Secondary")}
            options={[
              { value: "Secondary", label: "Prioridad secundaria" },
              { value: "Primary", label: "Prioridad principal" },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              loading={update.isPending}
              onClick={() => {
                if (!editing) return;
                update.mutate(
                  {
                    id: editing.publicContactId,
                    input: {
                      relationship: editRelationship.trim() || undefined,
                      priority: editPriority,
                    },
                  },
                  {
                    onSuccess: () => {
                      setEditing(null);
                      setNotice("Relación actualizada.");
                    },
                  },
                );
              }}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.kind === "block" ? "Bloquear contacto" : "Revocar contacto"}
        description={
          confirmAction
            ? `${confirmAction.kind === "block" ? "Se bloqueará" : "Se revocará"} la relación con ${contactLabel(confirmAction.contact)}.`
            : ""
        }
        confirmLabel={confirmAction?.kind === "block" ? "Bloquear" : "Revocar"}
        danger
        loading={block.isPending || revoke.isPending}
        error={block.isError || revoke.isError ? platformError(block.error ?? revoke.error) : null}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          const mutation = confirmAction.kind === "block" ? block : revoke;
          mutation.mutate(confirmAction.contact.publicContactId, {
            onSuccess: () => {
              setNotice(confirmAction.kind === "block" ? "Contacto bloqueado." : "Contacto revocado.");
              setConfirmAction(null);
            },
          });
        }}
      />
    </div>
  );
}
