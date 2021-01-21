const { assert } = require('chai');

const { generateRandomString, existingUserCheck, existingEmailCheck, urlsForUser } = require("../helpers.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID1" },
  "9sm5xK": { longURL: "http://www.google.ca", userID: "userID2" }
};

describe('generateRandomString', function() {
  it('should return a randomized string text with exactly 6 characters', function() {
    const user = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(user, expectedOutput);
  });

  it('should return a different string everytime when the function is called', function() {
    const user1 = generateRandomString();
    const user2 = generateRandomString();
    assert.notEqual(user1, user2);
  });
  
});


describe('existingUserCheck', function() {
  it('should return a valid User ID if the email is linked with a user in the database', function() {
    const user = existingUserCheck("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if the email is not linked with a user in the database', function() {
    const user = existingUserCheck("isthisregistered@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
  
});

describe('existingEmailCheck', function() {
  it('should return a user with valid email', function() {
    const user = existingEmailCheck("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if email provided is not in the database', function() {
    const user = existingEmailCheck("isthisregistered@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
  
});


describe('urlsForUser', function() {
  it('should return the correct object position (URL) when passed a specific User ID from the database', function() {

    const user = urlsForUser("userID1", testDatabase);

    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID1" },
    };

    assert.deepEqual(user, expectedOutput);
  });

  it('should return an empty object when not passed a specific User ID from the database', function() {
    const user = urlsForUser("userID3", testDatabase);

    const expectedOutput = {};

    assert.deepEqual(user, expectedOutput);
  });
  
});