import { Request, Response, NextFunction } from 'express'
import * as moment from 'moment'
import RplUtils from './utils'
import { rplToken } from '../config'
import { Forbidden } from '../errors'

export default class RplControllers {

  public static async updateRpl(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      if (req.query.token !== rplToken)
        throw new Forbidden()
    } catch (error) {
      return next(error)
    }

    if (await RplUtils.hasUpdate()) {
      console.log(`Starting RPL updates at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`)
      return RplUtils.clearDatabase()
        .then(async () => {
          const firs = ['SBAZ', 'SBBS', 'SBCW', 'SBRE']
          for (const fir of firs)
            await RplUtils.updateFIR(fir)
          return
        })
        .then(() => res.send(`Update conclude sucessfully at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`))
        .catch((error: Error) => next(error))
    }
    return res.send('No updates today')

  }
}