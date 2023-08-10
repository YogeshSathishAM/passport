const express = require("express")
const app = express()
const path = require("path")
const cookieparser = require("cookie-parser")
const passport = require("passport")
const googleOauth2 = require("passport-google-oauth20").Strategy;

let profileObj = {};

app.use(express.static(path.join(__dirname,'views')))
app.use(express.json())

app.use(express.urlencoded({extended:true}))


passport.use(new googleOauth2({
  //authorizationURL: 'http://localhost:3300/auth',
  //tokenURL: 'https://example.com/oauth2/token',
  clientID: '437217891511-39ii7e3mjnqq6qmh6qssomoag7b12asb.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3300/auth/google/callback'
},

(accessToken, refreshToken, profile, done) => {
  // Profile contains user information returned by the provider
  console.log("profile details")
  console.log(profile)
  return done(null, profile);
}));

// Serialize user into the session
passport.serializeUser((profile, done) => {
profileObj = {profile}

done(null, profile.id);
});

// Deserialize user from the session
passport.deserializeUser((id,done) => {
  const user = profileObj.find(u => profile.id === id)
  done(null, user);
});

// Initialize Passport and use session for tracking authentication
app.use(passport.initialize());
app.use(passport.session());

// Route to initiate OAuth 2.0 authorization
app.get('/auth/google', passport.authenticate('google', { scope: ['email','profile']}));

// Callback route after successful authorization
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/auth/google' // can i redirect to index page?
}));


// Example protected route, app.get to display the user after verification
app.get('/profile', (req, res) => {
 // console.log(req);

  if (req.isAuthenticated()) {
      res.send(`Hello, ${req.user.username}!`);
  } else {
      res.send('Not authenticated.');
  }
});

app.listen(3300,(res,req)=>{
    console.log("listening to server 3300")
})