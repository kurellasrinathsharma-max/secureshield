# Building the SecureShield Windows Installer via GitHub

This guide creates a real `.exe` installer for Windows 11 automatically using GitHub Actions — no build tools needed on your PC.

## Step 1 — Push this project to GitHub

1. Go to [github.com/new](https://github.com/new) → create a repo named `secureshield`
2. In Replit, open the **Shell** tab and run:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/secureshield.git
   git push -u origin main
   ```

## Step 2 — Set your deployed app URL

1. First **deploy** the Replit app (click Publish → Deploy)
2. You'll get a URL like `https://secureshield-abc.replit.app`
3. In your GitHub repo → **Settings → Variables → Actions** → click **New repository variable**:
   - Name: `SECURESHIELD_URL`
   - Value: `https://your-actual-app.replit.app`

## Step 3 — Trigger the build

**Option A — Automatic:** Every push to `main` triggers a build.

**Option B — Create a release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```
This creates a GitHub Release with the `.exe` attached for download.

**Option C — Manual:** Go to GitHub → Actions → "Build Windows Installer" → Run workflow.

## Step 4 — Download the installer

- Go to your GitHub repo → **Actions** → click the latest workflow run
- Scroll to **Artifacts** → download **SecureShield-Windows-Setup**
- Extract the ZIP → run `SecureShield-Setup-1.0.0.exe`

Or if you pushed a tag, go to **Releases** and download directly.

## What the installer does

- Installs to `C:\Program Files\SecureShield\` (or custom location)
- Creates a **Start Menu** shortcut
- Creates a **Desktop** shortcut
- Adds a **system tray** icon (minimize to tray, not close)
- Right-click tray: Quick launch Smart Scan, Scam Guardian, Privacy Center
- Animated splash screen on launch

## Windows SmartScreen warning

The first time you run an unsigned installer, Windows may show:
> "Windows protected your PC"

Click **More info → Run anyway**. This warning disappears after code signing.

## SMTP Email Setup

Add these as **Replit Secrets** for real email OTP delivery:

| Secret | Value |
|--------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `yourapp@gmail.com` |
| `SMTP_PASS` | 16-char Gmail App Password |
| `SMTP_FROM` | `SecureShield <yourapp@gmail.com>` |

**Gmail App Password setup:**
1. Google Account → Security → Enable 2-Step Verification
2. Search "App passwords" → Create → Name it "SecureShield"
3. Copy the 16-character password → paste as `SMTP_PASS`
