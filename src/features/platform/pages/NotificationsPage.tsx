import { useState } from "react";
import { Bell, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useNotifications,
  useReadAllNotifications,
  useToggleNotificationRead,
} from "@/features/platform/hooks";
import type { NotificationItem } from "@/features/platform/types";
import { formatPlatformDate, platformError } from "@/features/platform/pages/shared";

function safeInternalDeepLink(value: string | null): string | null {
  if (!value) return null;
  return value.startsWith("/app/") ? value : null;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const query = useNotifications();
  const toggle = useToggleNotificationRead();
  const readAll = useReadAllNotifications();
  const remove = useDeleteNotification();
  const removeAll = useDeleteAllNotifications();
  const [deleting, setDeleting] = useState<NotificationItem | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const unread = query.data?.filter((item) => !item.leida).length ?? 0;

  const openNotification = (item: NotificationItem) => {
    const destination = safeInternalDeepLink(item.deepLink);
    if (!destination) return;
    if (item.leida) {
      navigate(destination);
      return;
    }
    toggle.mutate(
      { id: item.id, leida: true },
      { onSettled: () => navigate(destination) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Notificaciones"
        description={`${unread} notificación${unread === 1 ? "" : "es"} sin leer.`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={<CheckCheck className="size-4" aria-hidden="true" />}
              loading={readAll.isPending}
              onClick={() =>
                readAll.mutate(undefined, {
                  onSuccess: () =>
                    setNotice("Todas las notificaciones fueron marcadas como leídas."),
                })
              }
            >
              Leer todas
            </Button>
            <Button variant="outline" onClick={() => setConfirmAll(true)}>
              Eliminar todas
            </Button>
          </div>
        }
      />

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {query.isPending ? <div className="skeleton h-64" /> : null}
      {query.isError ? (
        <ErrorState
          title="No se pudieron cargar las notificaciones"
          description={platformError(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.data?.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sin notificaciones"
          description="No hay notificaciones registradas."
        />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="space-y-3">
          {query.data.map((item) => {
            const destination = safeInternalDeepLink(item.deepLink);
            return (
              <Card
                key={item.id}
                className={!item.leida ? "border-line-strong" : undefined}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.titulo}</p>
                      {!item.leida ? <Badge tone="brand">Nueva</Badge> : null}
                      {item.evento ? <Badge tone="neutral">{item.evento}</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-secondary">{item.mensaje}</p>
                    <p className="mt-2 text-xs text-muted">
                      {formatPlatformDate(item.creadoEn)} · {item.tipo}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {destination ? (
                      <Button
                        size="sm"
                        leftIcon={<ExternalLink className="size-4" aria-hidden="true" />}
                        onClick={() => openNotification(item)}
                      >
                        Abrir
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      loading={toggle.isPending}
                      onClick={() => toggle.mutate({ id: item.id, leida: !item.leida })}
                    >
                      {item.leida ? "Marcar no leída" : "Marcar leída"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
                      onClick={() => setDeleting(item)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar notificación"
        description={deleting?.titulo ?? ""}
        confirmLabel="Eliminar"
        danger
        loading={remove.isPending}
        error={remove.isError ? platformError(remove.error) : null}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
      <ConfirmDialog
        open={confirmAll}
        title="Eliminar todas las notificaciones"
        description="Esta acción limpiará el historial completo de notificaciones."
        confirmLabel="Eliminar todas"
        danger
        loading={removeAll.isPending}
        error={removeAll.isError ? platformError(removeAll.error) : null}
        onCancel={() => setConfirmAll(false)}
        onConfirm={() =>
          removeAll.mutate(undefined, {
            onSuccess: () => {
              setConfirmAll(false);
              setNotice("Todas las notificaciones fueron eliminadas.");
            },
          })
        }
      />
    </div>
  );
}
