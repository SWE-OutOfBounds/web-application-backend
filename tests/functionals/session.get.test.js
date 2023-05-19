require("dotenv").config();

const request = require("supertest");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = require("../../app");
const { JsonWebTokenError } = require("jsonwebtoken");

describe("Session api get endpoint", () => {
  describe("Richiesta senza secret key in header", () => {
    it("JSON format", (done) => {
      request(app)
        .get("/session")
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("403 code", (done) => {
      request(app)
        .get("/session")
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("Message expected", (done) => {
      request(app)
        .get("/session")
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
        .get("/session")
        .set("x-secret-key", "LQbHd5h334ciuy7a")
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("403 code", (done) => {
      request(app)
        .get("/session")
        .set("x-secret-key", "LQbHd5h334ciuy7a")
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    it("Message expected", (done) => {
      request(app)
        .get("/session")
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
    describe("Cookie sessionToken non presente nella richiesta", () => {
      it("JSON format", (done) => {
        request(app)
          .get("/session")
          .set("x-secret-key", "LQbHd5h334ciuy7")
          .expect("Content-Type", /json/)
          .end((err, res) => {
            if (err) return done(err);
            return done();
          });
      });
      it("404 code", (done) => {
        request(app)
          .get("/session")
          .set("x-secret-key", "LQbHd5h334ciuy7")
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            return done();
          });
      });
      it("Content expected", (done) => {
        request(app)
          .get("/session")
          .set("x-secret-key", "LQbHd5h334ciuy7")
          .expect({
            details: "MISSING_COOKIE",
          })
          .end((err, res) => {
            if (err) return done(err);
            return done();
          });
      });
    });
    describe("Cookie sessionToken presente nella richiesta", () => {
      describe("Token di sessione non valido", () => {
        it("JSON format", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(
            expected,
            crypto.randomBytes(20).toString("hex"),
            { expiresIn: "1h" }
          );
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect("Content-Type", /json/)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("400 code", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(
            expected,
            crypto.randomBytes(20).toString("hex"),
            { expiresIn: "1h" }
          );
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect(400)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("Content expected", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(
            expected,
            crypto.randomBytes(20).toString("hex"),
            { expiresIn: "1h" }
          );
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect({
              details: "INVALID_TOKEN",
            })
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
      });
      describe("Token di sessione scaduto", () => {
        it("JSON format", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {
            expiresIn: "1",
          });
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect("Content-Type", /json/)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("400 code", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {
            expiresIn: "1",
          });
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect(400)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("Content expected", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {
            expiresIn: "1",
          });
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect({
              details: "EXPIRED_TOKEN",
            })
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
      });
      describe("Token di sessione valido", () => {
        it("JSON format", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
          });
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect("Content-Type", /json/)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("200 code", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
          });
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
        it("Content expected", (done) => {
          const expected = { email: "abc@def.ghi", username: "abcdefghi" };
          const token = jwt.sign(expected, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
          });
          request(app)
            .get("/session")
            .set("x-secret-key", "LQbHd5h334ciuy7")
            .set("cookie", [`sessionToken=${token}`])
            .expect({
              email: "abc@def.ghi",
              username: "abcdefghi",
            })
            .end((err, res) => {
              if (err) return done(err);
              return done();
            });
        });
      });
    });
  });
});
