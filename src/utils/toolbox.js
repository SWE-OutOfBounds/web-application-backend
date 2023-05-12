module.exports = {
  // Funzione per la validazione della password
  passwordValidator: (string) => {
    // Espressione regolare per verificare se la stringa soddisfa determinati criteri di validazione
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
    // Restituisce true se la stringa corrisponde alla regex, altrimenti restituisce false
    return regex.test(string);
  },
};
