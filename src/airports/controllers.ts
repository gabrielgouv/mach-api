import { Request, Response, NextFunction } from 'express'
import { DBServices } from '../db/services'
import * as utils from './utils'

const services = new DBServices('airports')

export default class AirportsControllers {

  public static getAirport(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    return Promise.all([services.getEntityById(req.params.icao), utils.getCharts(req.params.icao), utils.getNotams(req.params.icao)])
      .then((processedData: Array<any>) => {
        const [ data, charts, notams ] = processedData
        return res.send({
          data: data,
          charts: charts,
          notams: notams
        })
      })
      .catch((error: Error) => next(error))  
  }

}