module.exports = (req, res, next) => {
  (req.user.role === 'ADMIN') ? next(): res.status(401).send({
    Error: 'You must be an Admin to access'
  })
}