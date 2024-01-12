require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const md5 = require('md5');

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
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    })

    newUser.save()
        .then(() => {
            res.render("secrets");
        })
        .catch((err) => {
            console.log("Error Occurred:", err);
        });
})

app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username})
        .then((foundUser) => {
            if (foundUser && password === foundUser.password) {
                res.render("secrets");
            } else {
                console.log("Incorrect username or password");
            }
        })
        .catch((err) => {
            console.log("Some Error Occurred:", err);
        });
})

app.listen(3000, function() {
    console.log("Server started on Port 3000")
})