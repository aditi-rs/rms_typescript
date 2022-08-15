import errorHandling from '../error/errorHandling'
import { Request,Response,NextFunction} from 'express'
interface CustomError {

    statusCode?:number,
    message?:string
}

export const errorHandler = (error:CustomError, req:Request, res:Response, next:NextFunction) =>{
    if(error instanceof errorHandling){
        return res.status(error.statusCode).json({message:error.message,error:error.error})
    }
    console.log(error)
    return res.status(500).send("something went wrong")
}