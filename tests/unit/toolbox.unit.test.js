const toolbox = require('../../src/utils/toolbox');

describe("Toolbox", ()=>{
    describe("passwordValidator", ()=>{
        it("\"\" ritorna false", ()=>{
            expect(toolbox.passwordValidator("")).toEqual(false);
        })
        it("\"ALLCAPS1234\"  ritorna false", ()=>{
            expect(toolbox.passwordValidator("ALLCAPS1234")).toEqual(false);
        })
        it("\"onlylowercase1234\"  ritorna false", ()=>{
            expect(toolbox.passwordValidator("onlylowercase1234")).toEqual(false);
        })
        it("\"MissingNumbers\"  ritorna false", ()=>{
            expect(toolbox.passwordValidator("MissingNumbers")).toEqual(false);
        })
        it("\"Short1\"  ritorna false", ()=>{
            expect(toolbox.passwordValidator("Short1")).toEqual(false);
        })
        it("\"WellFormatted1234\"  ritorna true", ()=>{
            expect(toolbox.passwordValidator("WellFormatted1234")).toEqual(true);
        })
    })
})