require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const corsOptions = {};
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./documentation/swagger.documentation.yaml");

const keyCheckMiddleware = require("./src/middlewares/keycheck.middleware");

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(keyCheckMiddleware.checkSecretKey);

app.use("/users", require("./src/routes/user.router"));
app.use("/session", require("./src/routes/session.router"));
app.use("/clock-captcha", require("./src/routes/clockCAPTCHA.router"));

module.exports = app;
