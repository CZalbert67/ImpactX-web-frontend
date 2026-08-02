import { useState } from "react";
import { Contact, Pencil, Plus, Star, Trash2 } from "lucide-react";
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
import { useContacts, useCreateContact, useDeleteContact, useMakePrimaryContact, useUpdateContact } from "@/features/platform/hooks";
import type { ContactInput, ContactItem } from "@/features/platform/types";
import { platformError } from "@/features/platform/pages/shared";

const EMPTY: ContactInput = { nombre: "", telefono: "", parentesco: "", username: "", appUserId: "", priority: "Secundario", esPrincipal: false };

export function ContactsPage() {
  const query = useContacts(); const create = useCreateContact(); const update = useUpdateContact(); const remove = useDeleteContact(); const primary = useMakePrimaryContact();
  const [editing, setEditing] = useState<ContactItem | null>(null); const [formOpen, setFormOpen] = useState(false); const [deleting, setDeleting] = useState<ContactItem | null>(null); const [form, setForm] = useState<ContactInput>(EMPTY); const [notice, setNotice] = useState<string | null>(null);
  const openCreate = () => { setEditing(null); setForm(EMPTY); setFormOpen(true); };
  const openEdit = (item: ContactItem) => { setEditing(item); setForm({ nombre: item.nombre, telefono: item.telefono, parentesco: item.parentesco ?? "", username: item.username ?? "", appUserId: item.appUserId ?? "", priority: item.priority, esPrincipal: item.esPrincipal }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); setForm(EMPTY); };
  const submit = () => {
    setNotice(null);
    if (!form.nombre.trim() || !form.telefono.trim()) return;
    if (editing) update.mutate({ id: editing.id, input: { nombre: form.nombre.trim(), telefono: form.telefono.trim(), parentesco: form.parentesco?.trim(), priority: form.priority } }, { onSuccess: () => { closeForm(); setNotice("Contacto actualizado."); } });
    else create.mutate({ ...form, nombre: form.nombre.trim(), telefono: form.telefono.trim(), parentesco: form.parentesco?.trim() || undefined, username: form.username?.trim() || undefined, appUserId: form.appUserId?.trim() || undefined }, { onSuccess: () => { closeForm(); setNotice("Contacto creado."); } });
  };
  const mutationError = create.error || update.error;
  return <div className="space-y-6"><PageHeader icon={Contact} title="Contactos de emergencia" description="Administra los contactos que recibirán avisos en situaciones críticas." actions={<Button leftIcon={<Plus className="size-4" />} onClick={openCreate}>Agregar contacto</Button>} />
    {notice ? <Alert tone="success">{notice}</Alert> : null}
    {query.isPending ? <div className="skeleton h-64" /> : null}{query.isError ? <ErrorState title="No se pudieron cargar los contactos" description={platformError(query.error)} onRetry={() => void query.refetch()} /> : null}
    {query.data?.length === 0 ? <EmptyState icon={Contact} title="Sin contactos" description="Agrega al menos un contacto de emergencia." action={<Button onClick={openCreate}>Agregar contacto</Button>} /> : null}
    {query.data && query.data.length > 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data.map((item) => <Card key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.nombre}</p><p className="text-sm text-secondary">{item.telefono}</p></div>{item.esPrincipal ? <Badge tone="brand" icon={<Star className="size-3" />}>Principal</Badge> : null}</div><dl className="mt-4 space-y-2 text-sm"><div><span className="text-muted">Parentesco: </span><span>{item.parentesco || "No informado"}</span></div><div><span className="text-muted">Prioridad: </span><span>{item.priority}</span></div></dl><div className="mt-5 flex flex-wrap gap-2">{!item.esPrincipal ? <Button size="sm" variant="outline" onClick={() => primary.mutate(item.id)}>Hacer principal</Button> : null}<Button size="sm" variant="ghost" leftIcon={<Pencil className="size-4" />} onClick={() => openEdit(item)}>Editar</Button><Button size="sm" variant="ghost" leftIcon={<Trash2 className="size-4" />} onClick={() => setDeleting(item)}>Eliminar</Button></div></Card>)}</div> : null}
    <Modal open={formOpen} onClose={closeForm} title={editing ? "Editar contacto" : "Nuevo contacto"}><div className="space-y-4"><Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /><Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /><Input placeholder="Parentesco" value={form.parentesco ?? ""} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} />{!editing ? <><Input placeholder="Usuario ImpactX (opcional)" value={form.username ?? ""} onChange={(e) => setForm({ ...form, username: e.target.value })} /><Input placeholder="ID público ImpactX (opcional)" value={form.appUserId ?? ""} onChange={(e) => setForm({ ...form, appUserId: e.target.value })} /></> : null}<Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={[{ value: "Principal", label: "Principal" }, { value: "Secundario", label: "Secundario" }]} />{mutationError ? <Alert tone="error">{platformError(mutationError)}</Alert> : null}<div className="flex justify-end gap-2"><Button variant="ghost" onClick={closeForm}>Cancelar</Button><Button loading={create.isPending || update.isPending} onClick={submit}>Guardar</Button></div></div></Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Eliminar contacto" description={deleting ? `Se eliminará a ${deleting.nombre}.` : ""} confirmLabel="Eliminar" danger loading={remove.isPending} error={remove.isError ? platformError(remove.error) : null} onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { setDeleting(null); setNotice("Contacto eliminado."); } })} />
  </div>;
}
