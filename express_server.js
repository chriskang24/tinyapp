const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

const existingEmail = function(email) {
  for(const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
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
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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




// POST requests are used to CHANGE/DELETE/UPDATE/CREATE data

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
  // console.log(req.body);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const idToDelete = req.params.shortURL;
  // console.log(idToDelete);
  delete urlDatabase[idToDelete];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  // res.send("ok")
  // console.log(req.params.shortURL);

  const newLink = req.body.urltoedit;
  const keyToUpdate = req.params.shortURL

  urlDatabase[keyToUpdate] = newLink

  res.redirect('/urls');

});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
});

app.post("/register", (req, res) => {
 
  const providedEmail = req.body.email;
  const providedPassword = req.body.password;
  const newUserID = generateRandomString();


  
if (!providedEmail || !providedPassword) {
  res.send(400, "Please include a valid email and password into the form")
  res.redirect("/register")
} else if (existingEmail(providedEmail)) {
  res.send(400, "An account already exists with this email address")
} else {
  users[newUserID] = {
    id: newUserID,
    email: providedEmail,
    password: providedPassword
  };
}
  console.log(users);
  res.cookie("user_id", newUserID);
  res.redirect("/urls")
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
