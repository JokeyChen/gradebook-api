var db = require('./');

var defaultScale = [
  { name: 'A', numeric: 93 },
  { name: 'A-', numeric: 90 },
  { name: 'B+', numeric: 87 },
  { name: 'B', numeric: 83 },
  { name: 'B-', numeric: 80 },
  { name: 'C+', numeric: 77 },
  { name: 'C', numeric: 73 },
  { name: 'C-', numeric: 70 },
  { name: 'F', numeric: 0 }
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
    } else {
      var percentage = (totalEarnedScore / totalMaxScore).toPrecision(2) * 100;
      // write numeric grade
      updates['/courses/' + courseId + '/numericGrade'] = percentage;
      // write letter grade
      var letter = '';
      for (var i = 0; i < defaultScale.length; i++) {
        var scale = defaultScale[i];
        if (percentage >= scale.numeric) {
          letter = scale.name;
          break;
        }
      }
      updates['/courses/' + courseId + '/letterGrade'] = letter;
    }
    db.ref.update(updates);
  }
}

module.exports = listenForGradeChange;
