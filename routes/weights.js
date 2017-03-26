var express = require('express');
var router = express.Router();
var db = require('../database');

router.route('/courses/:courseId/weight')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    db.weightsRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .post(function (req, res) {
    var courseId = req.params.courseId;
    // check if weight exist first
    db.coursesRef.child(courseId + '/weight').once('value', function (snapshot) {
      if (snapshot.val()) {
        // weight exist, override the weight
        db.weightsRef.child(snapshot.val()).once('value', function (weightSnap) {
          var weight = weightSnap.val();
          weight.weight = req.body;
          var weightId = weightSnap.key;
          var updates = {};
          updates['/weights/' + weightId] = weight;
          db.ref.update(updates);
          res.send(weight);
        });
      } else {
        // weight does not exist, create a new one
        var weight = {
          course: courseId
        };
        weight.weight = req.body;
        var newWeightId = db.weightsRef.push().key;
        var updates = {};
        updates['/weights/' + newWeightId] = weight;
        updates['/courses/' + courseId + '/weight/'] = newWeightId;
        db.ref.update(updates);
        res.send(weight);
      }
    });
  })
  .put(function (req, res) {
    var courseId = req.params.courseId;
    db.coursesRef.child(courseId + '/weight').once('value', function (snapshot) {
      db.weightsRef.child(snapshot.val()).once('value', function (weightSnap) {
        var weight = weightSnap.val();
        var weightId = weightSnap.key;
        weight.weight = req.body;
        var updates = {};
        updates['/weights/' + weightId] = weight;
        db.ref.update(updates);
        res.send(weight);
      });
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.courseId;
    db.coursesRef.child(courseId + '/weight').once('value', function (snapshot) {
      var weightId = snapshot.val();
      var updates = {};
      updates['/weights/' + weightId] = null;
      updates['/courses/' + courseId + '/weight'] = null;
      db.ref.update(updates);
      res.send();
    });
  });

module.exports = router;
