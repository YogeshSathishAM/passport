const express = require("express")
const app = express()
const path = require("path")
const cookieparser = require("cookie-parser")
const passport = require("passport")
const googleOauth2 = require("passport-google-oauth20").Strategy;
const session = require("express-session")
const ejs = require("ejs")
const fs = require("fs")
const multer = require("multer")

//const upload = multer({dest:'uploads/'})

app.use(express.static(path.join(__dirname,'views')))
app.use(express.json())
//app.use("view engine","ejs") // if this is active, the app fails

app.use(express.urlencoded({extended:true}))

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))

passport.use(new googleOauth2({
  clientID: '437217891511-39ii7e3mjnqq6qmh6qssomoag7b12asb.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3300/auth/google/callback'
},

(accessToken, refreshToken, profile, done) => {
  // Profile contains user information returned by the provider
  console.log("profile details")
  //console.log(profile)
  return done(null, profile);
}));

// Serialize user into the session
passport.serializeUser((user, done) => {
done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user,done) => {
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
 //console.log(req);

 // checking if req is authenticated and then proceed to write the username got from gmail, 
 //then read it from same file, store in a variable and then using it as cond to login
if (req.isAuthenticated()) {

//res.render("login",{obj:"req.user.displayName"})
//res.send(`Hello ${req.user.displayName}!`) // this is to send in webpage, but since now we want to send the button in webpage, slash this
console.log("Hello," +req.user); 

let obj = req.user // getting req.user i.e, key value pairs from req body

let arrayKeys = obj.keys
console.log(arrayKeys)

jsonObj = JSON.stringify(obj) // js object converted to json object 


fs.writeFile('./username.json',jsonObj,(err) => {
 
  if (err) {
      console.error('Error writing file:', err);
      res.status(500).send('Error writing file');
    } else {
      console.log('File written successfully');
      }})
var usernameFromFile= ""
fs.readFile("./username.json","utf-8", (err,data)=>{

if(err){console.log(err)}
else{
   usernameFromFile =  data
  console.log("usernameFromFile")
}
})
  console.log(usernameFromFile)

console.log("inputing condition to display the login page")
if(usernameFromFile)
res.sendFile(path.join(__dirname,"views","login.html"))
}

   else {
      res.send('Not authenticated');
  }
 });

app.post("/logout",(req,res)=>{

  fs.unlink("./usermame.txt")
  usernameFromFile=""

  req.session.destroy(err=>{
    if(err){console.log(err)}
    else(console.log("session destroyed"))

fs.unlink("./usermame.txt")
usernameFromFile=""
console.log("the end")
  })
})

app.listen(3300,(res,req)=>{
    console.log("listening to server 3300")
})