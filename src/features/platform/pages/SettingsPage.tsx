import { useState } from "react";
import { Copy, KeyRound, Settings } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import {
  useDisable2Fa,
  useEnable2Fa,
  useSettings,
  useSetup2Fa,
  useUpdateSettings,
} from "@/features/platform/hooks";
import { platformError } from "@/features/platform/pages/shared";
import type { SettingsData } from "@/features/platform/types";

interface SettingsFormProps {
  initialValue: SettingsData;
}

function SettingsForm({ initialValue }: SettingsFormProps) {
  const update = useUpdateSettings();
  const setup = useSetup2Fa();
  const enable = useEnable2Fa();
  const disable = useDisable2Fa();
  const [form, setForm] = useState(initialValue);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <>
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <Card>
        <h2 className="mb-4 font-semibold">Preferencias generales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            value={form.idioma ?? "es-MX"}
            onChange={(event) => setForm({ ...form, idioma: event.target.value })}
            options={[
              { value: "es-MX", label: "Español (México)" },
              { value: "en-US", label: "English" },
            ]}
          />
          <Select
            value={form.unidadVelocidad ?? "km/h"}
            onChange={(event) =>
              setForm({ ...form, unidadVelocidad: event.target.value })
            }
            options={[
              { value: "km/h", label: "km/h" },
              { value: "mph", label: "mph" },
            ]}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              ["notificacionesPush", "Notificaciones push"],
              ["notificacionesEmail", "Notificaciones por correo"],
              ["compartirUbicacion", "Compartir ubicación"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form[key]}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.checked })
                }
              />
              {label}
            </label>
          ))}
        </div>
        {update.isError ? (
          <Alert className="mt-4" tone="error">
            {platformError(update.error)}
          </Alert>
        ) : null}
        <Button
          className="mt-4"
          loading={update.isPending}
          onClick={() =>
            update.mutate(form, {
              onSuccess: (data) => {
                setForm(data);
                setNotice("Configuración actualizada.");
              },
            })
          }
        >
          Guardar configuración
        </Button>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-brand" />
          <h2 className="font-semibold">Autenticación de dos factores</h2>
        </div>
        <p className="mt-2 text-sm text-secondary">
          Estado: {form.twoFactorEnabled ? "Activada" : "Desactivada"}
        </p>
        {!form.twoFactorEnabled ? (
          <div className="mt-4 space-y-4">
            <Button
              variant="outline"
              loading={setup.isPending}
              onClick={() => setup.mutate()}
            >
              Generar clave 2FA
            </Button>
            {setup.data ? (
              <Alert tone="info">
                <p className="font-medium">Guarda esta clave en tu autenticador:</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="break-all">{setup.data.manualKey}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Copiar clave"
                    onClick={() =>
                      void navigator.clipboard?.writeText(setup.data.manualKey)
                    }
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </Alert>
            ) : null}
            <Input
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={12}
            />
            <Button
              disabled={!code.trim()}
              loading={enable.isPending}
              onClick={() =>
                enable.mutate(code.trim(), {
                  onSuccess: () => {
                    setCode("");
                    setForm((current) => ({ ...current, twoFactorEnabled: true }));
                    setNotice("2FA activada.");
                  },
                })
              }
            >
              Activar 2FA
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <Alert tone="warning">
              Para desactivar 2FA escribe un código válido de tu autenticador.
            </Alert>
            <Input
              placeholder="Código de 2FA"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <Button
              variant="danger"
              disabled={!code.trim()}
              loading={disable.isPending}
              onClick={() =>
                disable.mutate(code.trim(), {
                  onSuccess: () => {
                    setCode("");
                    setForm((current) => ({ ...current, twoFactorEnabled: false }));
                    setNotice("2FA desactivada.");
                  },
                })
              }
            >
              Desactivar 2FA
            </Button>
          </div>
        )}
        {setup.isError || enable.isError || disable.isError ? (
          <Alert className="mt-4" tone="error">
            {platformError(setup.error || enable.error || disable.error)}
          </Alert>
        ) : null}
      </Card>
    </>
  );
}

export function SettingsPage() {
  const query = useSettings();

  if (query.isError) {
    return (
      <ErrorState
        title="No se pudo cargar la configuración"
        description={platformError(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="Configuración"
        description="Preferencias generales y autenticación de dos factores."
      />
      {query.isPending ? <div className="skeleton h-64" /> : null}
      {query.data ? <SettingsForm initialValue={query.data} /> : null}
    </div>
  );
}
