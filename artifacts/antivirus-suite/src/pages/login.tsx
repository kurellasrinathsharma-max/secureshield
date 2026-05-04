import { useState, useRef, useEffect } from "react";
import { Shield, Mail, User, ArrowRight, RefreshCw, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type AuthUser } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

type Tab = "login" | "register";
type Step = "email" | "otp";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    if (!email || !email.includes("@")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (tab === "register" && !name.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name: tab === "register" ? name : email.split("@")[0] }),
      });
      const data = await res.json() as { message: string; devOtp?: string };
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
      setDevOtp(data.devOtp ?? null);
      setStep("otp");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      toast({ title: "Code sent!", description: data.devOtp ? "Dev mode: code shown below." : `Check ${email} for your verification code.` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast({ title: "Incomplete code", description: "Enter all 6 digits.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json() as { user?: AuthUser; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      if (data.user) {
        toast({ title: `Welcome, ${data.user.name}!`, description: "You are now logged in to SecureShield." });
        setUser(data.user);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Incorrect code.";
      toast({ title: "Verification failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length > 0) {
      setOtp([...text.split(""), ...Array(6 - text.length).fill("")]);
      otpRefs.current[Math.min(text.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setDevOtp(null);
    setEmail("");
    setName("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-64 -right-64 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5" />
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -inset-1 rounded-2xl border border-primary/10 animate-[ping_3s_ease-in-out_infinite]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SecureShield</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Enterprise-grade protection for everyone</p>
        </div>

        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/40 p-8">
          {/* Tab switcher */}
          <div className="flex bg-secondary/50 rounded-xl p-1 mb-8">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => switchTab(t)}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div key="email-step" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold">{tab === "login" ? "Welcome back" : "Create your account"}</h2>
                  <p className="text-muted-foreground text-sm">
                    {tab === "login" ? "Enter your email and we'll send a verification code." : "Sign up to protect your digital life."}
                  </p>
                </div>

                {tab === "register" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="pl-10"
                        data-testid="input-name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendOtp()}
                      className="pl-10"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <Button className="w-full h-11 text-base rounded-xl" onClick={sendOtp} disabled={loading} data-testid="btn-send-otp">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  {tab === "login" ? "Send Verification Code" : "Create Account"}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="otp-step" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold">Check your email</h2>
                  <p className="text-muted-foreground text-sm">
                    We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>
                  </p>
                </div>

                {/* Dev mode OTP reveal */}
                {devOtp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shrink-0" />
                    <div className="text-xs">
                      <span className="text-amber-500 font-semibold">Dev mode</span>
                      <span className="text-muted-foreground"> — no SMTP configured. Your code: </span>
                      <span className="font-mono font-bold text-foreground tracking-wider">{devOtp}</span>
                    </div>
                  </motion.div>
                )}

                {/* OTP input boxes */}
                <div className="flex gap-2.5 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onPaste={handleOtpPaste}
                      onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) otpRefs.current[i - 1]?.focus(); }}
                      className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-secondary/40 focus:outline-none transition-all ${digit ? "border-primary bg-primary/5 text-primary" : "border-border focus:border-primary"}`}
                      data-testid={`otp-digit-${i}`}
                    />
                  ))}
                </div>

                <Button className="w-full h-11 text-base rounded-xl" onClick={verifyOtp} disabled={loading || otp.join("").length < 6} data-testid="btn-verify-otp">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Verify & {tab === "login" ? "Sign In" : "Create Account"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => { setStep("email"); setDevOtp(null); setOtp(["","","","","",""]); }}>
                    ← Change email
                  </button>
                  <button
                    className={`transition-colors ${countdown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:text-primary/80"}`}
                    disabled={countdown > 0}
                    onClick={() => { if (countdown === 0) sendOtp(); }}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by SecureShield AI · 256-bit encryption · Zero-knowledge architecture
        </p>
      </motion.div>
    </div>
  );
}
