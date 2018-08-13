// Passport configuration:
const passport     = require("passport");

const express      = require("express");
const authRoutes   = express.Router();

// Models
const User         = require("../models/user");

// Bcrypt to encrypt passwords
const bcrypt       = require("bcrypt");
const bcryptSalt   = 10;

// /routes/auth-routes.js
const ensureLogin  = require("connect-ensure-login");

// Validates roles to redirect to specific page:
const checkRoles   = require("./validateRouter")
//=====================================================================================>





//=====================================================================================>
// User Accesses:
authRoutes.get("/login", (req, res, next) => {
  res.render("auth-views/login", { "message": req.flash("error") });
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));
//=====================================================================================>





//=====================================================================================>
// Sign Up Form:
authRoutes.get("/signup", (req, res, next) => {
  res.render("auth-views/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const role      = req.body.role;
  const email     = req.body.email;
  const firstname = req.body.firstname;
  const lastname  = req.body.lastname;
  const username  = req.body.username;
  const password  = req.body.password;

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

authRoutes.get("/dashboard", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("dashboard", {
    user: req.user
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    const role = req.user.role;
    if (role === 'ADMIN') {
      res.render('./views/dashboard', {
        user: req.user.name,
        role: req.user.role
      });
    } else if (role === 'COMPANY') {
      res.render('./views/dashboard', {
        user: req.user.name,
        role: req.user.role
      });
    } else {
      res.render('./views/dashboard', {
        user: req.user.name,
        role: req.user.role
      })
    }
  } else {
    res.redirect('/login')
  }
}
//=====================================================================================>





//=====================================================================================>
// Check User Roles:
const checkAdmin = checkRoles('ADMIN');
const checkCompany = checkRoles('COMPANY');
const checkironhacker = checkRoles("IRONHACKER");
//=====================================================================================>





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
      res.render('admin-views/user-list', {usersFromDb});
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
  const role      = req.body.role;
  const email     = req.body.email;
  const firstname = req.body.firstname;
  const lastname  = req.body.lastname;
  const username  = req.body.username;
  const password  = req.body.password;

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
  User.remove({ _id: userId })
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
      res.render('user-views/edit-page', {userDetails: userDetails});
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




//=====================================================================================>
// Company Accesses:
authRoutes.get('/dashboard', checkCompany, (req, res) => {
  User.findOne({}, (err, users) => {
    if(req.user.last_login == false) {
      res.send("Es tu primer acceso")  
    } else{
    // res.render('/dashboard', {
    //   users: users,
    //   authUser: req.user,
    //   last_login: req.users.last_login++
    // });
    res.send('Es tu segundo acceso')
    } 
  });
});

// Add Job
authRoutes.get('/post-job', checkCompany, (req, res) => {
  console.log(req.user)
  res.render('employer/job/add', {
    authUser: req.user
  });

});

// Job Vacancie
authRoutes.post('/dashboard', checkCompany, (req, res) => {
  const { companyName, title, description, duties, objective, qualifications, benefits, email,resume } = req.body;

  if (companyName === "" || title === "" || description === "" || duties === "" || objective === "" || qualifications === "" || benefits === "" || email === "" || resume === "") {
    res.render("../views/dashboard", {
      message: "Please fill all requested fields to be able to publish your vacancy"
    });
    return;
  }

  User.find({})
    .then(user => {
      if (user !== null) {
        res.render("employer/users/add", {
          message: "Username is not available"
        });
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);

      const newCompany = new User({
        username,
        password: hashPass
      });

      newCompany.save((err) => {
        if (err) {
          res.render("employer/users/add", {
            message: "Error, contact site Admin."
          });
        } else {
          res.redirect("/employer/users");
        }
      });
    })
    .catch(error => {
      next(error)
    })
});

// Edit User Profile:
authRoutes.get('/edit-profile', (req, res, next) => {
  User.findById(req.params.userId)
    .then((userDetails) => {
      res.locals.userInfo = userDetails;
      res.render('company-views/edit-page', {
        userDetails: userDetails
      });
    })
    .catch((err) => {
      next(err);
    })
});

authRoutes.post('/process-edit-profile/:userId', (req, res, next) => {
  const { companyName, address, username, email, password, phoneNumber } = req.body;
  User.findByIdAndUpdate(
      req.params.userId, { companyName, address, username, email, password, phoneNumber }, {
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

authRoutes.post('/employer/users/:id/delete', checkCompany, (req, res) => {
  User.deleteOne({
    _id: req.params.id
  }, (err, user) => {
    res.redirect("/employer/users");
  });
});
//=====================================================================================>





//=====================================================================================>
// IronHacker Accessess:
authRoutes.get('/dashboard', (req, res, next) => {
  User.findById(req.params.userId)
    .then((userDetails) => {
      res.locals.userInfo = userDetails;
      res.render('user-views/user-profile');
    })
    .catch((err) => {
      next(err);
    });
  // res.render('user-views/user-profile');
});

authRoutes.post('/dashboard/:userId', (req, res, next) => {
  const {
    firstname,
    lastname,
    email,
    username,
    password,
    role
  } = req.body;
  User.findByIdAndUpdate(
      req.params.userId, {
        firstname,
        lastname,
        email,
        username,
        password,
        role
      }, {
        runValidators: true
      }
    )
    .then(() => {
      res.redirect(`/user-profile/${req.params.userId}`);
    })
    .catch((err) => {
      next(err);
    })
});

authRoutes.get('/view-users', (req, res, next) => {
  if (!req.user) {
    next();
    return;
  }
  User.find()
    .then((usersFromDb) => {
      res.locals.userList = usersFromDb;
      res.render('user-views/user-list', { usersFromDb });
    })
    .catch((err) => {
      next(err);
    });
})
//=====================================================================================>





//=====================================================================================>
// Get users
// User.find(function (err, users, res) {
//   if (err) return console.error(err);
//   res.render("user-views/user-list", { userList: users });
//   console.log(users);
// });
//=====================================================================================>





//=====================================================================================>
// Logout
authRoutes.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  console.log(req.session);
  res.redirect("./login");
});
//=====================================================================================>


module.exports = authRoutes;