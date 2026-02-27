import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ColUsuarios } from '../index'
import { Rol, Usuario } from '../types'
import { cedulaEsValida, resError, responseToError, validarCedula, validarClave, validarClavesActualizacion, validarCuerpo, validarFoto, validarNombreApellido, validarObjectId, validarRolDelBody, validarRolParaAcciones, validarTelefono } from '../utilidades/validaciones'

/* ==========================================================================
   🔹 Obtener todos los usuarios (sin vacunas, clave ni foto)
   ========================================================================== */
export async function obtenerUsuarios (_: Request, res: Response): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [Rol.Administrador])
    // filtro omitir arreglo vacunas, clave (fuera hackers) y foto(mucha informacion)
    const resultado = await ColUsuarios.find(
      {
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      },
      { projection: { vacunas: false, clave: false, foto: false } }
    ).toArray() as Usuario[]
    return res.json(resultado)
  } catch (error) {
    return responseToError(error as Error, res)
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
    ) as Usuario

    if (resultado == null || resultado.isDeleted) {
      return resError(404, 'Usuario no encontrado')
    }

    return res.json(resultado)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ==========================================================================
   🔹 Buscar usuario por ID o por cédula
   ========================================================================== */
export async function obtenerUsuarioPorId (req: Request, res: Response): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [Rol.Administrador, Rol.Vacunador])
    const id = req.params.id as string
    let resultado: Usuario | null = null

    // Caso 1: Buscar por ObjectId
    if (ObjectId.isValid(id)) {
      resultado = await ColUsuarios.findOne(
        {
          _id: new ObjectId(id),
          isDeleted: false
        },
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
    return responseToError(error as Error, res)
  }
}

/* ==========================================================================
   🔹 Crear nuevo usuario
   ========================================================================== */
export async function crearUsuario (req: Request, res: Response): Promise<Response> {
  try {
    // Obtenemos el cuerpo enviado por el cliente
    const body = req.body

    // Validamos que el cuerpo tenga todos los datos necesarios
    validarCuerpo(req.body, false)

    // Validamos y unimos "nombre" y "apellido" (asegura formato correcto)
    const nombreCompleto = validarNombreApellido(body.nombre, body.apellido)

    // Validamos la imagen recibida (req.file la envía multer)
    const foto = validarFoto(req.file)

    // Validamos la clave según reglas (longitud, seguridad, etc.)
    const clave = validarClave(body.clave)

    // Validamos el teléfono
    const telefono = validarTelefono(body.telefono)

    // Validamos la cédula (que no exista si es creación)
    const cedula = await validarCedula(body.cedula, false)

    let rolCuerpo: Rol

    // Si el usuario que crea NO es administrador, solo puede crear usuarios Pacientes
    if (res.locals.usuario.rol !== Rol.Administrador) {
      rolCuerpo = validarRolDelBody(body.rol, [Rol.Paciente])
    } else { //  Si es administrador, puede crear cualquier tipo de usuario
      rolCuerpo = validarRolDelBody(
        body.rol,
        [Rol.Administrador, Rol.Vacunador, Rol.Paciente]
      )
    }

    // Creamos un ObjectId nuevo para el usuario
    const _id = new ObjectId()

    // Generamos la sal para la contraseña
    const sal = await bcrypt.genSalt(12)

    // 🟦 Encriptamos la clave (clave -> hash)
    const claveHash = await bcrypt.hash(clave, sal)

    // Construimos el objeto usuario listo para guardar en MongoDB
    const nuevoUsuario: Usuario = {
      _id,
      nombre: nombreCompleto.nombre,
      apellido: nombreCompleto.apellido,
      foto,
      cedula,
      telefono,
      clave: claveHash,
      vacunas: [],
      rol: rolCuerpo,
      isDeleted: false
    }

    // Insertamos el usuario en la base de datos
    await ColUsuarios.insertOne(nuevoUsuario)

    // Creamos una copia para enviar al frontend SIN datos sensibles
    const usuarioFiltrado: Partial<Usuario> = nuevoUsuario

    // Eliminamos información sensible o innecesaria
    delete usuarioFiltrado.clave
    delete usuarioFiltrado.vacunas
    delete usuarioFiltrado._id

    // Enviamos el usuario creado (solo datos seguros)
    return res.json(usuarioFiltrado)
  } catch (error) {
    // Si ocurre un error, lo enviamos con la función de manejo especial
    return responseToError(error as Error, res)
  }
}

/* ==========================================================================
   🔹 Actualizar usuario
   ========================================================================== */
// 🔹 Controlador para ACTUALIZAR un usuario existente

