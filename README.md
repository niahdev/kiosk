# Student Progress Kiosk

학생별 프로젝트 진행 상황을 입력하고, 키오스크 화면에서 조회하는 Node.js + MySQL 프로젝트입니다.

## Pages

- `http://localhost:703/kiosk`
  학생 목록을 보여주는 키오스크 화면입니다.
- `http://localhost:703/insert`
  학생이 자신의 프로젝트 진행상황을 입력하는 화면입니다.
- `http://localhost:703/admin`
  관리자가 프로젝트 정보, 교수 피드백, 마감일을 수정하는 화면입니다.

## Main Features

- 한 학생이 여러 프로젝트를 등록할 수 있습니다.
- 키오스크에서 학생을 누르면 프로젝트 목록이 열립니다.
- 프로젝트를 누르면 상세 목업, 추천 일정, 교수 피드백, 공개 코멘트를 볼 수 있습니다.
- 배포판 링크가 입력된 프로젝트는 키오스크에서 목업 형태로 바로 열 수 있습니다.
- 관리자 화면에서 프로젝트 수정, 삭제, 교수 피드백 입력, 최종 마감일 변경이 가능합니다.

## Tech Stack

- `Node.js`
- `mysql2`
- `MySQL 8`
- `Docker Compose`

## Run With Docker

키오스크 PC에서 가장 간단하게 실행하는 방법입니다.

```powershell
git clone https://github.com/niahdev/kiosk.git
cd kiosk
docker compose up -d
```

실행 확인:

```powershell
docker compose ps
```

브라우저 주소:

```text
http://localhost:703/kiosk
http://localhost:703/insert
http://localhost:703/admin
```

종료:

```powershell
docker compose down
```

DB 데이터까지 완전히 삭제:

```powershell
docker compose down -v
```

## Run With Local MySQL

이미 로컬 MySQL이 준비되어 있다면 아래처럼 실행할 수 있습니다.

```powershell
npm install

$env:PORT="703"
$env:DB_USER="root"
$env:DB_PASSWORD="your_mysql_password"
$env:DB_NAME="kiosk"

npm start
```

## Database

앱은 시작 시 필요한 테이블을 자동으로 확인하고 생성하거나 컬럼을 보정합니다.

주요 테이블:

- `student_project`
  프로젝트 기본 정보 저장
- `project_comment`
  프로젝트별 공개 코멘트 저장
- `app_setting`
  최종 마감일 저장

`student_project`에는 아래 정보가 포함됩니다.

- `student_id`
- `project_name`
- `progress`
- `deployment_url`
- `professor_feedback`

## Progress Options

- `기획`
- `프로토타입`
- `실제 제작 시작`
- `최종 테스트`
- `완료`

## Useful Commands

테스트:

```powershell
npm test
```

DB 연결 확인:

```powershell
npm run check:db
```
