// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var firebase = require("firebase");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDeWRbAK8f5ZLblOI8oaXE67lNXNgD4pLM",
  authDomain: "gradebook-353a5.firebaseapp.com",
  databaseURL: "https://gradebook-353a5.firebaseio.com",
  storageBucket: "gradebook-353a5.appspot.com",
  messagingSenderId: "789215569656"
};
firebase.initializeApp(config);
// Database references
var coursesRef = firebase.database().ref('courses');

// local variables
var courses = {};

var defaultCourseScale = [
  {
    name : "A",
    numeric : 93
  }, {
    name : "A-",
    numeric : 90
  }, {
    name : "B+",
    numeric : 87
  }, {
    name : "B",
    numeric : 83
  }, {
    name : "B-",
    numeric : 80
  }, {
    name : "C+",
    numeric : 77
  }, {
    name : "C",
    numeric : 73
  }, {
    name : "C-",
    numeric : 70
  }, {
    name : "F",
    numeric : 0
  }
];

// Setup database listeners
coursesRef.on('value', function (data) {
  courses = data.val();
});

coursesRef.on('child_added', function (data) {
  console.log(JSON.stringify(data.val()) + ' added!');
});

coursesRef.on('child_changed', function (data) {
  console.log(JSON.stringify(data.val()) + ' changed!');
});

coursesRef.on('child_removed', function (data) {
  console.log(JSON.stringify(data.val()) + ' removed!');
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// HELPER METHODS


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
  console.log('Receiving a ' + req.method + ' request from ' + req.path);
  next();
})

// CRUD
// courses
router.route('/courses')
  .post(function (req, res) {
    var course = {
      name: req.body.name,
      unit: req.body.unit,
      scale: defaultCourseScale
    }
    var newCourseId = coursesRef.push().key;
    var updates = {};
    updates['/courses/' + newCourseId] = course;
    firebase.database().ref().update(updates);
    res.send(course);
  })
  .get(function (req, res) {
    res.send(courses);
  });

router.route('/courses/:id')
  .get(function (req, res) {
    var courseId = req.params.id;
    res.send(courses[courseId]);
  })
  .put(function (req, res) {
    var courseId = req.params.id;
    var course = courses[courseId];
    if (req.body.name) course.name = req.body.name;
    if (req.body.unit) course.unit = req.body.unit;
    res.send(course);
  })
  .delete(function (req, res) {
    var courseId = req.params.id;
    var course = courses[courseId];
    var updates = {};
    updates['/courses/' + courseId] = null;
    firebase.database().ref().update(updates);
    res.send(course);
  });

// REGISTER OUR ROUTES
// =============================================================================
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port, function (err) {
  if (err) console.log(err);
  else console.log('Server started on port ' + port);
});
