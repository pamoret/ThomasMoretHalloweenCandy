# ---------------------------------------------------------------------------
# PowerShell Network Sync (Polling Mode) with Progress
# ---------------------------------------------------------------------------

$SourcePath      = "\\Server\Share\ExampleFolder"   # The Network Folder
$DestinationPath = "C:\LocalBackup\ExampleFolder"   # The Local Folder
$SyncInterval    = 30                               # Check every 30 seconds

Clear-Host
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "     NETWORK SYNC MONITOR (Polling Mode)        " -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "Source:      $SourcePath" -ForegroundColor Gray
Write-Host "Destination: $DestinationPath" -ForegroundColor Gray
Write-Host "Interval:    Checking every $SyncInterval seconds..." -ForegroundColor Gray
Write-Host "------------------------------------------------" -ForegroundColor Cyan

# Ensure destination exists
if (!(Test-Path -Path $DestinationPath)) {
    New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
}

# --- HELPER: Build table of source files ---
function Get-FileTable {
    param(
        [string]$RootPath
    )

    # Normalize root path length for substring
    $root = (Get-Item $RootPath).FullName
    $rootLength = $root.Length

    Get-ChildItem -Path $RootPath -Recurse -File | ForEach-Object {
        $full = $_.FullName
        $relative = $full.Substring($rootLength).TrimStart('\','/')

        [PSCustomObject]@{
            RelativePath   = $relative
            Length         = $_.Length
            LastWriteTime  = $_.LastWriteTimeUtc
        }
    }
}

Write-Host "Building source file list..." -ForegroundColor Yellow
$sourceFiles = Get-FileTable -RootPath $SourcePath
$totalFiles  = $sourceFiles.Count
$totalBytes  = ($sourceFiles | Measure-Object -Property Length -Sum).Sum

Write-Host "Source contains $totalFiles files, $([Math]::Round($totalBytes / 1MB, 2)) MB" -ForegroundColor Yellow

# --- SYNC LOOP ---
while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"

    # Run Robocopy (remove /NP to see per-file progress in console)
    $arguments = "`"$SourcePath`" `"$DestinationPath`" /MIR /FFT /R:0 /W:0 /NDL /NJH /NJS"
    $process = Start-Process robocopy -ArgumentList $arguments -NoNewWindow -PassThru -Wait

    if ($process.ExitCode -ge 8) {
        Write-Host "[$timestamp] [!] Error: Robocopy failed. Check permissions or network connection." -ForegroundColor Red
    }
    elseif ($process.ExitCode -ge 1) {
        Write-Host "[$timestamp] [+] Sync cycle completed: changes detected and applied." -ForegroundColor Green
    }

    # --- PROGRESS CALCULATION: how much is mirrored? ---
    if ($totalFiles -gt 0 -and $totalBytes -gt 0) {

        $mirroredFiles = 0L
        $mirroredBytes = 0L

        foreach ($src in $sourceFiles) {
            $destFull = Join-Path $DestinationPath $src.RelativePath

            if (Test-Path $destFull) {
                $dest = Get-Item $destFull

                # Consider it "mirrored" if size matches and timestamp is within 2 seconds
                $timeDiff = [Math]::Abs( ($dest.LastWriteTimeUtc - $src.LastWriteTime).TotalSeconds )

                if ($dest.Length -eq $src.Length -and $timeDiff -le 2) {
                    $mirroredFiles++
                    $mirroredBytes += $src.Length
                }
            }
        }

        $percentFiles = [Math]::Round(100 * $mirroredFiles / $totalFiles, 1)
        $percentBytes = [Math]::Round(100 * $mirroredBytes / $totalBytes, 1)

        Write-Host ("[$timestamp] [>] Progress: {0}% of files, {1}% of bytes mirrored ({2}/{3} files)" -f `
            $percentFiles, $percentBytes, $mirroredFiles, $totalFiles) -ForegroundColor Yellow
    }

    Start-Sleep -Seconds $SyncInterval
}
