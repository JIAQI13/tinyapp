const bcrypt = require('bcryptjs');
//utility function that check the email has been registered or not

const getUserByEmail = function (emailString,users) {
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
const urlForUser = function (userString,urlDatabase) {
    let result = {};
    for (let i in urlDatabase) {
        if (urlDatabase[i].userID === userString) {
            result[i] = urlDatabase[i];
        }
    }
    return result;
};

/*
utility function that generate random string for our url
*/
const getRandomInt = function (max) {
    return Math.floor(Math.random() * max);
};

const generateRandomString = function () {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        result += characters[getRandomInt(characters.length)];
    }
    return result;
};

//Utility function to login
const Auth = function(testEmail, testPassword,users) {
    for (let i in users) {
      let result = bcrypt.compareSync(testPassword, users[i].password);
      if (result && users[i].email === testEmail) {
        return i;
      }
    }
    return false;
  };

module.exports = { getUserByEmail, urlForUser, generateRandomString, Auth};