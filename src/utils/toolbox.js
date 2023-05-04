module.exports = {
    
    passwordValidator : (string) => {
        const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
        return regex.test(string);
    }
    
};