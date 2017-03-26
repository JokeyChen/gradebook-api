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
var homeworksRef = database.ref('homeworks');
var quizzesRef = database.ref('quizzes');
var examsRef = database.ref('exams');

var defaultScale = [
  { name: 'A', numeric: 93 },
  { name: 'A-', numeric: 90 },
  { name: 'B+', numeric: 87 },
  { name: 'B', numeric: 83 },
  { name: 'B-', numeric: 80 },
  { name: 'C+', numeric: 77 },
  { name: 'C', numeric: 73 },
  { name: 'C-', numeric: 70 },
  { name: 'F', numeric: 0 }
];

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// Update courses totals when the value of homeworks, quizzes, and exams changed
homeworksRef.on('child_added', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

homeworksRef.on('child_changed', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

homeworksRef.on('child_removed', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

quizzesRef.on('child_added', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

quizzesRef.on('child_changed', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

quizzesRef.on('child_removed', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

examsRef.on('child_added', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

examsRef.on('child_changed', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

examsRef.on('child_removed', function (snapshot) {
  calculateGrade(snapshot.val().course);
});

// HELPER METHODS
function calculateGrade(courseId) {
  var totalEarnedScore = 0;
  var totalMaxScore = 0;
  // homeworks
  homeworksRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
    snapshot.forEach(function (homework) {
      totalEarnedScore += homework.val().earnedScore;
      totalMaxScore += homework.val().maxScore;
    });
  });
  // quizzes
  quizzesRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
    snapshot.forEach(function (quiz) {
      totalEarnedScore += quiz.val().earnedScore;
      totalMaxScore += quiz.val().maxScore;
    });
  });
  // exams
  examsRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
    snapshot.forEach(function (exam) {
      totalEarnedScore += exam.val().earnedScore;
      totalMaxScore += exam.val().maxScore;
    });
  });
  var updates = {};
  if (totalMaxScore == 0) {
    // write numeric grade
    updates['/courses/' + courseId + '/numericGrade'] = 100;
    // write letter grade
    updates['/courses/' + courseId + '/letterGrade'] = 'A';
  } else {
    var percentage = (totalEarnedScore / totalMaxScore).toPrecision(2) * 100;
    // write numeric grade
    updates['/courses/' + courseId + '/numericGrade'] = percentage;
    // write letter grade
    var letter = '';
    for (var i = 0; i < defaultScale.length; i++) {
      var scale = defaultScale[i];
      if (percentage >= scale.numeric) {
        letter = scale.name;
        break;
      }
    }
    updates['/courses/' + courseId + '/letterGrade'] = letter;
  }
  firebase.database().ref().update(updates);
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
    coursesRef.once('value', function (snapshot) {
      res.send(snapshot.val());
    })
  });

router.route('/courses/:id')
  .get(function (req, res) {
    var courseId = req.params.id;
    coursesRef.child(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .put(function (req, res) {
    var courseId = req.params.id;
    coursesRef.child(courseId).once('value', function (snapshot) {
      var course = snapshot.val();
      if (req.body.name) course.name = req.body.name;
      if (req.body.unit) course.unit = req.body.unit;
      var updates = {};
      updates['/courses/' + courseId] = course;
      firebase.database().ref().update(updates);
      res.send(course);
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.id;
    coursesRef.child(courseId).once('value', function (snapshot) {
      var course = snapshot.val();
      var updates = {};
      updates['/courses/' + courseId] = null;
      // delete associated homeworks
      coursesRef.child(courseId + '/homeworks').once('value', function (snapshot) {
        snapshot.forEach(function (homework) {
          updates['/homeworks/' + homework.key] = null;
        })
      });
      // delete associated quizzes
      coursesRef.child(courseId + '/quizzes').once('value', function (snapshot) {
        snapshot.forEach(function (quiz) {
          updates['/quizzes/' + quiz.key] = null;
        })
      });
      // delete associated exams
      coursesRef.child(courseId + '/exams').once('value', function (snapshot) {
        snapshot.forEach(function (exam) {
          updates['/exams/' + exam.key] = null;
        })
      });
      firebase.database().ref().update(updates);
      res.send(course);
    });
  });

// homeworks
router.route('/courses/:courseId/homeworks')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    homeworksRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    })
  })
  .post(function (req, res) {
    var courseId = req.params.courseId;
    var homework = {
      name: req.body.name,
      earnedScore: req.body.earnedScore,
      maxScore: req.body.maxScore,
      course: courseId
    };
    var newHomeworkId = homeworksRef.push().key;
    var updates = {};
    updates['/homeworks/' + newHomeworkId] = homework;
    updates['/courses/' + courseId + '/homeworks/' + newHomeworkId] = true;
    firebase.database().ref().update(updates);
    res.send(homework);
  });
router.route('/courses/:courseId/homeworks/:homeworkId')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    var homeworkId = req.params.homeworkId;
    homeworksRef.child(homeworkId).once('value', function (snapshot) {
      if (snapshot.child('course').val() == courseId) res.send(snapshot.val());
      else res.status(404).send();
    })
  })
  .put(function (req, res) {
    var courseId = req.params.courseId;
    var homeworkId = req.params.homeworkId;
    homeworksRef.child(homeworkId).once('value', function (snapshot) {
      var homework = snapshot.val();
      if (req.body.name) homework.name = req.body.name;
      if (req.body.earnedScore) homework.earnedScore = req.body.earnedScore;
      if (req.body.maxScore) homework.maxScore = req.body.maxScore;
      var updates = {};
      updates['/homeworks/' + homeworkId] = homework;
      firebase.database().ref().update(updates);
      res.send(homework);
    })
  })
  .delete(function (req, res) {
    var courseId = req.params.courseId;
    var homeworkId = req.params.homeworkId;
    var updates = {};
    updates['/homeworks/' + homeworkId] = null;
    updates['/courses/' + courseId + '/homeworks/' + homeworkId] = null;
    firebase.database().ref().update(updates);
    res.send();
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
