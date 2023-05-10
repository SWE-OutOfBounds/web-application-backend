DROP DATABASE IF EXISTS PoCBackEnd;
CREATE DATABASE PoCBackEnd;
USE PoCBackEnd;

CREATE TABLE users(
    email VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE apikeys(
    secretKey VARCHAR(255) PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    appName VARCHAR(255) NOT NULL
);

CREATE TABLE blackList(
    OTT VARCHAR(255) PRIMARY KEY,
    used DATETIME NOT NULL
);

INSERT INTO users(email, username, firstname, lastname, password) VALUES('mario.rossi@gmmail.com', 'BigMario', 'Mario', 'Rossi', '$2b$10$8vF0Woa6QogcWhZa48Q0Au7uxAYeCD1Y/hzP/5WV34xjLEws6vEgG');
INSERT INTO apikeys(secretkey, host, appName) VALUES('LQbHd5h334ciuy7', 'http://localhost/', 'ClockCATPCHA-Tester');
