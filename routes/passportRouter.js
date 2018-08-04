const express         = require("express");
const authRoutes      = express.Router();

// Bcrypt to encrypt passwords
const bcrypt          = require("bcryptjs");
const bcryptSalt      = 10;

// User model
const User            = require("../models/user");

// Require Passport
const passport        = require("passport");

//  Makes sure user has logged in
const ensureLogin     = require("connect-ensure-login");

// Validates roles to redirect to specific page:
const checkRoles      = require("./valideRouter")


// Login
authRoutes.get("/login", (req, res, next) => {
  res.render("./login", {
    "message": req.flash("error"),
    "user": req.user
  });
});


// Signup:

authRoutes.get("/signup", (req, res, next) => {
  res.render("./signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const role = req.body.role;
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body);

  if (username === "" || password === "" || name === "" || role === "") {
    res.render("./signup", {
      message: "Please, fill up all fields"
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
      name,
      role,
      username,
      password: hashPass,
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

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "./login",
  failureFlash: true,
  passReqToCallback: true
}));


// Role:
//========================>
const checkAdmin        = checkRoles('ADMIN');
const checkCompany      = checkRoles('COMPANY');
const checkironhacker   = checkRoles("IRONHACKER");
//========================>



// Admin Accessess:
//========================>
authRoutes.get('/dashboard', checkAdmin, (req, res) => {
  User.find({}, (err, users) => {
    res.render('/dashboard/profile', {
      users: users,
      authUser: req.user
    });
  });
});

authRoutes.get('/dashboard', checkAdmin, (req, res) => {
  console.log(req.user)
  res.render('dashboard/add', {
    authUser: req.user
  });

});

authRoutes.post('/admin/users/add', checkAdmin, (req, res) => {
  const role     = req.body.role;
  const name     = req.body.name;
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

authRoutes.get('/dashboard', checkAdmin, (req, res) => {
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




// Company Accessess:
//========================>


// employer User Manager CRUD
authRoutes.get('/dashboard', checkCompany, (req, res) => {
  User.find({}, (err, users) => {
    res.render('/employer/users/list', {
      users: users,
      authUser: req.user
    });
  });
});

authRoutes.get('/dashboard', checkCompany, (req, res) => {
  console.log(req.user)
  res.render('employer/users/add', {
    authUser: req.user
  });

});

authRoutes.post('/employer/users/add', checkCompany, (req, res) => {
  const role = req.body.role;
  const name = req.body.name;
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
        res.render("employer/users/add", {
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

authRoutes.get('/employer/users/:id/edit', checkCompany, (req, res) => {
  User.findOne({
    _id: req.params.id
  }, (err, userItem) => {
    res.render('employer/users/edit', {
      userItem: userItem,
      authUser: req.user
    });
  });
});

authRoutes.post('/employer/users/:id/edit', checkCompany, (req, res) => {
  User.updateOne({
    _id: req.params.id
  }, req.body, (err, user) => {
    res.redirect("/employer/users");
  });
});

authRoutes.post('/employer/users/:id/delete', checkCompany, (req, res) => {
  User.deleteOne({
    _id: req.params.id
  }, (err, user) => {
    res.redirect("/employer/users");
  });
});
//========================>





// IronHacker Accessess:
//========================>

// Ironhacker User Manager CRUD
authRoutes.get('/ironhacker/users', (req, res) => {
  User.find({}, (err, users) => {
    if(!err){
      res.json(users)
    }else{
      res.statusCode(500).json({error:"No se encontraron datos"});
    }
    
  });
});

authRoutes.get('/dashboard', checkironhacker, (req, res) => {
  console.log(req.user)
  res.render('ironhacker/users/add', {
    authUser: req.user
  });

});

authRoutes.post('/ironhacker/users/add', checkironhacker, (req, res) => {
  const name = req.body.name;
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
        res.render("ironhacker/users/add", {
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
          res.render("ironhacker/users/add", {
            message: "Error, contact site ironhacker."
          });
        } else {
          res.redirect("/ironhacker/users");
        }
      });
    })
    .catch(error => {
      next(error)
    })
});

authRoutes.get('/ironhacker/users/:id/edit', checkironhacker, (req, res) => {
  User.findOne({
    _id: req.params.id
  }, (err, userItem) => {
    res.render('ironhacker/users/edit', {
      userItem: userItem,
      authUser: req.user
    });
  });
});

authRoutes.post('/ironhacker/users/:id/edit', checkironhacker, (req, res) => {
  User.updateOne({
    _id: req.params.id
  }, req.body, (err, user) => {
    res.redirect("/ironhacker/users");
  });
});

authRoutes.post('/ironhacker/users/:id/delete', checkironhacker, (req, res) => {
  User.deleteOne({
    _id: req.params.id
  }, (err, user) => {
    res.redirect("/ironhacker/users");
  });
});
//========================>

// Logout

authRoutes.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  console.log(req.session);
  res.redirect("./login");
});

module.exports = authRoutes;