var db = require('./');

var defaultScale = [
  ['A', 93],
  ['A-', 90],
  ['B+', 87],
  ['B', 83],
  ['B-', 80],
  ['C+', 77],
  ['C', 73],
  ['C-', 70],
  ['F', 0]
];

var defaultWeight = {
  homeworks: 0.3,
  quizzes: 0.2,
  exams: 0.5
};

function listenForGradeChange() {

  // Update courses totals when the value of homeworks, quizzes, and exams changed
  db.homeworksRef.on('child_added', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.homeworksRef.on('child_changed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.homeworksRef.on('child_removed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.quizzesRef.on('child_added', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.quizzesRef.on('child_changed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.quizzesRef.on('child_removed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.examsRef.on('child_added', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.examsRef.on('child_changed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.examsRef.on('child_removed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.scalesRef.on('child_added', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.scalesRef.on('child_changed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.scalesRef.on('child_removed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.weightsRef.on('child_added', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.weightsRef.on('child_changed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  db.weightsRef.on('child_removed', function (snapshot) {
    calculateGrade(snapshot.val().course);
  });

  // HELPER METHODS
  function calculateGrade(courseId) {
    var numeric = 0;
    var courseWeight = defaultWeight;

    // try to retrieve course specific scale
    db.coursesRef.child(courseId + '/weight').once('value', function (snapshot) {
      if (snapshot.val()) {
        // if specific weight found, use that weight instead of the default one
        db.weightsRef.child(snapshot.val()).once('value', function (weightSnap) {
          courseWeight = weightSnap.val().weight;
        });
      }
      // homeworks
      db.homeworksRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
        var totalEarnedScore = 0;
        var totalMaxScore = 0;
        snapshot.forEach(function (homework) {
          totalEarnedScore += homework.val().earnedScore;
          totalMaxScore += homework.val().maxScore;
        });
        var percentage = totalEarnedScore / totalMaxScore;
        if (!isNaN(percentage)) {
          numeric += percentage * courseWeight.homeworks * 100;
        } else {
          numeric += courseWeight.homeworks * 100;
        }
      });
      // quizzes
      db.quizzesRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
        var totalEarnedScore = 0;
        var totalMaxScore = 0;
        snapshot.forEach(function (quiz) {
          totalEarnedScore += quiz.val().earnedScore;
          totalMaxScore += quiz.val().maxScore;
        });
        var percentage = totalEarnedScore / totalMaxScore;
        if (!isNaN(percentage)) {
          numeric += percentage * courseWeight.quizzes * 100;
        } else {
          numeric += courseWeight.quizzes * 100;
        }
      });
      // exams
      db.examsRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
        var totalEarnedScore = 0;
        var totalMaxScore = 0;
        snapshot.forEach(function (exam) {
          totalEarnedScore += exam.val().earnedScore;
          totalMaxScore += exam.val().maxScore;
        });
        var percentage = totalEarnedScore / totalMaxScore;
        if (!isNaN(percentage)) {
          numeric += percentage * courseWeight.exams * 100;
        } else {
          numeric += courseWeight.exams * 100;
        }
      });
      var updates = {};
      if (numeric == 0) {
        // write letter grade
        updates['/courses/' + courseId + '/letterGrade'] = 'A';
        // write numeric grade
        updates['/courses/' + courseId + '/numericGrade'] = 100;
        db.ref.update(updates);
      } else {
        var courseScale = defaultScale;
        // try to retrieve course specific scale
        db.coursesRef.child(courseId + '/scale').once('value', function (snapshot) {
          if (snapshot.val()) {
            // if specific scale found, use that scale instead of the default one
            db.scalesRef.child(snapshot.val()).once('value', function (scaleSnap) {
              courseScale = [];
              for (a in scaleSnap.val().scale) {
                courseScale.push([a, scaleSnap.val().scale[a]]);
              }
              courseScale.sort(function (a, b) {
                return b[1] - a[1];
              });
            });
          }
          var letter = '';
          for (var i = 0; i < courseScale.length; i++) {
            var scale = courseScale[i];
            if (numeric >= scale[1]) {
              letter = scale[0];
              break;
            }
          }
          // write letter grade
          updates['/courses/' + courseId + '/letterGrade'] = letter;
          // write numeric grade
          updates['/courses/' + courseId + '/numericGrade'] = numeric.toFixed(2);
          db.ref.update(updates);
        });
      }
    });
  }
}

module.exports = listenForGradeChange;
