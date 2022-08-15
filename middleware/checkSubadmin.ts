import pool from '../db';
import {Request,Response,NextFunction} from 'express'

export const checksubAdmin = (req : Request,res:Response,next:NextFunction)=>
{
    if(req.user.role=="subadmin")
        { 
            next();
        }
    else
    {
        res.send("You are not subadmin")
    }
}