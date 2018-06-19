import { Request, Response, NextFunction } from 'express'
import { DBServices } from '../db/services'

const services = new DBServices('routes')

export default class FlightsControllers {

  public static getFlightById(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    return services.getEntityById(req.params.id)
      .then(data => res.send(data))
      .catch((error: Error) => next(error))
  }
  
  public static getFlights(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    return services.getEntities(req.query)
      .then(data => res.send(data))
      .catch((error: Error) => next(error))
  }

}