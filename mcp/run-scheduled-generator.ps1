param(
  [switch]$Dry,
  [string]$Model = 'claude-sonnet-4-6',
  [int]$Limit = 6
)

$ErrorActionPreference = 'Stop'
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$logDirectory = Join-Path $scriptDirectory 'logs\scheduled-generator'
$nodeExecutable = 'C:\Program Files\nodejs\node.exe'
$generator = Join-Path $scriptDirectory 'scheduled-generator.mjs'
$retentionDays = 30

New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

$cutoff = (Get-Date).AddDays(-$retentionDays)
Get-ChildItem -LiteralPath $logDirectory -File -Filter '*.log' -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -lt $cutoff } |
  Remove-Item -Force

$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$logPath = Join-Path $logDirectory "scheduled-generator_$timestamp.log"
$arguments = @($generator, '--model', $Model, '--limit', [string]$Limit)
if ($Dry) { $arguments += '--dry' }

function Protect-LogLine([string]$Line) {
  if ($null -eq $Line) { return '' }
  $safe = $Line -replace '(?i)(authorization\s*[:=]\s*bearer\s+)[^\s]+', '$1[REDACTED]'
  $safe = $safe -replace '(?i)((?:api[_-]?key|token|secret|password)\s*[:=]\s*)[^\s,;]+', '$1[REDACTED]'
  $safe = $safe -replace '(?i)\b(?:sk-ant-|sk-proj-|sk-)[A-Za-z0-9_-]{12,}\b', '[REDACTED_KEY]'
  return $safe
}

"[$(Get-Date -Format o)] START task=MoneypickGenerator model=$Model limit=$Limit dry=$($Dry.IsPresent)" |
  Tee-Object -FilePath $logPath -Append

try {
  & $nodeExecutable @arguments 2>&1 |
    ForEach-Object { Protect-LogLine ([string]$_) } |
    Tee-Object -FilePath $logPath -Append
  $generatorExitCode = $LASTEXITCODE
} catch {
  Protect-LogLine "wrapper_error=$($_.Exception.Message)" | Tee-Object -FilePath $logPath -Append
  $generatorExitCode = 1
}

"[$(Get-Date -Format o)] END exitCode=$generatorExitCode log=$logPath" |
  Tee-Object -FilePath $logPath -Append

exit $generatorExitCode
