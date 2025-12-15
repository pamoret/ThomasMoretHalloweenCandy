<#
Merge-Profiles.ps1

Merges two "profile-like" folder trees into a single destination tree.
- Never overwrites.
- If a file already exists at destination, appends a suffix (_mlbba or _Reeds) before extension.
- If the suffixed name also exists, appends _2, _3, etc.
- Preserves relative folder structure (Desktop\..., Documents\..., etc).

Test run example:
  .\Merge-Profiles.ps1 -DestinationRoot "C:\CopyTo\Combined" -WhatIf -LogPath "C:\CopyTo\merge-test.log"

Real run example:
  .\Merge-Profiles.ps1 -DestinationRoot "C:\Users\mlbba" -LogPath "C:\CopyTo\merge-real.log"
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory=$false)]
    [string]$SourceMlbba = "C:\CopyTo\Reeds\mlbba",

    [Parameter(Mandatory=$false)]
    [string]$SourceReeds = "C:\CopyTo\Reeds\Reeds",

    # Test destination default (your Combined folder)
    [Parameter(Mandatory=$false)]
    [string]$DestinationRoot = "C:\CopyTo\Combined",

    # Only copy these top-level folders (common user-profile folders).
    # If you want EVERYTHING under the profile root, set this to @("*")
    [Parameter(Mandatory=$false)]
    [string[]]$TopFolders = @(
        "Desktop","Documents","Downloads","Music","Pictures","Videos",
        "Favorites","Links","Contacts","Saved Games","Searches"
    ),

    # Log file (optional)
    [Parameter(Mandatory=$false)]
    [string]$LogPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Initialize-Log {
    if (-not $LogPath -or $LogPath.Trim() -eq "") { return }

    $logDir = Split-Path -Parent $LogPath
    if ($logDir -and -not (Test-Path -LiteralPath $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }

    # Ensure the log exists even during -WhatIf runs
    if (-not (Test-Path -LiteralPath $LogPath)) {
        New-Item -ItemType File -Path $LogPath -Force | Out-Null
    }
}

function Write-Log {
    param([string]$Message)

    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $Message"
    Write-Host $line

    if ($LogPath -and $LogPath.Trim() -ne "") {
        Initialize-Log
        Add-Content -Path $LogPath -Value $line
    }
}

function Get-UniqueDestinationPath {
    param(
        [Parameter(Mandatory=$true)][string]$DestPath,
        [Parameter(Mandatory=$true)][string]$Suffix
    )

    if (-not (Test-Path -LiteralPath $DestPath)) {
        return $DestPath
    }

    $dir  = Split-Path -Parent $DestPath
    $name = Split-Path -Leaf $DestPath

    $base = [System.IO.Path]::GetFileNameWithoutExtension($name)
    $ext  = [System.IO.Path]::GetExtension($name)

    # First try: base_suffix.ext
    $candidate = Join-Path $dir ("{0}_{1}{2}" -f $base, $Suffix, $ext)
    if (-not (Test-Path -LiteralPath $candidate)) {
        return $candidate
    }

    # Then: base_suffix_2.ext, base_suffix_3.ext, ...
    $i = 2
    while ($true) {
        $candidate = Join-Path $dir ("{0}_{1}_{2}{3}" -f $base, $Suffix, $i, $ext)
        if (-not (Test-Path -LiteralPath $candidate)) {
            return $candidate
        }
        $i++
    }
}

function Copy-TreeNoOverwrite {
    param(
        [Parameter(Mandatory=$true)][string]$SourceRoot,
        [Parameter(Mandatory=$true)][string]$Suffix,
        [Parameter(Mandatory=$true)][string]$DestRoot,
        [Parameter(Mandatory=$true)][string[]]$Folders
    )

    if (-not (Test-Path -LiteralPath $SourceRoot)) {
        throw "SourceRoot not found: $SourceRoot"
    }
    if (-not (Test-Path -LiteralPath $DestRoot)) {
        throw "DestinationRoot not found: $DestRoot"
    }

    $targets = $Folders
    if ($Folders.Count -eq 1 -and $Folders[0] -eq "*") {
        # Everything under SourceRoot
        $targets = Get-ChildItem -LiteralPath $SourceRoot -Directory -Force |
                   Select-Object -ExpandProperty Name
    }

    foreach ($top in $targets) {
        $srcTop = Join-Path $SourceRoot $top
        if (-not (Test-Path -LiteralPath $srcTop)) {
            Write-Log "SKIP (missing): $srcTop"
            continue
        }

        Write-Log "Scanning: $srcTop"

        # Create directories in destination
        Get-ChildItem -LiteralPath $srcTop -Directory -Recurse -Force | ForEach-Object {
            $rel = $_.FullName.Substring($SourceRoot.Length).TrimStart('\')
            $dstDir = Join-Path $DestRoot $rel
            if (-not (Test-Path -LiteralPath $dstDir)) {
                if ($PSCmdlet.ShouldProcess($dstDir, "Create directory")) {
                    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
                }
                Write-Log "DIR: $dstDir"
            }
        }

        # Ensure the top folder exists at destination
        $dstTop = Join-Path $DestRoot $top
        if (-not (Test-Path -LiteralPath $dstTop)) {
            if ($PSCmdlet.ShouldProcess($dstTop, "Create directory")) {
                New-Item -ItemType Directory -Path $dstTop -Force | Out-Null
            }
            Write-Log "DIR: $dstTop"
        }

        # Copy files
        Get-ChildItem -LiteralPath $srcTop -File -Recurse -Force | ForEach-Object {
            $rel = $_.FullName.Substring($SourceRoot.Length).TrimStart('\')
            $dstPath = Join-Path $DestRoot $rel
            $dstDir  = Split-Path -Parent $dstPath

            if (-not (Test-Path -LiteralPath $dstDir)) {
                if ($PSCmdlet.ShouldProcess($dstDir, "Create directory")) {
                    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
                }
                Write-Log "DIR: $dstDir"
            }

            $finalPath = $dstPath
            if (Test-Path -LiteralPath $dstPath) {
                $finalPath = Get-UniqueDestinationPath -DestPath $dstPath -Suffix $Suffix
            }

            if ($PSCmdlet.ShouldProcess($finalPath, "Copy file from $($_.FullName)")) {
                Copy-Item -LiteralPath $_.FullName -Destination $finalPath -Force:$false
            }

            if ($finalPath -ne $dstPath) {
                Write-Log "FILE (renamed): $($_.FullName)  -->  $finalPath"
            } else {
                Write-Log "FILE: $($_.FullName)  -->  $finalPath"
            }
        }
    }
}

# --- Main ---
Initialize-Log

Write-Log "DestinationRoot = $DestinationRoot"
Write-Log "Source (mlbba)  = $SourceMlbba"
Write-Log "Source (Reeds)  = $SourceReeds"
Write-Log "TopFolders      = $($TopFolders -join ', ')"
if ($LogPath -and $LogPath.Trim() -ne "") { Write-Log "LogPath         = $LogPath" }

# Copy in desired precedence order:
# If Destination already has data (your baseline copy), the script will not overwrite it;
# it will rename incoming duplicates instead.
Copy-TreeNoOverwrite -SourceRoot $SourceMlbba -Suffix "mlbba" -DestRoot $DestinationRoot -Folders $TopFolders
Copy-TreeNoOverwrite -SourceRoot $SourceReeds -Suffix "Reeds" -DestRoot $DestinationRoot -Folders $TopFolders

Write-Log "DONE."
