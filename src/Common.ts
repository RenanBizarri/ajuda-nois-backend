import {initializeApp} from "firebase/app"
import {getStorage, ref, uploadString, getDownloadURL} from "firebase/storage"
import * as Uuid from "uuid"

async function uploadFirebase(base64: string, format: string, font: string){
    try{
        const firebaseConfig = {
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.FB_AUTH_DOMAIN,
            projectId: process.env.FB_PROJECT_ID,
            storageBucket: process.env.FB_STORAGE_BUCKET
        }

        const firebase = initializeApp(firebaseConfig)

        const storage = getStorage(firebase, "gs://ajuda-nois.appspot.com/")

        const filename = font + "/" + font + "_" + Uuid.v4()

        const storageRef = ref(storage, filename)

        await uploadString(storageRef, base64, 'base64', { contentType: format})

        return getDownloadURL(storageRef)

    }catch(error: any){
        console.log("Error: " + error);
        return error
    }
}

class Common {
    uploadFirebase(icon_base64: any, arg1: string, arg2: string) {
        return uploadFirebase(icon_base64, arg1, arg2)
    }

    async uploadImage(req: any, res: any){
        try{
            let {
                base64,
                font
            } = req.body

            const file = await uploadFirebase(base64, "image/jpeg" , font)

            console.log(file)
            return res.status(200).json({
                imageUrl: file
            })

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new Common()