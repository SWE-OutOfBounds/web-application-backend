const app = require("./app");
const port = 3000;

const specs = require('./documentation/swagger');

const swaggerUI = require('swagger-ui-express');
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const server = app.listen(port, () => {
  console.log(`Api running at http://localhost:${port}`);
});