export async function actualizarUsuario (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const id: string | undefined = req.params.id

    if (id === undefined || id === null || id.trim() === '') {
      return resError(400, 'ID requerido')
    }
    let usuarioExistente: Usuario | null = null

    // 🔎 Buscar por ObjectId o por cédula
    if (ObjectId.isValid(id)) {
      usuarioExistente = await ColUsuarios.findOne({
        _id: new ObjectId(id)
      }) as Usuario | null
    } else {
      const cedulaParam: number = await validarCedula(id, true)
      usuarioExistente = await ColUsuarios.findOne({
        cedula: cedulaParam
      }) as Usuario | null
    }

    if (usuarioExistente == null) {
      return resError(404, 'Usuario no encontrado')
    }

    const body = req.body

    const actualizaciones: Partial<Usuario> = {}

    /* ============================================================
       🔹 CÉDULA (validar que no exista en otro usuario)
    ============================================================ */
    if (body.cedula != null) {
      const nuevaCedula: number = await validarCedula(body.cedula, true)

      const usuarioConMismaCedula = await ColUsuarios.findOne({
        cedula: nuevaCedula,
        _id: { $ne: usuarioExistente._id }
      }) as Usuario | null

      if (usuarioConMismaCedula != null) {
        return resError(400, 'La cédula ya está registrada en otro usuario')
      }

      actualizaciones.cedula = nuevaCedula
    }

    /* ============================================================
       🔹 Nombre y Apellido (opcional)
    ============================================================ */
    if (body.nombre != null || body.apellido != null) {
      const nombreCompleto = validarNombreApellido(
        body.nombre ?? usuarioExistente.nombre,
        body.apellido ?? usuarioExistente.apellido
      )

      actualizaciones.nombre = nombreCompleto.nombre
      actualizaciones.apellido = nombreCompleto.apellido
    }

    /* ============================================================
       🔹 Teléfono (opcional)
    ============================================================ */
    if (body.telefono != null) {
      actualizaciones.telefono = validarTelefono(body.telefono)
    }

    /* ============================================================
       🔹 Foto (solo si se envía archivo)
    ============================================================ */
    if (req.file != null) {
      actualizaciones.foto = validarFoto(req.file)
    }

    /* ============================================================
       🔹 Rol (según permisos)
    ============================================================ */
    if (body.rol != null) {
      let rolValido: Rol

      if (res.locals.usuario.rol !== Rol.Administrador) {
        rolValido = validarRolDelBody(body.rol, [Rol.Paciente])
      } else {
        rolValido = validarRolDelBody(
          body.rol,
          [Rol.Administrador, Rol.Vacunador, Rol.Paciente]
        )
      }

      actualizaciones.rol = rolValido
    }

    /* ============================================================
       🔹 Cambio de contraseña (opcional)
    ============================================================ */
    if (body.claveVieja != null && body.claveNueva != null) {
      const { claveVieja, claveNueva } =
        validarClavesActualizacion(body.claveVieja, body.claveNueva)

      const coincide: boolean = await bcrypt.compare(
        claveVieja,
        usuarioExistente.clave
      )

      if (!coincide) {
        return resError(400, 'La clave vieja no coincide')
      }

      const sal: string = await bcrypt.genSalt(12)
      actualizaciones.clave = await bcrypt.hash(claveNueva, sal)
    }

    /* ============================================================
       🔹 Validar que haya algo para actualizar
    ============================================================ */
    if (Object.keys(actualizaciones).length === 0) {
      return resError(400, 'No hay datos para actualizar')
    }

    /* ============================================================
       🔹 Ejecutar actualización
    ============================================================ */
    const resultado = await ColUsuarios.updateOne(
      { _id: usuarioExistente._id },
      { $set: actualizaciones }
    )

    if (resultado.modifiedCount === 0) {
      return resError(500, 'No se pudo actualizar el usuario')
    }

    /* ============================================================
       🔹 Respuesta sin datos sensibles
    ============================================================ */
    const usuarioActualizado = await ColUsuarios.findOne(
      { _id: usuarioExistente._id },
      { projection: { clave: false } }
    )

    return res.json(usuarioActualizado)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ==========================================================================
   🔹 Eliminar usuario temporalmente
   ========================================================================== */
// 🔹 Controlador para eliminar un usuario
export async function eliminarUsuario (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [Rol.Administrador])

    const { id } = req.params
    const objectId = validarObjectId(id)

    const usuario = await ColUsuarios.findOne({ _id: objectId }) as Usuario | null

    if (usuario == null) {
      return resError(404, 'Usuario no encontrado')
    }

    if (usuario.isDeleted) {
      return resError(400, 'El usuario ya está eliminado')
    }

    const resultado = await ColUsuarios.updateOne(
      { _id: objectId },
      { $set: { isDeleted: true } }
    )

    if (resultado.modifiedCount === 0) {
      return resError(500, 'No se pudo eliminar el usuario')
    }

    return res.json({
      mensaje: 'Usuario eliminado temporalmente',
      _id: id
    })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ==========================================================================
   🔹 Eliminar usuario definitivamente
   ========================================================================== */
export async function eliminarUsuarioForce (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [Rol.Administrador])

    const { id } = req.params
    const objectId = validarObjectId(id)

    const usuario = await ColUsuarios.findOne({ _id: objectId }) as Usuario | null

    if (usuario == null) {
      return resError(404, 'Usuario no encontrado')
    }

    const resultado = await ColUsuarios.deleteOne({ _id: objectId })

    if (resultado.deletedCount === 0) {
      return resError(500, 'No se pudo eliminar definitivamente')
    }

    return res.json({
      mensaje: 'Usuario eliminado definitivamente',
      _id: id
    })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ==========================================================================
   🔹 Restaurar usuario
   ========================================================================== */
export async function restaurarUsuario (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [Rol.Administrador])

    const { id } = req.params
    const objectId = validarObjectId(id)

    const usuario = await ColUsuarios.findOne({ _id: objectId }) as Usuario | null

    if (usuario == null) {
      return resError(404, 'Usuario no encontrado')
    }

    if (!usuario.isDeleted) {
      return resError(400, 'El usuario no está eliminado')
    }

    const resultado = await ColUsuarios.updateOne(
      { _id: objectId },
      { $set: { isDeleted: false } }
    )

    if (resultado.modifiedCount === 0) {
      return resError(500, 'No se pudo restaurar el usuario')
    }

    return res.json({
      mensaje: 'Usuario restaurado correctamente',
      _id: id
    })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ==========================================================================
   🔹 PUT /me – Actualizar usuario autenticado (TODOS LOS ROLES)
   ========================================================================== */
export async function actualizarUsuarioMe (req: Request, res: Response): Promise<Response> {
  try {
    //  Usuario autenticado desde el token
    const userId = res.locals.usuario.sub
    const objectId = validarObjectId(userId)

    //  Buscar usuario actual
    const usuario = await ColUsuarios.findOne({ _id: objectId }) as Usuario | null
    if (usuario == null) {
      return resError(404, 'Usuario no encontrado')
    }

    //  Validar cuerpo
    const body = req.body
    // validarCuerpo(body, false) cambio feb 20 11:15

    //  Objeto de actualizaciones
    const actualizaciones: Partial<Usuario> = {}

    //  Nombre y apellido
    if (body.nombre != null || body.apellido != null) {
      const nombreCompleto = validarNombreApellido(body.nombre, body.apellido)
      actualizaciones.nombre = nombreCompleto.nombre
      actualizaciones.apellido = nombreCompleto.apellido
    }

    //  Foto (multer)
    if (req.file != null) {
      actualizaciones.foto = validarFoto(req.file)
    }

    // Teléfono
    if (body.telefono != null) {
      actualizaciones.telefono = validarTelefono(body.telefono)
    }

    //  Cambio de contraseña (opcional)
    if (body.claveVieja != null || body.claveNueva != null) {
      const { claveVieja, claveNueva } =
        validarClavesActualizacion(body.claveVieja, body.claveNueva)

      const coincide = await bcrypt.compare(claveVieja, usuario.clave)
      if (!coincide) {
        return resError(400, 'La clave vieja no coincide')
      }

      const sal = await bcrypt.genSalt(12)
      actualizaciones.clave = await bcrypt.hash(claveNueva, sal)
    }

    //  Nada para actualizar
    if (Object.keys(actualizaciones).length === 0) {
      return resError(400, 'No hay datos para actualizar')
    }

    // 💾 Actualizar en DB
    const resultado = await ColUsuarios.updateOne(
      { _id: objectId },
      { $set: actualizaciones }
    )

    if (resultado.matchedCount === 0) {
      return resError(404, 'Usuario no encontrado')
    }

    //  Respuesta segura
    const respuesta: Partial<Usuario> = actualizaciones
    delete respuesta.clave

    return res.json(respuesta)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

// Buscar usuario eliminado (para restaurar)
export async function obtenerUsuarioEliminado (
  req: Request<{ cedula: string }>,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [Rol.Administrador])

    const cedulaParam = req.params.cedula

    if (cedulaParam.trim() === '') {
      return resError(400, 'Cédula requerida')
    }

    const cedula = Number(cedulaParam)

    if (!Number.isInteger(cedula)) {
      return resError(400, 'Cédula inválida')
    }

    // 🔎 Buscar usuario sin importar estado
    const usuario = await ColUsuarios.findOne(
      { cedula },
      { projection: { clave: false } }
    ) as Usuario | null

    if (usuario == null) {
      return resError(404, 'Usuario no existe en el sistema')
    }

    // 🔎 Si existe pero NO está eliminado
    if (!usuario.isDeleted) {
      return resError(400, 'El usuario no ha sido eliminado')
    }

    // ✔ Está eliminado
    return res.json({ ...usuario, _id: usuario._id.toString() })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

// // Buscar usuario activo (para eliminar)
export async function obtenerUsuarioActivo (
  req: Request<{ cedula: string }>,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [Rol.Administrador])

    const cedulaParam = req.params.cedula

    if (cedulaParam.trim() === '') {
      return resError(400, 'Cédula requerida')
    }

    const cedula = parseInt(cedulaParam, 10)

    if (isNaN(cedula)) {
      return resError(400, 'Cédula inválida')
    }

    const usuario = await ColUsuarios.findOne(
      { cedula, isDeleted: false },
      { projection: { clave: false } }
    ) as Usuario | null

    if (usuario == null) {
      return resError(404, 'Usuario activo no encontrado')
    }

    return res.json({ ...usuario, _id: usuario._id.toString() })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}
