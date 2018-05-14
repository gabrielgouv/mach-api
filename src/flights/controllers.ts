import firestore from './../db'
import { errorHandler } from '../errorHandler'

// DB Refs
const routesRef = firestore.collection('routes')

export function getFlightById(req, res) {
  routesRef.doc(req.params.id).get()
    .then((doc) => {
      if(doc.exists)
        return res.send(doc.data())
      return res.sendStatus(404)
    })
    .catch(err => errorHandler(err, res))
}

export function getFlights(req, res) {
  let query : any = routesRef

  Object.keys(req.query).forEach(key => {
    query = query.where(key, "==", req.query[key])
  })

  query.get().then((docs) => {
    if(docs.empty)
      return res.sendStatus(404)
    const flights = []
    docs.forEach(doc => {
      flights.push(doc.data())
    })
    return res.send(flights)
  })
  .catch(err => errorHandler(err, res))
}
