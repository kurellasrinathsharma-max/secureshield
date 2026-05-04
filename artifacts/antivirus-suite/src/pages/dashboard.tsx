import { useState, useEffect } from "react";
import { ShieldCheck, Clock, AlertTriangle, Bug, ArrowRight, Shield, Globe, HardDrive, Search, MessageSquareWarning } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [score, setScore] = useState(0);
  const [threats, setThreats] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setScore(98), 500);
    const threatsTimer = setTimeout(() => setThreats(0), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(threatsTimer);
    };
  }, []);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your computer is protected.</p>
        </div>
        <div className="flex items-center gap-2 bg-safe/10 text-safe px-4 py-2 rounded-full border border-safe/20">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse-fast" />
          <span className="text-sm font-medium">All systems active</span>
        </div>
      </div>

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
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8" 
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
            <div className="space-y-6 flex-1 w-full">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Core Shields</span>
                  <span className="text-safe">Active</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Virus Definitions</span>
                  <span className="text-muted-foreground">Up to date</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div className="flex gap-4 pt-2">
                <Link href="/scan" className="flex-1">
                  <Button className="w-full" size="lg">
                    <Search className="mr-2 h-4 w-4" />
                    Smart Scan
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Last Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">2h ago</div>
                  <div className="text-sm text-muted-foreground">0 threats found</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Threats Prevented</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <Bug className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{threats}</div>
                  <div className="text-sm text-muted-foreground">Last 30 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "File Shield", icon: HardDrive, active: true },
          { title: "Web Guard", icon: Globe, active: true },
          { title: "Ransomware", icon: Shield, active: true },
          { title: "Email Guard", icon: AlertTriangle, active: false }
        ].map((shield, i) => (
          <Card key={i} className="hover:border-primary/50 transition-colors cursor-default">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-md ${shield.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <shield.icon className="h-5 w-5" />
                </div>
                <div className={`w-2 h-2 rounded-full ${shield.active ? 'bg-safe' : 'bg-muted'}`} />
              </div>
              <h3 className="font-semibold">{shield.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {shield.active ? 'Protecting' : 'Disabled'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-secondary/50 border-none">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-background rounded-full shadow-sm">
              <MessageSquareWarning className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-bold">Scam Guardian</h3>
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
