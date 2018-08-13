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
const checkCompany    = checkRoles('COMPANY');


//=====================================================================================>
// Company Accesses:
authRoutes.get('/dashboard', checkCompany, (req, res) => {
  User.findOne({}, (err, users) => {
    if(req.user.last_login == false) {
      res.send("Es tu primer acceso")  
    } else{
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