var express = require('express');
var router = express.Router();
var db = require('../database');

router.route('/courses/:courseId/exams')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    db.examsRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .post(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    var exam = {
      name: req.body.name,
      earnedScore: req.body.earnedScore,
      maxScore: req.body.maxScore,
      course: courseId
    };
    var newExamId = db.examsRef.push().key;
    var updates = {};
    updates['/exams/' + newExamId] = exam;
    updates['/courses/' + courseId + '/exams/' + newExamId] = true;
    db.ref.update(updates);
    res.send(newExamId);
  });
router.route('/courses/:courseId/exams/:examId')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    var examId = req.params.examId;
    db.examsRef.child(examId).once('value', function (snapshot) {
      if (snapshot.child('course').val() == courseId) res.send(snapshot.val());
      else res.status(404).send();
    });
  })
  .put(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    var examId = req.params.examId;
    db.examsRef.child(examId).once('value', function (snapshot) {
      if (snapshot.val()) {
        var exam = snapshot.val();
        if (req.body.name) exam.name = req.body.name;
        if (req.body.earnedScore) exam.earnedScore = req.body.earnedScore;
        if (req.body.maxScore) exam.maxScore = req.body.maxScore;
        var updates = {};
        updates['/exams/' + examId] = exam;
        db.ref.update(updates);
        res.send(examId);
      } else {
        res.status(404).send();
      }
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    var examId = req.params.examId;
    var updates = {};
    updates['/exams/' + examId] = null;
    updates['/courses/' + courseId + '/exams/' + examId] = null;
    db.ref.update(updates);
    res.send();
  });

module.exports = router;
