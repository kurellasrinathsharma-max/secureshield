import { useState, useEffect } from "react";
import { Disc, Download, Usb, AlertTriangle, ShieldCheck, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RescueDisk() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleCreate = (type: string) => {
    setDownloading(true);
    setProgress(0);
    
    toast({
      title: "Creating Rescue Disk",
      description: `Starting creation of ${type}. Please do not close this window.`,
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (downloading) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setDownloading(false);
            toast({
              title: "Success",
              description: "Rescue Disk created successfully. You can now use it to boot infected PCs.",
            });
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [downloading, toast]);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rescue Disk</h1>
        <p className="text-muted-foreground mt-1">Create a bootable scanner to remove deep-rooted malware.</p>
      </div>

      <Card className="bg-warning/10 border-warning/30">
        <CardContent className="p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-warning mb-1">When to use Rescue Disk?</h3>
            <p className="text-sm text-muted-foreground">
              Use this tool when your PC is so heavily infected that it cannot start properly, or when malware hides deep in the system preventing normal scans from removing it.
            </p>
          </div>
        </CardContent>
      </Card>

      {downloading && (
        <Card className="border-primary">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Creating Rescue Media...</span>
              <span className="font-mono">{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">Downloading necessary files and writing to media. Do not interrupt.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={downloading ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Usb className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Create on USB</CardTitle>
            <CardDescription>Format a USB drive and make it bootable with our scanner.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select USB Drive</label>
              <Select defaultValue="e">
                <SelectTrigger>
                  <SelectValue placeholder="Select drive" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="e">Drive E: (Cruzer Blade 16GB)</SelectItem>
                  <SelectItem value="f">Drive F: (Samsung USB 32GB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-destructive">Warning: All data on the selected USB drive will be erased.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleCreate("USB Drive")}>Create USB</Button>
          </CardFooter>
        </Card>

        <Card className={downloading ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Disc className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Create ISO File</CardTitle>
            <CardDescription>Download an ISO file to burn to a CD/DVD later.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Size: ~850 MB<br/>Format: .iso<br/>Compatibility: Legacy BIOS & UEFI</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button variant="outline" className="w-full" onClick={() => handleCreate("ISO File")}>
              <Download className="w-4 h-4 mr-2" /> Download ISO
            </Button>
          </CardFooter>
        </Card>

        <Card className={downloading ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Use UEFI Boot File</CardTitle>
            <CardDescription>Add a boot entry directly to your system partition.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No external media required. Creates a temporary boot option that runs before Windows starts.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button variant="secondary" className="w-full" onClick={() => handleCreate("UEFI Entry")}>Setup Boot Entry</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 border-t pt-8">
        <h3 className="font-bold mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-safe" /> How to use</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground pl-2">
          <li>Insert the created USB or CD into the infected computer.</li>
          <li>Restart the computer.</li>
          <li>Enter the BIOS/UEFI boot menu (usually by pressing F12, F2, F8, or Del during startup).</li>
          <li>Select the USB or CD drive from the list.</li>
          <li>Follow the on-screen instructions to run a deep scan.</li>
        </ol>
      </div>
    </div>
  );
}
