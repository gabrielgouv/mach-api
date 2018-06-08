import * as services from '../db/services'

export async function getSita(req, res) {
  if(!req.query.departure || !req.query.arrival || !req.query.route)
    return res.sendStatus(400)
  try {
    const sita = await getRoute(req.query)
    return res.send(sita)
  } catch (error) {
    return res.sendStatus(500)
  }
}

async function getRoute ({departure, arrival, route}) {
  let sita = []
  const posDeparture = await posApt(departure)
  const posArrival = await posApt(arrival)
  const routeArray = route.split(' ').filter((field) => field !== 'DCT')
  for (let i = 0; i < routeArray.length; i++) {
    if (await isAwy(routeArray[i])) {
      const airway = routeArray[i]
      const fixoBegin = routeArray[i - 1] || await nearestFix(airway, posDeparture)
      const fixoLast = routeArray[i + 1] || await nearestFix(airway, posArrival)
      sita = sita.concat(await getAwy(airway, formatFix(fixoBegin), formatFix(fixoLast)))
    }
  }
  // Insere as posições dos aeroportos
  sita.splice(0, 0, posDeparture)
  sita.splice(sita.length, 0, posArrival)
  // Retorna um array com os fixos repetidos removidos
  return sita.filter((objeto, index, self) => self.findIndex(t => t.fix === objeto.fix && t.lat === objeto.lat) === index)
}


async function isAwy (airway) {
  try {
    const busca = await services.getEntities('fixes', { airway: airway })
    return true
  } catch (error) {
    return false
  }
}

// Busca o fixo mais próximo da posição passada mas que pertença a aerovia passada
async function nearestFix(airway, position) {
  let airwayFixes = await services.getEntities('fixes', { airway: airway })
  airwayFixes = airwayFixes.sort((a, b) => {
    if (a.order < b.order) return -1
    if (a.order > b.order) return 1
    return 0
  })
  let closest = Math.abs(airwayFixes[0].lat - position.lat)
  let nearest = null
  airwayFixes.map((elem) => {
    if (Math.abs(elem.lat - position.lat) < closest) {
      nearest = elem
      closest = Math.abs(elem.lat - position.lat)
    }
  })
  return nearest.fix
}

function formatFix(fix) {
  return fix.split('/')[0]
}

async function posApt(icao) {
  const airport = await services.getEntityById('airports', icao)
  return { fix: airport.icao, lat: airport.lat, lng: airport.lng }
}

async function getAwy(airway, beginFix, lasFix) {
  let airwayFixes = await services.getEntities('fixes', { airway: airway })
  airwayFixes = airwayFixes.sort((a, b) => {
    if(a.order < b.order) return -1;
    if(a.order > b.order) return 1;
    return 0;
  })
    const posBegin = airwayFixes.findIndex(i => i.fix === beginFix)
    const posLast = airwayFixes.findIndex(i => i.fix === lasFix)
    if (posBegin > posLast)
      return airwayFixes.slice(posLast, posBegin + 1).reverse()
    return airwayFixes.slice(posBegin, posLast + 1)
}