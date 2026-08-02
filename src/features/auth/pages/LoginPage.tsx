import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}