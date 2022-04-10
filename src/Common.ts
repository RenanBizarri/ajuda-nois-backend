import {initializeApp} from "firebase/app"
import {getStorage, ref, uploadString, getDownloadURL} from "firebase/storage"
import * as Uuid from "uuid"
import * as Mailer from "nodemailer"

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

    async sendMail(to: string, mail_type: string, token: string = ""){
        let subject, message
        const url = process.env.URL_LOCAL + `changePassword/${token}`

        switch (mail_type) {
            case "recover_pass":
                subject = "Pedido de recupeação de senha"
                message = `Um pedido para a recuperação da senha foi feita pra essa 
                            conta, para prosseguir e criar uma senha nova entre no 
                            link: <a href="${url}"> .\n
                            Caso não tenha pedido a recuperação, ignore esse email.`
                break;
            case "new_user":
                subject = "Cadastro no Ajuda Nois"
                message = `Sua conta no Ajuda Nois foi criada, para completar o cadastro
                            entre no link para criar sua senha: <a href="${url}" > .\n`
                break;
            default:
                break;
        }

        const mail_options = {
            from: process.env.EMAIL,
            to,
            subject,
            html: message
        }

        const trasnporter = Mailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
            port: 587,
            secure: true
        })

        trasnporter.sendMail(mail_options, (error: any, info: any) => {
            if(error){
                return error
            }else{
                return "Email enviado com sucesso!"
            }
        })
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