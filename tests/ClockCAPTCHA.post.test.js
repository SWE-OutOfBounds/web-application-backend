const request = require("supertest");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = require("../app");
const { JsonWebTokenError } = require("jsonwebtoken");
const { describe } = require("node:test");

const clockCAPTCHA = require('../../clock-captcha/dist/index');


describe("ClockCAPTCHA get endpoint", () => {

    describe("Richiesta senza secret key in header", () => {

        test("JSON format", (done) => {
            request(app)
                .post("/clock-captcha")
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("403 code", (done) => {
            request(app)
                .post("/clock-captcha")
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        test("Message expected", (done) => {
            request(app)
                .post("/clock-captcha")
                .expect({
                    details: "API_KEY_REQUIRED"
                })
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });

    });

    describe("Secret key in header ma non in database", () => {

        test("JSON format", (done) => {
            request(app)
                .post("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("403 code", (done) => {
            request(app)
                .post("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        test("Message expected", (done) => {
            request(app)
                .post("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect({
                    details: "INVALID_API_KEY"
                })
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });

    });

    describe("Secret key in header e in database", () => {

        describe("Formato dati non corretto", () => {

            describe("Token e input utente non presente nel corpo della richiesta", () => {

                test("JSON format", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect("Content-Type", /json/)
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
                test("200 code", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect(404)
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
                test("Content expected", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect(404)
                        .expect({
                            details: "MISSING_DATA"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });

                })

            })

            describe("Token non presente nel corpo della richiesta", () => {

                test("JSON format", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .send({
                            cc_input: "00:00"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect("Content-Type", /json/)
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
                test("200 code", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .send({
                            cc_input: "00:00"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect(404)
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
                test("Content expected", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .send({
                            cc_input: "00:00"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect(404)
                        .expect({
                            details: "MISSING_DATA"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });

                })

            });

            describe("Input utente non presente nel corpo della richiesta", () => {

                test("JSON format", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .send({
                            cc_token: "00:00"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect("Content-Type", /json/)
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
                test("200 code", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .send({
                            cc_token: "00:00"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect(404)
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
                test("Content expected", (done) => {
                    request(app)
                        .post("/clock-captcha")
                        .send({
                            cc_token: "00:00"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect(404)
                        .expect({
                            details: "MISSING_DATA"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });

                })

            });

        });

        describe("Formato dati corretto", () => {

            describe("Token scaduto", () => {

                test("TODO", () => {
                    expect(1).toBe(1);
                })

            });

            describe("Token valido", () => {

                describe("Input utente non corretto", () => {
                    let captchaGenerator = new clockCAPTCHA.ClockCAPTCHAGenerator(process.env.CLOCK_CAPTCHA_PSW);
                    let token = jwt.sign({ cc_token: captchaGenerator.getToken() }, process.env.JWT_SECRET_KEY, { expiresIn: '30s' })

                    let hours = Math.floor(Math.random() * 11), minutes = Math.floor(Math.random() * 59);
                    let user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));

                    let i = 0;
                    while (i < 10 && clockCAPTCHA.ClockCAPTCHAGenerator.verifyUserInput(captchaGenerator.getToken(), process.env.CLOCK_CAPTCHA_PSW, user_input)) {
                        i++;
                        hours = Math.floor(Math.random() * 11);
                        minutes = Math.floor(Math.random() * 59);
                        user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));
                    }

                    console.log(clockCAPTCHA.ClockCAPTCHAGenerator.verifyUserInput(captchaGenerator.getToken(), process.env.CLOCK_CAPTCHA_PSW, user_input))

                    test("JSON format | 400 code | Message expected", (done) => {
                        request(app)
                            .post("/clock-captcha")
                            .send({
                                cc_token: token,
                                cc_input: user_input
                            })
                            .set('x-secret-key', 'LQbHd5h334ciuy7')
                            .expect("Content-Type", /json/)
                            .expect(400)
                            .expect({
                                details: "BAD_CAPTCHA"
                            })
                            .end((err, res) => {
                                if (err) return done(err);
                                return done();
                            });
                    });

                });

                describe("Input utente corretto", () => {
                    test("todo", () => {
                        expect(1).toBe(1);
                    })
                });
            });

        });
    });
});