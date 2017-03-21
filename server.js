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
// Get a reference to the database service
var database = firebase.database();

// Database references
var coursesRef = firebase.database().ref('courses');
var examsRef = firebase.database().ref('exams');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

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

// HELPER METHODS

function createCourse(courseName, courseUnit) {
  var course = {
    name: courseName,
    unit: courseUnit,
    scales: defaultCourseScale
  };
  coursesRef.push(course);
  return course;
}

function updateCourse(courseName, courseUnit, id) {
  var updates = {
    name: courseName,
    unit: courseUnit
  };
  coursesRef.child(id).update(updates);
  return updates;
}

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
    res.send(createCourse(req.body.name, req.body.unit));
  })
  .get(function (req, res) {
    coursesRef.once('value').then(function (snapshot) {
      res.send(snapshot.val());
    });
  });

router.route('/courses/:id')
  .get(function (req, res) {
    coursesRef.child(req.params.id).once('value', function (snapshot) {
      var course = snapshot.val();
      // TODO: sum totals, compute percentage, and figure out grades here
      course.letterGrade = 'B+';
      course.numericGrade = '3.3';
      course.percentage = 88.21;
      res.send(course);
    });
  })
  .put(function (req, res) {
    res.send(updateCourse(req.body.name, req.body.unit, req.params.id));
  })
  .delete(function (req, res) {
    // TODO: two-way delete
    coursesRef.child(req.params.id).once('value', function (snapshot) {
      var course = snapshot.val()[req.params.id];
      coursesRef.child(req.params.id).remove();
      res.send(course);
    });
  });

// exams
router.route('/exams')
  .post(function (req, res) {
    // TODO: two-way add
    var courseId = -1; // TODO
    var exam = {
      name: req.body.name,
      earnedScore: req.body.earnedScore,
      maxScore: req.body.maxScore,
      courses: courseId
    };
    examsRef.push(exam);
    res.send(exam);
  })
  .get(function (req, res) {
    examsRef.once('value').then(function (snapshot) {
      res.send(snapshot.val());
    });
  });

router.route('/exams/:id')
  .get(function (req, res) {
    examsRef.child(req.params.id).once('value', function (snapshot) {
      var exam = snapshot.val();
      res.send(exam);
    });
  })
  .put(function (req, res) {
    var updates = {
      name: req.body.name,
      earnedScore: req.body.earnedScore,
      maxScore: req.body.maxScore
    };
    examsRef.child(req.params.id).update(updates);
    examsRef.child(req.params.id).once('value', function (snapshot) {
      var exam = snapshot.val();
      res.send(exam);
    });
  })
  .delete(function (req, res) {
    // TODO: two-way delete
    examsRef.child(req.params.id).once('value', function (snapshot) {
      var exam = snapshot.val()[req.params.id];
      examsRef.child(req.params.id).remove();
      res.send(exam);
    });
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
