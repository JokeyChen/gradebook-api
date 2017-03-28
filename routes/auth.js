var express = require('express');
var router = express.Router();
var auth = require('../database/auth');

router.route('/signup')
  .post(function (req, res) {
    auth.signup(req.body.email, req.body.password, function (token) {
      res.send(token);
    });
  });

router.route('/login')
  .post(function (req, res) {
    auth.login(req.body.email, req.body.password, function (token) {
      res.send(token);
    });
  });

router.use(function (req, res, next) {
  var token = req.body.token || req.headers['x-access-token'];

  if (token) {
    // decode token
    auth.verifyToken(token, function (decoded) {
      if (decoded.success === false && decoded.message === 'Failed to authenticate token.') {
        // console.log('here');
        res.status(401).send(decoded);
      } else {
        req.decoded = decoded;
        next();
      }
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

router.route('/test')
  .get(function (req, res) {
    res.send({
      success: true,
      message: "IT WORKS!"
    })
  });

module.exports = router;
