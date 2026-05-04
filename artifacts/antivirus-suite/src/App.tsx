import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Scan from "@/pages/scan";
import ScamGuardian from "@/pages/scam-guardian";
import Shields from "@/pages/shields";
import RescueDisk from "@/pages/rescue-disk";
import Privacy from "@/pages/privacy";
import Performance from "@/pages/performance";
import SecurityTools from "@/pages/security";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/scan" component={Scan} />
        <Route path="/scam-guardian" component={ScamGuardian} />
        <Route path="/shields" component={Shields} />
        <Route path="/rescue-disk" component={RescueDisk} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/performance" component={Performance} />
        <Route path="/security" component={SecurityTools} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="secure-shield-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
