require('dotenv').config();

const request = require("supertest");
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const app = require("../../app");
const { JsonWebTokenError } = require("jsonwebtoken");
const cc = require('../../../clock-captcha/dist/index');

describe("Richiesta senza secret key in header", () => {

    it("JSON format", (done) => {
        request(app)
            .post("/session")
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            });
    });
    it("403 code", (done) => {
        request(app)
            .post("/session")
            .expect(403)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            })
    });
    it("Message expected", (done) => {
        request(app)
            .post("/session")
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

    it("JSON format", (done) => {
        request(app)
            .post("/session")
            .set('x-secret-key', 'LQbHd5h334ciuy7a')
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            });
    });
    it("403 code", (done) => {
        request(app)
            .post("/session")
            .set('x-secret-key', 'LQbHd5h334ciuy7a')
            .expect(403)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            })
    });
    it("Message expected", (done) => {
        request(app)
            .post("/session")
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
    describe("ClockCAPTCHA: dati non presenti", () => {
        it("JSON format", (done) => {
            request(app)
                .post("/session")
                .set('x-secret-key', 'LQbHd5h334ciuy7')
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        it("403 code", (done) => {
            request(app)
                .post("/session")
                .set('x-secret-key', 'LQbHd5h334ciuy7')
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        it("Message expected", (done) => {
            request(app)
                .post("/session")
                .set('x-secret-key', 'LQbHd5h334ciuy7')
                .expect({
                    details: "MISSING_DATA"
                })
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
    })
    describe("ClockCAPTCHA: dati incorretti", () => {
        describe("Token scaduto", () => {
            let toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator()));
            let token = jwt.sign({ token: toSendData.token }, process.env.JWT_SECRET_KEY, { expiresIn: '1' });
            it("JSON format", (done) => {
                request(app)
                    .post("/session")
                    .send({
                        cc_token: token,
                        cc_input: "00:00"
                    })
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .expect("Content-Type", /json/)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            it("400 code", (done) => {
                request(app)
                    .post("/session")
                    .send({
                        cc_token: token,
                        cc_input: "00:00"
                    })
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .expect(400)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    })
            });
            it("Message expected", (done) => {
                request(app)
                    .post("/session")
                    .send({
                        cc_token: token,
                        cc_input: "00:00"
                    })
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .expect({
                        details: "EXPIRED_TOKEN"
                    })
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
        })
        describe.skip("Token già utilizzato", () => {

        })
        describe("Captcha errato", () => {
            let toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator()));
            let token = jwt.sign({ token: toSendData.token }, process.env.JWT_SECRET_KEY, { expiresIn: '30s' });

            //Brute forcing captcha result
            let hours = 0, minutes = 0, user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));
            it("JSON format + 400 code + Message expected", (done) => {
                request(app)
                    .post("/session")
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
        })

    })
    describe("ClockCAPTCHA: dati corretti", () => {
        describe("Dati di accesso incoretti", () => {
            describe("Email assente", () => {
                let toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator()));
            let token = jwt.sign({ token: toSendData.token }, process.env.JWT_SECRET_KEY, { expiresIn: '30s' });

                //Brute forcing captcha result
                let hours = 0, minutes = 0, user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString())), flag = false;
                while (!flag && hours < 12) {
                    minutes = 0;
                    while (!flag && minutes < 60) {
                        flag = cc.ClockCAPTCHA.validateData({token: toSendData['token'], input: user_input}, process.env.CLOCK_CAPTCHA_PSW);
                        if (!flag) user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));
                        if (!flag) minutes++;
                    }
                    if (!flag) hours++;
                }

                it("JSON format + 400 code + Message expected", (done) => {
                    request(app)
                        .post("/session")
                        .send({
                            cc_token: token,
                            cc_input: user_input
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect("Content-Type", /json/)
                        .expect(400)
                        .expect({
                            details: "INVALID_EMAIL_FORMAT"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
            })
            describe("Password assente", () => {
                let toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator()));
            let token = jwt.sign({ token: toSendData.token }, process.env.JWT_SECRET_KEY, { expiresIn: '30s' });

                //Brute forcing captcha result
                let hours = 0, minutes = 0, user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString())), flag = false;
                while (!flag && hours < 12) {
                    minutes = 0;
                    while (!flag && minutes < 60) {
                        flag = cc.ClockCAPTCHA.validateData({token: toSendData['token'], input: user_input}, process.env.CLOCK_CAPTCHA_PSW);
                        if (!flag) user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));
                        if (!flag) minutes++;
                    }
                    if (!flag) hours++;
                }

                it("JSON format + 400 code + Message expected", (done) => {
                    request(app)
                        .post("/session")
                        .send({
                            cc_token: token,
                            cc_input: user_input,
                            email: "nice@email.com"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect("Content-Type", /json/)
                        .expect(400)
                        .expect({
                            details: "INVALID_PASSWORD_FORMAT"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });

            })
            describe("Email malformata", () => {
                let toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator()));
            let token = jwt.sign({ token: toSendData.token }, process.env.JWT_SECRET_KEY, { expiresIn: '30s' });

                //Brute forcing captcha result
                let hours = 0, minutes = 0, user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString())), flag = false;
                while (!flag && hours < 12) {
                    minutes = 0;
                    while (!flag && minutes < 60) {
                        flag = cc.ClockCAPTCHA.validateData({token: toSendData['token'], input: user_input}, process.env.CLOCK_CAPTCHA_PSW);
                        if (!flag) user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));
                        if (!flag) minutes++;
                    }
                    if (!flag) hours++;
                }

                it("JSON format + 400 code + Message expected", (done) => {
                    request(app)
                        .post("/session")
                        .send({
                            cc_token: token,
                            cc_input: user_input,
                            email: "random_string",
                            password: ""
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect("Content-Type", /json/)
                        .expect(400)
                        .expect({
                            details: "INVALID_EMAIL_FORMAT"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
            })
            describe("Password malformata", () => {
                let toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator()));
            let token = jwt.sign({ token: toSendData.token }, process.env.JWT_SECRET_KEY, { expiresIn: '30s' });

                //Brute forcing captcha result
                let hours = 0, minutes = 0, user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString())), flag = false;
                while (!flag && hours < 12) {
                    minutes = 0;
                    while (!flag && minutes < 60) {
                        flag = cc.ClockCAPTCHA.validateData({token: toSendData['token'], input: user_input}, process.env.CLOCK_CAPTCHA_PSW);
                        if (!flag) user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));
                        if (!flag) minutes++;
                    }
                    if (!flag) hours++;
                }

                it("JSON format + 400 code + Message expected", (done) => {
                    request(app)
                        .post("/session")
                        .send({
                            cc_token: token,
                            cc_input: user_input,
                            email: "nice_email@email.com",
                            password: "badpsw"
                        })
                        .set('x-secret-key', 'LQbHd5h334ciuy7')
                        .expect("Content-Type", /json/)
                        .expect(400)
                        .expect({
                            details: "INVALID_PASSWORD_FORMAT"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            return done();
                        });
                });
            })
        });
        describe("Dati di accesso corretti", () => {
            let toSendData = cc.ClockCAPTCHA.generateData(process.env.CLOCK_CAPTCHA_PSW, new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator()));
            let token = jwt.sign({ token: toSendData.token }, process.env.JWT_SECRET_KEY, { expiresIn: '30s' });

            //Brute forcing captcha result
            let hours = 0, minutes = 0, user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString())), flag = false;
            while (!flag && hours < 12) {
                minutes = 0;
                while (!flag && minutes < 60) {
                    flag = cc.ClockCAPTCHA.validateData({token: toSendData['token'], input: user_input}, process.env.CLOCK_CAPTCHA_PSW);
                    if (!flag) user_input = ((hours < 10 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes < 10 ? "0" + minutes.toString() : minutes.toString()));
                    if (!flag) minutes++;
                }
                if (!flag) hours++;
            }

            it("JSON format + 200 code + Message expected + Token verification", (done) => {
                request(app)
                    .post("/session")
                    .send({
                        cc_token: token,
                        cc_input: user_input,
                        email: "mario.rossi@gmmail.com",
                        password: "Password1234"
                    })
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        expect(res.body.session_token).toEqual(expect.any(String));
                        try {
                            let jwtDecoded = jwt.verify(res.body.session_token, process.env.JWT_SECRET_KEY);
                            expect(jwtDecoded.email).toEqual("mario.rossi@gmmail.com");
                            expect(jwtDecoded.username).toEqual("BigMario");
                        } catch (err) {
                            throw err;
                        }
                        return done();
                    });
            });
        })
    });
});