import { useState } from "react";
import { MonitorSmartphone, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { useDeleteAllDevices, useDeleteDevice, useDevices, useRegisterDevice } from "@/features/platform/hooks";
import type { DeviceItem, DeviceRegistrationInput } from "@/features/platform/types";
import { formatPlatformDate, platformError } from "@/features/platform/pages/shared";

const EMPTY: DeviceRegistrationInput = { deviceId: "", platform: "web", token: "", name: "" };
export function DevicesPage() {
  const query = useDevices(); const register = useRegisterDevice(); const remove = useDeleteDevice(); const removeAll = useDeleteAllDevices();
  const [open, setOpen] = useState(false); const [deleting, setDeleting] = useState<DeviceItem | null>(null); const [confirmAll, setConfirmAll] = useState(false); const [form, setForm] = useState(EMPTY); const [notice, setNotice] = useState<string | null>(null);
  const submit = () => register.mutate({ ...form, deviceId: form.deviceId.trim(), token: form.token.trim(), name: form.name?.trim() || undefined }, { onSuccess: () => { setOpen(false); setForm(EMPTY); setNotice("Dispositivo registrado."); } });
  return <div className="space-y-6"><PageHeader icon={MonitorSmartphone} title="Dispositivos" description="Consulta sesiones de dispositivos y administra el token de notificaciones del navegador." actions={<div className="flex gap-2"><Button variant="outline" onClick={() => setConfirmAll(true)}>Eliminar todos</Button><Button leftIcon={<Plus className="size-4" />} onClick={() => setOpen(true)}>Registrar token</Button></div>} />{notice ? <Alert tone="success">{notice}</Alert> : null}
    {query.isPending ? <div className="skeleton h-64" /> : null}{query.isError ? <ErrorState title="No se pudieron cargar los dispositivos" description={platformError(query.error)} onRetry={() => void query.refetch()} /> : null}{query.data?.length === 0 ? <EmptyState icon={MonitorSmartphone} title="Sin dispositivos" description="No hay dispositivos registrados para notificaciones." /> : null}
    {query.data && query.data.length > 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.map((item) => <Card key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.nombre || item.deviceId}</p><p className="text-sm text-muted">{item.platform}</p></div><Badge tone={item.activo ? "success" : "neutral"}>{item.activo ? "Activo" : "Inactivo"}</Badge></div><p className="mt-4 text-xs text-muted">Último uso: {formatPlatformDate(item.ultimoUsoEn)}</p><Button className="mt-4" size="sm" variant="ghost" leftIcon={<Trash2 className="size-4" />} onClick={() => setDeleting(item)}>Eliminar</Button></Card>)}</div> : null}
    <Modal open={open} onClose={() => setOpen(false)} title="Registrar dispositivo"><div className="space-y-4"><Input placeholder="Identificador del dispositivo" value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} /><Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} options={[{ value: "web", label: "Web" }, { value: "android", label: "Android" }, { value: "ios", label: "iOS" }]} /><Input placeholder="Nombre (opcional)" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input placeholder="Token FCM" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />{register.isError ? <Alert tone="error">{platformError(register.error)}</Alert> : null}<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={!form.deviceId.trim() || !form.token.trim()} loading={register.isPending} onClick={submit}>Registrar</Button></div></div></Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Eliminar dispositivo" description="Se revocará este dispositivo de tu cuenta." confirmLabel="Eliminar" danger loading={remove.isPending} error={remove.isError ? platformError(remove.error) : null} onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { setDeleting(null); setNotice("Dispositivo eliminado."); } })} />
    <ConfirmDialog open={confirmAll} title="Eliminar todos los dispositivos" description="Se revocarán todos los tokens y dispositivos registrados." confirmLabel="Eliminar todos" danger loading={removeAll.isPending} error={removeAll.isError ? platformError(removeAll.error) : null} onCancel={() => setConfirmAll(false)} onConfirm={() => removeAll.mutate(undefined, { onSuccess: () => { setConfirmAll(false); setNotice("Todos los dispositivos fueron eliminados."); } })} />
  </div>;
}
