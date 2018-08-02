const express = require("express");
const authRoutes = express.Router();

// Bcrypt to encrypt passwords
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;

// User model
const User = require("../models/user");

// Require Passport
const passport = require("passport");

//  Makes sure user has logged in
const ensureLogin = require("connect-ensure-login");


// Login
authRoutes.get("/login", (req, res, next) => {
  res.render("./login", {
    "message": req.flash("error")
  });
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "./login",
  failureFlash: true,
  passReqToCallback: true
}));

authRoutes.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("private", {
    user: req.user
  });
});


// Validate roles:
function checkRoles(role) {
  return function (req, res, next) {

    if (req.isAuthenticated() && req.user.role === "ADMIN") {
      return next();
    }

    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      if (role == "ADMIN") {
        res.redirect('/admin/login')
      } else {
        res.redirect('/login')
      }
    }
  }
}


// Roles:
//========================>
const checkCompany = checkRoles('COMPANY');
const checkIronHacker = checkRoles('IRONHACKER');
const checkAdmin = checkRoles('ADMIN');
//========================>



// Admin Accessess:
//========================>
authRoutes.get('/admin/login', (req, res) => {
  res.render('admin/users/index', {
    "message": req.flash("error")
  });
});

authRoutes.post("/admin/login", passport.authenticate("local", {
  successRedirect: "../views/admin/users/index",
  failureRedirect: "/admin/login",
  failureFlash: true,
  passReqToCallback: true
}));


// ADMIN User Manager CRUD
authRoutes.get('/admin/users', checkAdmin, (req, res) => {
  User.find({}, (err, users) => {
    res.render('admin/users/list', {
      users: users,
      authUser: req.user
    });
  });
});

authRoutes.get('/admin/users/add', checkAdmin, (req, res) => {
  console.log(req.user)
  res.render('admin/users/add', {
    authUser: req.user
  });

});

authRoutes.post('/admin/users/add', checkAdmin, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("../views/signup", {
      message: "Username and Password Required"
    });
    return;
  }

  User.findOne({
      username
    })
    .then(user => {
      if (user !== null) {
        res.render("admin/users/add", {
          message: "Username is not available"
        });
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass
      });

      newUser.save((err) => {
        if (err) {
          res.render("admin/users/add", {
            message: "Error, contact site admin."
          });
        } else {
          res.redirect("/admin/users");
        }
      });
    })
    .catch(error => {
      next(error)
    })
});

authRoutes.get('/admin/users/:id/edit', checkAdmin, (req, res) => {
  User.findOne({
    _id: req.params.id
  }, (err, userItem) => {
    res.render('admin/users/edit', {
      userItem: userItem,
      authUser: req.user
    });
  });
});

authRoutes.post('/admin/users/:id/edit', checkAdmin, (req, res) => {
  User.updateOne({
    _id: req.params.id
  }, req.body, (err, user) => {
    res.redirect("/admin/users");
  });
});

authRoutes.post('/admin/users/:id/delete', checkAdmin, (req, res) => {
  User.deleteOne({
    _id: req.params.id
  }, (err, user) => {
    res.redirect("/admin/users");
  });
});
//========================>


// Signup:

authRoutes.get("/signup", (req, res, next) => {
  res.render("./signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("./signup", {
      message: "Indicate username and password"
    });
    return;
  }

  User.findOne({
    username
  }, "username", (err, user) => {
    if (user !== null) {
      res.render("./signup", {
        message: "The username already exists"
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("./signup", {
          message: "Something went wrong"
        });
      } else {
        res.redirect("/");
      }
    });
  });
});


// Logout

authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("./login");
});

module.exports = authRoutes;