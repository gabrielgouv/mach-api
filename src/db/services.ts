// Initialize app
import * as admin from 'firebase-admin'
const firestore = admin.initializeApp().firestore()

export function getEntityById(collection, id) {
  return firestore.collection(collection).doc(id).get()
    .then(doc => {
      if(!doc.exists)
        throw new Error('Not Found')
      return doc.data()
    })
}

export function getEntities(collection, query) {
  let handler : any = firestore.collection(collection)
  Object.keys(query).forEach(key => {
    handler = handler.where(key, "==", query[key])
  })
  return handler.get()
    .then((docs) => {
      if(docs.empty)
        throw new Error('Not Found')
      const entities = []
      docs.forEach(doc => {
        entities.push(doc.data())
      })
      return entities
    })
}

export function setEntity(collection, entity) {
  const { id } = entity
  return firestore.collection(collection).doc(id).set(entity)
}

export function deleteEntityById(collection, id) {
  return firestore.collection(collection).doc(id).delete()
}