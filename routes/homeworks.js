var express = require('express');
var router = express.Router();
var db = require('../database');

router.route('/courses/:courseId/homeworks')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    db.homeworksRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .post(function (req, res) {
    var courseId = req.params.courseId;
    var homework = {
      name: req.body.name,
      earnedScore: req.body.earnedScore,
      maxScore: req.body.maxScore,
      course: courseId
    };
    var newHomeworkId = db.homeworksRef.push().key;
    var updates = {};
    updates['/homeworks/' + newHomeworkId] = homework;
    updates['/courses/' + courseId + '/homeworks/' + newHomeworkId] = true;
    db.ref.update(updates);
    res.send(homework);
  });
router.route('/courses/:courseId/homeworks/:homeworkId')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    var homeworkId = req.params.homeworkId;
    db.homeworksRef.child(homeworkId).once('value', function (snapshot) {
      if (snapshot.child('course').val() == courseId) res.send(snapshot.val());
      else res.status(404).send();
    });
  })
  .put(function (req, res) {
    var courseId = req.params.courseId;
    var homeworkId = req.params.homeworkId;
    db.homeworksRef.child(homeworkId).once('value', function (snapshot) {
      var homework = snapshot.val();
      if (req.body.name) homework.name = req.body.name;
      if (req.body.earnedScore) homework.earnedScore = req.body.earnedScore;
      if (req.body.maxScore) homework.maxScore = req.body.maxScore;
      var updates = {};
      updates['/homeworks/' + homeworkId] = homework;
      db.ref.update(updates);
      res.send(homework);
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.courseId;
    var homeworkId = req.params.homeworkId;
    var updates = {};
    updates['/homeworks/' + homeworkId] = null;
    updates['/courses/' + courseId + '/homeworks/' + homeworkId] = null;
    db.ref.update(updates);
    res.send();
  });

module.exports = router;
