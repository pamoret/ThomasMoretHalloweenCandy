# ---------------------------------------------------------------------------
# Network Sync Monitor with LIVE % of Files Copied
# ---------------------------------------------------------------------------

$SourcePath      = "\\10.0.0.18\newfolder"   # The Network Folder
$DestinationPath = "C:\CopyTo\Reeds"         # The Local Folder
$SyncInterval    = 30                        # Check every 30 seconds
$ProgressRefresh = 2                         # How often % updates (seconds)

Clear-Host
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "     NETWORK SYNC MONITOR (WITH LIVE % COPY)    " -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "Source:      $SourcePath" -ForegroundColor Gray
Write-Host "Destination: $DestinationPath" -ForegroundColor Gray
Write-Host "Interval:    Checking every $SyncInterval seconds..." -ForegroundColor Gray
Write-Host "------------------------------------------------" -ForegroundColor Cyan

# Ensure destination exists
if (!(Test-Path $DestinationPath)) {
    New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
}

# Count how many files exist in the source tree
Write-Host "Scanning source..." -ForegroundColor Yellow
$TotalFiles = (Get-ChildItem $SourcePath -Recurse -File | Measure-Object).Count
Write-Host "Source contains $TotalFiles files" -ForegroundColor Yellow

while ($true) {

    Write-Host "`nStarting Sync..." -ForegroundColor Green

    # Start Robocopy in the background
    $arguments = "`"$SourcePath`" `"$DestinationPath`" /MIR /FFT /R:0 /W:0"
    $process = Start-Process robocopy -ArgumentList $arguments -NoNewWindow -PassThru

    # While Robocopy is running, keep showing % of files present in destination
    while (-not $process.HasExited) {

        $Copied = (Get-ChildItem $DestinationPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count

        if ($TotalFiles -gt 0) {
            $Percent = [Math]::Round(100 * $Copied / $TotalFiles, 1)
        }
        else {
            $Percent = 100
        }

        $now = Get-Date -Format "HH:mm:ss"
        Write-Host ("[{0}] Progress: {1}% ({2}/{3} files)" -f `
            $now, $Percent, $Copied, $TotalFiles) -ForegroundColor Yellow

        Start-Sleep -Seconds $ProgressRefresh
    }

    # Final Robocopy status for this cycle
    if ($process.ExitCode -ge 8) {
        Write-Host "[!] Robocopy Error (exit code $($process.ExitCode))" -ForegroundColor Red
    }
    else {
        Write-Host "[✓] Copy cycle finished (exit code $($process.ExitCode))" -ForegroundColor Green
    }

    # Wait before starting the next sync cycle
    Start-Sleep -Seconds $SyncInterval
}
