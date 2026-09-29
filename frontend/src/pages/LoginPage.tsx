import { useLayoutEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLoginMutation, useAuthSession } from "../features/auth/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginPage() {
  const loginMutation = useLoginMutation();
  const { data: session } = useAuthSession();
  const location = useLocation();
  useLayoutEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!themeColor) return;
    const previousColor = themeColor.content;
    themeColor.content = getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim();
    return () => {
      themeColor.content = previousColor;
    };
  }, []);
  const from: unknown =
    location.state?.from ??
    new URLSearchParams(location.search).get("returnTo");
  const destination =
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    !from.includes("\\") &&
    !from.startsWith("/login")
      ? from
      : "/";

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        const status =
          "status" in error ? (error as { status: number }).status : undefined;
        toast.error(
          status === 401
            ? "Das Beta-Passwort ist falsch."
            : "Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
        );
      },
    });
  };

  if (session?.authenticated) {
    return <Navigate to={destination} replace />;
  }

  return (
    <main className="login-page safe-page relative flex h-dvh flex-col overflow-y-auto bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative mx-auto my-auto flex w-full max-w-sm shrink-0 flex-col gap-6 rounded-xl bg-card p-8 shadow-card"
      >
        <div className="flex flex-row items-center justify-center gap-2">
          <img
            src="/buurekrom.svg"
            alt="Buurekrom"
            className="h-12 w-12 object-contain"
          />
          <div className="flex h-12 flex-col justify-center leading-tight">
            <span className="text-[1.5rem]">Buurekrom</span>
            <span className="inline-flex items-center gap-1 text-[0.625rem] font-medium text-outline-variant">
              <span className="rounded-sm border border-outline-variant bg-surface-container-highest px-1 py-px text-[0.5rem] font-semibold uppercase tracking-wide text-on-surface shadow-sm">
                Beta
              </span>
            </span>
          </div>
        </div>
        <p className="text-center text-body-sm text-muted-foreground">
          Gib das gemeinsame Beta-Passwort ein, um die App zu testen.
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-body-lg">
            Beta-Passwort
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-[0.8rem] font-medium text-destructive">
              Das Beta-Passwort ist erforderlich.
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
          className="w-full"
        >
          {loginMutation.isPending ? "Anmelden …" : "Anmelden"}
        </Button>

        <p className="text-center text-label-sm text-muted-foreground">
          Diese Web-Anwendung ist ausschließlich zur privaten Nutzung bestimmt
          und befindet sich noch in Entwicklung.
        </p>
      </form>
    </main>
  );
}
