const request = require("supertest");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = require("../app");
const { JsonWebTokenError } = require("jsonwebtoken");


describe("Session recovery api", () => {

    describe("Richiesta senza secret key in header", () => {
        
        test("JSON format", (done) => {
            request(app)
                .get("/SessionRecovery")
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("403 code", (done) => {
            request(app)
                .get("/SessionRecovery")
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        test("Message expected", (done) => {
            request(app)
                .get("/SessionRecovery")
                .expect({
                    message : "Applicazione non autorizzata."
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
                .get("/SessionRecovery")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("403 code", (done) => {
            request(app)
                .get("/SessionRecovery")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        test("Message expected", (done) => {
            request(app)
                .get("/SessionRecovery")
                .set('x-secret-key', 'LQbHd5h334ciuy7a')
                .expect((res) => {
                    message : "Applicazione non autorizzata."
                })
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });

    });

    describe("Secret key in header e in database", () => {

        describe("Token di sessione valido", () => {

            test("JSON format", (done) => {
                const expected = { email: "abc@def.ghi", username: "abcdefghi" };
                const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect("Content-Type", /json/)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("200 code", (done) => {
                const expected = { email: "abc@def.ghi", username: "abcdefghi" };
                const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {expiresIn : '1h'});
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("Content expected", (done) => {
                const expected = { email: "abc@def.ghi", username: "abcdefghi" };
                const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {expiresIn : '1h'});
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect(200)
                    .expect({
                        email : expected.email,
                        username : expected.username
                    })
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });

        });

        describe("Token di sessione non valido", () => {

            test("JSON format", (done) => {
                const token ="fakeJWToken";
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect("Content-Type", /json/)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("401 code", (done) => {
                const token ="fakeJWToken";
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect(401)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("Content expected", (done) => {
                const token ="fakeJWToken";
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect({
                        message : "Token non valido."
                    })
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });

        });

        describe("Token di sessione scaduto", () => {

            test("JSON format", (done) => {
                const expected = { email: "abc@def.ghi", username: "abcdefghi"};
                const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect("Content-Type", /json/)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("401 code", (done) => {
                const expected = { email: "abc@def.ghi", username: "abcdefghi" };
                const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect(401)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("Content expected", (done) => {
                const expected = { email: "abc@def.ghi", username: "abcdefghi" };
                const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {expiresIn : '1h'});
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .set('cookie', [
                        `sessionToken=${token}`
                    ])
                    .expect({
                        message : "Token scaduto."
                    })
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });

        });

        describe("Token di sessione non presente", () => {

            test("JSON format", (done) => {
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .expect("Content-Type", /json/)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("404 code", (done) => {
                request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .expect(404)
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });
            test("Content expected", (done) => {
               request(app)
                    .get("/SessionRecovery")
                    .set('x-secret-key', 'LQbHd5h334ciuy7')
                    .expect({
                        message : "Token non esistente."
                    })
                    .end((err, res) => {
                        if (err) return done(err);
                        return done();
                    });
            });

        });

    });
});
