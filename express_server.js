const PORT = 8080; // default port 8080
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

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
        email: "abc@abc",
        password: "123"
    }
}


/*
url database
*/
const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "abcdefg" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
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
return the URLs where the userID is equal to the id of the currently logged-in user
*/
const urlForUser = function (userString) {
    let result = {};
    for (let i in urlDatabase) {
        if (urlDatabase[i].userID === userString) {
            result[i] = urlDatabase[i];
        }
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
    let result = urlForUser(req.cookies["user_id"]);
    const templateVars = { urls: result, user_id: req.cookies["user_id"] };
    //console.log(result);
    console.log('users', users);
    res.render("urls_index", templateVars);
});

/*
create
*/
app.get("/urls/new", (req, res) => {
    const templateVars = { user_id: req.cookies["user_id"] };
    if (!req.cookies["user_id"]) { res.redirect('/urls'); }
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
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});

/*
update
*/
app.post("/urls/:shortURL/update", (req, res) => {
    if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
        urlDatabase[req.params.shortURL].longURL = 'http://' + req.body.longURL;
        res.redirect("/urls");
    }
    res.send(400, 'thats not ur url kid,dont mess around');
});

/*
delete
*/
app.post("/urls/:shortURL/delete", (req, res) => {
    if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
        const urlToDelete = req.params.shortURL;
        delete urlDatabase[urlToDelete];
        res.redirect("/urls");
    }
    res.send(400, 'thats not ur url kid,dont mess around');
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
        bcrypt.genSalt(10)
            .then((salt) => {
                return bcrypt.hash(req.body.password, salt);
            })
            .then((hash) => {
                users[idString] = {
                    id: idString,
                    email: req.body.email,
                    password: hash
                };
                console.log(users);
                res.redirect('/login');
            });
    }
});

/*
login
*/
app.get("/login", (req, res) => {
    const templateVars = { user_id: req.cookies["user_id"] };
    res.render("login", templateVars);
});


const Auth = function (testEmail, testPassword) {
    for (let i in users) {
        let result = bcrypt.compareSync(testPassword, users[i].password)
        // (console.log(`${result}   ${users[i].email}`);
        if (result && users[i].email === testEmail) {
            return i;
        }
    }   
    return false;
}

app.post("/login", (req, res) => {
    let testEmail = req.body.email;
    let testPassword = req.body.password;
    //check empty
    if (!testEmail || !testPassword) {
        return res.status(401).send('empty email or password');
    }
    //console.log('function', Auth(testEmail, testPassword));
    let obj = Auth(testEmail, testPassword)
    if (obj) {
        console.log(obj,users[obj].id);
        res.cookie("user_id", users[obj].id);
        res.redirect("/urls");
    } else {
        res.send('Password incorrect');
    }
});

/*
logout
*/
app.get("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));