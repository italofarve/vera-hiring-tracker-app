import { useEffect, useState } from "react";
import { useUser, useClerk, useAuth } from "@clerk/react";
import { Loader2 } from "lucide-react";

const DENIED_MESSAGE =
  "Acceso denegado, sólo los usuarios del Laboratorio 7 de IA Generativa - IE pueden registrarse e iniciar sesión.";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type CheckState =
  | { status: "checking" }
  | { status: "allowed" }
  | { status: "denied"; email: string }
  | { status: "error"; message: string };

interface Props {
  children: React.ReactNode;
}

export function AccessGate({ children }: Props) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [state, setState] = useState<CheckState>({ status: "checking" });

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;
    setState({ status: "checking" });

    (async () => {
      try {
        const token = await getToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`/api/access/check`, {
          credentials: "include",
          headers,
        });
        if (cancelled) return;

        if (res.status === 200) {
          const data = (await res.json()) as {
            allowed: boolean;
            email?: string;
          };
          if (data.allowed) {
            setState({ status: "allowed" });
          } else {
            setState({ status: "denied", email: data.email || email });
          }
          return;
        }
        if (res.status === 401 || res.status === 403) {
          setState({ status: "denied", email });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: (err as Error).message || "Error de red",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // getToken can be referentially unstable across renders in some Clerk setups.
    // Keeping it out of deps avoids a re-check loop that prevents the app shell
    // from rendering after sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, email]);

  if (!isLoaded || state.status === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Verificando acceso…</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            No pudimos verificar tu acceso
          </h2>
          <p className="text-sm text-muted-foreground">
            {state.message}. Inténtalo de nuevo en unos segundos.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md bg-[#00205b] text-white text-sm hover:bg-[#00205b]/90"
            >
              Reintentar
            </button>
            <button
              onClick={() => signOut({ redirectUrl: `${basePath}/sign-in` })}
              className="px-4 py-2 rounded-md border border-border text-foreground text-sm hover:bg-muted"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "denied") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg flex flex-col items-center text-center space-y-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00205b] shadow-md">
            <span className="text-white font-bold text-2xl tracking-tight">V</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              Acceso denegado
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {DENIED_MESSAGE}
            </p>
            {state.email ? (
              <p className="text-xs text-muted-foreground">
                Cuenta verificada:{" "}
                <span className="font-mono">{state.email}</span>
              </p>
            ) : null}
          </div>
          <button
            onClick={() => signOut({ redirectUrl: `${basePath}/sign-in` })}
            className="px-5 py-2.5 rounded-md bg-[#00205b] text-white text-sm font-medium hover:bg-[#00205b]/90"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
