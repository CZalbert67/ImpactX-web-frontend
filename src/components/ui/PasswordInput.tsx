import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

export interface PasswordInputProps extends InputProps {
  /** Cambia el autocomplete sugerido a «new-password». */
  newPassword?: boolean;
}

export function PasswordInput({ className, newPassword = false, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        autoComplete={newPassword ? "new-password" : "current-password"}
        className={cn("pr-10", className)}
        {...rest}
      />
      <IconButton
        type="button"
        icon={visible ? EyeOff : Eye}
        label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        size="sm"
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-1 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}