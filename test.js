const chai = require('chai');
const assert = chai.assert;describe('A simple arithmetic function', function () {    it('should return the sum of two numbers', function () {        const sum = (a, b) => a + b;        assert.equal(sum(2,3), 6);    });
});
