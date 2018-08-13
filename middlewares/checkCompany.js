module.exports = (req, res, next) => {
  (req.user.role === 'COMPANY') ? next(): res.status(401).send({
    Error: 'You must be a Company to access'
  })
}