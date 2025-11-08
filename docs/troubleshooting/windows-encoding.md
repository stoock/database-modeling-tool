# Windows 환경에서 한글 인코딩 문제 해결

## 문제 상황

Windows에서 백엔드 실행 시 한글 로그가 깨져서 표시되는 문제:

```
2025-11-09T01:55:46.117+09:00  INFO 17896 --- [           main] c.d.DatabaseModelingToolApplication      : ??PostgreSQL ?곗씠?곕쿋?댁뒪 ?곌껐 ?깃났
```

## 근본 원인

Windows 콘솔의 기본 코드 페이지가 **949 (EUC-KR)** 로 설정되어 있어, UTF-8로 인코딩된 한글이 제대로 표시되지 않습니다.

```powershell
PS> chcp
활성 코드 페이지: 949
```

## 해결 방법

### 방법 1: 수동 설정 (권장)

매번 백엔드 실행 전에 다음 명령어를 실행:

```powershell
# 1. 콘솔 인코딩을 UTF-8로 변경
chcp 65001

# 2. 환경 변수 설정
$env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"
$env:GRADLE_OPTS = "-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"

# 3. 백엔드 실행
cd backend
./gradlew bootRunDev
```

### 방법 2: 영구 설정 (시스템 전체)

Windows 시스템 전체에 UTF-8을 기본값으로 설정:

1. **제어판** → **시계 및 국가** → **국가 또는 지역**
2. **관리** 탭 → **시스템 로캘 변경**
3. **Beta: 세계 언어 지원을 위해 Unicode UTF-8 사용** 체크
4. 재부팅

⚠️ **주의**: 이 방법은 시스템 전체에 영향을 미치므로 신중하게 사용하세요.

## 적용된 설정

프로젝트에는 다음과 같은 UTF-8 설정이 이미 적용되어 있습니다:

### 1. Gradle 설정 (`backend/gradle.properties`)

```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dconsole.encoding=UTF-8

systemProp.file.encoding=UTF-8
systemProp.sun.jnu.encoding=UTF-8
systemProp.console.encoding=UTF-8
```

### 2. Gradle 빌드 스크립트 (`backend/build.gradle`)

```groovy
task bootRunDev(type: org.springframework.boot.gradle.tasks.run.BootRun) {
    systemProperty 'spring.profiles.active', 'dev'
    systemProperty 'file.encoding', 'UTF-8'
    systemProperty 'sun.jnu.encoding', 'UTF-8'
    jvmArgs = ['-Dfile.encoding=UTF-8', '-Dsun.jnu.encoding=UTF-8']
}
```

### 3. Logback 설정 (`backend/src/main/resources/logback-spring.xml`)

```xml
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <charset>UTF-8</charset>
        <pattern>${CONSOLE_LOG_PATTERN}</pattern>
    </encoder>
</appender>
```

## 검증 방법

올바르게 설정되었는지 확인:

```powershell
# 1. 코드 페이지 확인 (65001이어야 함)
chcp

# 2. 백엔드 실행 후 로그 확인
# 다음과 같이 한글이 정상적으로 표시되어야 함:
# ✅ PostgreSQL 데이터베이스 연결 성공
# 📊 데이터베이스 URL: jdbc:postgresql://localhost:5432/dbmodeling_dev
```

## 대안: 영문 로그 사용

UTF-8 설정이 어려운 환경이라면, 로그 메시지를 영문으로 변경하는 것도 방법입니다:

```java
// 한글 로그
logger.info("✅ PostgreSQL 데이터베이스 연결 성공");

// 영문 로그
logger.info("==> PostgreSQL Database Connection: SUCCESS");
```

하지만 이는 **임시방편**이며, 근본적인 해결책은 UTF-8 환경 설정입니다.

## 참고 자료

- [Microsoft Docs - Windows에서 UTF-8 사용](https://docs.microsoft.com/ko-kr/windows/apps/design/globalizing/use-utf8-code-page)
- [Gradle Docs - Build Environment](https://docs.gradle.org/current/userguide/build_environment.html)
- [Spring Boot Docs - Logging](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)
