const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

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
};

/*
url database
*/
const urlDatabase = {
  321: { longURL: "https://www.tsn.ca", userID: "abcdefg" },
  123: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

/*
utility function that generate random string for our url
*/
const getRandomInt = function(max) {
  return Math.floor(Math.random() * max);
};

const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters[getRandomInt(characters.length)];
  }
  return result;
};

/*
utility function that check the email has been registered or not
*/
const getUserByEmail = function(emailString) {
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
const urlForUser = function(userString) {
  let result = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === userString) {
      result[i] = urlDatabase[i];
    }
  }
  return result;
};

/*
use middleware
*/
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['PeePoo123']
}));

/*
routes
*/
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let result = urlForUser(req.session.user_id);
  const templateVars = { urls: result, user_id: req.session.user_id };
  res.render("urls_index", templateVars);
});

/*
create
*/
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.session.user_id };
  if (!req.session.user_id) {
    res.redirect('/urls');
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: 'http://' + req.body.longURL, userID: req.session.user_id };
  res.redirect('/urls');
});

/*
read
*/
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.session.user_id
  };
  res.render("urls_show", templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  let find = false;
  for (const key of Object.keys(urlDatabase)) {
    if (key === req.params.shortURL) {
      find = true;
    }
  }
  if (find) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send(400, 'thats an empty url kid,dont mess around');
  }
});

/*
update
*/
app.post("/urls/:shortURL/update", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = 'http://' + req.body.longURL;
    res.redirect("/urls");
  }
  res.send(400, 'thats not ur url kid,dont mess around');
});

/*
delete
*/
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
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
  const templateVars = { user_id: req.session.user_id };
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
        res.redirect('/login');
      });
  }
});

/*
login
*/
app.get("/login", (req, res) => {
  const templateVars = { user_id: req.session.user_id };
  res.render("login", templateVars);
});

//Utility function to login
const Auth = function(testEmail, testPassword) {
  for (let i in users) {
    let result = bcrypt.compareSync(testPassword, users[i].password);
    if (result && users[i].email === testEmail) {
      return i;
    }
  }
  return false;
};

app.post("/login", (req, res) => {
  let testEmail = req.body.email;
  let testPassword = req.body.password;
  //check empty
  if (!testEmail || !testPassword) {
    return res.status(401).send('empty email or password');
  }
  let obj = Auth(testEmail, testPassword);
  if (obj) {
    req.session.user_id = users[obj].id;
    res.redirect("/urls");
  } else {
    res.send('Password incorrect');
  }
});

/*
logout
*/
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));