require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    secret: 'This is our Secret.',
    resave: false,
    saveUninitialized: true
  }))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home")
})

app.get("/login", function(req, res) {
    res.render("login")
})

app.get("/register", function(req, res) {
    res.render("register")
})

app.get("/secrets", function(req, res) {
    if(req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.render("login")
    }
})

app.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) {
            console.log("Error during logout:", err);
        }
        res.redirect("/");
    });
});

app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if(err) {
            console.log("Some Error Occurred")
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                console.log("Registration Successful")
                res.redirect("/secrets");
              });
        }
    })
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err){
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function() {
            console.log("Login Successful")
            res.redirect("/secrets");
          });
        }
      });    
});

app.listen(3000, function() {
    console.log("Server started on Port 3000")
})