# PowerShell Script to Run Octane Render Command with Parameters

param(
    [string]$jobPath,       # Path to the job directory (e.g., d:\source\a\b\c)
    [string]$assetsPath,    # Path to the assets directory (e.g., d:\RenderFarm\assets)
    [string]$outputPath,    # Path to the output directory (e.g., d:\RenderFarm\output\images)
    [string]$outputDir,     # Name of the output directory (e.g., "A-B-C")
    [string]$octanePath     # Path to the Octane directory (e.g., d:\RenderFarm\octane)
)

Write-Host "JobPath = $jobPath\n"
Write-Host "AssetsPath = $assetsPath\n"
Write-Host "OutputPath = $outputPath\n"
Write-Host "OutputDir = $outputDir\n"
Write-Host "OctanePath = $octanePath\n"

# Construct the full command with arguments
$octaneCommand = "$octanePath\octane-cli.exe"
$scriptPath = "$assetsPath\Render\HK-R0.lua"
$outputFullPath = "$outputPath\$outputDir"
$scenePath = "HK-R0.ocs"

# Construct the argument list for octane-cli.exe
$arguments = @(
    "--script", $scriptPath,     # Specifies the script path
    "-a", "1",             # Argument for the script (static value as per example)
    "-a", "1",             # Another argument (static value)
    "-a", "100",           # Another argument (static value)
    "-a", $outputFullPath, # Specifies the output path with directory
    "-a", "PNG8",          # Output format
    $scenePath             # Specifies the .ocs scene file
)

#Move to the right directory
Set-Location "$jobPath"

# Print the command to be executed (for debugging/verification)
Write-Host "Executing command: $octaneCommand" -ForegroundColor Cyan
Write-Host "With arguments: $arguments" -ForegroundColor Cyan

# Execute the command
& $octaneCommand $arguments

# Check if the command was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Command executed successfully." -ForegroundColor Green
} else {
    Write-Host "Command failed with exit code $LASTEXITCODE." -ForegroundColor Red
}
