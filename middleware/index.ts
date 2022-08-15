import jwt from 'jsonwebtoken'
import pool  from '../db'

import {Request,Response,NextFunction} from 'express'

interface payload{

    userId:string,
    sessionId : string,
    name:string,
    email_id:string
};
export const authenticateToken = (req : Request,res:Response,next:NextFunction)=>
{
    const authHeader = req.headers['autherization']
    
    if(authHeader== null) return res.status(401).send('login first')

    jwt.verify(authHeader, process.env.ACCESS_TOKEN, async (err,user) =>
    {
        if(err) return res.status(403).send('access had been denied');
        req.user=user as payload
        
        let isInvalidToken= await pool.query(`select end_time from sessions where s_id='${req.user.sessionID}'`);
        if(isInvalidToken.rows[0].endtime!=null)
        {return res.send("session has expired. please login again");}

        next();
        
    
    })
}