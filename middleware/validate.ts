import { Request, Response, NextFunction } from 'express'
import joi from 'joi'
interface CustomError {

    status?:number,
    message?:string
}

export const validateRegister = (req : Request,res:Response,next:NextFunction)=>{
    const validation = joi.object({
        name: joi.string().alphanum().min(3).max(25).trim(true).required(),
        email_id: joi.string().email().trim(true).required(),
        password: joi.string().min(2).trim(true).required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}


export const validatelogin = (req : Request,res:Response,next:NextFunction)=>{
    const validation = joi.object({
        email_id: joi.string().email().trim(true).required(),
        password: joi.string().min(2).trim(true).required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}
 
export const validateAddress = (req : Request,res:Response,next:NextFunction)=>{
    const validation = joi.object({
        addr: joi.string().alphanum().min(3).max(50).trim(true).required(),
        geopoint: joi.string().required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}

export const validateResturant = (req : Request,res:Response,next:NextFunction)=>{
    const validation = joi.object({
        res_name: joi.string().min(3).max(25).trim(true).required(),
        res_addr: joi.string().min(3).max(25).trim(true).required(),
        geopoint: joi.string().required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}
export const validateDish = (req : Request,res:Response,next:NextFunction)=>{
    const validation = joi.object({
        dish_name: joi.string().alphanum().min(3).max(25).trim(true).required()
    })
    const {error} = validation.validate(req.body)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    next()
}




