import { Router } from 'express'
import { cedulaEsValida } from '../utilidades/validaciones'

const login = Router()

login.post('/', async (req, res) => {
  if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ error: 'Falta el cuerpo de la peticion' })
  }
  const { cedula, clave } = req.body

  if (cedula == null || clave == null) {
    return res.status(400).json({ error: 'Tipo de datos invalidos' })
  }

  const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)
})
export default login
