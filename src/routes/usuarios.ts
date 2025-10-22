import { Router } from 'express'
import { ObjectId } from 'mongodb'
// esto se descarga para manejar archivos en las peticiones,para subir imagenes que pesan demasiado
import bcrypt from 'bcrypt'
import multer from 'multer'
import { ColUsuarios } from '../index'
import { Usuario } from '../types'
import { cedulaEsValida, resError, validarCedula, validarClave, validarClavesActualizacion, validarCuerpo, validarCuerpoActualizacion, validarFoto, validarNombreApellido, validarObjectId, validarTelefono } from '../utilidades/validaciones'

const subir = multer({ limits: { fileSize: 15 * 1024 * 1024 } }) // 15 MB

const personas = Router()

// buscar personas
personas.get('/', async (_, res) => {
  // filtro omitir arreglo vacunas

  const resultado = await ColUsuarios.find({}, { projection: { vacunas: false, clave: false } }).toArray() as Usuario[]
  res.json(resultado)
})

// Buscar persona por _id o por cédula
personas.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Declaramos la variable que va a guardar el resultado
    // Puede ser un Usuario si se encuentra en la base de datos,
    // o null si no existe ningún documento con esos criterios.
    let resultado: Usuario | null = null

    // Caso 1: si el id recibido es un ObjectId válido
    if (ObjectId.isValid(id)) {
      // findOne devuelve Usuario | null → hay que tiparlo así
      resultado = await ColUsuarios.findOne({ _id: new ObjectId(id) }) as Usuario | null
    } else {
      // Caso 2: intentar parsear el id como un número (cédula)
      const cedula = parseInt(id, 10)

      // Si no es número → error 400
      if (Number.isNaN(cedula)) {
        return res.status(400).json({ error: 'El parámetro debe ser un ObjectId válido o un número de cédula' })
      }

      // Validamos longitud de la cédula (ejemplo: entre 5 y 10 dígitos)
      // if (cedula <= 0 || cedula.toString().length < 5 || cedula.toString().length > 10) {
      //   return res.status(400).json({ error: 'La cédula debe ser un número positivo de entre 5 y 10 dígitos' })
      // }

      const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)
      // findOne devuelve Usuario | null → lo volvemos a tipar igual
      resultado = await ColUsuarios.findOne({ cedula }) as Usuario | null
    }

    // Si no encontró nada (resultado === null), respondemos 404
    if (resultado == null) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // ✅ Caso exitoso: retornamos el usuario con _id convertido a string
    res.json({ ...resultado, _id: resultado._id.toString() })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

