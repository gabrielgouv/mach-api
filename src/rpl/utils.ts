import * as rp from 'request-promise'
import * as moment from 'moment'
import * as AdmZip from 'adm-zip'
import { DBServices } from '../db/services'

const services = new DBServices('routes')

export default class RplUtils {

  public static hasUpdate(): Promise<boolean> {
    return rp(`http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/companhias/Cia_GLO_CS.txt`)
      .then(data => true)
      .catch(err => false)
  }

  public static clearDatabase(): Promise<void> {
    return services.getEntities({})
      .then(data => {
        const promises = data.map(entity => services.deleteEntity(entity.id))
        return Promise.all(promises).then(() => console.log('DB cleaned with success'))
      })
  }

  public static updateFIR(fir): Promise<void> {
    console.log(`Creating promises for ${fir}`)
    return rp({
        url: `http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/bdr/RPL${fir}.zip`,
        encoding: null
      })
      .then(body => {
        const zip = new AdmZip(body)
        const promises = []
        zip.getEntries().forEach((zipEntry) => {
          if (zipEntry.entryName.indexOf('EOBT') !== -1) {
            const lines = zip.readAsText(zipEntry.entryName).split("\n")
            lines.forEach((line) => {
              if (line.indexOf('EQPT') !== -1) {
                const id = line.substr(25, 7).trim() + line.substr(40, 4).trim() + line.substr(line.indexOf('EQPT') - 9, 4).trim() + line.substr(44, 4).trim()
                const flightInfo = {
                  id: id,
                  callsign: line.substr(25, 7).trim(),
                  beginDate: moment(line.substr(3, 6).trim(), "DDMMYY").toISOString(),
                  endDate: (line.substr(10, 6).trim() === "UFN") ? null : moment(line.substr(10, 6).trim(), "DDMMYY").toISOString(),
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
                  rules: this.flightRules(line.substr(59, line.indexOf('EQPT') - 68).trim())
                }
                promises.push(services.setEntity(flightInfo.id, flightInfo))
              }
            })
          }
        })
        return Promise.all(promises).then(() => console.log(`Flights from ${fir} has been saved successfully`))
      })
  }
  
  private static flightRules(route): string {
    if (route.indexOf(' IFR ') !== -1)
      return 'Y'
    else if (route.indexOf(' VFR ') !== -1)
      return 'Z'
    else
      return 'I'
  }

}