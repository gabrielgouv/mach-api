import * as admin from 'firebase-admin'
import { CollectionReference, Firestore, Query } from 'firestore'
import { Router } from './router'

export class ModelRouter<Collection> extends Router {
    protected firestore: Firestore = admin.initializeApp().firestore() 
    protected collection: CollectionReference
    protected basePath: string

    constructor(collection: new () => Collection) {
        super()
        const collectionName = `${collection.name.toLowerCase()}s`
        this.collection = this.firestore.collection(collectionName)
        this.basePath = `/${collectionName}`
    }

    protected find = (req, res) => {
        let handler: CollectionReference | Query = this.collection
        Object.keys(req.query).forEach(key => {
            handler = handler.where(key, "==", req.query[key])
        })
        handler.get()
            .then(this.renderManyDocuments(res))
            .catch(this.renderError(res))
    }

    protected findById = (req, res) => {
        this.collection.doc(req.params.id).get()
            .then(this.renderDocument(res))
            .catch(this.renderError(res))
    }

}