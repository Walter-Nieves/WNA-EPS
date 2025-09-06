import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { ColUsuarios, ColVacunas } from '../index'
import { Vacuna, Vacunas } from '../types'

const vacunas = Router()

// buscar personas
vacunas.get('/', async (_, res) => {
  try {
    const resultado = await ColVacunas.find().toArray() as Vacuna[]
    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// buscar persona
vacunas.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    if (ObjectId.isValid(id)) { //  camino id de la vacuna
      const resultado = await ColVacunas.findOne({ _id: new ObjectId(id) }) as Vacuna | null
      if (resultado != null) {
        res.json(resultado)
      } else {
        res.status(404).json({ error: 'Vacuna no encontrada' })
      }
    } else { // camino de la cedula de la persona, me da arreglo de vacunas
      const cedula = parseInt(id, 10)
      if (Number.isNaN(cedula)) {
        return res.status(400).json({ error: 'La cédula debe ser un número' })
      }

      if (cedula <= 0) {
        return res.status(400).json({ error: 'La cédula debe ser mayor que cero' })
      }

      if (id.length < 5 || id.length > 10) {
        return res.status(400).json({ error: 'La cédula debe tener entre 5 y 10 dígitos' })
      }

      const vacunasPersona = await ColVacunas.find({ cedula }).toArray() as Vacuna[]

      if (vacunasPersona.length > 0) {
        res.json(vacunasPersona)
      } else {
        res.status(200).json({ mensaje: 'No se encontraron vacunas para esta cédula' })
      }
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
)

// export interface Vacuna {
//   _id: ObjectId
//   cedula: number
//   fecha: Date
//   vacuna: Vacunas
//   vacunador: string
//   lugar: string
// }

vacunas.post('/:id', async (req, res) => {
  const { id } = req.params

  const cedula = parseInt(id, 10)
  if (Number.isNaN(cedula)) {
    return res.status(400).json({ error: 'La cédula debe ser un número' })
  }

  if (cedula <= 0) {
    return res.status(400).json({ error: 'La cédula debe ser mayor que cero' })
  }

  if (id.length < 5 || id.length > 10) {
    return res.status(400).json({ error: 'La cédula debe tener entre 5 y 10 dígitos' })
  }

  const resultado = await ColUsuarios.findOne({ cedula })
  if (resultado == null) {
    return res.status(400).json({ error: 'Usuario no encontrado' })
  }

  const { fecha, nombre } = req.body
  let { vacunador, lugar } = req.body
  // el body debe ser un objeto json no un arreglo
  if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un objeto JSON' })
  }

  if (fecha == null || nombre == null || vacunador == null || lugar == null) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  if (typeof fecha !== 'string' || isNaN(Date.parse(fecha))) {
    return res.status(400).json({ error: 'La fecha debe ser una cadena de texto en formato ISO 8601 (new Date().toISOString())' })
  }
  // nombre debe ser string y ser del tipo vacunas
  // convertir el tipo vacunas en arreglo para verificar con includes
  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre de la vacuna debe ser un string' })
  }

  const nombreTipo: Vacunas = nombre as Vacunas

  // con esta linea convertimos cualquier objeto a un arreglo Object.values
  if (!Object.values(Vacunas).includes(nombreTipo)) {
    return res.status(400).json({ error: 'El nombre de la vacuna debe ser uno de los siguientes: Pfizer-BionNTech, Moderna, AztraZeneca, Janssen, Sinopharm' })
  }

  if (typeof vacunador !== 'string' || lugar.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre del vacunador debe ser un string' })
  }

  // sanitizar codigo
  vacunador = vacunador.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
  lugar = lugar.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // quitar dobles espacios
  vacunador = vacunador.replace(/\s{2,}/g, ' ')
  lugar = lugar.replace(/\s{2,}/g, ' ')

  const _id = new ObjectId()

  const nuevaVacuna: Vacuna = {
    _id,
    fecha: new Date(fecha),
    nombre: nombreTipo,
    cedula,
    vacunador,
    lugar
  }

  await ColVacunas.insertOne(nuevaVacuna)

  // actualizar tambien el usuario,empujando la nueva vacuna en su array "vacunas"

  await ColUsuarios.updateOne(
    { cedula },
    { $push: { vacunas: nuevaVacuna } })

  res.status(201).json({ ...nuevaVacuna, _id: _id.toString() })
})

export default vacunas
