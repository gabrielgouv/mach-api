export function errorHandler(error, res) {
  if(error.message === 'Not Found')
    return res.sendStatus(404)
  console.error(error)
  res.sendStatus(500)
}