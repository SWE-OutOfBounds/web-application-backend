require("dotenv").config();

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const cc = require("../../../clock-captcha/dist/index");
const pool = require("../../src/configs/db.config");
var crypto = require("crypto");

let fN = crypto.randomBytes(10).toString("hex");
let lN = crypto.randomBytes(10).toString("hex");
let uN = crypto.randomBytes(20).toString("hex");
let eM =
  crypto.randomBytes(5).toString("hex") +
  "@" +
  crypto.randomBytes(5).toString("hex") +
  ".it";
let pS = "ExamplePassword1234";
describe("User post endpoint", () => {
  describe("Richiesta senza secret key in header", () => {
    it("JSON format", (done) => {
      request(app)
        .post("/user")
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("403 code", (done) => {
      request(app)
        .post("/user")
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("Message expected", (done) => {
      request(app)
        .post("/user")
        .expect({
          details: "API_KEY_REQUIRED",
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
        .post("/user")
        .set("x-secret-key", "LQbHd5h334ciuy7a")
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("403 code", (done) => {
      request(app)
        .post("/user")
        .set("x-secret-key", "LQbHd5h334ciuy7a")
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("Message expected", (done) => {
      request(app)
        .post("/user")
        .set("x-secret-key", "LQbHd5h334ciuy7a")
        .expect({
          details: "INVALID_API_KEY",
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
          .post("/users")
          .set("x-secret-key", "LQbHd5h334ciuy7")
          .expect("Content-Type", /json/)
          .end((err, res) => {
            if (err) return done(err);
            return done();
          });
      });
      it("403 code", (done) => {
        request(app)
          .post("/users")
          .set("x-secret-key", "LQbHd5h334ciuy7")
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            return done();
          });
      });
      it("Message expected", (done) => {
        request(app)
          .post("/users")
          .set("x-secret-key", "LQbHd5h334ciuy7")
          .expect({
            details: "MISSING_DATA",
          })
          .end((err, res) => {
            if (err) return done(err);
            return done();
          });
      });
    });

    describe("ClockCAPTCHA: dati incorretti", () => {
      describe("Token scaduto", () => {
        let toSendData = cc.ClockCAPTCHA.generateData(
          process.env.CLOCK_CAPTCHA_PSW,
          new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
        );
        let token = jwt.sign(
          { token: toSendData.token },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1" }
        );
        it("JSON format", (done) => {
          request(app)
            .post("/users")
            .send({
              cc_token: token,
              cc_input: "00:00",
            })
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .expect("Content-Type", /json/)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("400 code", (done) => {
          request(app)
            .post("/users")
            .send({
              cc_token: token,
              cc_input: "00:00",
            })
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .expect(400)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("Message expected", (done) => {
          request(app)
            .post("/users")
            .send({
              cc_token: token,
              cc_input: "00:00",
            })
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .expect({
              details: "EXPIRED_TOKEN",
            })
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
      });
      describe("Token già utilizzato", () => {});
      describe("Captcha errato", () => {
        let toSendData = cc.ClockCAPTCHA.generateData(
          process.env.CLOCK_CAPTCHA_PSW,
          new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
        );
        let token = jwt.sign(
          { token: toSendData.token },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "30s" }
        );

        let hours = 0,
          minutes = 0,
          user_input =
            (hours < 10 ? "0" + hours.toString() : hours.toString()) +
            ":" +
            (minutes < 10 ? "0" + minutes.toString() : minutes.toString());
        it("JSON format + 400 code + Message expected", (done) => {
          request(app)
            .post("/users")
            .send({
              cc_token: token,
              cc_input: user_input,
            })
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .expect("Content-Type", /json/)
            .expect(400)
            .expect({
              details: "BAD_CAPTCHA",
            })
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
      });
    });
    describe("ClockCAPTCHA: dati corretti", () => {
      describe("Dati assenti", () => {
        describe("Nome assente", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                lastName: lN,
                username: uN,
                email: eM,
                password: pS,
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "MISSING_DATA",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
        describe("Cognome assente", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: fN,
                username: uN,
                email: eM,
                password: pS,
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "MISSING_DATA",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
        describe("Nome utente assente", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: fN,
                lastName: lN,
                email: eM,
                password: pS,
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "MISSING_DATA",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
        describe("Email assente", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: fN,
                lastName: lN,
                username: uN,
                password: pS,
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "MISSING_DATA",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
        describe("Password assente", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: fN,
                lastName: lN,
                username: uN,
                email: eM,
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "MISSING_DATA",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
      });
      describe("Dati inconsistenti", () => {
        describe("Email non ben formattata", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: fN,
                lastName: lN,
                username: uN,
                email: "bad_email.com",
                password: pS,
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "INVALID_EMAIL_FORMAT",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
        describe("Password non ben formattata", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: fN,
                lastName: lN,
                username: uN,
                email: eM,
                password: "badpassword",
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "INVALID_PASSWORD_FORMAT",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
      });
      describe("Dati consistenti", () => {
        describe("Email già collegata ad un database", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }
          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: "Mario",
                lastName: "Rossi",
                username: "BigMario",
                email: "mario.rossi@gmmail.com",
                password: "Password1234",
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect("Content-Type", /json/)
              .expect(400)
              .expect({
                details: "USED_EMAIL",
              })
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
        describe.skip("Email non collegata a nessun database", () => {
          let toSendData = cc.ClockCAPTCHA.generateData(
            process.env.CLOCK_CAPTCHA_PSW,
            new cc.ClockImageGenerator(new cc.HTMLCanvasGenerator())
          );
          let token = jwt.sign(
            { token: toSendData.token },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "30s" }
          );

          //Brute forcing captcha result
          let hours = 0,
            minutes = 0,
            user_input =
              (hours < 10 ? "0" + hours.toString() : hours.toString()) +
              ":" +
              (minutes < 10 ? "0" + minutes.toString() : minutes.toString()),
            flag = false;
          while (!flag && hours < 12) {
            minutes = 0;
            while (!flag && minutes < 60) {
              flag = cc.ClockCAPTCHA.validateData(
                { token: toSendData["token"], input: user_input },
                process.env.CLOCK_CAPTCHA_PSW
              );
              if (!flag)
                user_input =
                  (hours < 10 ? "0" + hours.toString() : hours.toString()) +
                  ":" +
                  (minutes < 10
                    ? "0" + minutes.toString()
                    : minutes.toString());
              if (!flag) minutes++;
            }
            if (!flag) hours++;
          }

          it("JSON format + 400 code + Message expected", (done) => {
            request(app)
              .post("/users")
              .send({
                cc_token: token,
                cc_input: user_input,
                firstName: fN,
                lastName: lN,
                username: uN,
                email: eM,
                password: pS,
              })
              .set("x-secret-key", "LQbHd5h334ciuy7")
              .expect(201)
              .end((err, res) => {
                if (err) return done(err);
                return done();
              });
          });
        });
      });
    });
  });
});
