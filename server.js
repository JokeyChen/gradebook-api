// BASE SETUP
// =============================================================================

// call the packages needed
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var courses = require('./routes/courses');
var homeworks = require('./routes/homeworks');
var quizzes = require('./routes/quizzes');
var exams = require('./routes/exams');

// configure app to use bodyParser()
// this will get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR THE API
// =============================================================================
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
  console.log('Receiving a ' + req.method + ' request from ' + req.path);
  next();
})

// REGISTER THE ROUTES
// =============================================================================
app.use('/', courses);
app.use('/', homeworks);
app.use('/', quizzes);
app.use('/', exams);

// START THE SERVER
// =============================================================================
app.listen(port, function (err) {
  if (err) console.log(err);
  else console.log('Server started on port ' + port);
});
