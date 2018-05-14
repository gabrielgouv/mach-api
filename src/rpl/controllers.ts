import * as rp from 'request-promise'
import firestore from './../db'
import { errorHandler } from '../errorHandler'
import * as moment from 'moment'
import * as AdmZip from 'adm-zip'

// DB Refs
const routesRef = firestore.collection('routes')

class Rpl {

  public res

  constructor(res) {
    this.res = res
  }

  hasUpdate() {
    return rp(`http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/companhias/Cia_GLO_CS.txt`)
      .then(data => true)
      .catch(err => false)
  }

  clearDatabase() {
    return routesRef.get()
      .then((routes) => {
        routes.forEach((doc) => {
          routesRef.doc(doc.id).delete()
        })
        console.log(`Database cleaned`)
      })
  }

  updateFIR(fir) {
      return rp({url: `http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/bdr/RPL${fir}.zip`, encoding: null})
      .then((body) => {
        const zip = new AdmZip(body)

        return zip.getEntries().forEach((zipEntry) => {
          if (zipEntry.entryName.indexOf('EOBT') !== -1) {
            const lines = zip.readAsText(zipEntry.entryName).split("\n")

            lines.forEach((line) => {
              if (line.indexOf('EQPT') !== -1) {
                const id = line.substr(25, 7).trim() + line.substr(40, 4).trim() + line.substr(line.indexOf('EQPT') - 9, 4).trim() + line.substr(44, 4).trim()
                // Save flight to database
                routesRef.doc(id).set({
                    id: id,
                    callsign: line.substr(25, 7).trim(),
                    beginDate: line.substr(3, 6).trim(),
                    endDate: (line.substr(10, 6).trim() === "UFN") ? null : line.substr(10, 6).trim(),
                    company: line.substr(25, 3).trim(),
                    flight: parseInt(line.substr(28, 4).trim()),
                    aircraft: line.substr(33, 4).trim(),
                    wakeTurbulence: line.substr(38, 1).trim(),
                    departure: line.substr(40, 4).trim(),
                    eobt: line.substr(44, 4).trim(),
                    speed: line.substr(49, 5).trim(),
                    days: line.substr(17, 8).trim(),
                    fl: parseInt(line.substr(55, 3).trim()),
                    route: line.substr(59, line.indexOf('EQPT') - 68).trim(),
                    arrival: line.substr(line.indexOf('EQPT') - 9, 4).trim(),
                    eet: line.substr(line.indexOf('EQPT') - 5, 4).trim(),
                    rmk: line.substr(line.indexOf('EQPT')).trim(),
                    eqpt: line.substr(line.indexOf('EQPT')).trim().substr(5, line.substr(line.indexOf('EQPT')).trim().indexOf(' ') - 4).trim(),
                    rules: flightRules(line.substr(59, line.indexOf('EQPT') - 68).trim())
                  })
                  .catch(err => errorHandler(err, this.res))
              }
            })
            console.log(`Flights from ${fir} has been saved successfully`)
          }
        })
      })
  }

  updateRpl() {
    console.log(`Starting RPL updates at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`)
    return this.clearDatabase()
      .then(() => {
        const firs = ['SBAZ', 'SBBS', 'SBCW', 'SBRE']
        return new Promise(async res => {
          await firs.map(this.updateFIR)
          res('Update conclude sucessfully')
        })
      })
      .catch(err => errorHandler(err, this.res))
  }

}

function flightRules(route) {
  if (route.indexOf(' IFR ') !== -1)
    return 'Y'
  else if (route.indexOf(' VFR ') !== -1)
    return 'Z'
  else
    return 'I'
}

export { Rpl }