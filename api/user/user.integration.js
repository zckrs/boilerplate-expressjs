'use strict';

const request = require('supertest');

const chai = require('chai');
chai.should();
chai.use(require('sinon-chai'));

const app = require('../..');

const User = require('./user.model');

describe('User API:', () => {
  let user;

  // Clear users before testing
  before(() => User.removeAsync().then(() => {
    user = new User({
      name: 'Fake User',
      email: 'test@example.com',
      password: 'password'
    });

    return user.saveAsync();
  }));

  // Clear users after testing
  after(() => User.removeAsync());

  describe('GET /api/users/me', () => {
    let token;

    before(done => {
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          token = res.body.token;
          done();
        });
    });

    it('should respond with a user profile when authenticated', done => {
      request(app)
        .get('/api/users/me')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body._id.toString().should.equal(user._id.toString());
          done();
        });
    });

    it('should respond with a 401 when not authenticated', done => {
      request(app)
        .get('/api/users/me')
        .expect(401)
        .end(done);
    });
  });
});
