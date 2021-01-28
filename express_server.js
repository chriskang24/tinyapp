const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const { generateRandomString, existingUserCheck, existingEmailCheck, urlsForUser } = require("./helpers");

// Global Object containing all Long URLS and their given short URLS & userIDs
const urlDatabase = {};

// Global object containing all user database information
const users = {};

// Routing all GET requests below:

app.get("/", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (users[req.session["user_id"]]) {
  const templateVars = {
    urls: urlsForUser(req.session["user_id"], urlDatabase),
    user: users[req.session["user_id"]],
  };
  res.render("urls_index", templateVars);
} else {
  res.status(403).redirect("/login");
}
});


// Redirects user to login page if trying to create URL while not logged in
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session["user_id"]],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session["user_id"]],
    };
    res.render("urls_registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session["user_id"]],
    };
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  if (userID) {
    const validLongURL = urlDatabase[req.params.shortURL].longURL;
    if (validLongURL) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      uniqueUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session["user_id"]],
    };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      error: "The ShortURL entered does not match a valid longURL",
      user: null,
    };
    res.render("urls_error", templateVars);
  }
}});

app.get("/u/:shortURL", (req, res) => {
 
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (res.status(200)) {
      res.redirect(longURL);
    } else {
      const templateVars = {
        error: "The ShortURL entered does not match a valid longURL",
        user: null,
      };
      res.render("urls_error", templateVars);
    }
});

// Routing all POST requests below:

app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (userID) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session["user_id"],
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Please login to create shortURLs");
  }
});

app.post("/register", (req, res) => {
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;
  const newUserID = generateRandomString();
  
  if (!providedEmail || !providedPassword) {
    const templateVars = {
      error: "Please include a valid email and password into the form",
      user: null,
    };
    res.render("urls_error", templateVars);
  } else if (existingEmailCheck(providedEmail, users)) {
    const templateVars = {
      error: "An account already exists with this email address",
      user: null,
    };
    res.render("urls_error", templateVars);
  } else {
    users[newUserID] = {
      id: newUserID,
      email: providedEmail,
      password: bcrypt.hashSync(providedPassword, saltRounds)
    };
  }
  req.session["user_id"] = newUserID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;

  if (!existingEmailCheck(providedEmail, users)) {
    const templateVars = {
      error: "Email provided not found in database",
      user: null,
    };
    res.render("urls_error", templateVars);
  } else {
    const existingUserID = existingUserCheck(providedEmail, users);
    if (bcrypt.compareSync(providedPassword, users[existingUserID].password)) {
      req.session["user_id"] = existingUserID;
      res.redirect("/urls");
    } else {
      const templateVars = {
        error: "Incorrect Email or Password",
        user: null,
      };
      res.render("urls_error", templateVars);
    }
  }
});

app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

app.delete("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const uniqueUserURLs = urlsForUser(userID, urlDatabase);
  if (Object.keys(uniqueUserURLs).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    return res.status(401).send("You do not have permissions to delete this shortURL");
  }
});

app.put("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const uniqueUserURLs = urlsForUser(userID, urlDatabase);

  if (Object.keys(uniqueUserURLs).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID };
    res.redirect('/urls');
  } else {
    return res.status(401).send("You do not have permissions to edit this shortURL");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
