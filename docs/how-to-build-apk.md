# Jumping Girl - APK 빌드 가이드

안드로이드 폰에 설치할 수 있는 APK를 만드는 방법입니다. **Capacitor**로 웹 게임을 앱으로 감싸 빌드합니다.

> **중요:** 아래에 적힌 `android/` 폴더와 `app-debug.apk` 경로는 **아직 없을 수 있습니다.**  
> `npx cap add android`를 실행하면 `android/` 폴더가 생기고,  
> `npm run build:apk`가 **에러 없이 끝나야** `app-debug.apk` 파일이 만들어집니다.  
> 이 순서대로 진행해 보세요.

---

## 1. 사전 준비

### 1) Node.js
- [nodejs.org](https://nodejs.org/) 에서 LTS 버전 설치 (v18 권장)

### 2) Android 개발 환경 (APK 빌드용)
- **Android Studio** 설치 권장: [developer.android.com/studio](https://developer.android.com/studio)  
  - 설치 시 **Android SDK** 함께 설치  
  - 실행 후 **SDK Manager**에서 **Android SDK** 경로 확인 (예: `C:\Users\사용자명\AppData\Local\Android\Sdk`)
- 또는 **Android command line tools only** 로 SDK만 설치해도 됩니다.

### 3) 환경 변수 (APK 빌드 시)
- `ANDROID_HOME` = Android SDK 폴더 경로  
  - 예: `C:\Users\사용자명\AppData\Local\Android\Sdk`
- `JAVA_HOME` = JDK 17 이상 (**21 권장**: Android Studio `jbr` 또는 [Adoptium JDK 21](https://adoptium.net) 등)

#### 3-1) ANDROID_HOME · JAVA_HOME 설정 (상세)

**① ANDROID_HOME (Android SDK 경로)**

| 항목 | 내용 |
|------|------|
| **역할** | Gradle·Capacitor가 Android SDK(빌드 도구, 플랫폼 등)를 찾을 때 사용 |
| **경로 찾는 방법** | 1) Android Studio 실행 → **More Actions** 또는 **Tools** → **SDK Manager** → 상단 **Android SDK Location** 에 표시된 경로  
| **Windows 예시** | `C:\Users\junghyunuk\AppData\Local\Android\Sdk` (사용자명은 본인 PC에 맞게) |
| **주의** | 맨 끝에 `\` 또는 `/` 없이, **폴더 경로만** 넣습니다. |

**② JAVA_HOME (JDK 경로)**

| 항목 | 내용 |
|------|------|
| **역할** | Gradle이 Java 컴파일·실행에 사용할 JDK 경로 |
| **경로 찾는 방법** | Android Studio에 포함된 JDK(**jbr**) 사용 시:  
  Android Studio 설치 폴더 안의 `jbr` 폴더  
  - 기본: `C:\Program Files\Android\Android Studio\jbr`  
  - `jbr\bin\java -version`으로 버전 확인 (21이면 `version 65` 오류 예방에 유리)  
  - 17만 있으면 [Adoptium JDK 21](https://adoptium.net) 설치 후 그 경로 사용 |
| **Windows 예시** | `C:\Program Files\Android\Android Studio\jbr` (또는 JDK 21 설치 경로) |
| **주의** | `JAVA_HOME` = **jbr 폴더** 또는 JDK 폴더 경로. `bin`을 붙이지 않습니다. |

**③ 환경 변수 넣는 방법 (Windows)**

- **영구 설정 (권장)**  
  1. **Win + R** → `sysdm.cpl` 입력 → **고급** 탭 → **환경 변수**  
  2. **사용자 환경 변수** 또는 **시스템 환경 변수**에서 **새로 만들기**  
  3. 변수 이름: `ANDROID_HOME` / `JAVA_HOME`  
  4. 변수 값: 위에서 확인한 **경로** (슬래시·백슬래시 상관없이 일관되게)  
  5. **확인**으로 모두 닫기  

- **PATH에 추가 (선택)**  
  - `ANDROID_HOME`만 설정해도 Gradle은 찾습니다.  
  - `platform-tools`를 명령어로 쓰려면:  
    **Path**에 `%ANDROID_HOME%\platform-tools` 추가  

**④ 적용·확인**

- **적용:** 환경 변수 창을 닫은 뒤, **사용 중이던 CMD·PowerShell은 모두 닫고 새로** 연다.  
  (또는 PC 재시작)
- **확인 (CMD):**
  ```bat
  echo %ANDROID_HOME%
  echo %JAVA_HOME%
  ```
  각각 경로가 그대로 출력되면 정상입니다. `%ANDROID_HOME%`처럼 그대로 나오면 **설정이 안 된 것**입니다.
- **확인 (PowerShell):**
  ```powershell
  $env:ANDROID_HOME
  $env:JAVA_HOME
  ```

**⑤ 이 세션만 잠깐 넣어서 쓰기 (테스트용)**

- **CMD:**
  ```bat
  set ANDROID_HOME=C:\Users\junghyunuk\AppData\Local\Android\Sdk
  set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
  ```
- **PowerShell:**
  ```powershell
  $env:ANDROID_HOME = "C:\Users\junghyunuk\AppData\Local\Android\Sdk"
  $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
  ```
  그 다음 **같은 창**에서 `build-apk.bat` 또는 `.\build-apk.ps1` 실행.  
  (창을 닫으면 변수는 사라집니다.)

**⑥ build-apk.bat 실행**

- `ANDROID_HOME`, `JAVA_HOME`이 제대로 보이는 **새 CMD 또는 PowerShell**에서:
  ```bat
  cd /d F:\cursor_project
  build-apk.bat
  ```
  또는 `F:\cursor_project` 폴더에서 **`build-apk.bat` 더블클릭**  
  (더블클릭 시, **영구 설정한** 환경 변수가 사용됩니다.)

---

## 2. 프로젝트에서 실행

### (1) 의존성 설치
```bash
cd F:\cursor_project
npm install
```

### (2) Android 프로젝트 추가 (최초 1회만)
```bash
npx cap add android
```
- `android/` 폴더가 생깁니다.

### (3) APK 빌드

**방법 A – 한 번에 (권장)**  
- `F:\cursor_project` 에서 **`build-apk.bat`** 더블클릭  
- 또는 **Windows PowerShell**을 **새로 연 다음**:
  ```powershell
  cd F:\cursor_project
  powershell -ExecutionPolicy Bypass -File .\build-apk.ps1
  ```
- Cursor 터미널은 네트워크·캐시 제한으로 npm이 실패할 수 있으니, **Windows에서 직접** 실행하는 것이 좋습니다.

**방법 B – npm 스크립트**
```bash
npm run build:apk
```
- `www/`에 게임 파일을 복사한 뒤 `android/` 프로젝트와 동기화하고,  
  `android/app/build/outputs/apk/debug/app-debug.apk` 를 생성합니다.

---

## 3. APK 위치와 설치

- **경로** (`npm run build:apk`가 **성공한 뒤**에만 생성됨)
  ```
  F:\cursor_project\android\app\build\outputs\apk\debug\app-debug.apk
  ```
  - `android` 폴더는 `npx cap add android` 실행 후 생깁니다.
  - `app\build\outputs\apk\debug\` 경로와 `app-debug.apk`는 `npm run build:apk`가 **성공했을 때만** 생깁니다. 빌드 전이나 빌드가 실패하면 이 경로는 없습니다.
- **설치**
  - 이 파일을 안드로이드 폰으로 복사(이메일, USB, 클라우드 등) 후, 파일 관리자에서 열어 설치
  - **출처를 알 수 없는 앱** 설치 허용이 필요할 수 있습니다. (설정 → 보안)

---

## 4. 스크립트 설명

| 스크립트       | 내용 |
|----------------|------|
| `npm run copy-web` | 게임 리소스(index.html, js, css, bgm, effect_sound, graphic_resource)를 `www/`로 복사 |
| `npm run cap:sync`  | `copy-web` 실행 후 Capacitor가 `www/`를 `android/`에 반영 |
| `npm run build:apk` | `cap:sync` 후 `gradlew.bat assembleDebug` 로 debug APK 생성 |

---

## 5. 빌드 실패 시 / 경로가 없을 때

- **`app-debug.apk` 경로가 파일 탐색기에 없음**
  - 이 경로는 `npm run build:apk`가 **성공적으로 완료된 뒤**에만 만들어집니다.  
  - `android` 폴더가 없다면: `npx cap add android` 실행  
  - `android`는 있는데 `app\build\...`가 없다면: `npm run build:apk` 실행 (Node, JDK, Android SDK가 설치·설정되어 있어야 함)
- **`ANDROID_HOME` / `JAVA_HOME` 확인**
  - 터미널: `echo %ANDROID_HOME%`, `echo %JAVA_HOME%`
- **`Unsupported class file major version 65` (Java 버전·캐시 문제)**
  - **원인:** Gradle이 Java 21 바이트코드를 쓰는데, 현재 JVM이 17 이하이거나, 예전에 만든 Gradle 캐시와 Java 버전이 맞지 않음.
  - **조치:**  
    1) `%USERPROFILE%\.gradle\caches` 안의 **`8.0.2`** 폴더 삭제  
    2) **JAVA_HOME**을 **Java 21**로 설정  
       - Android Studio `jbr`가 21이면: `C:\Program Files\Android\Android Studio\jbr`  
       - 17이면: [Adoptium JDK 21](https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64&package=jdk) 설치 후 그 경로를 `JAVA_HOME`에 지정  
    3) CMD/PowerShell **새로 연 뒤** `build-apk.bat` 다시 실행
- **`android/` 없음**
  - `npx cap add android` 먼저 실행
- **`gradlew.bat` 오류 (Windows)**
  - `android` 폴더에서 직접:  
    `gradlew.bat assembleDebug`
- **Mac/Linux**
  - `build:apk` 안의 `gradlew.bat`를 `./gradlew`로 바꾸거나,  
    `cd android && ./gradlew assembleDebug` 를 수동 실행

---

## 6. 참고

- **Debug APK**이므로 서명/배포용이 아닙니다. 본인 기기 테스트용입니다.
- **Release APK**나 스토어 배포용은 Android Studio에서 **Build → Generate Signed Bundle / APK** 로 키스토어를 설정해 만들어야 합니다.
