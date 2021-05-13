const PORT = 8080; // default port 8080
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const app = express();
app.set("view engine", "ejs");

/*
user data
*/

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    },
    "abcdefg": {
        id: "abcdefg",
        email: "abc",
        password: "123"
    }
}


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
app.use(cookieParser());

/*
routes
*/
app.get("/", (req, res) => {
    res.redirect('/urls');
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, username: req.cookies["user"] };
    res.render("urls_index", templateVars);
});

/*
create
*/
app.get("/urls/new", (req, res) => {
    const templateVars = { username: req.cookies["username"] };
    res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
    let newKey = generateRandomString();
    console.log(req.body);
    urlDatabase[newKey] = 'http://' + String(req.body.longURL);
    res.redirect('/urls');
});

/*
read
*/
app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

/*
update
*/
app.post("/urls/:shortURL/update", (req, res) => {
    urlDatabase[req.params.shortURL] = 'http://' + req.body.longURL;
    res.redirect("/urls");
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
register
*/
app.get('/register', (req, res) => {
    const templateVars = { username: req.cookies["username"] };
    res.render("register", templateVars);
});

app.post("/register", (req, res) => {
    console.log("req.body:", req.body);
    let idString = generateRandomString();
    console.log(idString);
    if (!req.body.email || !req.body.password) {
        res.send(400, 'empty emaill or password');
    }
    users[idString] = { id: idString, email: req.body.email, password: req.body.password };
    console.log("users before:", users);
    res.redirect("/login");
});

/*
login
*/
app.get("/login", (req, res) => {
    const templateVars = { username: req.cookies["username"] };
    res.render("login", templateVars);
});

app.post("/login", (req, res) => {
    let testEmail = req.body.email;
    let testPassword = req.body.password;
    for (let i in users) {
        console.log(users[i].email);
        console.log(users[i].password);
        if (users[i].email === testEmail && users[i].password === testPassword) {
            res.cookie("user", testEmail);
            res.redirect("/urls");
        }
    }
    res.send('Wrong credentials');
    console.log('log in failed');
});

/*
logout
*/
app.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));