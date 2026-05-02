import { useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  RedirectToSignIn,
  useClerk,
} from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AccessGate } from "@/components/AccessGate";
import { Dashboard } from "@/pages/Dashboard";
import { Candidates } from "@/pages/Candidates";
import { CandidateDetail } from "@/pages/CandidateDetail";
import { Positions } from "@/pages/Positions";
import { PositionDetail } from "@/pages/PositionDetail";
import { Interviews } from "@/pages/Interviews";
import { Feedback } from "@/pages/Feedback";
import { Portal } from "@/pages/Portal";
import { ApplyPage } from "@/pages/ApplyPage";
import { Help } from "@/pages/Help";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const PROXY_URL = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00205b] mb-4 shadow-md">
            <span className="text-white font-bold text-2xl tracking-tight">V</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Vera Talent Acquisition</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Sign in to access the hiring platform</p>
        </div>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          appearance={{
            elements: {
              card: "shadow-md border border-border rounded-xl",
              formButtonPrimary: "bg-[#00205b] hover:bg-[#00205b]/90",
              footerActionLink: "text-[#00205b]",
            },
          }}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00205b] mb-4 shadow-md">
            <span className="text-white font-bold text-2xl tracking-tight">V</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Vera Talent Acquisition</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Create your account</p>
        </div>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          appearance={{
            elements: {
              card: "shadow-md border border-border rounded-xl",
              formButtonPrimary: "bg-[#00205b] hover:bg-[#00205b]/90",
              footerActionLink: "text-[#00205b]",
            },
          }}
        />
      </div>
    </div>
  );
}

function ClerkQueryCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <AccessGate>
          <Component />
        </AccessGate>
      </Show>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  );
}

function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <AccessGate>
          <Layout>{children}</Layout>
        </AccessGate>
      </Show>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/portal" component={Portal} />
      <Route path="/portal/:id" component={ApplyPage} />
      <Route path="/">
        <HRLayout><Dashboard /></HRLayout>
      </Route>
      <Route path="/candidates">
        <HRLayout><Candidates /></HRLayout>
      </Route>
      <Route path="/candidates/:id">
        <HRLayout><CandidateDetail /></HRLayout>
      </Route>
      <Route path="/positions">
        <HRLayout><Positions /></HRLayout>
      </Route>
      <Route path="/positions/:id">
        <HRLayout><PositionDetail /></HRLayout>
      </Route>
      <Route path="/interviews">
        <HRLayout><Interviews /></HRLayout>
      </Route>
      <Route path="/feedback">
        <HRLayout><Feedback /></HRLayout>
      </Route>
      <Route path="/help">
        <HRLayout><Help /></HRLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        proxyUrl={PROXY_URL}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        routerPush={(to) => setLocation(stripBase(to))}
        routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      >
        <ClerkQueryCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      {PUBLISHABLE_KEY ? (
        <ClerkProviderWithRoutes />
      ) : (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Layout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/candidates" component={Candidates} />
                <Route path="/candidates/:id" component={CandidateDetail} />
                <Route path="/positions" component={Positions} />
                <Route path="/positions/:id" component={PositionDetail} />
                <Route path="/interviews" component={Interviews} />
                <Route path="/feedback" component={Feedback} />
                <Route path="/help" component={Help} />
                <Route path="/portal" component={Portal} />
                <Route path="/portal/:id" component={ApplyPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      )}
    </WouterRouter>
  );
}

export default App;
