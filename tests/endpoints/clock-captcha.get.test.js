const request = require("supertest");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = require("../../app");
const { JsonWebTokenError } = require("jsonwebtoken");

describe("ClockCAPTCHA get endpoint", () => {

    describe("Richiesta senza secret key in header", () => {

        test("JSON format", (done) => {
            request(app)
                .get("/clock-captcha")
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("403 code", (done) => {
            request(app)
                .get("/clock-captcha")
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        test("Message expected", (done) => {
            request(app)
                .get("/clock-captcha")
                .expect({
                    details : "API_KEY_REQUIRED"
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
                .get("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("403 code", (done) => {
            request(app)
                .get("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        test("Message expected", (done) => {
            request(app)
                .get("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect({
                    details : "INVALID_API_KEY"
                })
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });

    });

    describe("Secret key in header e in database", () => {

        test("JSON format", (done) => {
            request(app)
                .get("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7')
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("200 code", (done) => {
            request(app)
                .get("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("Content expected", (done) => {
            request(app)
                .get("/clock-captcha")
                .set('x-secret-key', 'LQbHd5h334ciuy7')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            image: expect.any(String),
                            token: expect.any(String),
                        }),
                    );
                    return done();
                });
        });

    });

})