personas.post('/', subir.single('foto'), async (req, res) => {
  // const body = req.body
  try {
    validarCuerpo(req.body, false)

    // res.send('prueba')
    // const propiedades = ['nombre', 'apellido', 'telefono', 'foto', 'cedula', 'clave']

    const body = req.body

    const nombreCompleto = validarNombreApellido(body.nombre, body.apellido)
    const foto = validarFoto(req.file)
    const clave = validarClave(body.clave)
    const telefono = validarTelefono(body.telefono)
    const cedula = await validarCedula(body.cedula, false) // false = no debe existir
    const _id = new ObjectId()
    const sal = await bcrypt.genSaltSync(12)// generar sal(12) significa que se aplicarán 2^12 rondas de procesamiento para generar la sal.
    // const claveHash = await bcrypt.hash(clave, 12) si hay 2 usuarios con la misma clave, genera el mismo hash
    const claveHash = await bcrypt.hash(clave, sal)// si hay 2 usuarios con la misma clave, genera diferente hash porque tiene diferente la sal

    const nuevoUsuario: Usuario = {
      _id,
      nombre: nombreCompleto.nombre,
      apellido: nombreCompleto.apellido,
      foto,
      cedula,
      telefono,
      clave: claveHash,
      vacunas: []
    }
    const resultado = await ColUsuarios.insertOne(nuevoUsuario)
    return res.json({ ...nuevoUsuario, _id: resultado.insertedId.toString() })
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
})

// actualizar persona (PUT)
personas.put('/:id', async (req, res) => {
  try {
    // --- validar que el cuerpo sea un objeto válido ---
    validarCuerpoActualizacion(req.body)
    // verificar parametros
    const { id } = req.params
    const body = req.body

    // --- determinar si se actualizará por _id o por cédula ---
    let posibleUsuario: Usuario | null = null
    if (ObjectId.isValid(id)) {
      posibleUsuario = await ColUsuarios.findOne({ _id: new ObjectId(id) }) as Usuario
    } else {
      const cedula = await validarCedula(id, true) // true = debe existir
      posibleUsuario = await ColUsuarios.findOne({ cedula }) as Usuario
    }

    if (posibleUsuario == null) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    // verificar cedula que proviene del cuerpo
    const cedula = await validarCedula(body.cedula, true)
    // si todo esta ok, verificar que la cedula ingresada es igual a la del usuario encontrado
    if (ObjectId.isValid(id)) {
      const posibleOtroUsuario = await ColUsuarios.findOne({ _id: new ObjectId(id), cedula }) as Usuario
      if (posibleOtroUsuario == null) {
        resError(400, 'La cédula ya está registrada en otro usuario')
      }
    } else {
      if (posibleUsuario.cedula !== cedula) {
        resError(400, 'La cédula ya está registrada en otro usuario')
      }
    }

    // --- validar campos a modificar ---
    const actualizaciones: Partial<Usuario> = {}

    const nombreCompleto = validarNombreApellido(body.nombre, body.apellido)
    actualizaciones.nombre = nombreCompleto.nombre
    actualizaciones.apellido = nombreCompleto.apellido

    actualizaciones.foto = validarFoto(body.foto)

    actualizaciones.telefono = validarTelefono(body.telefono)

    if (body.claveVieja !== undefined && body.claveNueva !== undefined) {
      const { claveVieja, claveNueva } = validarClavesActualizacion(body.claveVieja, body.claveNueva)
      if (posibleUsuario.clave !== claveVieja) {
        return res.status(400).json({ error: 'La clave vieja no coincide con la registrada' })
      }
      actualizaciones.clave = claveNueva
    }

    // --- si no hay cambios ---Este if asegura que no se ejecute un update vacío en MongoDB, lo que tendría poco sentido.
    // si actualizaciones esta vacio quiere decir que no se realizo ninguna novedad
    if (Object.keys(actualizaciones).length === 0) {
      return res.status(200).json({ error: 'No hay campos válidos para actualizar' })
    }

    // --- actualizar en la DB ---
    const resultado = await ColUsuarios.updateOne(
      { _id: posibleUsuario._id }, // filtro: cual documento se va actualizar
      { $set: actualizaciones } // $set es un operador de MongoDB que sirve para actualizar solo los campos indicados dentro de un documento.
      // No reemplaza todo el documento, sino que pone o modifica solo las claves especificadas.
    )
    // MongoDB devuelve un objeto UpdateResult que contiene varias propiedades útiles, entre ellas:
    // matchedCount → cuántos documentos coincidieron con el filtro ({ _id: objectId }).
    // modifiedCount → cuántos documentos fueron realmente modificados.
    // acknowledged → si la operación fue confirmada por el servidor.
    // resultado.modifiedCount === 0
    // Quiere decir que ningún documento se actualizó.
    // Esto puede pasar en dos escenarios:
    // El documento existe, pero no hubo cambios
    // El documento no existía o el filtro _id/cedula no encontró nada → Entonces tampoco se modifica nada.

    if (resultado.modifiedCount === 0) {
      return res.status(200).json({ error: 'No hubo actualizacion para el usuario' })
    }

    return res.json({ ...posibleUsuario, ...actualizaciones }) // copia el usuario original y sobrescribe sus campos con los nuevos valores actualizados.
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message) // Convierte ese mensaje JSON en un objeto real de JavaScript.
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
})

// personas.post('/', async (req, res) => {
//   try {
//     if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
//       return res.status(400).json({ error: 'Cuerpo de la solicitud inválido' })
//     }

//     const { telefono, cedula } = req.body
//     let { nombre, apellido, foto, clave } = req.body

//     // verificar si las anteriores propiedades existen (son diferentes a null)
//     // if (nombre == null || apellido == null || telefono == null || cedula == null || foto == null || clave == null) {
//     //   return res.status(400).json({ error: 'Faltan propiedades requeridas' })
//     // }
//     const errorNulos = propiedadesSonNulas([nombre, apellido, telefono, cedula, foto, clave]); if (errorNulos !== false) return res.status(400).json(errorNulos)

//     // verificar si las propiedades son del tipo correcto
//     if (typeof nombre !== 'string' || typeof apellido !== 'string' || typeof foto !== 'string' || typeof clave !== 'string') {
//       return res.status(400).json({ error: 'Propiedades de tipo incorrecto' })
//     }

//     // const errorTipos = sonTipoCorrecto([]);

//     // quitar los espacioss al principio y al final de cada string (es decir, que estos son let no const)
//     nombre = nombre.trim()
//     apellido = apellido.trim()
//     foto = foto.trim()
//     clave = clave.trim()

//     // verificar si los strings tienen una longitud mayor a 0
//     if (nombre.length === 0 || apellido.length === 0 || foto.length === 0 || clave.length === 0) {
//       return res.status(400).json({ error: 'Las propiedades no pueden estar vacías' })
//     }

//     // nombre y apellido minimo 2 caracteres
//     if (nombre.length < 2 || apellido.length < 2) {
//       return res.status(400).json({ error: 'El nombre y el apellido deben tener al menos 2 caracteres' })
//     }

//     // sanitizar los string
//     nombre = nombre.replace(/</g, '&lt;').replace(/>/g, '&gt;')
//     apellido = apellido.replace(/</g, '&lt;').replace(/>/g, '&gt;')
//     foto = foto.replace(/</g, '&lt;').replace(/>/g, '&gt;')
//     clave = clave.replace(/</g, '&lt;').replace(/>/g, '&gt;')

//     // para nombre, apellido solo se permiten letras y espacios
//     // if (!/^[a-zA-Z\s]+$/.test(nombre) || !/^[a-zA-Z\s]+$/.test(apellido)) {
//     //   return res.status(400).json({ error: 'El nombre y el apellido solo pueden contener letras y espacios' })
//     // }
//     const errorNombreCompleto = nombreEsValido([nombre, apellido]); if (errorNombreCompleto !== false) return res.status(400).json(errorNombreCompleto)

//     // verificar si la foto es una URL válida
//     // if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|avif|webp|bmp)$/.test(foto)) {
//     //   return res.status(400).json({ error: 'La foto debe ser una URL válida de una imagen' })
//     // }
//     const errorImagen = imagenEsValida(foto); if (errorImagen !== false) return res.status(400).json(errorImagen)

//     // verificar si la clave tiene al menos 6 caracteres
//     if (clave.length < 6) {
//       return res.status(400).json({ error: 'La clave debe tener al menos 6 caracteres' })
//     }

//     // que los strings no puedan tener 2 espacios seguidos, excepto la clave
//     // borra el espacio adicional, no lanza error
//     nombre = nombre.replace(/\s{2,}/g, ' ')
//     apellido = apellido.replace(/\s{2,}/g, ' ')
//     foto = foto.replace(/\s{2,}/g, ' ')

//     // if (/\s{2,}/.test(nombre) || /\s{2,}/.test(apellido) || /\s{2,}/.test(foto)) {
//     //   return res.status(400).json({ error: 'Los nombres y apellidos no pueden tener 2 espacios seguidos' })
//     // }

//     // telefono debe ser mayor a 0, y tener una longitud exacta a 10
//     // if (telefono <= 0 || telefono.toString().length !== 10) {
//     //   return res.status(400).json({ error: 'El teléfono debe ser un número positivo de 10 dígitos' })
//     // }

//     const errorTelefono = telefonoEsValido(telefono); if (errorTelefono !== false) return res.status(400).json(errorTelefono)

//     // cedula debe ser mayor a 0, y tener una longitud entre 5 y 10
//     // if (cedula <= 0 || cedula.toString().length < 5 || cedula.toString().length > 10) {
//     //   return res.status(400).json({ error: 'La cédula debe ser un número positivo de entre 5 y 10 dígitos' })
//     // }
//     const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)

//     // consultar a la base de datos usando el objeto colUsuarios.findOne() si la cedula esta repetida, si lo esta, dar error
//     const cedulaExistente = await ColUsuarios.findOne({ cedula })
//     if (cedulaExistente != null) {
//       return res.status(400).json({ error: 'La cédula ya está registrada' })
//     }

//     // crear un nuevo ObjectId
//     const _id = new ObjectId()

//     // crear un nuevo "Usuario" con las respectivas propiedades, y la propiedad vacuna es un arreglo vacio
//     const nuevoUsuario: Usuario = {
//       _id,
//       nombre,
//       apellido,
//       foto,
//       cedula,
//       telefono,
//       clave,
//       vacunas: []
//     }

//     // hacer insertOne de este objeto
//     const resultado = await ColUsuarios.insertOne(nuevoUsuario)

//     // retornar al usuario el Objeto resultante que es del tipo "Usuario", pero el _id no no lo retornamos como ObjectId, sino como string (el frontend no necesita saber que estoy usando mongodb)
//     res.json({ ...nuevoUsuario, _id: resultado.insertedId.toString() })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ error: 'Error interno del servidor' })
//   }
// })

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
// personas.put('/:identificador', async (req, res) => {
//   try {
//     const { identificador } = req.params
//     const actualizaciones = req.body

//     if (
//       actualizaciones == null ||
//       typeof actualizaciones !== 'object' ||
//       Array.isArray(actualizaciones)
//     ) {
//       return res.status(400).json({ error: 'Cuerpo de la solicitud inválido' })
//     }

//     delete actualizaciones._id

//     let usuarioOriginal = null
//     if (ObjectId.isValid(identificador)) {
//       usuarioOriginal = await ColUsuarios.findOne({ _id: new ObjectId(identificador) })
//     } else if (!isNaN(Number(identificador))) {
//       usuarioOriginal = await ColUsuarios.findOne({ cedula: Number(identificador) })
//     } else {
//       return res.status(400).json({ error: 'Identificador inválido, use _id o cédula' })
//     }

//     if (usuarioOriginal == null) {
//       return res.status(404).json({ error: 'Usuario no encontrado' })
//     }

//     let { nombre, apellido, foto, cedula, telefono, claveVieja, claveNueva } = actualizaciones

//     const errorNulos = propiedadesSonNulas([nombre, apellido, telefono, cedula, foto])
//     if (errorNulos !== false) return res.status(400).json(errorNulos)

//     if (nombre !== undefined) {
//       if (typeof nombre !== 'string' || nombre.trim().length < 2) {
//         return res
//           .status(400)
//           .json({ error: 'El nombre debe ser un string con al menos 2 caracteres' })
//       }
//       const errorNombreCompleto = nombreEsValido([nombre, apellido])
//       if (errorNombreCompleto !== false) return res.status(400).json(errorNombreCompleto)
//       nombre = nombre.trim().replace(/\s{2,}/g, ' ')
//     }

//     if (apellido !== undefined) {
//       if (typeof apellido !== 'string' || apellido.trim().length < 2) {
//         return res
//           .status(400)
//           .json({ error: 'El apellido debe ser un string con al menos 2 caracteres' })
//       }
//       const errorNombreCompleto = nombreEsValido([nombre, apellido])
//       if (errorNombreCompleto !== false) return res.status(400).json(errorNombreCompleto)
//       apellido = apellido.trim().replace(/\s{2,}/g, ' ')
//     }

//     if (foto !== undefined) {
//       const errorImagen = imagenEsValida(foto)
//       if (errorImagen !== false) return res.status(400).json(errorImagen)
//       foto = foto.trim()
//     }

//     if (cedula !== undefined) {
//       const errorCedula = cedulaEsValida(cedula)
//       if (errorCedula !== false) return res.status(400).json(errorCedula)

//       const existeCedula = await ColUsuarios.findOne({
//         cedula,
//         _id: { $ne: usuarioOriginal._id }
//       })
//       if (existeCedula != null) {
//         return res.status(400).json({ error: 'La cédula ya está registrada en otro usuario' })
//       }
//     }

//     if (telefono !== undefined) {
//       const errorTelefono = telefonoEsValido(telefono)
//       if (errorTelefono !== false) return res.status(400).json(errorTelefono)
//     }

//     if (
//       claveVieja === undefined || claveVieja === null || claveVieja.trim() === '' ||
//       claveNueva === undefined || claveNueva === null || claveNueva.trim() === ''
//     ) {
//       return res.status(400).json({ error: 'Debe enviar claveVieja y claveNueva' })
//     }

//     if (usuarioOriginal.clave !== claveVieja) {
//       return res.status(400).json({ error: 'La clave antigua no coincide' })
//     }

//     if (typeof claveNueva !== 'string' || claveNueva.trim() === '' || claveNueva.trim().length < 6) {
//       return res.status(400).json({ error: 'La clave nueva debe tener al menos 6 caracteres' })
//     }

//     await ColUsuarios.updateOne(
//       { _id: usuarioOriginal._id },
//       {
//         $set: {
//           ...(nombre !== undefined && { nombre }),
//           ...(apellido !== undefined && { apellido }),
//           ...(foto !== undefined && { foto }),
//           ...(cedula !== undefined && { cedula }),
//           ...(telefono !== undefined && { telefono }),
//           ...(claveNueva !== undefined && { clave: claveNueva })
//         }
//       }
//     )

//     const usuarioActualizado = await ColUsuarios.findOne<Usuario>({ _id: usuarioOriginal._id })

//     if (usuarioActualizado === null || usuarioActualizado === undefined) {
//       return res.status(404).json({ error: 'Usuario no encontrado tras actualizar' })
//     }

//     res.json({
//       ...usuarioActualizado,
//       _id: usuarioActualizado._id.toString()
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ error: 'Error interno del servidor' })
//   }
// })

