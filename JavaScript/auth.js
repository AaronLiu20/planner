// Firebase Sign-Up Function

// TODO: Display errors to user such as ->
// 1. Email already taken
// 2. Passwork too weak (Firebase requires [recommends?] 6 characters)
// 3. Login/Logout elements flashing for a second as firebase reauthenticates a user on refresh.
// https://stackoverflow.com/questions/60156164/how-to-stop-firebase-re-auth-on-every-page-reload-in-a-react-app

// For now errors are displayed in console only (CTRL+Shift+i)
const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
const logoutNav = document.getElementById("logoutNav");


if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const auth = firebase.auth();

    var userEmail = document.getElementById("new-user-email").value;
    var userPassword = document.getElementById("new-user-password").value;
    var confirmPass = document.getElementById("confirm-password").value;
    if (userPassword === confirmPass) {
      auth.createUserWithEmailAndPassword(userEmail, userPassword)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          document.getElementById('loginNav').style.display = 'none';
          document.getElementById('logoutNav').style.display = 'block';

          // Create a collection that is linked to the unique user ID that is logged in.
          return db.collection('users').doc(userCredential.user.uid).set({
              email: userEmail
            }).then(() => {
              // Debugging code, remove from production.
              console.log("Document written with ID: ", userCredential.user.uid);

              signupForm.reset();
              window.location = 'month.html';
            })
            .catch((error) => {
              console.error("Error adding document: ", error);
            })
        });
    } else {
      // Change this later, alerts are terrible.
      alert("Passwords must match");
    }
  })
}


// Firebase log-in function

// TODO: Display errors to user such as ->
// 1. Only display ("Invalid Login") for security reasons?

// For now errors are displayed in console only (CTRL+Shift+i)
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Grab input from user.
    let userEmail = document.getElementById("user-email").value;
    let userPassword = document.getElementById("user-password").value;

    // Sign in user with firebase.
    firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
      .then((userCredential) => {
        // Signed in
        window.location = 'month.html';
        const user = userCredential.user;
        console.log(user);
        loginForm.reset();
      });
  })
}

// Real Time Listener (Logout)
if (logoutNav) {
  logoutNav.addEventListener("click", (e) => {
    e.preventDefault();
    firebase.auth().signOut();
    document.getElementById('loginNav').style.display = 'block';
    document.getElementById('logoutNav').style.display = 'none';
    window.location = 'index.html';
    //console.log("LOGOUT BUTTON CLICKED");
  })
}

// Banner on main page was built oddly, so I had to make a funtion specifically
// for it to hide the login button while someone is already logged in.
// >> Bootstrap blocking class changes with !important?
firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    var element = document.getElementById('loginNav');
    element.classList.remove("nav-item");
    element.style.display = 'none';
  } else {
    var element = document.getElementById('logoutNav');
    element.classList.remove("nav-item");
    element.style.display = 'none';
  }
});