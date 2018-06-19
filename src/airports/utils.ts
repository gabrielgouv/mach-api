import * as xml from 'xml2js'
import * as rp from 'request-promise'
import { InternalServerError, NotFound } from '../errors'
import { aisPassword } from '../config'
const parseXML = xml.parseString

export function getCharts(icao: string) {
  return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${aisPassword}&area=cartas&IcaoCode=${icao}`)
    .then(data => {
      const charts: Array<object> = []
      parseXML(data, (error, result) => {
        if(error)
          throw new InternalServerError()
        if(result.aisweb.cartas[0].item === undefined)
          throw new NotFound()
          result.aisweb.cartas[0].item.forEach(chart => charts.push({
            tipo: chart.tipo[0],
            nome: chart.nome[0],
            data: chartDate(chart.dt[0]),
            link: chart.link[0]
          }))
      })
      if(charts.length === 0)
        throw new NotFound()
      return charts
    })
}

export function getChartsByType(icao: string, type: string) {
  return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${aisPassword}&area=cartas&IcaoCode=${icao}`)
    .then(data => {
      const charts: Array<object> = []
      parseXML(data, (error, result) => {
        if(error)
          throw new InternalServerError()
        if(result.aisweb.cartas[0].item === undefined)
          throw new NotFound()
          result.aisweb.cartas[0].item.forEach(chart => {
            if(chart.tipo[0] === type) {
              charts.push({
                tipo: chart.tipo[0],
                nome: chart.nome[0],
                data: chartDate(chart.dt[0]),
                link: chart.link[0]
              })
            }
          })
      })
      if(charts.length === 0)
        throw new NotFound()
      return charts
    })
}

export function getNotams(icao: string) {
  return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${aisPassword}&area=notam&IcaoCode=${icao}`)
    .then(data => {
      const notams: Array<object> = []
      parseXML(data, (error, result) => {
        if(error)
          throw new InternalServerError()
        if(result.aisweb.notam[0].item === undefined)
          throw new NotFound()
          result.aisweb.notam[0].item.forEach(notam => notams.push({
            codigo: notam.cod[0],
            status: notam.status[0],
            tipo: notam.tp[0],
            data: notam.dt[0],
            indent: notam.n[0],
            inicio: notamDate(notam.b[0]),
            termino: notamDate(notam.c[0]),
            mensagem: notam.e[0]
          }))
      })
      if(notams.length === 0)
        throw new NotFound()
      return notams
    })
}

function chartDate(input: string) {
  const date = input.split('-')
  return date[2] + '/' + date[1] + '/' + date[0]
}

function notamDate(a: string) {
  if (a === 'PERM')
    return a
  return a[4] + a[5] + '/' + a[2] + a[3] + '/' + a[0] + a[1] + ' ' + a[6] + a[7] + ':' + a[8] + a[9] + 'Z'
}