import * as rp from 'request-promise'
import * as xml from 'xml2js'
import * as functions from 'firebase-functions'
import { errorHandler } from '../errorHandler'

// Parse XML
const parseXML = xml.parseString

class Ais {

  public airport
  public res

  constructor(airport, res) {
    this.airport = airport || res.sendStatus(400)
    this.res = res
  }

  getCharts() {
    return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${functions.config().ais.password}&area=cartas&IcaoCode=${this.airport}`)
      .then((data) => {
        const charts = []
        parseXML(data, (err, result) => {
          if (err) errorHandler(err, this.res)
          result.aisweb.cartas[0].item.forEach(chart => charts.push({
            tipo: chart.tipo[0],
            nome: chart.nome[0],
            data: this.chartDate(chart.dt[0]),
            link: chart.link[0]
          }))
        })
        return charts
      })
      .catch(err => errorHandler(err, this.res))
  }

  getNotams() {
    return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${functions.config().ais.password}&area=notam&IcaoCode=${this.airport}`)
      .then((data) => {
        const notams = []
        parseXML(data, (err, result) => {
          if (err) errorHandler(err, this.res)
          result.aisweb.notam[0].item.forEach(notam => notams.push({
            codigo: notam.cod[0],
            status: notam.status[0],
            tipo: notam.tp[0],
            data: notam.dt[0],
            indent: notam.n[0],
            inicio: this.notamDate(notam.b[0]),
            termino: this.notamDate(notam.c[0]),
            mensagem: notam.e[0]
          }))
        })
        return notams
      })
      .catch(err => errorHandler(err, this.res))
  }

  chartDate(input) {
    const date = input.split('-')
    return date[2] + '/' + date[1] + '/' + date[0]
  }

  notamDate(a) {
    if (a === 'PERM')
      return a
    return a[4] + a[5] + '/' + a[2] + a[3] + '/' + a[0] + a[1] + ' ' + a[6] + a[7] + ':' + a[8] + a[9] + 'Z'
  }

}

export { Ais }