import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { StringValue } from 'ms'
import { ColUsuarios } from '..'
import { Usuario } from '../types'
import { resError, responseToError, validarCedula, validarClave, validarCuerpo, validarToken } from '../utilidades/validaciones'

dotenv.config()

const SECRETO: string = process.env.JWT_SECRET as string
const JWT_ACCESS_EXPIRA_EN = process.env.JWT_ACCESS_EXPIRA_EN as StringValue
const JWT_REFRESH_EXPIRA_EN = process.env.JWT_REFRESH_EXPIRA_EN as StringValue
const COOKIE_ACCESS_EXPIRA_EN: number = Number(process.env.COOKIE_ACCESS_EXPIRA_EN)
const COOKIE_REFRESH_EXPIRA_EN: number = Number(process.env.COOKIE_REFRESH_EXPIRA_EN)

const isInLocalHost = (process.env.FRONT_DOMAIN as string).includes('localhost')

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
      httpOnly: true,
      secure: !isInLocalHost,
      sameSite: isInLocalHost ? 'lax' : 'none',
      maxAge: COOKIE_ACCESS_EXPIRA_EN
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: !isInLocalHost,
      sameSite: isInLocalHost ? 'lax' : 'none',
      maxAge: COOKIE_REFRESH_EXPIRA_EN
    })

    return res.json({ message: 'Acceso concedido' })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

export async function refresh (req: Request, res: Response): Promise <Response> {
  try {
    const { refreshToken } = req.cookies
    if (refreshToken == null) resError(401, 'No hay token de refresco')

    let posibleUsuario: Usuario | null = null
    const userId: string = validarToken(refreshToken).sub as string

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
      httpOnly: true,
      secure: !isInLocalHost,
      sameSite: isInLocalHost ? 'lax' : 'none',
      maxAge: COOKIE_ACCESS_EXPIRA_EN
    })
    return res.json({ message: 'Token de acceso renovado' })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

export async function logout (req: Request, res: Response): Promise<Response> {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: !isInLocalHost,
      sameSite: isInLocalHost ? 'lax' : 'none',
      maxAge: 1
    })
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: !isInLocalHost,
      sameSite: isInLocalHost ? 'lax' : 'none',
      maxAge: 1
    })
    return res.json({ message: 'Sesion cerrada correctamente' })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}
