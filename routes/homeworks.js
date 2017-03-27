var express = require('express');
var router = express.Router();
var db = require('../database');

router.route('/courses/:courseId/homeworks')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    db.homeworksRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .post(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
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
    res.send(newHomeworkId);
  });
router.route('/courses/:courseId/homeworks/:homeworkId')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    var homeworkId = req.params.homeworkId;
    db.homeworksRef.child(homeworkId).once('value', function (snapshot) {
      if (snapshot.child('course').val() == courseId) res.send(snapshot.val());
      else res.status(404).send();
    });
  })
  .put(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    var homeworkId = req.params.homeworkId;
    db.homeworksRef.child(homeworkId).once('value', function (snapshot) {
      if (snapshot.val()) {
        var homework = snapshot.val();
        if (req.body.name) homework.name = req.body.name;
        if (req.body.earnedScore) homework.earnedScore = req.body.earnedScore;
        if (req.body.maxScore) homework.maxScore = req.body.maxScore;
        var updates = {};
        updates['/homeworks/' + homeworkId] = homework;
        db.ref.update(updates);
        res.send(homeworkId);
      } else {
        res.status(404).send();
      }
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.courseId;
    // TODO: check courseId is valid
    var homeworkId = req.params.homeworkId;
    var updates = {};
    updates['/homeworks/' + homeworkId] = null;
    updates['/courses/' + courseId + '/homeworks/' + homeworkId] = null;
    db.ref.update(updates);
    res.send();
  });

module.exports = router;
