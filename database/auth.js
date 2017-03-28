var db = require('./');
var jwt = require('jsonwebtoken');

var secret = 'ilovefuoo';
var callback;

db.auth.onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;

    db.usersRef.child(uid).once('value', function (snapshot) {
      if (!snapshot.val()) {
        // new user
        // add user info into database
        var updates = {};
        var newUser = {
          email: user.email
        };
        updates['/users/' + user.uid] = newUser;
        db.ref.update(updates);
      }
      // generate token for this user
      var token = generateToken({uid: user.uid, email: user.email});
      // send the token back
      callback(token);
    });
  } else {
    // User is signed out.
    // ...
  }
});

function signup(email, password, cb) {
  callback = cb;

  db.auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    callback({ success: false, message: errorMessage });
    // ...
  });
}

function login(email, password, cb) {
  callback = cb;

  db.auth.signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    // ...
  });
}



function generateToken(payload) {
  var token = jwt.sign(payload, secret, { expiresIn: '12h' });
  return token;
}

function verifyToken(token, cb) {
  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      cb({ success: false, message: 'Failed to authenticate token.' });
    } else {
      cb(decoded);
    }
  })
}

module.exports = {
  signup: signup,
  login: login,
  verifyToken: verifyToken
};
