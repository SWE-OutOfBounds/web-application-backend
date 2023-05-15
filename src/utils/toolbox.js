module.exports = {
  // Funzione per la validazione della password
  passwordValidator: (string) => {
    // Espressione regolare per verificare se la stringa soddisfa i seguenti criteri di validazione:
    // Almeno 8 caratteri, almeno un carattere minuscolo, almeno un carattere maiuscolo e almeno un numero
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
    // Restituisce true se la stringa corrisponde alla regex, altrimenti restituisce false
    return regex.test(string);
  },
};
