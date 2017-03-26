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
    res.send(course);
  })
  .get(function (req, res) {
    db.coursesRef.once('value', function (snapshot) {
      res.send(snapshot.val());
    })
  });

router.route('/courses/:id')
  .get(function (req, res) {
    var courseId = req.params.id;
    db.coursesRef.child(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .put(function (req, res) {
    var courseId = req.params.id;
    db.coursesRef.child(courseId).once('value', function (snapshot) {
      var course = snapshot.val();
      if (req.body.name) course.name = req.body.name;
      if (req.body.unit) course.unit = req.body.unit;
      var updates = {};
      updates['/courses/' + courseId] = course;
      db.ref.update(updates);
      res.send(course);
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.id;
    db.coursesRef.child(courseId).once('value', function (snapshot) {
      var course = snapshot.val();
      var updates = {};
      updates['/courses/' + courseId] = null;
      // delete associated homeworks
      db.coursesRef.child(courseId + '/homeworks').once('value', function (snapshot) {
        snapshot.forEach(function (homework) {
          updates['/homeworks/' + homework.key] = null;
        })
      });
      // delete associated quizzes
      db.coursesRef.child(courseId + '/quizzes').once('value', function (snapshot) {
        snapshot.forEach(function (quiz) {
          updates['/quizzes/' + quiz.key] = null;
        })
      });
      // delete associated exams
      db.coursesRef.child(courseId + '/exams').once('value', function (snapshot) {
        snapshot.forEach(function (exam) {
          updates['/exams/' + exam.key] = null;
        })
      });
      db.ref.update(updates);
      res.send(course);
    });
  });

module.exports = router;
