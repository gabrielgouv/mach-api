import * as express from 'express'
import * as cors from 'cors'
import AirportsRoutes from './airports/routes'
import FlightsRoutes from './flights/routes'
import RplRoutes from './rpl/routes'
import errorHandler from './errors/handler'

class Api {
  public express: express.Application

  constructor() {
    this.express = express()
    this.middleware()
  }

  middleware(): void {
    this.express.use(cors({ origin: true }))
    this.router()
    this.express.get('*', (req, res) => res.redirect('https://jpedroh.github.io/mach/#/developers'))
    this.express.use(errorHandler)
  }

  private router(): void {
    AirportsRoutes.routes(this.express)
    FlightsRoutes.routes(this.express)
    RplRoutes.routes(this.express)
  }
}

export default new Api().express