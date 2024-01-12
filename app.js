require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const User = mongoose.model("User", userSchema)

app.get("/", function(req, res) {
    res.render("home")
})

app.get("/login", function(req, res) {
    res.render("login")
})

app.get("/register", function(req, res) {
    res.render("register")
})

app.post("/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds)
        .then(function(hash) {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });

            newUser.save()
                .then(() => {
                    res.render("secrets");
                })
                .catch((err) => {
                    console.log("Error Occurred:", err);
                });
        })
        .catch((err) => {
            console.log("Error Occurred while hashing password:", err);
        });
});

app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username })
        .then((foundUser) => {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password)
                    .then(function(result) {
                        if (result) {
                            res.render("secrets");
                            console.log("Login Successful");
                        } else {
                            console.log("Incorrect password");
                        }
                    })
                    .catch((err) => {
                        console.log("Error Occurred while comparing passwords:", err);
                    });
            } else {
                console.log("User not found");
            }
        })
        .catch((err) => {
            console.log("Some Error Occurred:", err);
        });
});

app.listen(3000, function() {
    console.log("Server started on Port 3000")
})