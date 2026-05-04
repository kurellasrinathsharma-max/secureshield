import { useState } from "react";
import { MessageSquareWarning, ShieldAlert, Link as LinkIcon, Upload, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type AnalysisResult = {
  status: 'safe' | 'suspicious' | 'dangerous' | null;
  score: number;
  reason: string;
  details: string[];
};

export default function ScamGuardian() {
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please paste a message, URL, or email to analyze.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    // Fake analysis
    setTimeout(() => {
      setAnalyzing(false);
      
      const text = input.toLowerCase();
      if (text.includes("urgent") || text.includes("account suspended") || text.includes("click here")) {
        setResult({
          status: "dangerous",
          score: 98,
          reason: "High probability of Phishing",
          details: [
            "Creates artificial urgency ('urgent', 'account suspended')",
            "Contains suspicious call-to-action ('click here')",
            "Sender domain does not match official company records",
            "Requests sensitive account information"
          ]
        });
      } else if (text.includes("offer") || text.includes("free") || text.includes("winner")) {
        setResult({
          status: "suspicious",
          score: 65,
          reason: "Potential Scam / Spam",
          details: [
            "Too-good-to-be-true language ('free', 'winner')",
            "Unsolicited promotional content",
            "Check the sender carefully before interacting"
          ]
        });
      } else {
        setResult({
          status: "safe",
          score: 5,
          reason: "No threats detected",
          details: [
            "No typical scam keywords found",
            "URL matches known safe patterns",
            "No suspicious tracking redirects detected"
          ]
        });
      }
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scam Guardian AI</h1>
        <p className="text-muted-foreground mt-1">Paste suspicious emails, texts, or links. Our AI will analyze them for threats.</p>
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
                placeholder="Paste an email, SMS text, or URL here..." 
                className="min-h-[200px] text-base resize-y bg-secondary/30"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAnalyze} disabled={analyzing} className="min-w-[150px]">
                  {analyzing ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                      Analyzing...
                    </span>
                  ) : (
                    "Analyze Content"
                  )}
                </Button>
                <Button variant="secondary" disabled={analyzing}>
                  <LinkIcon className="w-4 h-4 mr-2" /> Check Link Safety
                </Button>
                <Button variant="outline" className="ml-auto" disabled={analyzing}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Screenshot
                </Button>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={`border-2 ${
                  result.status === 'dangerous' ? 'border-destructive/50 bg-destructive/5' : 
                  result.status === 'suspicious' ? 'border-warning/50 bg-warning/5' : 
                  'border-safe/50 bg-safe/5'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.status === 'dangerous' ? <ShieldAlert className="w-6 h-6 text-destructive" /> :
                         result.status === 'suspicious' ? <Info className="w-6 h-6 text-warning" /> :
                         <ShieldCheck className="w-6 h-6 text-safe" />}
                        <span>Analysis Result</span>
                      </div>
                      <Badge variant="outline" className={`text-sm ${
                        result.status === 'dangerous' ? 'text-destructive border-destructive' : 
                        result.status === 'suspicious' ? 'text-warning border-warning' : 
                        'text-safe border-safe'
                      }`}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{result.reason}</h3>
                      <p className="text-muted-foreground">Threat Score: {result.score}/100</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Findings</h4>
                      <ul className="space-y-2">
                        {result.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="bg-secondary/50 border-none">
            <CardHeader>
              <CardTitle className="text-lg">Stay Safe Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Phishing Emails</h4>
                <p className="text-sm text-muted-foreground">Always check the actual sender email address, not just the display name. Banks rarely ask for passwords via email.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Smishing (SMS Scams)</h4>
                <p className="text-sm text-muted-foreground">Unexpected package delivery texts with links are almost always malicious. Go directly to the carrier's website instead.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Tech Support Scams</h4>
                <p className="text-sm text-muted-foreground">Microsoft or Apple will never call you or put a popup on your screen telling you to call them.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
