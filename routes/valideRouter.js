module.exports = function checkRoles(role) {
  return function (req, res, next) {

    if (req.isAuthenticated() && req.user.role === role) {
      res.redirect('/dashboard')
    } else {
      res.redirect('/login', {
        message: "Sorry, your username or password is incorrect, please validate and try again"
      })
    }
  }
}