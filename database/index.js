var firebase = require("firebase");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDeWRbAK8f5ZLblOI8oaXE67lNXNgD4pLM",
  authDomain: "gradebook-353a5.firebaseapp.com",
  databaseURL: "https://gradebook-353a5.firebaseio.com",
  storageBucket: "gradebook-353a5.appspot.com",
  messagingSenderId: "789215569656"
};
var database = firebase.initializeApp(config).database();

module.exports = {
  ref: database.ref(),
  coursesRef: database.ref('courses'),
  homeworksRef: database.ref('homeworks'),
  quizzesRef: database.ref('quizzes'),
  examsRef: database.ref('exams'),
  scalesRef: database.ref('scales'),
  weightsRef: database.ref('weights'),
  usersRef: database.ref('users'),
  auth: firebase.auth()
};
