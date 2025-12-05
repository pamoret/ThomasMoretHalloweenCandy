# ---------------------------------------------------------------------------
# Network Sync Monitor with LIVE % of Files Copied + Progress Bar
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

Write-Host "Scanning source..." -ForegroundColor Yellow
$TotalFiles = (Get-ChildItem $SourcePath -Recurse -File | Measure-Object).Count
Write-Host "Source contains $TotalFiles files" -ForegroundColor Yellow

while ($true) {

    Write-Host "`nStarting Sync..." -ForegroundColor Green

    $Arguments = "`"$SourcePath`" `"$DestinationPath`" /MIR /FFT /R:0 /W:0"
    $Process   = Start-Process robocopy -ArgumentList $Arguments -NoNewWindow -PassThru

    while (-not $Process.HasExited) {

        $Copied = (Get-ChildItem $DestinationPath -Recurse -File -ErrorAction SilentlyContinue |
                   Measure-Object).Count

        if ($TotalFiles -gt 0) {
            # Write-Progress wants an integer 0–100
            $Percent = [int]([Math]::Round(100 * $Copied / $TotalFiles, 0))
        } else {
            $Percent = 100
        }

        $statusText = "{0}% ({1}/{2} files copied)" -f $Percent, $Copied, $TotalFiles

        # This draws the floating bar at the top of the console
        Write-Progress -Activity "Mirroring files from $SourcePath" `
                       -Status   $statusText `
                       -PercentComplete $Percent

        Start-Sleep -Seconds $ProgressRefresh
    }

    # Mark progress bar as complete for this cycle
    Write-Progress -Activity "Mirroring files from $SourcePath" `
                   -Completed `
                   -Status "Copy cycle finished (exit code $($Process.ExitCode))"

    if ($Process.ExitCode -ge 8) {
        Write-Host "[!] Robocopy Error (exit code $($Process.ExitCode))" -ForegroundColor Red
    }
    else {
        Write-Host ("Copy cycle finished (exit code {0})" -f $Process.ExitCode) -ForegroundColor Green
    }

    Start-Sleep -Seconds $SyncInterval
}
