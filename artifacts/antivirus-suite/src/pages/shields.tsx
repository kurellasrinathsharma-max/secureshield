import { useState } from "react";
import { Shield, HardDrive, Globe, Mail, Lock, Box, Wifi, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type ShieldState = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
  level: string;
};

const INITIAL_SHIELDS: ShieldState[] = [
  { id: "file", name: "File Shield", description: "Scans all files added to or opened on your PC.", icon: HardDrive, active: true, level: "standard" },
  { id: "behavior", name: "Behavior Shield", description: "Warns if applications behave suspiciously.", icon: Shield, active: true, level: "standard" },
  { id: "web", name: "Web Guard", description: "Blocks web attacks and unsafe downloads.", icon: Globe, active: true, level: "aggressive" },
  { id: "mail", name: "Mail Shield", description: "Blocks dangerous email attachments.", icon: Mail, active: false, level: "standard" },
  { id: "ransomware", name: "Ransomware Shield", description: "Secures personal folders from ransomware.", icon: Lock, active: true, level: "strict" },
  { id: "sandbox", name: "Sandbox", description: "Test suspicious files in a safe environment.", icon: Box, active: false, level: "standard" },
];

export default function Shields() {
  const [shields, setShields] = useState<ShieldState[]>(INITIAL_SHIELDS);
  const { toast } = useToast();

  const toggleShield = (id: string) => {
    setShields(prev => prev.map(s => {
      if (s.id === id) {
        const newState = !s.active;
        toast({
          title: `${s.name} ${newState ? 'Enabled' : 'Disabled'}`,
          description: newState ? "Your system is now protected." : "Warning: Your system may be vulnerable.",
          variant: newState ? "default" : "destructive",
        });
        return { ...s, active: newState };
      }
      return s;
    }));
  };

  const changeLevel = (id: string, level: string) => {
    setShields(prev => prev.map(s => s.id === id ? { ...s, level } : s));
    toast({
      title: "Protection Level Updated",
      description: "New security rules applied successfully.",
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Core Shields</h1>
        <p className="text-muted-foreground mt-1">Configure your real-time protection layers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shields.map(shield => (
          <Card key={shield.id} className={`transition-all duration-300 ${shield.active ? 'border-primary/20 shadow-md shadow-primary/5' : 'opacity-75'}`}>
            <CardHeader className="pb-4 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center text-lg">
                  <shield.icon className={`w-5 h-5 mr-2 ${shield.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  {shield.name}
                </CardTitle>
                <CardDescription className="h-10 line-clamp-2">{shield.description}</CardDescription>
              </div>
              <Switch 
                checked={shield.active} 
                onCheckedChange={() => toggleShield(shield.id)}
                className="mt-1 data-[state=checked]:bg-safe"
              />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-muted-foreground">Sensitivity</span>
                <Select disabled={!shield.active} value={shield.level} onValueChange={(val) => changeLevel(shield.id, val)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Status</span>
                {shield.active ? (
                  <Badge variant="outline" className="text-safe border-safe/30 bg-safe/10">Protecting</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Advanced Protection</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="w-5 h-5 mr-2 text-primary" />
                Network Inspector
              </CardTitle>
              <CardDescription>Scan your local network for vulnerabilities.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/30 p-4 rounded-lg flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium text-sm">Current Network</div>
                  <div className="text-lg font-bold">Home_Wi-Fi_5G</div>
                </div>
                <Badge variant="outline" className="text-safe border-safe bg-safe/10">Secure</Badge>
              </div>
              <Button className="w-full">Scan Network</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                Quarantine
              </CardTitle>
              <CardDescription>Manage isolated dangerous files.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/30 p-4 rounded-lg flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium text-sm">Isolated Threats</div>
                  <div className="text-lg font-bold text-warning">12 Files</div>
                </div>
                <Button variant="outline" size="sm">View Files</Button>
              </div>
              <Button variant="secondary" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">Empty Quarantine</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
