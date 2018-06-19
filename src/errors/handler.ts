import * as HttpStatus from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import { ApiError } from './contracts'

export default function errorHandler(error: ApiError, req: Request, res: Response, next: NextFunction): Response {
  if(!error.isClient)
    console.log(error)
  return res.sendStatus(error.responseCode || HttpStatus.INTERNAL_SERVER_ERROR)
}