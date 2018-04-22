import * as rp from 'request-promise'
import firestore from './../db'
import { errorHandler } from '../errorHandler'

// DB Refs
const routesRef = firestore.collection('routes')

class Flights {

  public res

  constructor(res) {
    this.res = res
  }

  getFlights(query) {
    const arr = query.arr || this.res.sendStatus(400)
    const dep = query.dep || this.res.sendStatus(400)
    return routesRef.where('departure', '==', dep).where('arrival', '==', arr).get()
      .then(data => {
        const flights = []
        data.forEach(flight => {
          flights.push(flight.data())
        })
        return flights
      })
      .catch(err => errorHandler(err, this.res))  
  }

  getFlightsByDep(query) {
    const apt = query.apt || this.res.sendStatus(400)
    return routesRef.where('departure', '==', apt).get()
      .then(data => {
        const flights = []
        data.forEach(flight => {
          flights.push(flight.data())
        })
        return flights
      })
      .catch(err => errorHandler(err, this.res))  
  }

  getFlightsByArr(query) {
    const apt = query.apt || this.res.sendStatus(400)
    return routesRef.where('arrival', '==', apt).get()
      .then(data => {
        const flights = []
        data.forEach(flight => {
          flights.push(flight.data())
        })
        return flights
      })
      .catch(err => errorHandler(err, this.res))  
  }

  getFlightsByCompany(query) {
    const company = query.company || this.res.sendStatus(400)
    return routesRef.where('company', '==', company).get()
      .then(data => {
        const flights = []
        data.forEach(flight => {
          flights.push(flight.data())
        })
        return flights
      })
      .catch(err => errorHandler(err, this.res))  
  }

  getFlightById(query) {
    const id = query.id || this.res.sendStatus(400)
    return routesRef.doc(id).get()
      .then(data => data.data())
      .catch(err => errorHandler(err, this.res))  
  }
}

export { Flights }