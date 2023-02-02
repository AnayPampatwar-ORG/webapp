let chai = require('chai');
let chaiHTTP = require('chai-http');
var should = chai.should(); 
const app = require('./server');
chai.use(chaiHTTP); describe('Test', () => {
    it('200 OK', (done) => {
        chai.request(app)
            .get('/healthz')
            .end((err, response) => {
                (response).should.have.status(200);
                done();
            });
    });
});