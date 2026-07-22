param(
  [string]$BaseUrl = "https://demo.grapecity.com.cn",
  [string]$RootId = "6dac7158-28fc-4aba-b07b-33f4b5b16b1b",
  [switch]$Force,
  [switch]$SkipScaffold
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$docsDir = Join-Path $repoRoot "docs"
$maintainerDir = Join-Path $repoRoot ".github"
$samplesDir = Join-Path $repoRoot "samples"
$sourcePracticeUrl = "$BaseUrl/spreadjs/practice"

function Get-DirectChildren {
  param([string]$ParentId)

  $url = "$BaseUrl/_docapp/toc/$RootId/tocItem/$ParentId/direct-children"
  $data = Invoke-RestMethod -Uri $url
  return @($data.children)
}

function Get-TocTree {
  param([string]$ParentId)

  $children = Get-DirectChildren -ParentId $ParentId

  return @($children | ForEach-Object {
    $childNodes = @()
    if ($_.hasChild) {
      $childNodes = @(Get-TocTree -ParentId $_.tocItemId)
    }

    [pscustomobject][ordered]@{
      displayName = $_.displayName
      slug = $_.text
      path = $_.documentPath
      sourceUrl = "$sourcePracticeUrl$($_.documentPath)"
      hasDoc = [bool]$_.hasDoc
      hasChild = [bool]$_.hasChild
      tocItemId = $_.tocItemId
      nodeId = $_.id
      order = $_.tocOrder
      children = $childNodes
    }
  })
}

function Write-TextFile {
  param(
    [string]$Path,
    [string]$Content,
    [switch]$Overwrite
  )

  $parent = Split-Path -Parent $Path
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }

  if ($Overwrite -or -not (Test-Path $Path)) {
    Set-Content -Path $Path -Value $Content -Encoding UTF8
  }
}

function Add-TocMarkdown {
  param(
    [object[]]$Nodes,
    [int]$Depth,
    [System.Collections.Generic.List[string]]$Lines
  )

  foreach ($node in $Nodes) {
    $indent = "  " * $Depth
    $path = $node.path.TrimStart("/")
    if ($node.hasDoc) {
      $Lines.Add("$indent- [$($node.displayName)](../samples/$path/) - [online demo]($($node.sourceUrl))")
    }
    else {
      $slug = $node.slug
      $Lines.Add("$indent- $($node.displayName) ($slug)")
    }

    if ($node.children.Count -gt 0) {
      Add-TocMarkdown -Nodes $node.children -Depth ($Depth + 1) -Lines $Lines
    }
  }
}

function New-CategoryReadme {
  param([object]$Category)

  $lines = [System.Collections.Generic.List[string]]::new()
  $lines.Add("# $($Category.displayName)")
  $lines.Add("")
  $lines.Add("Online category: $($Category.sourceUrl)")
  $lines.Add("")
  $lines.Add("## Demos")
  $lines.Add("")

  foreach ($demo in $Category.children) {
    $lines.Add("- [$($demo.displayName)]($($demo.slug)/) - [online demo]($($demo.sourceUrl))")
  }

  return ($lines -join [Environment]::NewLine)
}

function New-DemoReadme {
  param([object]$Demo)

  return @"
# $($Demo.displayName)

Online demo: $($Demo.sourceUrl)

## Local Code

The local code for this example is being organized.

## What To Expect

- Runnable demo files.
- Local assets required by the example.
- Notes about key SpreadJS APIs and behavior.
- Verification steps.
"@
}

Write-Host "Fetching SpreadJS practice demo catalog..."
$toc = @(Get-TocTree -ParentId $RootId)

if (-not (Test-Path $docsDir)) {
  New-Item -ItemType Directory -Force -Path $docsDir | Out-Null
}

if (-not (Test-Path $maintainerDir)) {
  New-Item -ItemType Directory -Force -Path $maintainerDir | Out-Null
}

$jsonPath = Join-Path $maintainerDir "demo-catalog.json"
$toc | ConvertTo-Json -Depth 20 | Set-Content -Path $jsonPath -Encoding UTF8

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("# SpreadJS Practice Demo Catalog")
$lines.Add("")
$lines.Add("Source menu: $sourcePracticeUrl/welcome")
$lines.Add("")
Add-TocMarkdown -Nodes $toc -Depth 0 -Lines $lines
Set-Content -Path (Join-Path $docsDir "demo-catalog.md") -Value ($lines -join [Environment]::NewLine) -Encoding UTF8

if (-not $SkipScaffold) {
  if (-not (Test-Path $samplesDir)) {
    New-Item -ItemType Directory -Force -Path $samplesDir | Out-Null
  }

  foreach ($page in $toc | Where-Object { $_.hasDoc }) {
    $pageDir = Join-Path $samplesDir $page.slug
    New-Item -ItemType Directory -Force -Path $pageDir | Out-Null
    Write-TextFile -Path (Join-Path $pageDir "README.md") -Content (New-DemoReadme -Demo $page) -Overwrite:$Force
  }

  foreach ($category in $toc | Where-Object { $_.hasChild }) {
    $categoryDir = Join-Path $samplesDir $category.slug
    New-Item -ItemType Directory -Force -Path $categoryDir | Out-Null
    Write-TextFile -Path (Join-Path $categoryDir "README.md") -Content (New-CategoryReadme -Category $category) -Overwrite:$Force

    foreach ($demo in $category.children | Where-Object { $_.hasDoc }) {
      $demoDir = Join-Path $categoryDir $demo.slug
      New-Item -ItemType Directory -Force -Path $demoDir | Out-Null
      Write-TextFile -Path (Join-Path $demoDir "README.md") -Content (New-DemoReadme -Demo $demo) -Overwrite:$Force
    }
  }
}

Write-Host "Generated $jsonPath"
Write-Host "Done."
