// controller/userController.ts
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ColUsuarios } from '../index'
import { Rol, Usuario } from '../types'
import { cedulaEsValida, resError, validarCedula, validarClave, validarClavesActualizacion, validarCuerpo, validarCuerpoActualizacion, validarFoto, validarNombreApellido, validarObjectId, validarRol, validarTelefono } from '../utilidades/validaciones'

/* ==========================================================================
   🔹 Obtener todos los usuarios (sin vacunas, clave ni foto)
   ========================================================================== */
export async function obtenerUsuarios (_: Request, res: Response): Promise<Response> {
  try {
    const resultado = await ColUsuarios.find(
      {},
      { projection: { vacunas: false, clave: false, foto: false } }
    ).toArray() as Usuario[]
    return res.json(resultado)
  } catch (error) {
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

/* ==========================================================================
   🔹 Obtener usuario autenticado (propio)
   ========================================================================== */
export async function obtenerUsuarioActual (_: Request, res: Response): Promise<Response> {
  try {
    const resultado = await ColUsuarios.findOne(
      { _id: new ObjectId(res.locals.usuario.sub) },
      { projection: { clave: false } }
    ) as Usuario | null

    if (resultado == null) {
      return resError(404, 'Usuario no encontrado')
    }

    return res.json(resultado)
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

/* ==========================================================================
   🔹 Buscar usuario por ID o por cédula
   ========================================================================== */
export async function obtenerUsuarioPorId (req: Request, res: Response): Promise<Response> {
  const id = req.params.id as string
  try {
    let resultado: Usuario | null = null

    // Caso 1: Buscar por ObjectId
    if (ObjectId.isValid(id)) {
      resultado = await ColUsuarios.findOne(
        { _id: new ObjectId(id) },
        { projection: { clave: false } }
      ) as Usuario | null
    } else {
      // Caso 2: Buscar por cédula
      const cedula = parseInt(id, 10)
      if (Number.isNaN(cedula)) {
        return res.status(400).json({ error: 'El parámetro debe ser un ObjectId o cédula válida' })
      }

      const errorCedula = cedulaEsValida(cedula)
      if (errorCedula !== false) return res.status(400).json(errorCedula)

      resultado = await ColUsuarios.findOne(
        { cedula },
        { projection: { clave: false } }
      ) as Usuario | null
    }

    if (resultado == null) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.json({ ...resultado, _id: resultado._id.toString() })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

/* ==========================================================================
   🔹 Crear nuevo usuario
   ========================================================================== */
export async function crearUsuario (req: Request, res: Response): Promise<Response> {
  try {
    const rolPeticion: Rol = res.locals.usuario.rol
    validarCuerpo(req.body, false)

    const body = req.body
    const nombreCompleto = validarNombreApellido(body.nombre, body.apellido)
    const foto = validarFoto(req.file)
    const clave = validarClave(body.clave)
    const telefono = validarTelefono(body.telefono)
    const cedula = await validarCedula(body.cedula, false)

    const rolCuerpo = validarRol(rolPeticion, body.rol)

    const _id = new ObjectId()
    const sal = await bcrypt.genSalt(12)
    const claveHash = await bcrypt.hash(clave, sal)

    const nuevoUsuario: Usuario = {
      _id,
      nombre: nombreCompleto.nombre,
      apellido: nombreCompleto.apellido,
      foto,
      cedula,
      telefono,
      clave: claveHash,
      vacunas: [],
      rol: rolCuerpo
    }

    const resultado = await ColUsuarios.insertOne(nuevoUsuario)
    return res.json({ ...nuevoUsuario, _id: resultado.insertedId.toString() })
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return resError(objetoError.codigo, objetoError.mensaje)
    }
    return resError(500, 'Error interno en el servidor')
  }
}

/* ==========================================================================
   🔹 Actualizar usuario
   ========================================================================== */
export async function actualizarUsuario (req: Request, res: Response): Promise<Response> {
  try {
    validarCuerpoActualizacion(req.body)
    const id = req.params.id as string
    const body = req.body

    let posibleUsuario: Usuario | null = null
    if (ObjectId.isValid(id)) {
      posibleUsuario = await ColUsuarios.findOne({ _id: new ObjectId(id) }) as Usuario
    } else {
      const cedula = await validarCedula(id, true)
      posibleUsuario = await ColUsuarios.findOne({ cedula }) as Usuario
    }

    if (posibleUsuario == null) {
      return resError(404, 'Usuario no encontrado')
    }

    const cedula = await validarCedula(body.cedula, true)
    if (ObjectId.isValid(id)) {
      const otroUsuario = await ColUsuarios.findOne({ _id: new ObjectId(id), cedula }) as Usuario
      if (otroUsuario == null) {
        return resError(400, 'La cédula ya está registrada en otro usuario')
      }
    } else if (posibleUsuario.cedula !== cedula) {
      return resError(400, 'La cédula ya está registrada en otro usuario')
    }

    const actualizaciones: Partial<Usuario> = {}

    const nombreCompleto = validarNombreApellido(body.nombre, body.apellido)
    actualizaciones.nombre = nombreCompleto.nombre
    actualizaciones.apellido = nombreCompleto.apellido
    actualizaciones.foto = validarFoto(req.file)
    actualizaciones.telefono = validarTelefono(body.telefono)

    const { claveVieja, claveNueva } = validarClavesActualizacion(body.claveVieja, body.claveNueva)
    const coincide = await bcrypt.compare(claveVieja, posibleUsuario.clave)
    if (!coincide) {
      return resError(400, 'La clave vieja no coincide con la registrada')
    }

    const sal = await bcrypt.genSalt(12)
    const claveHash = await bcrypt.hash(claveNueva, sal)
    actualizaciones.clave = claveHash

    if (Object.keys(actualizaciones).length === 0) {
      return resError(200, 'No hubo actualizacion para el usuario')
    }

    const resultado = await ColUsuarios.updateOne(
      { _id: posibleUsuario._id },
      { $set: actualizaciones }
    )

    if (resultado.modifiedCount === 0) {
      return resError(500, 'No se pudo actualizar el usuario')
    }

    return res.json({ ...posibleUsuario, ...actualizaciones })
  } catch (error) {
    const e = error as Error
    if (e.message.startsWith('{')) {
      const objetoError = JSON.parse(e.message)
      return res.status(objetoError.codigo).json(objetoError.mensaje)
    }
    return res.status(500).json({ error: 'Error interno en el servidor' })
  }
}

/* ==========================================================================
   🔹 Eliminar usuario
   ========================================================================== */
export async function eliminarUsuario (req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const objectId = validarObjectId(id)

    const usuario = await ColUsuarios.findOne({ _id: objectId })
    if (usuario == null) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

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
}
