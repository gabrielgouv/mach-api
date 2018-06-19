import RplControllers from './controllers'
import { Application } from 'express'

export default class RplRoutes {

  static routes (app : Application) {
    app.get('/rpl/update', RplControllers.updateRpl)
  }

}