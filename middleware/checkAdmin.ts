import pool from '../db';
import {Request,Response,NextFunction} from 'express'

export const checkAdmin = (req : Request,res:Response,next:NextFunction)=>
{
    if(req.user.role=="admin")
        { 
            next();
        }
    else
    {
        res.send("You are not admin")
    }
}