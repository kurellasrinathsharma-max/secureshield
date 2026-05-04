import { useState } from "react";
import { EyeOff, AlertCircle, Search, Trash2, Camera, Chrome, Lock, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Privacy() {
  const [webcamShield, setWebcamShield] = useState(true);
  const [browserShield, setBrowserShield] = useState(true);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p className="text-muted-foreground mt-1">Protect your personal identity and sensitive data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              Hack Alerts
            </CardTitle>
            <CardDescription>We monitor the dark web for your compromised credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter email to check" defaultValue="user@example.com" />
              <Button variant="destructive">Check</Button>
            </div>
            <div className="space-y-3 mt-4">
              <div className="bg-background rounded-md p-3 flex items-center justify-between border border-border">
                <div>
                  <p className="font-semibold text-sm">Canva Data Breach</p>
                  <p className="text-xs text-muted-foreground">Exposed: Email, Password, Name</p>
                </div>
                <Badge variant="destructive">High Risk</Badge>
              </div>
              <div className="bg-background rounded-md p-3 flex items-center justify-between border border-border">
                <div>
                  <p className="font-semibold text-sm">LinkedIn Scraping</p>
                  <p className="text-xs text-muted-foreground">Exposed: Email, Phone</p>
                </div>
                <Badge variant="warning" className="bg-warning text-warning-foreground border-none hover:bg-warning/80">Medium Risk</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-primary" />
                    Webcam Shield
                  </CardTitle>
                  <CardDescription className="mt-1">Block untrusted apps from accessing your camera.</CardDescription>
                </div>
                <Switch checked={webcamShield} onCheckedChange={setWebcamShield} className="data-[state=checked]:bg-safe" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 opacity-90">
                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-secondary/50">
                  <span className="font-medium">Zoom.exe</span>
                  <Badge variant="outline" className="text-safe border-safe">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-secondary/50">
                  <span className="font-medium">Discord.exe</span>
                  <Badge variant="outline" className="text-safe border-safe">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-secondary/50">
                  <span className="font-medium">Unknown_App.exe</span>
                  <Badge variant="outline" className="text-destructive border-destructive">Blocked</Badge>
                </div>
              </div>
              <Button variant="link" size="sm" className="px-0 mt-2">Manage permissions...</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-primary" />
              Sensitive Data Shield
            </CardTitle>
            <CardDescription>Find and secure tax documents, medical records, and travel tickets on your PC.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 bg-secondary/20 rounded-lg border border-dashed border-border mb-4">
              <Search className="w-10 h-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">No documents protected yet</p>
              <p className="text-xs text-muted-foreground text-center max-w-xs mb-4">Scan your PC to find tax documents, flight tickets, and other sensitive files that should be locked.</p>
              <Button>Scan for Documents</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-primary" />
              Data Shredder
            </CardTitle>
            <CardDescription>Permanently delete files so they can never be recovered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-8 border-2 border-dashed border-border rounded-lg text-center hover:bg-secondary/20 transition-colors cursor-pointer">
              <p className="text-sm font-medium">Drag & Drop files or folders here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Shredding Algorithm</Label>
              <RadioGroup defaultValue="standard">
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary/30 rounded-md">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <div className="font-medium">Random Overwrite</div>
                    <div className="text-xs text-muted-foreground">1 pass (Fast)</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary/30 rounded-md">
                  <RadioGroupItem value="dod" id="dod" />
                  <Label htmlFor="dod" className="flex-1 cursor-pointer">
                    <div className="font-medium">DOD 5220.22-M</div>
                    <div className="text-xs text-muted-foreground">3 passes (Secure)</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 hover:bg-secondary/30 rounded-md">
                  <RadioGroupItem value="gutmann" id="gutmann" />
                  <Label htmlFor="gutmann" className="flex-1 cursor-pointer">
                    <div className="font-medium">Gutmann Method</div>
                    <div className="text-xs text-muted-foreground">35 passes (Extremely Slow, Maximum Security)</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
