import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/configurator/auth/AuthProvider";

interface AuthGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after successful sign-in OR sign-up. */
  onAuthSuccess?: () => void;
  title?: string;
  description?: string;
}

type Mode = "login" | "signup";

export function AuthGateDialog({
  open,
  onOpenChange,
  onAuthSuccess,
  title = "Save your progress",
  description = "Sign in or create a free account to keep going. Your selections so far won't be lost.",
}: AuthGateDialogProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onAuthSuccess?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-md border border-border bg-muted/40 p-1 mb-2">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Log in
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-name">Full name</Label>
              <Input
                id="auth-name"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
