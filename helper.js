// helper functions for express_server.js

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const existingUserCheck = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

const existingEmailCheck = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {

  const uniqueUserURLs = {};

  for (const shortURLs in urlDatabase) {
    if (urlDatabase[shortURLs].userID === id) {
      uniqueUserURLs[shortURLs] = urlDatabase[shortURLs];
    }
  }

  return uniqueUserURLs;

};

module.exports = { generateRandomString, existingUserCheck, existingEmailCheck, urlsForUser };