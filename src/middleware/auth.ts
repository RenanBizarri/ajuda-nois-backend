import { verify } from 'jsonwebtoken';

export default (req: any,res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).json({error: 'Não há token de acesso'});

    const parts = authHeader.split(' ');

    if(!parts)
        return res.status(401).json({error:'Token Invalido'});

    const [scheme, token] = parts;

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).json({error: 'Token malformatted'});
    

    verify(token, process.env.PUBLIC_KEY!.replace(/\\n/gm, '\n') as string , (err: any, decoded: any) => {
        if(err) return res.status(401).json({error: 'Token invalido'});
        
        if(decoded) req.body.user_id = decoded.user_id;

        return next();
    })
};