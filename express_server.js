const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const { generateRandomString, existingUserCheck, existingEmailCheck, urlsForUser } = require("./helpers");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID1" },
  "9sm5xK": { longURL: "http://www.google.ca", userID: "userID2" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session["user_id"], urlDatabase),
    user: users[req.session["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  const userID = req.session["user_id"];

  if (userID) {

    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      uniqueUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session["user_id"]],
    };

    console.log(templateVars);
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      error: "Please Login to view unique URL links",
      user: null,
    };
    res.render("urls_error", templateVars);
  }
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(302);
  } else {
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_registration", templateVars);
});


app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});



// POST requests are used to CHANGE/DELETE/UPDATE/CREATE data

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };

  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  // console.log(req.body);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // const idToDelete = req.params.shortURL;
  // console.log(idToDelete);

  const userID = req.session["user_id"];
  const uniqueUserURLs = urlsForUser(userID, urlDatabase);

  console.log(uniqueUserURLs);

  if (Object.keys(uniqueUserURLs).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    return res.send(401);
  }

  // delete urlDatabase[idToDelete];
  // res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  // res.send("ok")
  // console.log(req.params.shortURL);

  // const newLink = req.body.urltoedit;
  // const keyToUpdate = req.params.shortURL;
  // urlDatabase[keyToUpdate] = newLink;
  // res.redirect('/urls');

  const userID = req.session["user_id"];
  const uniqueUserURLs = urlsForUser(userID, urlDatabase);

  
  if (Object.keys(uniqueUserURLs).includes(req.params.shortURL)) {

    const shortURL = req.params.shortURL;

    urlDatabase[shortURL] = { longURL: req.body.longURL, userID };

    res.redirect('/urls');
  } else {
    return res.send(401);
  }

});

app.post("/login", (req, res) => {

  const providedEmail = req.body.email;
  const providedPassword = req.body.password;

  // console.log(providedEmail);
  // console.log(providedPassword);

  if (!existingEmailCheck(providedEmail, users)) {
    const templateVars = {
      error: "Email not found",
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
        error: "Incorrect Password",
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
  console.log(users);
  req.session["user_id"] = newUserID;
  res.redirect("/urls");
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});