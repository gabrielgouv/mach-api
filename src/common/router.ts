import { Response } from 'express'
import * as httpStatusCodes from 'http-status-codes'

export class Router {

    protected renderDocument = (res: Response) => {
        return (document: any) => {
            if(document.exists) {
                return res.json(document.data())
            }
            return res.sendStatus(httpStatusCodes.NOT_FOUND)
        }
    }

    protected renderManyDocuments = (res: Response) => {
        return (documents) => {
            if(!documents.empty) {
                return res.json(documents.docs.map(document => document.data()))
            }
            return res.sendStatus(httpStatusCodes.NOT_FOUND)
        }
    }

    protected renderError = (res: Response, statusCode?: number) => {
        return (error) => {
            console.error(error)
            return res.sendStatus(statusCode || httpStatusCodes.INTERNAL_SERVER_ERROR)
        }
    }

}