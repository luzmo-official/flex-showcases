#!/usr/bin/env pwsh

[CmdletBinding()]
param(
  [switch]$Fix,
  [ValidateSet('low','moderate','high','critical')]
  [string]$Level = 'moderate',
  [ValidateSet('low','moderate','high','critical')]
  [string]$FailOn = ''
)

$ErrorActionPreference = 'Stop'

function Get-SeverityValue([string]$sev) {
  switch ($sev) {
    'low' { return 1 }
    'moderate' { return 2 }
    'high' { return 3 }
    'critical' { return 4 }
    default { return 0 }
  }
}

function Should-FailOnCounts([string]$failOn, [int]$low, [int]$moderate, [int]$high, [int]$critical) {
  if ([string]::IsNullOrWhiteSpace($failOn)) { return $false }
  $threshold = Get-SeverityValue $failOn
  if ($threshold -le 1 -and $low -gt 0) { return $true }
  if ($threshold -le 2 -and $moderate -gt 0) { return $true }
  if ($threshold -le 3 -and $high -gt 0) { return $true }
  if ($threshold -le 4 -and $critical -gt 0) { return $true }
  return $false
}

function Get-AuditCountsFromJson([string]$jsonText) {
  try {
    $audit = $jsonText | ConvertFrom-Json -ErrorAction Stop
    $v = $audit.metadata.vulnerabilities
    $low = if ($null -ne $v.low) { [int]$v.low } else { 0 }
    $moderate = if ($null -ne $v.moderate) { [int]$v.moderate } else { 0 }
    $high = if ($null -ne $v.high) { [int]$v.high } else { 0 }
    $critical = if ($null -ne $v.critical) { [int]$v.critical } else { 0 }
    $total = if ($null -ne $v.total) { [int]$v.total } else { $low + $moderate + $high + $critical }
    return [pscustomobject]@{ Low=$low; Moderate=$moderate; High=$high; Critical=$critical; Total=$total }
  } catch {
    return [pscustomobject]@{ Low=0; Moderate=0; High=0; Critical=0; Total=0 }
  }
}

function Format-Row([string]$project, $low, $moderate, $high, $critical, $total) {
  "{0,-45} {1,8} {2,8} {3,8} {4,8} {5,8}" -f $project, $low, $moderate, $high, $critical, $total
}

Write-Host "Running npm security audits..."
Write-Host ("Mode: " + ($(if ($Fix) { "fix" } else { "audit only" })))
Write-Host "Audit level: $Level"

$totalBeforeLow = 0
$totalBeforeModerate = 0
$totalBeforeHigh = 0
$totalBeforeCritical = 0
$totalBeforeAll = 0

$totalAfterLow = 0
$totalAfterModerate = 0
$totalAfterHigh = 0
$totalAfterCritical = 0
$totalAfterAll = 0

$failed = $false
$rows = New-Object System.Collections.Generic.List[object]

$root = (Resolve-Path ".").Path
$projects = Get-ChildItem -Path $root -Recurse -File -Filter "package.json" -ErrorAction Stop |
  Where-Object {
    $_.FullName -notmatch "\\node_modules\\"
  } |
  Sort-Object FullName

foreach ($pkg in $projects) {
  $dir = Split-Path -Parent $pkg.FullName
  $lockPath = Join-Path $dir "package-lock.json"

  if (-not (Test-Path -LiteralPath $lockPath)) {
    $rows.Add([pscustomobject]@{
      Project = $dir
      Low = "skip"
      Moderate = "skip"
      High = "skip"
      Critical = "skip"
      Total = "no lock"
    }) | Out-Null
    continue
  }

  Push-Location $dir
  try {
    $beforeJson = (& npm audit --audit-level=$Level --json 2>$null) -join "`n"
    if ([string]::IsNullOrWhiteSpace($beforeJson)) {
      $beforeJson = (& npm audit --audit-level=$Level --json 2>&1) -join "`n"
    }
  } catch {
    $beforeJson = $_.Exception.Message
  } finally {
    Pop-Location
  }

  $before = Get-AuditCountsFromJson $beforeJson
  $rows.Add([pscustomobject]@{
    Project = "$dir before"
    Low = $before.Low
    Moderate = $before.Moderate
    High = $before.High
    Critical = $before.Critical
    Total = $before.Total
  }) | Out-Null

  $totalBeforeLow += $before.Low
  $totalBeforeModerate += $before.Moderate
  $totalBeforeHigh += $before.High
  $totalBeforeCritical += $before.Critical
  $totalBeforeAll += $before.Total

  $counts = $before
  if ($Fix) {
    Write-Host "  fixing $dir..."
    Push-Location $dir
    try { & npm audit fix 2>&1 | Out-Null } catch { }

    try {
      $afterJson = (& npm audit --audit-level=$Level --json 2>$null) -join "`n"
      if ([string]::IsNullOrWhiteSpace($afterJson)) {
        $afterJson = (& npm audit --audit-level=$Level --json 2>&1) -join "`n"
      }
    } catch {
      $afterJson = $_.Exception.Message
    } finally {
      Pop-Location
    }

    $counts = Get-AuditCountsFromJson $afterJson
    $rows.Add([pscustomobject]@{
      Project = "$dir after"
      Low = $counts.Low
      Moderate = $counts.Moderate
      High = $counts.High
      Critical = $counts.Critical
      Total = $counts.Total
    }) | Out-Null
  }

  $totalAfterLow += $counts.Low
  $totalAfterModerate += $counts.Moderate
  $totalAfterHigh += $counts.High
  $totalAfterCritical += $counts.Critical
  $totalAfterAll += $counts.Total

  if (Should-FailOnCounts $FailOn $counts.Low $counts.Moderate $counts.High $counts.Critical) {
    $failed = $true
  }
}

Write-Host ""
Write-Host (Format-Row "Project" "Low" "Moderate" "High" "Critical" "Total")
Write-Host (Format-Row "-------" "---" "--------" "----" "--------" "-----")
foreach ($r in $rows) {
  Write-Host (Format-Row $r.Project $r.Low $r.Moderate $r.High $r.Critical $r.Total)
}
Write-Host (Format-Row "TOTAL before" $totalBeforeLow $totalBeforeModerate $totalBeforeHigh $totalBeforeCritical $totalBeforeAll)
Write-Host (Format-Row "TOTAL after" $totalAfterLow $totalAfterModerate $totalAfterHigh $totalAfterCritical $totalAfterAll)

if ($failed) {
  Write-Host ""
  Write-Host "Vulnerabilities found at or above severity: $FailOn"
  exit 1
}

Write-Host ""
Write-Host "Done."
