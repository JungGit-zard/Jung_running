# Jumping Girl - APK 빌드 (한 번에 실행)
# 필요: Node.js, Android SDK (ANDROID_HOME), JDK (JAVA_HOME)
$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
Set-Location $ProjectRoot

# PATH에 Node 기본 설치 경로 추가 (방금 설치한 경우 터미널에 안 잡힐 수 있음)
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) { $env:Path = $nodeDir + ";" + $env:Path }

# JAVA_HOME을 Android Studio jbr(Java 21)로 고정 (Unsupported class file major version 65 방지)
# - jbr가 있으면 항상 사용. 기존 JAVA_HOME이 17이어도 21로 덮어씀.
$jbr = "C:\Program Files\Android\Android Studio\jbr"
if (Test-Path $jbr) {
    $env:JAVA_HOME = $jbr
    Write-Host "JAVA_HOME = jbr (Android Studio JDK 21)" -ForegroundColor DarkGray
}

# 1) www 복사 (Node 불필요)
& (Join-Path $ProjectRoot "scripts\copy-web.ps1")

# 2) Node/npm 확인
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host ""
    Write-Host "Node.js가 설치되어 있지 않거나 PATH에 없습니다." -ForegroundColor Red
    Write-Host "https://nodejs.org 에서 LTS를 설치한 뒤, *새 터미널*을 열고 이 스크립트를 다시 실행해 주세요." -ForegroundColor Yellow
    exit 1
}

# 3) npm install (온라인에서 패키지 받기)
Write-Host "npm install ..."
& npm install --prefer-online
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 4) android 추가 (없을 때만)
if (-not (Test-Path (Join-Path $ProjectRoot "android"))) {
    Write-Host "npx cap add android ..."
    & npx cap add android
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# 5) cap sync
Write-Host "npx cap sync ..."
& npx cap sync
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 6) APK 빌드
$androidDir = Join-Path $ProjectRoot "android"
Set-Location $androidDir

# Daemon 종료 후 2초 대기, 8.0.2 캐시 삭제 (version 65 오류 시 캐시가 17/21 불일치로 깨진 경우 대비)
& .\gradlew.bat --stop 2>$null
Start-Sleep -Seconds 2
$cache82 = Join-Path $env:USERPROFILE ".gradle\caches\8.0.2"
if (Test-Path $cache82) {
    Remove-Item -Recurse -Force $cache82 -ErrorAction SilentlyContinue
}

# JAVA_HOME을 cmd 환경에 명시적으로 넣어 gradlew가 반드시 jbr(Java 21)을 쓰도록 함
# (PowerShell $env:JAVA_HOME이 gradlew 자식 프로세스에 안 넘어가는 경우 대비)
$gradleCmd = "set `"JAVA_HOME=$jbr`" && .\gradlew.bat assembleDebug"
Write-Host "gradlew.bat assembleDebug ..."
& cmd /c $gradleCmd
$r = $LASTEXITCODE
Set-Location $ProjectRoot
if ($r -ne 0) { exit $r }

$apk = Join-Path $ProjectRoot "android\app\build\outputs\apk\debug\app-debug.apk"
Write-Host ""
Write-Host "빌드 완료: $apk" -ForegroundColor Green
if (Test-Path $apk) {
    explorer (Split-Path $apk)
}
