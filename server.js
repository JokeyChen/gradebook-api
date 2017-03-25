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
var database = firebase.database();
var coursesRef = database.ref('courses');
var homeworksRef = database.ref('homeworks').orderByChild('course');

// local variables
var courses = {};
var homeworks = {};

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

homeworksRef.on('value', function (data) {
  homeworks = data.val();
});

homeworksRef.on('child_added', function (data) {
  console.log(JSON.stringify(data.val()) + ' added!');
});

homeworksRef.on('child_changed', function (data) {
  console.log(JSON.stringify(data.val()) + ' changed!');
});

homeworksRef.on('child_removed', function (data) {
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
      unit: req.body.unit
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
router.route('/courses/:courseId/homeworks/:homeworkId')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    var course = courses[courseId];
    res.send({message: 'hello'});
  });

// // homeworks
// router.route('/homeworks')
//   .post(function (req, res) {
//     var homework = {
//       name: req.body.name,
//       earnedScore: req.body.earnedScore,
//       maxScore: req.body.maxScore,
//       course: req.body.course
//     }
//     var newHomeworkId = homeworksRef.push().key;
//     var updates = {};
//     updates['/homeworks/' + newHomeworkId] = homework;
//     updates['/courses/' + req.body.course + '/homeworks/' + newHomeworkId] = true;
//     firebase.database().ref().update(updates);
//     res.send(homework);
//   })
//   .get(function (req, res) {
//     res.send(homeworks);
//   });
//
// router.route('/homeworks/:id')
//   .get(function (req, res) {
//     var homeworkId = req.params.id;
//     res.send(homeworks[homeworkId]);
//   })
//   .put(function (req, res) {
//     var homeworkId = req.params.id;
//     var homework = homeworks[homeworkId];
//     if (req.body.name) homework.name = req.body.name;
//     if (req.body.earnedScore) homework.earnedScore = req.body.earnedScore;
//     if (req.body.maxScore) homework.maxScore = req.body.maxScore;
//     res.send(homework);
//   })
//   .delete(function (req, res) {
//     var homeworkId = req.params.id;
//     var homework = homeworks[homeworkId];
//     var updates = {};
//     updates['/homeworks/' + homeworkId] = null;
//     updates['/courses/' + homework.course + '/homeworks/' + homeworkId] = null;
//     firebase.database().ref().update(updates);
//     res.send(homework);
//   });

// REGISTER OUR ROUTES
// =============================================================================
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port, function (err) {
  if (err) console.log(err);
  else console.log('Server started on port ' + port);
});
