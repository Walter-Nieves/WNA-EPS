
import { NextFunction, Request, Response } from 'express'

export function sapo (req: Request, res: Response, next: NextFunction): void {
  console.log(`Alguien hizo una peticion en${req.url}`)
  console.log(`La peticion fue del tipo ${req.method}`)
  console.log('Cuidado')
  next()
}
