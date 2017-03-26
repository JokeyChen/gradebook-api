var express = require('express');
var router = express.Router();
var db = require('../database');

router.route('/courses/:courseId/scale')
  .get(function (req, res) {
    var courseId = req.params.courseId;
    db.scalesRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      res.send(snapshot.val());
    });
  })
  .post(function (req, res) {
    var courseId = req.params.courseId;
    // check if scale exist first
    db.coursesRef.child(courseId + '/scale').once('value', function (snapshot) {
      if (snapshot.val()) {
        // scale exist, override the scale
        db.scalesRef.child(snapshot.val()).once('value', function (scaleSnap) {
          if (scaleSnap.val()) {
            var scale = scaleSnap.val();
            scale.scale = req.body;
            var scaleId = scaleSnap.key;
            var updates = {};
            updates['/scales/' + scaleId] = scale;
            db.ref.update(updates);
            res.send(scale);
          } else {
            res.status(404).send();
          }
        });
      } else {
        // scale does not exist, create a new one
        var scale = {
          course: courseId
        };
        scale.scale = req.body;
        var newScaleId = db.scalesRef.push().key;
        var updates = {};
        updates['/scales/' + newScaleId] = scale;
        updates['/courses/' + courseId + '/scale/'] = newScaleId;
        db.ref.update(updates);
        res.send(scale);
      }
    });
  })
  .put(function (req, res) {
    var courseId = req.params.courseId;
    db.coursesRef.child(courseId + '/scale').once('value', function (snapshot) {
      db.scalesRef.child(snapshot.val()).once('value', function (scaleSnap) {
        if (scaleSnap.val()) {
          var scale = scaleSnap.val();
          var scaleId = scaleSnap.key;
          scale.scale = req.body;
          var updates = {};
          updates['/scales/' + scaleId] = scale;
          db.ref.update(updates);
          res.send(scale);
        } else {
          res.status(404).send();
        }
      });
    });
  })
  .delete(function (req, res) {
    var courseId = req.params.courseId;
    db.coursesRef.child(courseId + '/scale').once('value', function (snapshot) {
      if (snapshot.val()) {
        var scaleId = snapshot.val();
        var updates = {};
        updates['/scales/' + scaleId] = null;
        updates['/courses/' + courseId + '/scale'] = null;
        db.ref.update(updates);
        res.send();
      } else {
        res.status(404).send();
      }
    });
  });

module.exports = router;
