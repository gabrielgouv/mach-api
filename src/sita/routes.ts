import * as controllers from './controllers'

export = (app) => {
  app.get('/sita', controllers.getSita)
}