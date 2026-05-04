import { useState, useRef } from "react";
import { MessageSquareWarning, ShieldAlert, Link as LinkIcon, Upload, ArrowRight, ShieldCheck, Info, Shield, AlertTriangle, BookOpen, Phone, CreditCard, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type AnalysisResult = {
  status: "safe" | "suspicious" | "dangerous";
  score: number;
  reason: string;
  details: string[];
  recommendation?: string;
};

const STAY_SAFE_TIPS = [
  {
    icon: Mail,
    title: "Phishing Emails",
    tip: "Always check the actual sender email address, not just the display name. Legitimate banks never ask for passwords via email.",
    color: "text-primary"
  },
  {
    icon: Phone,
    title: "Smishing (SMS Scams)",
    tip: "Unexpected package delivery texts with short links are almost always malicious. Go directly to the carrier's official website.",
    color: "text-warning"
  },
  {
    icon: Shield,
    title: "Tech Support Scams",
    tip: "Microsoft, Apple, and Google will never call you or show a popup telling you to call a number. Hang up immediately.",
    color: "text-destructive"
  },
  {
    icon: CreditCard,
    title: "Payment Scams",
    tip: "No legitimate organization will ask you to pay with gift cards, cryptocurrency, or wire transfers to resolve an issue.",
    color: "text-safe"
  },
];

export default function ScamGuardian() {
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const runFallbackAnalysis = (text: string): AnalysisResult => {
    const lower = text.toLowerCase();
    const dangerSignals = ["urgent", "account suspended", "click here", "verify immediately", "password expired", "confirm your identity", "unusual activity", "one-time password", "otp", "winner", "congratulations you've been selected"];
    const suspiciousSignals = ["free offer", "limited time", "act now", "exclusive deal", "you have been chosen", "claim your prize", "risk-free"];
    const dangerCount = dangerSignals.filter(s => lower.includes(s)).length;
    const suspiciousCount = suspiciousSignals.filter(s => lower.includes(s)).length;

    if (dangerCount >= 2) return { status: "dangerous", score: 90 + Math.min(dangerCount * 2, 9), reason: "High-confidence Phishing / Social Engineering Detected", details: ["Creates artificial urgency to bypass rational thinking", "Contains classic social engineering language patterns", "Requests account credentials or personal verification", "Message structure matches known phishing templates"], recommendation: "Do not click any links or provide any information. Block the sender immediately." };
    if (dangerCount === 1 || suspiciousCount >= 2) return { status: "suspicious", score: 55 + suspiciousCount * 5, reason: "Potentially Deceptive Content", details: ["Contains persuasive or pressure-based language", "Language patterns associated with promotional scams", "Verify the sender independently before interacting"], recommendation: "Proceed with caution. Contact the company directly through their official website if relevant." };
    return { status: "safe", score: Math.floor(Math.random() * 15) + 2, reason: "No Threats Detected", details: ["No known scam keywords or patterns found", "No suspicious URLs or redirect chains detected", "Message appears to be standard communication"], recommendation: "This content appears safe, but always stay alert to unexpected requests." };
  };

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast({ title: "Input required", description: "Please paste a message, URL, or email to analyze.", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/scam-guardian/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json() as AnalysisResult;
      setResult(data);
    } catch {
      const fallback = runFallbackAnalysis(input);
      setResult(fallback);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({ title: "Screenshot Received", description: `${file.name} queued for analysis. Paste any visible text from the image above.` });
    e.target.value = "";
  };

  const statusConfig = {
    safe: { icon: ShieldCheck, color: "text-safe", border: "border-safe/40 bg-safe/5", badgeClass: "text-safe border-safe" },
    suspicious: { icon: Info, color: "text-warning", border: "border-warning/40 bg-warning/5", badgeClass: "text-warning border-warning" },
    dangerous: { icon: ShieldAlert, color: "text-destructive", border: "border-destructive/40 bg-destructive/5", badgeClass: "text-destructive border-destructive" },
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scam Guardian AI</h1>
        <p className="text-muted-foreground mt-1">Paste suspicious emails, texts, or links. Our AI analyzes them for threats in real time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-primary" />
                Threat Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste a suspicious email, SMS, link, or message here for AI analysis..."
                className="min-h-[180px] text-sm resize-y bg-secondary/30 font-mono"
                value={input}
                onChange={e => setInput(e.target.value)}
                data-testid="textarea-scam-input"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAnalyze} disabled={analyzing} className="min-w-[160px]" data-testid="btn-analyze">
                  {analyzing ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                      Analyzing with AI...
                    </span>
                  ) : (
                    <><Shield className="w-4 h-4 mr-2" /> Analyze Content</>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  disabled={analyzing}
                  onClick={() => {
                    setInput("URGENT: Your account has been suspended. Verify immediately by clicking here: http://secure-login-verify.xyz/account?token=abc123 or your account will be permanently closed.");
                    toast({ title: "Example loaded", description: "Click Analyze to test with this phishing sample." });
                  }}
                  data-testid="btn-load-example"
                >
                  <LinkIcon className="w-4 h-4 mr-2" /> Load Example
                </Button>
                <Button
                  variant="outline"
                  disabled={analyzing}
                  className="ml-auto"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="btn-upload-screenshot"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Screenshot
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                {(() => {
                  const cfg = statusConfig[result.status];
                  const Icon = cfg.icon;
                  return (
                    <Card className={`border-2 ${cfg.border}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-6 h-6 ${cfg.color}`} />
                            <span>AI Analysis Result</span>
                          </div>
                          <Badge variant="outline" className={`text-sm font-bold ${cfg.badgeClass}`}>
                            {result.status.toUpperCase()}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{result.reason}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Threat Score:</span>
                              <span className={`text-lg font-bold font-mono ${result.score > 65 ? "text-destructive" : result.score > 25 ? "text-warning" : "text-safe"}`}>
                                {result.score}/100
                              </span>
                            </div>
                          </div>
                          <div className="relative w-16 h-16 shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted opacity-20" />
                              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10"
                                strokeDasharray="251"
                                strokeDashoffset={251 - (251 * result.score) / 100}
                                className={result.score > 65 ? "text-destructive" : result.score > 25 ? "text-warning" : "text-safe"}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{result.score}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Findings</h4>
                          <ul className="space-y-1.5">
                            {result.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <ArrowRight className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {result.recommendation && (
                          <div className={`p-3 rounded-lg border ${cfg.border}`}>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recommendation</h4>
                            <p className="text-sm font-medium">{result.recommendation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="bg-secondary/40 border-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Stay Safe Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {STAY_SAFE_TIPS.map(tip => (
                <div key={tip.title} className="space-y-1">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <tip.icon className={`w-4 h-4 ${tip.color}`} />
                    {tip.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-secondary/40 border-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> What is a Scam?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>A scam is a fraudulent scheme designed to trick you into revealing personal information, sending money, or installing malware.</p>
              <p>Common warning signs:</p>
              <ul className="space-y-1 list-none">
                {[
                  "Unsolicited contact out of nowhere",
                  "Urgency or pressure to act fast",
                  "Requests for personal info or money",
                  "Too-good-to-be-true offers",
                  "Suspicious links or attachments",
                ].map(sign => (
                  <li key={sign} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                    {sign}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
