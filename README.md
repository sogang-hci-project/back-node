# Getting Started

src/static 폴더 아래에 있는 모든 .md 파일에 대해 vector db 를 생성(또는 업데이트) 하는 과정입니다. 아래 명령어를 입력하면 src/data_store 경로에 vector db 가 생성(또는 업데이트) 됩니다.

```bash
$npx ts-node -r tsconfig-paths/register src/utils/save.local.db.ts
```

도커 서버 설치 및 실행

아래 명령어 실행

```bash
$ yarn
$ docker-compose up --build
```

개발환경에서 실행

```bash
npm run dev
```

배포환경에서 실행

```bash
npm run build
npm run start:pm2
```
