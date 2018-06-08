import { aisPassword } from '../config'
import * as rp from 'request-promise'
import * as xml from 'xml2js'
const parseXML = xml.parseString

export function getCharts(airport) {
    return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${aisPassword}&area=cartas&IcaoCode=${airport}`)
      .then((data) => {
        const charts = []
        parseXML(data, (err, result) => {
          if (err) throw new Error('Internal server error')
          result.aisweb.cartas[0].item.forEach(chart => charts.push({
            tipo: chart.tipo[0],
            nome: chart.nome[0],
            data: chartDate(chart.dt[0]),
            link: chart.link[0]
          }))
        })
        return charts
      })
  }
  
export function getChartsByType(airport, type) {
  return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${aisPassword}&area=cartas&IcaoCode=${airport}`)
    .then((data) => {
      const charts = []
      parseXML(data, (err, result) => {
        if (err) throw new Error('Internal server error')
        result.aisweb.cartas[0].item.forEach(chart => {
          if(chart.tipo[0] == type) {
            charts.push({
              tipo: chart.tipo[0],
              nome: chart.nome[0],
              data: chartDate(chart.dt[0]),
              link: chart.link[0]
            })
          }
        } )
      })
      return charts
    })
}

  export function getNotams(airport) {
    return rp(`https://www.aisweb.aer.mil.br/api/?apiKey=1934217367&apiPass=${aisPassword}&area=notam&IcaoCode=${airport}`)
      .then((data) => {
        const notams = []
        parseXML(data, (err, result) => {
          if (err) throw new Error('Not found')
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
        return notams
      })
  }
  
  function chartDate(input) {
    const date = input.split('-')
    return date[2] + '/' + date[1] + '/' + date[0]
  }
  
  function notamDate(a) {
    if (a === 'PERM')
      return a
    return a[4] + a[5] + '/' + a[2] + a[3] + '/' + a[0] + a[1] + ' ' + a[6] + a[7] + ':' + a[8] + a[9] + 'Z'
  }