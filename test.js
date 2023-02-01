const supertest = require('supertest');
const app = require('./server.js');
//const should = require('should');
const assert = require('assert');

describe("First Unit Test", () => {
    //console.log(typeof app);
    it("should return response code 2002222", (done) => {
        supertest(app).get("/healthz").expect(200).end((err, res) => {
            if (err) return done(err);
            return done();
        });
    });
});