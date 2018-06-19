import * as admin from 'firebase-admin'
import { NotFound } from '../errors'
import { CollectionReference, WriteResult, Firestore, DocumentSnapshot, Query, QueryDocumentSnapshot, QuerySnapshot } from 'firestore'
const firestore: Firestore = admin.initializeApp().firestore()

export class DBServices {
  private collection: CollectionReference

  constructor (collection: string) {
    this.collection = firestore.collection(collection)
  }

  public getEntityById(id: string): Promise<any> {
    return this.collection.doc(id).get()
      .then((doc: DocumentSnapshot): object => {
        if(doc.exists)
          return doc.data()
        throw new NotFound()
      })
  }

  public getEntities(query : object) : Promise<Array<QueryDocumentSnapshot>> {
    let handler : CollectionReference | Query = this.collection
    Object.keys(query).forEach(key => {
      handler = handler.where(key, "==", query[key])
    })
    return handler.get()
      .then((result : QuerySnapshot) => {
        if(result.empty)
          throw new NotFound()
        return result.docs.map(doc => doc.data())
      })
  }

  public setEntity(id: string, entity: object): Promise<WriteResult> {
    return this.collection.doc(id).set(entity)
  }

  public deleteEntity(id: string): Promise<WriteResult> {
    return this.collection.doc(id).delete()
  }

}