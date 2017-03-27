var express = require('express');
var router = express.Router();
var db = require('../database');

// courses
router.route('/courses')
  .post(function (req, res) {
    var course = {
      name: req.body.name,
      unit: req.body.unit
    }
    var newCourseId = db.coursesRef.push().key;
    var updates = {};
    updates['/courses/' + newCourseId] = course;
    db.ref.update(updates);
    res.send(newCourseId);
  })
  .get(function (req, res) {
    db.coursesRef.once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  });

router.route('/courses/:id')
  .get(function (req, res) {
    var courseId = req.params.id;
    db.coursesRef.child(courseId).once('value', function (snapshot) {
      if (snapshot.val()) res.send(snapshot.val());
      else res.status(404).send();
    });
  })
  .put(function (req, res) {
    var courseId = req.params.id;
    db.coursesRef.child(courseId).once('value', function (snapshot) {
      if (snapshot.val()) {
        var course = snapshot.val();
        if (req.body.name) course.name = req.body.name;
        if (req.body.unit) course.unit = req.body.unit;
        var updates = {};
        updates['/courses/' + courseId] = course;
        db.ref.update(updates);
        res.send(courseId);
      } else {
        res.status(404).send();
      }
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.id;
    db.coursesRef.child(courseId).once('value', function (snapshot) {
      if (snapshot.val()) {
        var course = snapshot.val();
        var updates = {};
        updates['/courses/' + courseId] = null;
        // delete associated homeworks
        snapshot.child('homeworks').forEach(function (homeworkSnap) {
          updates['/homeworks/' + homeworkSnap.key] = null;
        });
        // delete associated quizzes
        snapshot.child('quizzes').forEach(function (quizSnap) {
          updates['/quizzes/' + quizSnap.key] = null;
        });
        // delete associated exams
        snapshot.child('exams').forEach(function (examSnap) {
          updates['/exams/' + examSnap.key] = null;
        });
        // delete associated scale
        updates['/scales/' + snapshot.child('scale').val()] = null;
        // delete associated weight
        updates['/weights/' + snapshot.child('weight').val()] = null;
        db.ref.update(updates);
        res.send();
      } else {
        res.status(404).send();
      }
    });
  });

module.exports = router;
