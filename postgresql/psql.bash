vi .zshrc 

export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/16/bin

CREATE DATABASE fow;
DROP DATABASE fow;

claire@192 ~ % psql -h localhost -p 5432 -U claire fow

# 커맨드
\l
list

\c 
connect

\d 
describe

\dt 
describe table

# 테이블생성

CREATE TABLE person (
    id BIGSERIAL NOT NULL PRIMARY KEY ,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(7) NOT NULL,
    date_of_birth DATE NOT NULL
);

ALTER TABLE person
ADD COLUMN email VARCHAR(100);

# 데이터 insert

INSERT INTO person (
    first_name,
    last_name,
    gender,
    date_of_birth)
    VALUES ('Anne', 'Smith','Female', DATE '1988-01-01');

INSERT INTO person (first_name, last_name, gender, date_of_birth, email)
VALUES ('Jake', 'Jones', 'Male', DATE '1990-01-10', 'jake@gmail.com');

# Mockaroo

https://www.mockaroo.com/

create table person (
    id BIGSERIAL NOT NULL PRIMARY KEY ,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(7) NOT NULL,
    date_of_birth DATE NOT NULL
	country_of_birth VARCHAR(50)
);
