const PORT = 8080; // default port 8080
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var crypto = require("crypto");

const app = express();
app.set("view engine", "ejs");

/*
url database
*/
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

/*
utility function that generate random string for our url
*/
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function generateRandomString() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 7; i++) {
        result += characters[getRandomInt(characters.length)];
    }
    return result;
}

/*
use middleware
*/
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

/*
routes
*/
app.get("/", (req, res) => {
    res.redirect('/urls');
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

/*
create
*/
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.post("/urls", (req, res) => {
    let newKey = generateRandomString();
    console.log(req.body);
    urlDatabase[newKey] = 'http://' + String(req.body.longURL);
    res.redirect('/urls');
});


/*
delete
*/
app.post("/urls/:shortURL/delete", (req, res) => {
    const urlToDelete = req.params.shortURL;
    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
});

/*
read
*/
app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});



app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));