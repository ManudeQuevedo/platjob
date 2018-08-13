module.exports = (req, res, next) => {
  (req.user.role === 'IRONHACKER') ? next(): res.status(401).send({
    Error: 'You must be an IronHacker to access'
  })
}