const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

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

const existingEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

const urlsForUser = function(id) {

  const uniqueUserURLs = {};

  for (const shortURLs in urlDatabase) {
    if (urlDatabase[shortURLs].userID === id) {
      uniqueUserURLs[shortURLs] = urlDatabase[shortURLs];
    }
  }

  return uniqueUserURLs;

};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    uniqueUserID: urlDatabase[req.params.shortURL].userID,
    user: users[req.cookies["user_id"]],
  };

  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});


app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});



// POST requests are used to CHANGE/DELETE/UPDATE/CREATE data

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };

  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  // console.log(req.body);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // const idToDelete = req.params.shortURL;
  // console.log(idToDelete);

  const userID = req.cookies["user_id"];
  const uniqueUserURLs = urlsForUser(userID);

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

  const userID = req.cookies["user_id"];
  const uniqueUserURLs = urlsForUser(userID);

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

  if (!existingEmail(providedEmail)) {
    res.send(403, "Email not found");
  } else {
    const existingUserID = existingEmail(providedEmail);
    if (bcrypt.compareSync(providedPassword, users[existingUserID].password)) {
      res.cookie("user_id", existingUserID);
      res.redirect("/urls");
    } else {
      res.send(403, "Incorrect password");
    }
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
 
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;
  const newUserID = generateRandomString();
  
  if (!providedEmail || !providedPassword) {
    res.send(400, "Please include a valid email and password into the form");
    res.redirect("/register");
  } else if (existingEmail(providedEmail)) {
    res.send(400, "An account already exists with this email address");
  } else {
    users[newUserID] = {
      id: newUserID,
      email: providedEmail,
      password: bcrypt.hashSync(providedPassword, saltRounds)
    };
  }
  console.log(users);
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});