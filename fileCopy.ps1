# ---------------------------------------------------------------------------
# Network Sync Monitor with LIVE % of Files Copied
# ---------------------------------------------------------------------------

$SourcePath      = "\\10.0.0.18\newfolder"
$DestinationPath = "C:\CopyTo\Reeds"
$SyncInterval    = 30
$ProgressRefresh = 2

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

# Count source files
Write-Host "Scanning source..." -ForegroundColor Yellow
$TotalFiles = (Get-ChildItem $SourcePath -Recurse -File | Measure-Object).Count
Write-Host "Source contains $TotalFiles files" -ForegroundColor Yellow

while ($true) {

    Write-Host "`nStarting Sync..." -ForegroundColor Green

    # Start Robocopy
    $Arguments = "`"$SourcePath`" `"$DestinationPath`" /MIR /FFT /R:0 /W:0"
    $Process = Start-Process robocopy -ArgumentList $Arguments -NoNewWindow -PassThru

    # Live progress loop
    while (-not $Process.HasExited) {

        $Copied = (Get-ChildItem $DestinationPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count

        if ($TotalFiles -gt 0) {
            $Percent = [Math]::Round(100 * $Copied / $TotalFiles, 1)
        } else {
            $Percent = 100
        }

        $Now = Get-Date -Format "HH:mm:ss"
        Write-Host ("[{0}] Progress: {1}% ({2}/{3} files)" -f `
            $Now, $Percent, $Copied, $TotalFiles) -ForegroundColor Yellow

        Start-Sleep -Seconds $ProgressRefresh
    }

    # Completion message
    if ($Process.ExitCode -ge 8) {
        Write-Host "[!] Robocopy Error (exit code $($Process.ExitCode))" -ForegroundColor Red
    } else {
        Write-Host "[✓] Copy cycle finished (exit code $($Process.ExitCode))" -ForegroundColor Green
    }

    Start-Sleep -Seconds $SyncInterval
}
