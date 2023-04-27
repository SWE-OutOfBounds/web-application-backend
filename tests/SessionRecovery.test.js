const request = require("supertest");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = require("../app");
const { JsonWebTokenError } = require("jsonwebtoken");
const { describe } = require("node:test");


describe("Session recovery api", () => {

    describe("Richiesta senza secret key in header", () => {

        test("JSON format", (done) => {
            request(app)
                .get("/session")
                .expect("Content-Type", /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });
        test("403 code", (done) => {
            request(app)
                .get("/session")
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                })
        });
        test("Message expected", (done) => {
            request(app)
                .get("/session")
                .expect({
                    details: "API_KEY_REQUIRED"
                })
                .end((err, res) => {
                    if (err) return done(err);
                    return done();
                });
        });

    });

    // describe("Secret key in header ma non in database", () => {

    //     test("JSON format", (done) => {
    //         request(app)
    //             .get("/session")
    //             .set('x-secret-key', 'LQbHd5h334ciuy7a')
    //             .expect("Content-Type", /json/)
    //             .end((err, res) => {
    //                 if (err) return done(err);
    //                 return done();
    //             });
    //     });
    //     test("403 code", (done) => {
    //         request(app)
    //             .get("/session")
    //             .set('x-secret-key', 'LQbHd5h334ciuy7a')
    //             .expect(403)
    //             .end((err, res) => {
    //                 if (err) return done(err);
    //                 return done();
    //             })
    //     });
    //     test("Message expected", (done) => {
    //         request(app)
    //             .get("/session")
    //             .set('x-secret-key', 'LQbHd5h334ciuy7a')
    //             .expect({
    //                 details: "INVALID_API_KEY"
    //             })
    //             .end((err, res) => {
    //                 if (err) return done(err);
    //                 return done();
    //             });
    //     });

    // });

    // describe("Secret key in header e in database", () => {

    //     describe("Token di sessione non presente", () => {

    //         test("JSON format", (done) => {
    //             request(app)
    //                 .get("/session")
    //                 .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                 .expect("Content-Type", /json/)
    //                 .end((err, res) => {
    //                     if (err) return done(err);
    //                     return done();
    //                 });
    //         });
    //         test("404 code", (done) => {
    //             request(app)
    //                 .get("/session")
    //                 .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                 .expect(404)
    //                 .end((err, res) => {
    //                     if (err) return done(err);
    //                     return done();
    //                 });
    //         });
    //         test("Content expected", (done) => {
    //             request(app)
    //                 .get("/session")
    //                 .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                 .expect({
    //                     details: "MISSING_TOKEN"
    //                 })
    //                 .end((err, res) => {
    //                     if (err) return done(err);
    //                     return done();
    //                 });
    //         });

    //     });

    //     describe("Token di sessione presente", () => {

    //         describe("Token di sessione valido", () => {

    //             describe("Token di sessione non in database", () => {

    //                 test("JSON format", (done) => {
    //                     const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //                     const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
    //                     request(app)
    //                         .get("/session")
    //                         .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                         .set('cookie', [
    //                             `sessionToken=${token}`
    //                         ])
    //                         .expect("Content-Type", /json/)
    //                         .end((err, res) => {
    //                             if (err) return done(err);
    //                             return done();
    //                         });
    //                 });
    //                 test("404 code", (done) => {
    //                     const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //                     const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    //                     request(app)
    //                         .get("/session")
    //                         .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                         .set('cookie', [
    //                             `sessionToken=${token}`
    //                         ])
    //                         .expect(404)
    //                         .end((err, res) => {
    //                             if (err) return done(err);
    //                             return done();
    //                         });
    //                 });
    //                 test("Content expected", (done) => {
    //                     const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //                     const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    //                     request(app)
    //                         .get("/session")
    //                         .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                         .set('cookie', [
    //                             `sessionToken=${token}`
    //                         ])
    //                         .expect(404)
    //                         .expect({
    //                             details: "MISSING_TOKEN"
    //                         })
    //                         .end((err, res) => {
    //                             if (err) return done(err);
    //                             return done();
    //                         });
    //                 });

    //             });

    //             // // describe("Token di session in database", () => {

    //             // describe("Token di sessione scaduto", () => {

    //             //     test("JSON format", (done) => {
    //             //         const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //             //         const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
    //             //         request(app)
    //             //             .get("/session")
    //             //             .set('x-secret-key', 'LQbHd5h334ciuy7')
    //             //             .set('cookie', [
    //             //                 `sessionToken=${token}`
    //             //             ])
    //             //             .expect("Content-Type", /json/)
    //             //             .end((err, res) => {
    //             //                 if (err) return done(err);
    //             //                 return done();
    //             //             });
    //             //     });
    //             //     test("401 code", (done) => {
    //             //         const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //             //         const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
    //             //         request(app)
    //             //             .get("/session")
    //             //             .set('x-secret-key', 'LQbHd5h334ciuy7')
    //             //             .set('cookie', [
    //             //                 `sessionToken=${token}`
    //             //             ])
    //             //             .expect(401)
    //             //             .end((err, res) => {
    //             //                 if (err) return done(err);
    //             //                 return done();
    //             //             });
    //             //     });
    //             //     test("Content expected", (done) => {
    //             //         const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //             //         const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    //             //         request(app)
    //             //             .get("/session")
    //             //             .set('x-secret-key', 'LQbHd5h334ciuy7')
    //             //             .set('cookie', [
    //             //                 `sessionToken=${token}`
    //             //             ])
    //             //             .expect({
    //             //                 details: "EXPIRED_TOKEN"
    //             //             })
    //             //             .end((err, res) => {
    //             //                 if (err) return done(err);
    //             //                 return done();
    //             //             });
    //             //     });

    //             // });
    //             // describe("Token di sessione non scaduto", () => {

    //             //     test("JSON format", (done) => {
    //             //         const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //             //         const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
    //             //         request(app)
    //             //             .get("/session")
    //             //             .set('x-secret-key', 'LQbHd5h334ciuy7')
    //             //             .set('cookie', [
    //             //                 `sessionToken=${token}`
    //             //             ])
    //             //             .expect("Content-Type", /json/)
    //             //             .end((err, res) => {
    //             //                 if (err) return done(err);
    //             //                 return done();
    //             //             });
    //             //     });
    //             //     test("401 code", (done) => {
    //             //         const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //             //         const token = jwt.sign(expected, process.env.JWT_SECRET_KEY);
    //             //         request(app)
    //             //             .get("/session")
    //             //             .set('x-secret-key', 'LQbHd5h334ciuy7')
    //             //             .set('cookie', [
    //             //                 `sessionToken=${token}`
    //             //             ])
    //             //             .expect(401)
    //             //             .end((err, res) => {
    //             //                 if (err) return done(err);
    //             //                 return done();
    //             //             });
    //             //     });
    //             //     test("Content expected", (done) => {
    //             //         const expected = { email: "abc@def.ghi", username: "abcdefghi" };
    //             //         const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    //             //         request(app)
    //             //             .get("/session")
    //             //             .set('x-secret-key', 'LQbHd5h334ciuy7')
    //             //             .set('cookie', [
    //             //                 `sessionToken=${token}`
    //             //             ])
    //             //             .expect({
    //             //                 details: "EXPIRED_TOKEN"
    //             //             })
    //             //             .end((err, res) => {
    //             //                 if (err) return done(err);
    //             //                 return done();
    //             //             });
    //             //     });

    //             // });
    //             // })

    //         });

    //         describe("Token di sessione non valido", ()=>{
                
    //             test("JSON format", (done) => {
    //                 const token = "invalid_token";
    //                 request(app)
    //                     .get("/session")
    //                     .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                     .set('cookie', [
    //                         `sessionToken=${token}`
    //                     ])
    //                     .expect("Content-Type", /json/)
    //                     .end((err, res) => {
    //                         if (err) return done(err);
    //                         return done();
    //                     });
    //             });
    //             test("404 code", (done) => {
    //                 const token = "invalid_token";
    //                 request(app)
    //                     .get("/session")
    //                     .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                     .set('cookie', [
    //                         `sessionToken=${token}`
    //                     ])
    //                     .expect(400)
    //                     .end((err, res) => {
    //                         if (err) return done(err);
    //                         return done();
    //                     });
    //             });
    //             test("Content expected", (done) => {
    //                 const token = "invalid_token";
    //                 request(app)
    //                     .get("/session")
    //                     .set('x-secret-key', 'LQbHd5h334ciuy7')
    //                     .set('cookie', [
    //                         `sessionToken=${token}`
    //                     ])
    //                     .expect(400)
    //                     .expect({
    //                         details: "INVALID_TOKEN"
    //                     })
    //                     .end((err, res) => {
    //                         if (err) return done(err);
    //                         return done();
    //                     });
    //             });

    //         });

    //     });




    // });
});
