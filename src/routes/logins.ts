import { Router } from 'express'
import { ColUsuarios } from '..'
import { Usuario } from '../types'
import { validarCedula, validarClave, validarCuerpo } from '../utilidades/validaciones'
import bcrypt from 'bcrypt'

const login = Router()

login.post('/', async (req, res) => {
  try {
    const body = req.body
    validarCuerpo(body, false)
    const cedula = await validarCedula(body.cedula, true)
    const clave = validarClave(body.clave)
    const posibleUsuario: Usuario | null = await ColUsuarios.findOne({ cedula })
    if (posibleUsuario == null) {
      return res.status(404).json({ error: 'La cédula no está registrada' })
    }
    const esValida = await bcrypt.compare(clave, posibleUsuario.clave)
    if (!esValida) {
      return res.status(401).json({ error: 'La clave ingresada no coincide con la registrada' })
    }

    const usuarioRetornar: Omit <Usuario, 'clave' | '_id'> = posibleUsuario

    // if (posibleUsuario.clave !== clave) {
    //   return res.status(401).json({ error: 'La clave ingresada no coincide con la registrada' })
    // }
    res.json({
      mensaje: 'Bienvenido',
      info: { ...usuarioRetornar, _id: posibleUsuario._id.toString() }
    })
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }

  // if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
  //   res.status(400).json({ error: 'Falta el cuerpo de la peticion' })
  // }

  // const { cedula, clave } = req.body

  // if (cedula == null || clave == null) {
  //   return res.status(400).json({ error: 'Tipo de datos invalidos' })
  // }

  // const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)
})
export default login
