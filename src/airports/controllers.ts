import * as services from '../db/services'
import { errorHandler } from '../errorHandler'
import * as functions from './functions'

export async function getAirportByIcao(req, res) {
  try {
    res.send({
      data: await services.getEntityById('airports', req.params.icao),
      charts: await functions.getCharts(req.params.icao),
      notams: await functions.getNotams(req.params.icao)
    })
  } catch (error) {
    errorHandler(error, res)
  }
}

export async function getChartsByType(req, res) {
  const { icao, type } = req.params
  try {
    res.send(await functions.getChartsByType(icao, type))
  } catch (error) {
    errorHandler(error, res)
  }
}