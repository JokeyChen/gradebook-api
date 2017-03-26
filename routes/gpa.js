var express = require('express');
var router = express.Router();
var db = require('../database');

var defaultGpaScale = [
  ['A', 4.0],
  ['A-', 3.7],
  ['B+', 3.3],
  ['B', 3.0],
  ['B-', 2.7],
  ['C+', 2.3],
  ['C', 2.0],
  ['C-', 1.7],
  ['D', 1.0],
  ['F', 0]
];

router.route('/gpa')
  .get(function (req, res) {
    db.coursesRef.once('value', function (snapshot) {
      var totalGP = 0;
      var totalUnit = 0;
      snapshot.forEach(function (courseSnap) {
        var course = courseSnap.val();
        for (var i = 0; i < defaultGpaScale.length; i++) {
          if (course.letterGrade == defaultGpaScale[i][0]) {
            totalGP += (defaultGpaScale[i][1] * course.unit);
            break;
          }
        }
        totalUnit += parseInt(course.unit);
      });
      console.log(totalUnit);
      var gpa = totalGP / totalUnit;
      if (isNaN(gpa)) gpa = 4.0;
      res.send({gpa: gpa});
    });
  });

module.exports = router;
