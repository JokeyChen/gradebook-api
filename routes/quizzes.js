var express = require('express');
var router = express.Router();
var db = require('../database');

router.route('/courses/:courseId/quizzes')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    db.quizzesRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .post(function (req, res) {
    var courseId = req.params.courseId;
    var quiz = {
      name: req.body.name,
      earnedScore: req.body.earnedScore,
      maxScore: req.body.maxScore,
      course: courseId
    };
    var newQuizId = db.quizzesRef.push().key;
    var updates = {};
    updates['/quizzes/' + newQuizId] = quiz;
    updates['/courses/' + courseId + '/quizzes/' + newQuizId] = true;
    db.ref.update(updates);
    res.send(newQuizId);
  });
router.route('/courses/:courseId/quizzes/:quizId')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    var quizId = req.params.quizId;
    db.quizzesRef.child(quizId).once('value', function (snapshot) {
      if (snapshot.child('course').val() == courseId) res.send(snapshot.val());
      else res.status(404).send();
    });
  })
  .put(function (req, res) {
    var courseId = req.params.courseId;
    var quizId = req.params.quizId;
    db.quizzesRef.child(quizId).once('value', function (snapshot) {
      if (snapshot.val()) {
        var quiz = snapshot.val();
        if (req.body.name) quiz.name = req.body.name;
        if (req.body.earnedScore) quiz.earnedScore = req.body.earnedScore;
        if (req.body.maxScore) quiz.maxScore = req.body.maxScore;
        var updates = {};
        updates['/quizzes/' + quizId] = quiz;
        db.ref.update(updates);
        res.send(quizId);
      } else {
        res.status(404).send();
      }
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.courseId;
    var quizId = req.params.quizId;
    var updates = {};
    updates['/quizzes/' + quizId] = null;
    updates['/courses/' + courseId + '/quizzes/' + quizId] = null;
    db.ref.update(updates);
    res.send();
  });

module.exports = router;
