import {initializeApp} from "firebase/app"
import {getStorage, ref, uploadString, getDownloadURL} from "firebase/storage"
import * as Uuid from "uuid"
import * as Mailer from "nodemailer"
import xlsx from "xlsx";
import Achievement from "./models/AchievementModel";

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

    compareString(string1: string, string2: string){
        const s1 = string1.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const s2 = string2.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        return s1 === s2
    }

    XlsxToJson(base64: string){
        let xlsx_data = xlsx.read(base64, {type: "base64"})
        let sheet = xlsx_data.Sheets[xlsx_data.SheetNames[0]]
        return xlsx.utils.sheet_to_json(sheet, {defval: ""})
    }

    async sendMail(to: string, mail_type: string, token: string = "", password: string = ""){
        let subject, message
        let url = process.env.URL_LOCAL 
        if(token != "") url += `changePassword/${token}`

        switch (mail_type) {
            case "recover_pass":
                subject = "Pedido de recupeação de senha"
                message = `Um pedido para a recuperação da senha foi feita pra essa 
                            conta, para prosseguir e criar uma senha nova entre no 
                            link: <a href="${url}">${url} </a>.\n
                            Caso não tenha pedido a recuperação, ignore esse email.`
                break;
            case "new_user":
                subject = "Cadastro no Ajuda Nois"
                message = `Sua conta no Ajuda Nois foi criada com sucesso.\n
                           Acesse a plataforma e realize seu login: <a href="${url}">${url} </a> .\n\n
                           Sua senha na plataforma é ${password}. Recomenda-se muda-la assim que possivel.\n`
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

        const user = process.env.EMAIL
        const pass = process.env.EMAIL_PASS

        const trasnporter = Mailer.createTransport({
            service: "gmail",
            auth: {
                user,
                pass
            },
            port: 587,
            secure: true
        })

        trasnporter.sendMail(mail_options, (error: any, info: any) => {
            if(error){
                return error
            }else{
                return info
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

    async findAchievementMissing(user: any, type: string){
        try{
            const achievements = await Achievement.find({type})
            let achievementsMissing: any[] = []

            if(user.achievements){
                for(let achievement of achievements){
                    let flag = 0;
                    for(let verifyAchievement of user.achievements){
                        if(verifyAchievement.achievement_id.toString() == achievement._id.toString()) flag = 1
                    }
                    if(!flag) achievementsMissing.push(achievement)
                }
            }else{
                achievementsMissing = achievements
            }
    
            return achievementsMissing
        }catch(error: any){
            return error
        }
    }
}

export default new Common()