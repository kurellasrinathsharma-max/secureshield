import { ShieldCheck, Wifi, EyeOff, Trash2, Key, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function SecurityTools() {
  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Tools</h1>
        <p className="text-muted-foreground mt-1">Additional utilities to enhance your digital security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>SecureLine VPN</CardTitle>
            <CardDescription>Encrypt your internet connection to stay private on public Wi-Fi.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="bg-secondary/30 p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-2 py-8">
              <ShieldCheck className="w-10 h-10 text-muted-foreground opacity-50" />
              <p className="font-medium text-sm">VPN is Disconnected</p>
              <p className="text-xs text-muted-foreground">Your IP address is visible.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Connect to Optimal Location</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <EyeOff className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>AntiTrack</CardTitle>
            <CardDescription>Stop advertisers from tracking your online activities.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tracking Attempts Blocked</span>
                <span className="text-xl font-bold text-safe">1,492</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Chrome Protection</span>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Firefox Protection</span>
                  <Switch checked={false} />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Dashboard</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Passwords</CardTitle>
            <CardDescription>Manage and secure your login credentials across devices.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <div className="bg-warning/10 text-warning px-3 py-2 rounded text-sm border border-warning/20">
                3 weak passwords found
              </div>
              <div className="bg-safe/10 text-safe px-3 py-2 rounded text-sm border border-safe/20">
                0 compromised passwords
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">Open Password Manager</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Duplicate Finder</CardTitle>
            <CardDescription>Find and remove duplicate files wasting your disk space.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             <p className="text-sm text-muted-foreground">Scans your documents, pictures, and videos to find exact duplicates and helps you safely remove them.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Find Duplicates</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Driver Updater</CardTitle>
            <CardDescription>Fix hardware issues by updating old or missing PC drivers.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="bg-secondary/30 rounded-lg p-4 text-center">
              <p className="text-sm font-medium">Last scanned: 5 days ago</p>
              <p className="text-2xl font-bold text-destructive mt-1">4 Outdated</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Update Drivers</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
