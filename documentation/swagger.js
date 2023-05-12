const swaggerJsDoc = require("swagger-jsdoc");
const options = {
  definition: {
    info: {
      title: "Library API",
      description: "A simple Express Library API",
      contact: {
        name: "Out of Bounds Team",
      },
    },
  },
  apis: ["./documentation/swagger.documentation.yaml"],
};
const specs = swaggerJsDoc(options);

module.exports = specs;
