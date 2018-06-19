import * as HttpStatus from 'http-status-codes'
import { ApiError } from './contracts'

export class NotFound extends Error implements ApiError {
  public responseCode: number
  public isClient: boolean
  constructor(message?: string) {
    super(message)
    this.responseCode = HttpStatus.NOT_FOUND
    this.isClient = true
  }
}

export class BadRequest extends Error implements ApiError {
  public responseCode: number
  public isClient: boolean
  constructor(message?: string) {
    super(message)
    this.responseCode = HttpStatus.BAD_REQUEST
    this.isClient = true
  }
}

export class Forbidden extends Error implements ApiError {
  public responseCode: number
  public isClient: boolean
  constructor(message?: string) {
    super(message)
    this.responseCode = HttpStatus.FORBIDDEN
    this.isClient = true
  }
}

export class InternalServerError extends Error implements ApiError {
  public responseCode: number
  public isClient: boolean
  constructor(message?: string) {
    super(message)
    this.responseCode = HttpStatus.INTERNAL_SERVER_ERROR
    this.isClient = false
  }
}