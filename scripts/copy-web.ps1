# 게임 리소스를 www/로 복사 (Node 불필요)
$Root = Join-Path $PSScriptRoot ".."
$Www = Join-Path $Root "www"

$Dirs = @("css","js","bgm","effect_sound","graphic_resource")
$Files = @("index.html")

if (-not (Test-Path $Www)) { New-Item -ItemType Directory -Path $Www -Force | Out-Null }

foreach ($f in $Files) {
    $s = Join-Path $Root $f
    if (Test-Path $s) { Copy-Item $s (Join-Path $Www $f) -Force }
}
foreach ($d in $Dirs) {
    $s = Join-Path $Root $d
    if (Test-Path $s) { Copy-Item $s (Join-Path $Www $d) -Recurse -Force }
}
Write-Host "copy-web: www/ 준비됨"
