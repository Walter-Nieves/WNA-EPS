import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { ColUsuarios } from '../index'
import { Usuario } from '../types'

const personas = Router()

// buscar personas
personas.get('/', async (_, res) => {
  // filtro omitir arreglo vacunas

  const resultado = await ColUsuarios.find({}, { projection: { vacunas: false, clave: false } }).toArray() as Usuario[]
  res.json(resultado)
})

// buscar persona
personas.get('/:id', async (req, res) => {
  const { id: _id } = req.params

  if (!ObjectId.isValid(_id)) {
    return res.json({ error: ' El id ingresado no es valido' })
  }

  const resultado = await ColUsuarios.findOne({ _id: new ObjectId(_id) }) as Usuario

  if (resultado == null) {
    return res.status(404).json({ error: 'Paciente no encontrado' })
  }

  res.json(resultado)
})

personas.post('/', async (req, res) => {
  try {
    if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Cuerpo de la solicitud inválido' })
    }

    const { telefono, cedula } = req.body
    let { nombre, apellido, foto, clave } = req.body

    // verificar si las anteriores propiedades existen (son diferentes a null)
    if (nombre == null || apellido == null || telefono == null || cedula == null || foto == null || clave == null) {
      return res.status(400).json({ error: 'Faltan propiedades requeridas' })
    }

    // verificar si las propiedades son del tipo correcto
    if (typeof nombre !== 'string' || typeof apellido !== 'string' || typeof foto !== 'string' || typeof clave !== 'string') {
      return res.status(400).json({ error: 'Propiedades de tipo incorrecto' })
    }

    // quitar los espacioss al principio y al final de cada string (es decir, que estos son let no const)
    nombre = nombre.trim()
    apellido = apellido.trim()
    foto = foto.trim()
    clave = clave.trim()

    // verificar si los strings tienen una longitud mayor a 0
    if (nombre.length === 0 || apellido.length === 0 || foto.length === 0 || clave.length === 0) {
      return res.status(400).json({ error: 'Las propiedades no pueden estar vacías' })
    }

    // nombre y apellido minimo 2 caracteres
    if (nombre.length < 2 || apellido.length < 2) {
      return res.status(400).json({ error: 'El nombre y el apellido deben tener al menos 2 caracteres' })
    }

    // sanitizar los string
    nombre = nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    apellido = apellido.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    foto = foto.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    clave = clave.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // para nombre, apellido solo se permiten letras y espacios
    if (!/^[a-zA-Z\s]+$/.test(nombre) || !/^[a-zA-Z\s]+$/.test(apellido)) {
      return res.status(400).json({ error: 'El nombre y el apellido solo pueden contener letras y espacios' })
    }

    // verificar si la foto es una URL válida
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|avif|webp|bmp)$/.test(foto)) {
      return res.status(400).json({ error: 'La foto debe ser una URL válida de una imagen' })
    }

    // verificar si la clave tiene al menos 6 caracteres
    if (clave.length < 6) {
      return res.status(400).json({ error: 'La clave debe tener al menos 6 caracteres' })
    }

    // que los strings no puedan tener 2 espacios seguidos, excepto la clave
    // borra el espacio adicional, no lanza error
    nombre = nombre.replace(/\s{2,}/g, ' ')
    apellido = apellido.replace(/\s{2,}/g, ' ')
    foto = foto.replace(/\s{2,}/g, ' ')

    // if (/\s{2,}/.test(nombre) || /\s{2,}/.test(apellido) || /\s{2,}/.test(foto)) {
    //   return res.status(400).json({ error: 'Los nombres y apellidos no pueden tener 2 espacios seguidos' })
    // }

    // telefono debe ser mayor a 0, y tener una longitud exacta a 10
    if (telefono <= 0 || telefono.toString().length !== 10) {
      return res.status(400).json({ error: 'El teléfono debe ser un número positivo de 10 dígitos' })
    }

    // cedula debe ser mayor a 0, y tener una longitud entre 5 y 10
    if (cedula <= 0 || cedula.toString().length < 5 || cedula.toString().length > 10) {
      return res.status(400).json({ error: 'La cédula debe ser un número positivo de entre 5 y 10 dígitos' })
    }

    // consultar a la base de datos usando el objeto colUsuarios.findOne() si la cedula esta repetida, si lo esta, dar error
    const cedulaExistente = await ColUsuarios.findOne({ cedula })
    if (cedulaExistente != null) {
      return res.status(400).json({ error: 'La cédula ya está registrada' })
    }

    // crear un nuevo ObjectId
    const _id = new ObjectId()

    // crear un nuevo "Usuario" con las respectivas propiedades, y la propiedad vacuna es un arreglo vacio
    const nuevoUsuario: Usuario = {
      _id,
      nombre,
      apellido,
      foto,
      cedula,
      telefono,
      clave,
      vacunas: []
    }

    // hacer insertOne de este objeto
    const resultado = await ColUsuarios.insertOne(nuevoUsuario)

    // retornar al usuario el Objeto resultante que es del tipo "Usuario", pero el _id no no lo retornamos como ObjectId, sino como string (el frontend no necesita saber que estoy usando mongodb)
    res.json({ ...nuevoUsuario, _id: resultado.insertedId.toString() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// res.json('Agregado')
// hay cuerpo
// el cuerpo es valido
// el cuerpo es un objeto
// el cuerpo tiene
// -nombre
// -apellido
// - telefono
// - cedula
// - foto
// - clave
// los tipoas anteriores son correctos
// nombre debe tener minimo dos caracteres
// no se valesn numeros negativos ni ceros
// telefono debe tener exactamente 10 digitos
// cedula debe tener minimo 5 maximo 10
// al crear nuevo usuario, las vacunas deben ser del tipo Vacuna[]
// el _id debe ser un ObjetoId
// })

// actualizar persona (PUT)
personas.put('/:id', async (req, res) => {
  try {
    const { id: _id } = req.params
    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({ error: 'El id ingresado no es válido' })
    }

    const actualizaciones = req.body

    if (actualizaciones == null || typeof actualizaciones !== 'object' || Array.isArray(actualizaciones)) {
      return res.status(400).json({ error: 'Cuerpo de la solicitud inválido' })
    }

    // quitar _id si lo envían
    delete actualizaciones._id

    // buscar usuario original
    const usuarioOriginal = await ColUsuarios.findOne({ _id: new ObjectId(_id) })
    if (usuarioOriginal == null) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // VALIDACIONES
    let { nombre, apellido, foto, cedula, telefono, clave } = actualizaciones

    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim().length < 2) {
        return res.status(400).json({ error: 'El nombre debe ser un string con al menos 2 caracteres' })
      }
      if (!/^[a-zA-Z\s]+$/.test(nombre.trim())) {
        return res.status(400).json({ error: 'El nombre solo puede contener letras y espacios' })
      }
      nombre = nombre.trim().replace(/\s{2,}/g, ' ')
    }

    if (apellido !== undefined) {
      if (typeof apellido !== 'string' || apellido.trim().length < 2) {
        return res.status(400).json({ error: 'El apellido debe ser un string con al menos 2 caracteres' })
      }
      if (!/^[a-zA-Z\s]+$/.test(apellido.trim())) {
        return res.status(400).json({ error: 'El apellido solo puede contener letras y espacios' })
      }
      apellido = apellido.trim().replace(/\s{2,}/g, ' ')
    }

    if (foto !== undefined) {
      if (typeof foto !== 'string' || !/^https?:\/\/.+\.(jpg|jpeg|png|gif|avif|webp|bmp)$/.test(foto)) {
        return res.status(400).json({ error: 'La foto debe ser una URL válida de una imagen' })
      }
      foto = foto.trim()
    }

    if (cedula !== undefined) {
      if (typeof cedula !== 'number' || cedula <= 0 || cedula.toString().length < 5 || cedula.toString().length > 10) {
        return res.status(400).json({ error: 'La cédula debe ser un número positivo de entre 5 y 10 dígitos' })
      }
      // validar cedula duplicada
      const existeCedula = await ColUsuarios.findOne({ cedula, _id: { $ne: new ObjectId(_id) } })
      if (existeCedula != null) {
        return res.status(400).json({ error: 'La cédula ya está registrada en otro usuario' })
      }
    }

    if (telefono !== undefined) {
      if (typeof telefono !== 'number' || telefono <= 0 || telefono.toString().length !== 10) {
        return res.status(400).json({ error: 'El teléfono debe ser un número positivo de 10 dígitos' })
      }
    }

    if (clave !== undefined) {
      if (typeof clave !== 'string' || clave.trim().length < 6) {
        return res.status(400).json({ error: 'La clave debe tener al menos 6 caracteres' })
      }
    }

    // actualizar usuario
    await ColUsuarios.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...(nombre !== undefined && { nombre }),
          ...(apellido !== undefined && { apellido }),
          ...(foto !== undefined && { foto }),
          ...(cedula !== undefined && { cedula }),
          ...(telefono !== undefined && { telefono }),
          ...(clave !== undefined && { clave })
        }
      }
    )

    // obtener usuario actualizado
    const usuarioActualizado = await ColUsuarios.findOne({ _id: new ObjectId(_id) })

    // si cambiaron clave, incluimos anterior y nueva enmascaradas
    if (clave !== undefined) {
      return res.json({
        ...usuarioActualizado,
        _id: usuarioActualizado?._id.toString()
      })
    }

    res.json({ ...usuarioActualizado, _id: usuarioActualizado?._id.toString() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// eliminar persona (DELETE)
personas.delete('/:id', async (req, res) => {
  try {
    const { id: _id } = req.params

    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({ error: 'El id ingresado no es válido' })
    }

    // buscar primero el usuario
    const usuario = await ColUsuarios.findOne({ _id: new ObjectId(_id) })

    if (usuario == null) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const resultado = await ColUsuarios.deleteOne({ _id: new ObjectId(_id) })

    if (resultado.deletedCount === 0) {
      return res.status(500).json({ error: 'No se pudo eliminar el usuario' })
    }

    // devolvemos el objeto eliminado en vez de un mensaje
    res.json({ ...usuario, _id: usuario._id.toString() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default personas