// eliminar persona (DELETE)
// personas.delete('/:id', async (req, res) => {
//   try {
//     const { id: _id } = req.params

//     if (!ObjectId.isValid(_id)) {
//       return res.status(400).json({ error: 'El id ingresado no es válido' })
//     }

//     // buscar primero el usuario
//     const usuario = await ColUsuarios.findOne({ _id: new ObjectId(_id) })

//     if (usuario == null) {
//       return res.status(404).json({ error: 'Usuario no encontrado' })
//     }

//     const resultado = await ColUsuarios.deleteOne({ _id: new ObjectId(_id) })

//     if (resultado.deletedCount === 0) {
//       return res.status(500).json({ error: 'No se pudo eliminar el usuario' })
//     }

//     // devolvemos el objeto eliminado en vez de un mensaje
//     res.json({ ...usuario, _id: usuario._id.toString() })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ error: 'Error interno del servidor' })
//   }
// })

// eliminar persona (DELETE)
personas.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // --- validar que el id sea un ObjectId válido ---
    const objectId = validarObjectId(id)

    // --- verificar si existe en la base ---
    const usuario = await ColUsuarios.findOne({ _id: objectId })
    if (usuario == null) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // --- eliminar usuario ---
    const resultado = await ColUsuarios.deleteOne({ _id: objectId })

    if (resultado.deletedCount === 0) {
      return res.status(500).json({ error: 'No se pudo eliminar el usuario' })
    }

    return res.json({ mensaje: 'Usuario eliminado correctamente', _id: id })
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
})

export default personas
