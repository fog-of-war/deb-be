# 개발용 스테이지
FROM node:18-alpine AS development

WORKDIR /app

# package.json과 package-lock.json 파일 복사
COPY package*.json ./

# 종속성 설치
RUN npm install

# 생성된 Prisma 파일 복사
COPY prisma ./prisma/

# tsconfig.json 파일 복사
COPY tsconfig.json ./

# 소스 코드 복사
COPY . .

RUN npx prisma generate --schema ./prisma/schema.prisma

# NestJS 애플리케이션을 빌드
RUN npm run build

# PM2 설치
RUN npm install -g pm2

# 서버를 포트 5000으로 실행하도록 설정
EXPOSE 5000

# 마이그레이션을 포함하여 시작 스크립트 실행
# CMD ["sh", "-c", "source set_env.sh && npm run start:migrate:prod"]

