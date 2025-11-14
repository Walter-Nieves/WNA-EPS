import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { ColUsuarios, ColVacunas } from '../index'
import { Vacuna, Vacunas } from '../types'
import { cedulaEsValida } from '../utilidades/validaciones'

const vaccineRoutes = Router()

// buscar personas
vaccineRoutes.get('/', async (_, res) => {
  try {
    const resultado = await ColVacunas.find().toArray() as Vacuna[]
    res.json(resultado)
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// buscar persona
vaccineRoutes.get('/:id', async (req, res) => {
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

      // if (id.length < 5 || id.length > 10) {
      //   return res.status(400).json({ error: 'La cédula debe tener entre 5 y 10 dígitos' })
      // }
      const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)

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

vaccineRoutes.post('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const cedula = parseInt(id, 10)
    if (Number.isNaN(cedula)) {
      return res.status(400).json({ error: 'La cédula debe ser un número' })
    }

    if (cedula <= 0) {
      return res.status(400).json({ error: 'La cédula debe ser mayor que cero' })
    }

    // if (id.length < 5 || id.length > 10) {
    //   return res.status(400).json({ error: 'La cédula debe tener entre 5 y 10 dígitos' })
    // }
    const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)

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
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Agregar varias vacunas en una sola petición
vaccineRoutes.post('/:id/multiples', async (req, res) => {
  const { id } = req.params

  const cedula = parseInt(id, 10)
  if (Number.isNaN(cedula)) {
    return res.status(400).json({ error: 'La cédula debe ser un número' })
  }

  if (cedula <= 0) {
    return res.status(400).json({ error: 'La cédula debe ser mayor que cero' })
  }

  // if (id.length < 5 || id.length > 10) {
  //   return res.status(400).json({ error: 'La cédula debe tener entre 5 y 10 dígitos' })
  // }
  const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)

  const usuario = await ColUsuarios.findOne({ cedula })
  if (usuario == null) {
    return res.status(400).json({ error: 'Usuario no encontrado' })
  }

  // Validamos que el body sea un arreglo
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return res.status(400).json({ error: 'El cuerpo debe ser un array con al menos una vacuna' })
  }

  // “Crea una constante llamada vacunasInsertar, que es un arreglo vacío, pero que solo podrá contener objetos del tipo Vacuna,los dos puntos son para el tipado”.
  // esto es typescript no javascript puro
  const vacunasInsertar: Vacuna[] = []

  for (const item of req.body) {
    const { fecha, nombre, vacunador, lugar } = item

    if (fecha == null || nombre == null || vacunador == null || lugar == null) {
      return res.status(400).json({ error: 'Cada vacuna debe tener fecha, nombre, vacunador y lugar' })
    }

    if (typeof fecha !== 'string' || isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'La fecha debe estar en formato ISO 8601' })
    }

    if (typeof nombre !== 'string' || !Object.values(Vacunas).includes(nombre as Vacunas)) {
      return res.status(400).json({ error: 'El nombre de la vacuna no es válido' })
    }

    if (typeof vacunador !== 'string' || vacunador.trim() === '' || typeof lugar !== 'string' || lugar.trim() === '') {
      return res.status(400).json({ error: 'El vacunador y el lugar deben ser strings no vacíos' })
    }

    // Sanitizar
    const vac = {
      _id: new ObjectId(),
      fecha: new Date(fecha),
      nombre: nombre as Vacunas,
      // ahí no estás declarando la variable cedula, sino usando una variable que ya existe, se definio arriba en const cedula = parseInt(id, 10)
      cedula,
      vacunador: vacunador.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\s{2,}/g, ' '),
      lugar: lugar.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\s{2,}/g, ' ')
    }

    vacunasInsertar.push(vac)
  }

  // Insertar todas las vacunas en la colección
  await ColVacunas.insertMany(vacunasInsertar)

  // Actualizar el usuario, empujando todas las vacunas
  //   ColUsuarios.updateOne(...)
  //  Busca en la colección usuarios un documento que cumpla con el filtro { cedula }.
  // En este caso, cedula es un número único de identificación.

  // { $push: { vacunas: ... } }
  //  $push es un operador de MongoDB que agrega un elemento a un array existente dentro del documento.
  // Aquí está agregando cosas al campo vacunas del usuario.

  // { $each: vacunasInsertar }
  //  $each se usa junto con $push cuando quieres insertar varios elementos de una sola vez en el array.
  // En lugar de hacer $push uno por uno, con $each puedes empujar todos los elementos de vacunasInsertar en un solo update.

  await ColUsuarios.updateOne(
    { cedula },
    { $push: { vacunas: { $each: vacunasInsertar } } }
  )
  // Devuelve la respuesta en formato JSON al cliente (el frontend o quien consuma la API).
  //   map recorre el array vacunasInsertar y transforma cada vacuna.

  // { ...v, _id: v._id.toString() }
  //  Toma cada objeto vacuna v, lo copia con el spread operator (...v),
  // pero convierte su campo _id (que es un ObjectId de MongoDB) en un string.
  // Esto es importante porque si lo mandas tal cual, el frontend tendría problemas para manejar el ObjectId.

  res.status(201).json(
    vacunasInsertar.map(v => ({ ...v, _id: v._id.toString() }))
  )
})

export default vaccineRoutes
