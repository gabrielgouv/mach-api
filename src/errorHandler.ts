export function errorHandler(err, res, code = 500) {
  console.error(err)
  return res.sendStatus(code)
}