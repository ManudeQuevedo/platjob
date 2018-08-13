const express         = require("express");
const authRoutes      = express.Router();

// Models
const User            = require("../models/user");

// Bcrypt to encrypt passwords
const bcrypt          = require("bcrypt");
const bcryptSalt      = 10;

// /routes/auth-routes.js
const ensureLogin     = require("connect-ensure-login");

// Validates Role
const checkAdmin      = checkRoles('ADMIN');



//=====================================================================================>
// Admin Accesses:
authRoutes.get('/dashboard', checkAdmin, (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    next();
    return;
  }
  User.find()
    .then((usersFromDb) => {
      res.locals.userList = usersFromDb;
      res.render('admin-views/user-list', {
        usersFromDb
      });
    })
    .catch((err) => {
      next(err);
    });
});

// Create New User:
authRoutes.get('/dashboard/create', (req, res, next) => {
  res.render("../views/admin-views/add-user");
});

authRoutes.post('/dashboard/create', (req, res, next) => {
  const role = req.body.role;
  const email = req.body.email;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "" || role === "" || firstname === "" || email === "" || lastname === "") {
    res.render("auth-views/signup", {
      message: "All fields are mandatory."
    });
    return;
  }

  User.findOne({
    username
  }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth-views/signup", {
        message: "The username already exists"
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      firstname: firstname,
      lastname: lastname,
      email: email,
      role: role,
      username: username,
      password: hashPass,
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth-views/signup", {
          message: "Something went wrong"
        });
      } else {
        res.redirect("/");
      }
    });
  });
});

// Delete Existing User:
authRoutes.post('/delete-user/:userId', (req, res, next) => {
  if (req.user.role === "IRONHACKER" || req.user.role === "COMPANY") {
    console.log("User successfuly deleted");
    return;
  } else {
    if (!req.user.role === "ADMIN") {
      console.log("Cannot delete ADMIN");
      return;
    }
  }

  let userId = req.params.userId;
  User.remove({
      _id: userId
    })
    .then(() => {
      res.redirect('/view-users');
    })
    .catch((err) => {
      next(err);
    });
});

// Edit User Profile:
authRoutes.get('/edit-profile', (req, res, next) => {
  User.findById(req.params.userId)
    .then((userDetails) => {
      res.locals.userInfo = userDetails;
      res.render('user-views/edit-page', {
        userDetails: userDetails
      });
    })
    .catch((err) => {
      next(err);
    })
});

authRoutes.post('/process-edit-profile/:userId', (req, res, next) => {
  const {
    firstname,
    lastname,
    username,
    email,
    password
  } = req.body;
  User.findByIdAndUpdate(
      req.params.userId, {
        firstname,
        lastname,
        username,
        email,
        password
      }, {
        runValidators: true
      }
    )
    .then(() => {
      res.redirect(`/edit-profile`);
    })
    .catch((err) => {
      next(err);
    })
});


//=====================================================================================>