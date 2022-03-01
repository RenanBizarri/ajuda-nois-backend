import FirebaseAdmin from "firebase-admin"
import FirebaseApp from "firebase/app"
import Uuid from "uuid"

const serviceAccount = require("../ajuda-nois-firebase-adminsdk-s3hx0-4fcac83a23.json")

class Util {
    async uploadImage(req: any, res: any){
        try{
            const firebase = FirebaseAdmin.initializeApp({
                credential: FirebaseAdmin.credential.cert(serviceAccount)
            })

            const bucket = firebase.storage().bucket("gs://ajuda-nois.appspot.com")

            const filename = Uuid.v4()

            const file = bucket.file(filename)
            await file.save(Buffer.from(req.body.base64, 'base64'), {
                public: true,
                metadata: {
                    contentType: 'image/jpeg',
                    firebaseStorageDownloadTokens: filename
                }  
            })

            return res.status(200).json({
                imageUrl: file.metadata.medialink
            })
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new Util()