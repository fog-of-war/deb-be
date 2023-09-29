# 제로초님 질문 위한 브랜치

docker-compose.yml 로 postgresql 과 redis 컨테이너 실행가능합니다.

## env 목록

```
DB_HOST={}
DB_USER={}
DB_PASSWORD={}
DB_NAME={}
DB_PORT={}
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
GOOGLE_OAUTH_ID={}
GOOGLE_OAUTH_SECRET={}
KAKAO_CLIENT_ID={}
KAKAO_JAVASCRIPT_KEY={}
NAVER_CLIENT_ID={}
NAVER_CLIENT_PW={}
GOOGLE_REDIRECT_URL={}
KAKAO_REDIRECT_URL={}
NAVER_REDIRECT_URL={}
AT_SECRET={}
RT_SECRET={}
```

## 게시물 및 댓글 작성 방법

```
// 각각의 파일에서 "Bearer YOUR_ACCESS_TOKEN" 에 엑세스 토큰을 채워주세요
node send_posts.js
node send_comments.js
```
