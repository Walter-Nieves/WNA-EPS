import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { StringValue } from 'ms'
import { ColUsuarios } from '..'
import { Usuario } from '../types'
import { resError, validarCedula, validarClave, validarCuerpo } from '../utilidades/validaciones'

dotenv.config()

const SECRETO: string = process.env.JWT_SECRET as string
const JWT_ACCESS_EXPIRA_EN = process.env.JWT_ACCESS_EXPIRA_EN as StringValue
const JWT_REFRESH_EXPIRA_EN = process.env.JWT_REFRESH_EXPIRA_EN as StringValue
const COOKIE_ACCESS_EXPIRA_EN: number = Number(process.env.COOKIE_ACCESS_EXPIRA_EN)
const COOKIE_REFRESH_EXPIRA_EN: number = Number(process.env.COOKIE_REFRESH_EXPIRA_EN)

export async function login (req: Request, res: Response): Promise <Response> {
  try {
    const body = req.body
    validarCuerpo(body, false)

    const cedula = await validarCedula(body.cedula, true)
    const clave = validarClave(body.clave)

    const posibleUsuario: Usuario | null = await ColUsuarios.findOne({
      cedula
    })
    if (posibleUsuario == null) {
      return resError(404, 'Usuario no encontrado')
    }

    const esValida = await bcrypt.compare(clave, posibleUsuario.clave)
    if (!esValida) {
      resError(401, 'La clave ingresada no coincide con la registrada')
    }

    const accessPayload: jwt.JwtPayload = {
      sub: posibleUsuario._id?.toString(),
      cedula: posibleUsuario.cedula,
      nombre: posibleUsuario.nombre,
      apellido: posibleUsuario.apellido,
      rol: posibleUsuario.rol
    }

    const refreshPayload: jwt.JwtPayload = {
      sub: posibleUsuario._id?.toString()
    }

    const accessToken = jwt.sign(accessPayload, SECRETO, { expiresIn: JWT_ACCESS_EXPIRA_EN })
    const refreshToken = jwt.sign(refreshPayload, SECRETO, { expiresIn: JWT_REFRESH_EXPIRA_EN })

    // NUEVO: Configurar cookie HttpOnly
    res.cookie('accessToken', accessToken, {
      httpOnly: true, // 🔒 No accesible por JS
      secure: false,
      sameSite: 'lax', // Permite navegación entre dominio frontend-backend
      maxAge: COOKIE_ACCESS_EXPIRA_EN
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // 🔒 No accesible por JS
      secure: false,
      sameSite: 'lax', // Permite navegación entre dominio frontend-backend
      maxAge: COOKIE_REFRESH_EXPIRA_EN
    })

    return res.json({ message: 'Acceso concedido' })
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

export async function refresh (req: Request, res: Response): Promise <Response> {
  try {
    const { refreshToken } = req.cookies
    if (refreshToken == null) resError(401, 'No hay token de refresco')

    let posibleUsuario: Usuario | null = null
    let userId: string
    // verificamos el token si esta bien hecho
    try {
      const decodificado = jwt.verify(refreshToken, SECRETO) as jwt.JwtPayload
      userId = decodificado.sub as string
    } catch (error) {
      // este try-catch solo maneja errores del jwt.verify
      resError(401, 'Token de refresco inválido o expirado')
    }
    // usuario con el id existe o no
    posibleUsuario = await ColUsuarios.findOne({ _id: new ObjectId(userId) })
    if (posibleUsuario == null) {
      return resError(404, 'Usuario no encontrado')
    }
    const newAccessPayload: jwt.JwtPayload = {
      sub: posibleUsuario._id?.toString(),
      cedula: posibleUsuario.cedula,
      nombre: posibleUsuario.nombre,
      apellido: posibleUsuario.apellido,
      rol: posibleUsuario.rol
    }
    const newAccessToken = jwt.sign(newAccessPayload, SECRETO, { expiresIn: JWT_ACCESS_EXPIRA_EN })
    // NUEVO: Configurar cookie HttpOnly
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true, // 🔒 No accesible por JS
      secure: false,
      sameSite: 'lax', // Permite navegación entre dominio frontend-backend
      maxAge: COOKIE_ACCESS_EXPIRA_EN
    })
    return res.json({ message: 'Token de acceso renovado' })
  } catch (error) {
    const e = error as Error
    console.log(e)
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}
