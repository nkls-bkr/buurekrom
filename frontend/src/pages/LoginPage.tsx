import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLoginMutation, useMe } from "../features/auth/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import fieldImg from "@/assets/field.jpg";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const { data: me } = useMe();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (me) {
      navigate("/", { replace: true });
    }
  }, [me, navigate]);

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate("/", { replace: true }),
      onError: (error) => {
        const status =
          "status" in error ? (error as { status: number }).status : undefined;
        toast.error(
          status === 401
            ? "Benutzername oder Passwort ist falsch."
            : "Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
        );
      },
    });
  };

  return (
    <main className="relative flex min-h-full items-center justify-center p-6">
      <img
        src={fieldImg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex w-full max-w-sm flex-col gap-6 rounded-xl bg-card p-8 shadow-card"
      >
        <div className="flex flex-row items-center justify-center gap-2">
          <img
            src="/buurekrom.png"
            alt="Buurekrom"
            className="h-12 w-12 object-contain"
          />
          <span className="text-[1.5rem]">Buurekrom</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="username" className="text-body-lg">
            Benutzername
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            aria-invalid={!!errors.username}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-[0.8rem] font-medium text-destructive">
              Benutzername ist erforderlich.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-body-lg">
            Passwort
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
              Passwort ist erforderlich.
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

      <footer className="pointer-events-none absolute inset-x-0 bottom-4 text-center"></footer>
    </main>
  );
}
