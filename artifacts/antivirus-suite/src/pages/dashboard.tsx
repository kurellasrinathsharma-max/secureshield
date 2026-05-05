import { useState, useEffect } from "react";
import {
  ShieldCheck, Clock, AlertTriangle, Bug, ArrowRight, Shield, Globe,
  HardDrive, Search, MessageSquareWarning, Radio, RefreshCw,
  ExternalLink, Zap, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

type ThreatItem = {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  knownRansomwareCampaignUse: string;
};

type ThreatFeedResponse = {
  items: ThreatItem[];
  catalogVersion: string;
  cached: boolean;
  fetchedAt: number;
  stale?: boolean;
  error?: string;
};

type UserSettings = {
  displayName: string;
  emailAlertsEnabled: boolean;
  criticalThreatAlerts: boolean;
  threatFeedEnabled: boolean;
};

function daysAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function severityFromName(name: string): "critical" | "high" | "medium" {
  const lower = name.toLowerCase();
  if (lower.includes("remote code") || lower.includes("rce") || lower.includes("privilege escalation")) return "critical";
  if (lower.includes("injection") || lower.includes("authentication bypass") || lower.includes("deserialization")) return "high";
  return "medium";
}

const SEVERITY_STYLE = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-warning/10 text-warning border-warning/30",
  medium: "bg-primary/10 text-primary border-primary/30",
};

export default function Dashboard() {
  const [score, setScore] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setScore(98), 500);
    return () => clearTimeout(t);
  }, []);

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const r = await fetch(`${import.meta.env.BASE_URL}api/user/settings`);
      if (!r.ok) throw new Error("Failed to load settings");
      return r.json() as Promise<UserSettings>;
    },
    staleTime: 30 * 1000,
  });

  const threatFeedEnabled = settings?.threatFeedEnabled ?? true;
  const displayName = settings?.displayName ?? user?.name ?? "there";
  const firstName = displayName.split(" ")[0];

  const { data: feed, isLoading: feedLoading, refetch, dataUpdatedAt } = useQuery<ThreatFeedResponse>({
    queryKey: ["threat-feed"],
    queryFn: async () => {
      const r = await fetch(`${import.meta.env.BASE_URL}api/threat-feed`);
      if (!r.ok) throw new Error("Failed to load threat feed");
      return r.json() as Promise<ThreatFeedResponse>;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
    enabled: threatFeedEnabled,
  });

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">Your computer is protected.</p>
        </div>
        <div className="flex items-center gap-2 bg-safe/10 text-safe px-4 py-2 rounded-full border border-safe/20">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="text-sm font-medium">All systems active</span>
        </div>
      </div>

      {/* Protection score + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <CardHeader>
            <CardTitle>Protection Status</CardTitle>
            <CardDescription>Real-time security overview</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{score}%</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
              </div>
            </div>
            <div className="space-y-5 flex-1 w-full">
              {[
                { label: "Core Shields", value: 100, status: "Active", color: "text-safe" },
                { label: "Virus Definitions", value: 100, status: "Up to date", color: "text-muted-foreground" },
                { label: "Threat Database", value: 100, status: "Current", color: "text-muted-foreground" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{item.label}</span>
                    <span className={item.color}>{item.status}</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
              <div className="pt-1">
                <Link href="/scan">
                  <Button className="w-full" size="lg">
                    <Search className="mr-2 h-4 w-4" /> Smart Scan
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary rounded-lg shrink-0"><Clock className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Last Scan</div>
                  <div className="text-xl font-bold">2h ago</div>
                  <div className="text-xs text-muted-foreground">0 threats found</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary rounded-lg shrink-0"><Bug className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Threats Blocked</div>
                  <div className="text-xl font-bold">1,492</div>
                  <div className="text-xs text-muted-foreground">Last 30 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary rounded-lg shrink-0"><Zap className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Protection Days</div>
                  <div className="text-xl font-bold">247</div>
                  <div className="text-xs text-muted-foreground">Continuously active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick shield status row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { title: "File Shield", icon: HardDrive },
          { title: "Web Guard", icon: Globe },
          { title: "Ransomware", icon: Shield },
          { title: "Email Guard", icon: AlertTriangle },
        ].map((shield) => (
          <Link key={shield.title} href="/shields">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <shield.icon className="h-4 w-4" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-safe" />
                </div>
                <p className="font-semibold text-sm">{shield.title}</p>
                <p className="text-xs text-safe mt-0.5">Active</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Live Threat Intelligence Feed — conditionally shown */}
      <AnimatePresence mode="wait">
        {threatFeedEnabled ? (
          <motion.div key="feed-on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-destructive" />
                    <CardTitle>Live Threat Intelligence</CardTitle>
                    <div className="flex items-center gap-1.5 ml-1">
                      <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground font-medium">LIVE</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dataUpdatedAt > 0 && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => refetch()}
                      disabled={feedLoading}
                    >
                      <RefreshCw className={`w-4 h-4 ${feedLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Real-time feed from CISA's Known Exploited Vulnerabilities catalog — active threats attackers are using right now.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedLoading && !feed ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-secondary/40 rounded-lg animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                    ))}
                  </div>
                ) : feed?.error ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <AlertTriangle className="w-8 h-8 text-warning opacity-50" />
                    <p className="text-muted-foreground text-sm">Could not load threat feed. Check your connection.</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {feed?.stale && (
                      <div className="text-xs text-warning bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-md mb-3">
                        Showing cached data — live feed temporarily unavailable.
                      </div>
                    )}
                    {(feed?.items ?? []).map((item, i) => {
                      const severity = severityFromName(item.vulnerabilityName);
                      const isRansomware = item.knownRansomwareCampaignUse === "Known";
                      return (
                        <motion.div
                          key={item.cveID}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors group"
                        >
                          <div className="shrink-0 mt-2">
                            <div className={`w-2 h-2 rounded-full ${severity === "critical" ? "bg-destructive" : severity === "high" ? "bg-warning" : "bg-primary"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="font-mono text-xs font-bold text-primary">{item.cveID}</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${SEVERITY_STYLE[severity]}`}>
                                {severity.toUpperCase()}
                              </Badge>
                              {isRansomware && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-destructive/10 text-destructive border-destructive/30">
                                  RANSOMWARE
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto shrink-0">{daysAgo(item.dateAdded)}</span>
                            </div>
                            <p className="text-sm font-medium truncate">{item.vulnerabilityName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.vendorProject} · {item.product}
                            </p>
                          </div>
                          <a
                            href={`https://nvd.nist.gov/vuln/detail/${item.cveID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </motion.div>
                      );
                    })}
                    {feed?.catalogVersion && (
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Source: CISA KEV Catalog v{feed.catalogVersion} · Auto-refreshes every 5 min
                        </p>
                        <a
                          href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          Full catalog <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="feed-off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-dashed border-border/60 bg-secondary/20">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-background rounded-full shadow-sm opacity-40">
                    <Radio className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-muted-foreground">Threat Intelligence Feed — Off</h3>
                    <p className="text-sm text-muted-foreground">The live CISA exploit feed is disabled in your settings.</p>
                  </div>
                </div>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="shrink-0">
                    Enable in Settings <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scam Guardian CTA */}
      <Card className="bg-secondary/50 border-none">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-background rounded-full shadow-sm">
              <MessageSquareWarning className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-bold">Scam Guardian AI</h3>
              <p className="text-sm text-muted-foreground">Not sure if a link or message is safe? Ask our AI.</p>
            </div>
          </div>
          <Link href="/scam-guardian">
            <Button variant="outline" className="shrink-0">
              Try it out <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
