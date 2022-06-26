import Common from "../Common";
import Enem from "../models/EnemModel";
class EnemController {
    async create(req: any, res: any){
        try{
            let {
                year,
                exam_base64,
                template_base64,
                color,
                day
            } = req.body

            // Verifica se os campos estão preenchidos
            if(!year || !exam_base64 || !template_base64 || !color || !day){
                return res.status(400).json({
                    error: "Campos não preenchidos."
                });
            }

            let file = await Common.uploadFirebase(exam_base64, 'application/pdf', "enem_exam")
            const exam = file
            file = await Common.uploadFirebase(template_base64, 'application/pdf', "enem_template")
            const template = file

            const enem = await new Enem({
                year, 
                exam, 
                template,
                color,
                day
            }).save()

            return res.status(200).json(enem)

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async update(req: any, res: any){
        try{
            let {
                id,
                year,
                exam_base64,
                template_base64,
                color,
                day
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do ENEM para atualizar"
                });
            }
    
            // Verifica se os campos estão preenchidos
            if(!year && !exam_base64 && !template_base64 && !color && !day){
                return res.status(400).json({
                    error: "Nenhum campo para atualizar."
                });
            }

            let enem = await Enem.findById(id)

            if(!enem){
                return res.status(400).json({
                    error: "ENEM não encontrado."
                });
            }

            let file
            if(year) enem.year = year
            if(exam_base64){
                file = await Common.uploadFirebase(exam_base64, 'application/pdf', "enem_exam")
                enem.exam = file
            } 
            if(template_base64){
                file = await Common.uploadFirebase(template_base64, 'application/pdf', "enem_template")
                enem.template = file
            } 
            if(color) enem.color = color
            if(day) enem.day = day

            await enem.save()

            return res.status(200).json(enem)

        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async delete(req: any, res: any){
        try{
            let {
                id
            } = req.body
    
            if(!id){
                return res.status(400).json({
                    error: "Sem id do ENEM para excluir"
                });
            }
    
            await Enem.findByIdAndDelete(id)
    
            return res.status(200).json({
                message: "ENEM excluido"
            })
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findAll(req: any, res: any){
        try{
            const enem = await Enem.find({})

            return res.status(200).json(enem)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }

    async findByYearDayCollor(req: any, res: any){
        try{
            const enems = await Enem.find({})

            let result: any[] = []

            enems.forEach((enem: any): any => {
                let obj
                
                if(result){
                    let flag = 0
                    for(let year of result){
                        if(year.year === enem.year){
                            for(let color of year.colors){
                                if(color.color === enem.color){
                                    flag = 1
                                    if(enem.day === "first"){
                                        color.days.first = {
                                            exam: enem.exam,
                                            template: enem.template
                                        }
                                    }else{
                                        color.days.second = {
                                            exam: enem.exam,
                                            template: enem.template
                                        }
                                    }
                                }
                            }
                            if(!flag){
                                flag = 1
                                if(enem.day === "first"){
                                    year.colors.push({
                                        color: enem.color,
                                        days: {
                                            first: {
                                                exam: enem.exam,
                                                template: enem.template
                                            }
                                        }
                                    })
                                }else{
                                    year.colors.push({
                                        color: enem.color,
                                        days: {
                                            second: {
                                                exam: enem.exam,
                                                template: enem.template
                                            }
                                        }
                                    })
                                }
                            }
                        }
                    }
                    if(!flag){
                        if(enem.day == "first"){
                            obj = {
                                year: enem.year,
                                colors: [{
                                    color: enem.color,
                                    days: {
                                        first: {
                                            exam: enem.exam,
                                            template: enem.template
                                        }
                                    }
                                }]
                            }
                        }else{
                            obj = {
                                year: enem.year,
                                colors: [{
                                    color: enem.color,
                                    days: {
                                        second: {
                                            exam: enem.exam,
                                            template: enem.template
                                        }
                                    }
                                }]
                            }
                        }
                        result.push(obj)
                    }
                }else{
                    if(enem.day == "first"){
                        obj = {
                            year: enem.year,
                            colors: [{
                                color: enem.color,
                                days: {
                                    first: {
                                        exam: enem.exam,
                                        template: enem.template
                                    }
                                }
                            }]
                        }
                    }else{
                        obj = {
                            year: enem.year,
                            colors: [{
                                color: enem.color,
                                days: {
                                    second: {
                                        exam: enem.exam,
                                        template: enem.template
                                    }
                                }
                            }]
                        }
                    }

                    result = [obj]
                }
            })

            return res.status(200).json(result)
        }catch(error: any){
            console.log("Error: " + error);
            return res.status(401).json({
                error: error.message
            });
        }
    }
}

export default new EnemController()