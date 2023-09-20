# 라즈베리 파이용 Node.js 이미지를 사용
FROM arm32v7/node:18-alpine AS development

RUN apk add --no-cache python3 py3-pip make g++

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

# Prisma 파일 생성
# RUN npx prisma migrate deploy

# 서버를 포트 5000으로 실행하도록 설정
EXPOSE 5000

# 마이그레이션을 포함하여 시작 스크립트 실행
CMD ["npm", "run", "build"]
