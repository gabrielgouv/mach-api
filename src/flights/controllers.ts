import * as services from '../db/services'
import { errorHandler } from '../errorHandler'

export function getFlightById(req, res) {
  services.getEntityById('routes', req.params.id)
    .then(data => res.send(data))
    .catch(error => errorHandler(error, res))
}

export function getFlights(req, res) {
  services.getEntities('routes', req.query)
    .then(data => res.send(data))
    .catch(error => errorHandler(error, res))
}
