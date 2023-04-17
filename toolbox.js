const passwordValidator = function (string){
    const regex = /^(?=.?[A-Z])(?=.?[a-z]).{8,}$/i;
    return regex.test(string);
}