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
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
    for (var i = 0; i < 6; i++) {
        result += characters[getRandomInt(characters.length)];
    }
    return result;
}

/*
utility function that check the email has been registered or not
*/
const getUserByEmail = function (emailString) {
    for (let i in users) {
        if (users[i].email === emailString) {
            return true;
        }
    }
    return false;
};

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
    const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
    console.log(urlDatabase);
    console.log(users);
    res.render("urls_index", templateVars);
});

/*
create
*/
app.get("/urls/new", (req, res) => {
    const templateVars = { user_id: req.cookies["user_id"] };
    res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
    let newKey = generateRandomString();
    urlDatabase[newKey] = { longURL: String(req.body.longURL), userID: req.cookies["user_id"] }
    //urlDatabase[newKey] = 'http://' + String(req.body.longURL);
    res.redirect('/urls');
});

/*
read
*/
app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user_id: req.cookies["user_id"]
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
    const templateVars = { user_id: req.cookies["user_id"] };
    res.render("register", templateVars);
});

app.post("/register", (req, res) => {
    let idString = generateRandomString();
    //if email or password is empty
    if (!req.body.email || !req.body.password) {
        res.send(400, 'empty emaill or password');
    } else if (getUserByEmail(req.body.email)) {
        res.send(400, 'email already used');
    } else {
        users[idString] = { id: idString, email: req.body.email, password: req.body.password };
        res.redirect("/login");
    }

});

/*
login
*/
app.get("/login", (req, res) => {
    const templateVars = { user_id: req.cookies["user_id"] };
    res.render("login", templateVars);
});

app.post("/login", (req, res) => {
    let testEmail = req.body.email;
    let testPassword = req.body.password;
    for (let i in users) {
        if (users[i].email === testEmail && users[i].password === testPassword) {
            res.cookie("user_id", users[i].id);
            res.redirect("/urls");
        }
    }
    res.send(403,'Wrong credentials');
});
/*
logout
*/
app.get("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));