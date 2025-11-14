import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Rol } from '../types'
import { resError } from '../utilidades/validaciones'

dotenv.config()

const SECRETO: string = process.env.JWT_SECRET as string

export function authVerify (req: Request, res: Response, next: NextFunction): Response | undefined {
  try {
    // extraemos las cookies del request
    const { accessToken } = req.cookies
    // verificamos el token
    if (accessToken == null) resError(401, 'No hay token de autenticación')

    // verificamos el token que este bien hecho
    try {
      const decodificado = jwt.verify(accessToken, SECRETO)
      res.locals.usuario = decodificado // Usar res.locals evita contaminar req.body y es más idiomático en Express.
      next()// pasamos al siguiente middleware o ruta
    } catch (error) {
      // este try-catch solo maneja errores del jwt.verify
      resError(401, 'Token de autenticación inválido o expirado')
    }
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

export function authRole (req: Request, res: Response, next: NextFunction): Response | undefined {
  try {
    // extraemos las cookies del acessToken
    const { accessToken } = req.cookies
    // verificamos que si existe el token
    if (accessToken == null) {
      const rolPorDefecto = Rol.Paciente
      res.locals.usuario.rol = rolPorDefecto
    }
    // verificamos el token que este bien hecho
    try {
      const decodificado = jwt.verify(accessToken, SECRETO) as jwt.JwtPayload
      res.locals.usuario = decodificado // Usar res.locals evita contaminar req.body y es más idiomático en Express.
      next()// pasamos al siguiente middleware o ruta
    } catch (error) {
      // este try-catch solo maneja errores del jwt.verify
      resError(401, 'Token de autenticación inválido o expirado')
    }
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}
