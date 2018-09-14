import * as express from 'express'
import * as cors from 'cors'
import { flightRoutes } from './flights/flights.router'

class Api {
  public express: express.Application

  constructor() {
    this.express = express()
    this.middleware()
  }

  middleware(): void {
    this.express.use(cors({ origin: true }))
    this.router()
    this.express.get('*', (_, res) => res.redirect('https://jpedroh.github.io/mach/#/developers'))
  }

  private router(): void {
    flightRoutes.applyRoutes(this.express)
  }
}

export const apiInstance = new Api().express