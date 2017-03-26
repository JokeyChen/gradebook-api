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

  // HELPER METHODS
  function calculateGrade(courseId) {
    var totalEarnedScore = 0;
    var totalMaxScore = 0;
    // homeworks
    db.homeworksRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      snapshot.forEach(function (homework) {
        totalEarnedScore += homework.val().earnedScore;
        totalMaxScore += homework.val().maxScore;
      });
    });
    // quizzes
    db.quizzesRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      snapshot.forEach(function (quiz) {
        totalEarnedScore += quiz.val().earnedScore;
        totalMaxScore += quiz.val().maxScore;
      });
    });
    // exams
    db.examsRef.orderByChild('course').equalTo(courseId).once('value', function (snapshot) {
      snapshot.forEach(function (exam) {
        totalEarnedScore += exam.val().earnedScore;
        totalMaxScore += exam.val().maxScore;
      });
    });
    var updates = {};
    if (totalMaxScore == 0) {
      // write numeric grade
      updates['/courses/' + courseId + '/numericGrade'] = 100;
      // write letter grade
      updates['/courses/' + courseId + '/letterGrade'] = 'A';
      db.ref.update(updates);
    } else {
      var percentage = (totalEarnedScore / totalMaxScore).toPrecision(2) * 100;
      // write numeric grade
      updates['/courses/' + courseId + '/numericGrade'] = percentage;
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
        // write letter grade
        var letter = '';
        for (var i = 0; i < courseScale.length; i++) {
          var scale = courseScale[i];
          if (percentage >= scale[1]) {
            letter = scale[0];
            break;
          }
        }
        console.log(courseId, letter);
        updates['/courses/' + courseId + '/letterGrade'] = letter;
        db.ref.update(updates);
      });
    }
  }
}

module.exports = listenForGradeChange;
