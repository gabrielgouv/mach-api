import * as AdmZip from "adm-zip"
import { Application, Request, Response } from "express"
import * as httpStatusCodes from "http-status-codes"
import * as moment from "moment"
import * as rp from "request-promise"
import { ModelRouter } from "../common/model-router"
import { rplToken } from "../config"
import { Flight } from "./flights.model"
import { formatDate } from "../common/format-date"

class FlightRoutes extends ModelRouter<Flight> {

    constructor() {
        super(Flight)
    }

    public applyRoutes(application: Application) {
        application.get(`${this.basePath}/update`, this.updateRPL)
        application.get(`${this.basePath}`, this.find)
        application.get(`${this.basePath}/:id`, this.findById)
    }

    private updateRPL = async (req: Request, res: Response) => {
        // Check for authentication
        if (req.query.token !== rplToken) {
            return res.sendStatus(httpStatusCodes.FORBIDDEN)
        }
        // Check if there's an update available
        if (await this.hasUpdate()) {
            const flights: Flight[] = []
            console.log(`Starting RPL updates at ${moment().format('DD/MM/YY, HH:mm:ss')}`)
            return this.clearDatabase()
                .then(_ => this.getFIRFlights('SBAZ', flights))
                .then(flights => this.getFIRFlights('SBBS', flights))
                .then(flights => this.getFIRFlights('SBCW', flights))
                .then(flights => this.getFIRFlights('SBRE', flights))
                .then(flights => this.filterFlights(flights))
                .then(flights => this.saveFlights(flights))
                .then(_ => {
                    console.log(`Update conclude sucessfully at ${moment().format('DD/MM/YY, HH:mm:ss')}`)
                    res.sendStatus(200)
                })
                .catch(this.renderError(res))
        }
        return res.send('No updates today')
    }
    

    private hasUpdate = (): Promise<boolean> => {
        return rp(`http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/companhias/Cia_GLO_CS.txt`)
            .then(_ => true)
            .catch(_ => false)
    }

    private clearDatabase = (): Promise<void> => {
        return this.collection.get().then(data => {
            const promises = data.docs.map(doc => doc.ref.delete())
            return Promise.all(promises).then(_ => console.log("DB cleaned with success"))
        })
    }
    

    private downloadFIRFile = (fir: string): Promise<Buffer> => {
        console.log(`Downloading file from ${fir}`)
        return rp({
            url: `http://portal.cgna.gov.br/files/abas/${moment().format('YYYY-MM-DD')}/painel_rpl/bdr/RPL${fir}.zip`,
            encoding: null
        })
    }

    private findFIRFile = (fir: string): Promise<string[]> => {
      return this.downloadFIRFile(fir)
          .then(file => {
            const zip = new AdmZip(file)
            // Finds the .txt file with the RPL
            for(const txtFile of zip.getEntries()) {
                if (txtFile.entryName.indexOf("EOBT") !== -1) {
                    return zip.readAsText(txtFile.entryName).split('\n').filter(line => line.indexOf("EQPT") !== -1)
                }
            }
            return []
          })
    }

    private getFIRFlights = (fir: string, flights: Flight[]): Promise<Flight[]> => {
        return this.findFIRFile(fir)
          .then(lines => {
              for(const line of lines) {
                  flights.push(this.buildFlight(line))
              }
              return flights
          })
    }

    private buildFlight = (line: string): Flight => {
        const id = line.substr(25, 7).trim() + line.substr(40, 4).trim() + line.substr(line.indexOf("EQPT") - 9, 4).trim() + line.substr(44, 4).trim()
        return {
            id: id,
            callsign: line.substr(25, 7).trim(),
            beginDate: formatDate(line.substr(3, 6).trim()),
            endDate: line.substr(10, 6).trim() === "UFN" ? null : formatDate(line.substr(10, 6).trim()),
            company: line.substr(25, 3).trim(),
            flight: parseInt(line.substr(28, 4).trim()),
            aircraft: line.substr(33, 4).trim(),
            wakeTurbulence: line.substr(38, 1).trim(),
            departure: line.substr(40, 4).trim(),
            eobt: line.substr(44, 4).trim(),
            speed: line.substr(49, 5).trim(),
            days: line.substr(17, 8).trim(),
            fl: parseInt(line.substr(55, 3).trim()),
            route: line.substr(59, line.indexOf("EQPT") - 68).trim(),
            arrival: line.substr(line.indexOf("EQPT") - 9, 4).trim(),
            eet: line.substr(line.indexOf("EQPT") - 5, 4).trim(),
            rmk: line.substr(line.indexOf("EQPT")).trim(),
            eqpt: line.substr(line.indexOf("EQPT")).trim().substr(5,line.substr(line.indexOf("EQPT")).trim().indexOf(" ") - 4).trim(),
            rules: this.flightRules(line.substr(59, line.indexOf("EQPT") - 68).trim())
        }
    }

    private filterFlights = (flights: Flight[]) => {
        return flights.filter((objeto, index, self) => self.findIndex(t => t.id === objeto.id) === index)
    }

    private saveFlights = (flights: Flight[]) => {
        console.log('Saving flights to database')
        const MAX_SIZE_BATCH_FIRESTORE = 500
        let actualPointer = 0
        const batches = []
        // Splits the array allowing the batch operation into Firestore
        for(actualPointer; actualPointer < flights.length; actualPointer += MAX_SIZE_BATCH_FIRESTORE) {
            const firestoreBatch = this.firestore.batch()
            const flightReduced = flights.slice(actualPointer, actualPointer + MAX_SIZE_BATCH_FIRESTORE)
            for(const flight of flightReduced) {
                const dbRef = this.collection.doc(flight.id)
                firestoreBatch.set(dbRef, flight)
            }
            batches.push(firestoreBatch.commit())
        }
        return Promise.all(batches)
    }


    private flightRules = (route): string => {
        if (route.indexOf(" IFR ") !== -1) {
            return "Y"
        } else if (route.indexOf(" VFR ") !== -1) {
            return "Z"
        }
        return "I"
    }

}

export const flightRoutes = new FlightRoutes()
