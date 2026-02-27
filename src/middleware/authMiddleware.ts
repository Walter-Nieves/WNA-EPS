import { Response } from 'express'
import { Rol, middleware } from '../types'
import { resError, responseToError, validarToken } from '../utilidades/validaciones'

export function authVerify (necesitoLogin: boolean): middleware <Response | undefined> {
  return (req, res, next) => {
    try {
      // extraemos las cookies del request
      const { accessToken } = req.cookies
      // verificamos el token
      if (accessToken == null) {
        if (necesitoLogin) resError(401, 'No hay token de autenticación proporcionado')
        else {
          const rolPorDefecto: Rol = Rol.Paciente
          res.locals.usuario = {}
          res.locals.usuario.rol = rolPorDefecto // rol por defecto
          next()
          return
        }
      }
      res.locals.usuario = validarToken(accessToken)
      next()// pasamos al siguiente middleware o ruta
    } catch (error) {
      return responseToError(error as Error, res)
    }
  }
}
