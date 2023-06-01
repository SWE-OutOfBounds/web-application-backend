const cc = require("../../../clock-captcha/dist/index");
const jwt = require("jsonwebtoken");
module.exports = {
  generate: (req, res) => {
    // Creazione dell'oggetto generationStrategy per generare l'immagine del CAPTCHA
    // Utilizziamo una serie di decoratori per personalizzare la generazione dell'immagine
    var generationStrategy = new cc.ShapesDecorator(
      new cc.NoiseDecorator(
        new cc.HTMLCanvasGenerator(), // Generatore di immagini utilizzando HTML Canvas
        0 // Intensità del rumore nell'immagine (0 indica nessun rumore)
      ),
      8 // Numero di forme geometriche nel CAPTCHA
    );

    // Creazione dell'oggetto ImageGenerator utilizzando la strategia di generazione precedentemente creata
    var ImageGenerator = new cc.ClockImageGenerator(generationStrategy);

    // Generazione dei dati del Clock CAPTCHA utilizzando la password dell'ambiente di esecuzione
    var cc_data = cc.ClockCAPTCHA.generateData(
      process.env.CLOCK_CAPTCHA_PSW,
      ImageGenerator
    );

    // Creazione del payload di risposta che contiene il token firmato e l'immagine del CAPTCHA
    var resPayload = {
      token: jwt.sign({ token: cc_data.token }, process.env.JWT_SECRET_KEY, {
        expiresIn: "90s",
      }), // Firma del token utilizzando la chiave segreta JWT
      image: cc_data.image, // Immagine del CAPTCHA generata
    };

    // Invio della risposta al client con lo status code 200 (OK) e il payload di risposta
    res.status(200).json(resPayload);
  },
};
