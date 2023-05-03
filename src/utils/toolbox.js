module.exports = {
    
    passwordValidator : (string) => {
        const regex = /^(?=.?[A-Z])(?=.?[a-z]).{8,}$/;
        return regex.test(string);
    }
    
};