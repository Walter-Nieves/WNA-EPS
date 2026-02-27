import { Request, Response } from 'express'
import { ObjectId, WithId } from 'mongodb'
import { ColUsuarios, ColVacunas } from '../index'
import { Rol, Usuario, Vacuna, VacunaResponse, VacunaResponseOtros, Vacunas } from '../types'

import {
  cedulaEsValida,
  resError,
  responseToError,
  validarObjectId,
  validarRolParaAcciones
} from '../utilidades/validaciones'

/* ======================================
   1️⃣ GET ALL – Vacunador y Administrador
   ====================================== */

export async function getAllVaccines (
  _: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [
      Rol.Vacunador,
      Rol.Administrador
    ])

    const vacunas = await ColVacunas.find().toArray()
    const usuarios = await ColUsuarios.find().toArray()

    const mapaUsuarios = new Map<number, Usuario>()

    for (const u of usuarios) {
      mapaUsuarios.set(u.cedula, u)
    }

    const respuesta = vacunas.map((v) => {
      const paciente = mapaUsuarios.get(v.cedula)
      const responsable = mapaUsuarios.get(v.vacunadorCedula)

      return {
        _id: v._id.toString(),
        cedula: v.cedula,
        fecha: v.fecha.toISOString(),
        lugar: v.lugar,
        nombre: v.nombre,

        nombrePaciente:
      paciente != null
        ? `${paciente.nombre} ${paciente.apellido}`
        : 'No encontrado',

        fotoPaciente:
      paciente?.foto ?? 'https://placehold.co/200',

        nombreVacunador:
      responsable != null
        ? `${responsable.nombre} ${responsable.apellido}`
        : 'No encontrado',

        fotoVacunador:
      responsable?.foto ?? 'https://placehold.co/200',

        vacunadorId:
      responsable?._id != null
        ? responsable._id.toString()
        : undefined,

        pacienteId:
      paciente?._id != null
        ? paciente._id.toString()
        : undefined,

        vacunadorCedula: v.vacunadorCedula,

        nombreAdministrador:
      v.agregadoPorRol === Rol.Administrador && responsable != null
        ? `${responsable.nombre} ${responsable.apellido}`
        : undefined,

        fotoAdministrador:
      v.agregadoPorRol === Rol.Administrador
        ? responsable?.foto
        : undefined,

        agregadoPorRol: v.agregadoPorRol ?? null,

        agregadoPorId:
      v.agregadoPorId != null
        ? v.agregadoPorId.toString()
        : null
      }
    })

    return res.json(respuesta)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ======================================
   2️⃣ GET ME – Todos los roles
   ====================================== */

export async function getMyVaccines (
  _: Request,
  res: Response
): Promise<Response> {
  try {
    const cedula: number = res.locals.usuario.cedula

    const vacunas: Vacuna[] = await ColVacunas.find({ cedula }).toArray()
    const usuarios: Usuario[] = await ColUsuarios.find().toArray()

    const mapaUsuarios = new Map<number, Usuario>()
    for (const u of usuarios) {
      mapaUsuarios.set(u.cedula, u)
    }

    const respuesta = vacunas.map((v) => {
      const paciente = mapaUsuarios.get(v.cedula)
      const responsable = mapaUsuarios.get(v.vacunadorCedula)

      return {
        _id: v._id?.toString() ?? '',
        cedula: v.cedula,
        fecha: v.fecha instanceof Date
          ? v.fecha.toISOString()
          : new Date(v.fecha).toISOString(),
        lugar: v.lugar,
        nombre: v.nombre,

        nombrePaciente:
          paciente != null
            ? `${paciente.nombre} ${paciente.apellido}`
            : 'No encontrado',

        fotoPaciente:
          paciente?.foto ?? 'https://placehold.co/200',

        nombreVacunador:
          responsable != null
            ? `${responsable.nombre} ${responsable.apellido}`
            : 'No encontrado',

        fotoVacunador:
          responsable?.foto ?? 'https://placehold.co/200',

        vacunadorId: responsable?._id?.toString() ?? undefined,
        pacienteId: paciente?._id?.toString() ?? undefined,
        vacunadorCedula: v.vacunadorCedula,

        nombreAdministrador:
          v.agregadoPorRol === Rol.Administrador && responsable != null
            ? `${responsable.nombre} ${responsable.apellido}`
            : undefined,

        fotoAdministrador:
          v.agregadoPorRol === Rol.Administrador
            ? responsable?.foto
            : undefined,

        agregadoPorRol: v.agregadoPorRol ?? null,

        // PROTECCIÓN CLAVE
        agregadoPorId: (v.agregadoPorId != null)
          ? v.agregadoPorId.toString()
          : null
      }
    })

    return res.json(respuesta)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ======================================
   3️⃣ GET OTHERS – Vacunador y Admin
   ====================================== */

export async function getOtherVaccines (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [
      Rol.Vacunador,
      Rol.Administrador
    ])

    const cedula = Number(req.params.cedula)
    const errorCedula = cedulaEsValida(cedula)
    if (errorCedula !== false) {
      return res.status(400).json(errorCedula)
    }

    const vacunas = await ColVacunas.find({ cedula }).toArray() as Vacuna[]
    const usuarios = await ColUsuarios.find().toArray() as Usuario[]

    const mapaVacunadores = new Map<number, Usuario>()
    const mapaPacientes = new Map<number, Usuario>()

    for (const u of usuarios) {
      if (u.rol === Rol.Vacunador) {
        mapaVacunadores.set(u.cedula, u)
      }
      if (u.rol === Rol.Paciente) {
        mapaPacientes.set(u.cedula, u)
      }
    }

    const respuesta: VacunaResponse[] = vacunas.map((v) => {
      const infoVacunador = mapaVacunadores.get(v.vacunadorCedula)
      const infoPaciente = mapaPacientes.get(v.cedula)

      return {
        _id: v._id,
        cedula: v.cedula,
        fecha: v.fecha,
        lugar: v.lugar,
        nombre: v.nombre,

        nombreVacunador: (infoVacunador != null)
          ? `${infoVacunador.nombre} ${infoVacunador.apellido}`
          : 'No encontrado',

        fotoVacunador:
          infoVacunador?.foto ?? 'https://placehold.co/200',

        nombrePaciente: (infoPaciente != null)
          ? `${infoPaciente.nombre} ${infoPaciente.apellido}`
          : 'No encontrado',

        fotoPaciente:
          infoPaciente?.foto ?? 'https://placehold.co/200'
      }
    })

    return res.json(respuesta)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ======================================
   4️⃣ GET BY ID O CÉDULA – Vac/Admin
   ====================================== */

export async function getVaccineByIdOrCedula (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [
      Rol.Vacunador,
      Rol.Administrador
    ])

    const idParam: string | undefined = req.params.id

    if (idParam == null || idParam.trim() === '') {
      return res.status(400).json({
        error: 'Parámetro id requerido'
      })
    }

    const id = idParam.trim()

    const usuarios = await ColUsuarios.find().toArray() as Usuario[]

    const mapaVacunadores = new Map<number, Usuario>()
    const mapaPacientes = new Map<number, Usuario>()

    for (const u of usuarios) {
      if (u.rol === Rol.Vacunador) {
        mapaVacunadores.set(u.cedula, u)
      }
      if (u.rol === Rol.Paciente) {
        mapaPacientes.set(u.cedula, u)
      }
    }

    // 🔹 Caso 1: ObjectId
    if (ObjectId.isValid(id)) {
      const vacuna = await ColVacunas.findOne({
        _id: new ObjectId(id)
      }) as Vacuna | null

      if (vacuna == null) {
        return resError(404, 'Vacuna no encontrada')
      }

      const infoVacunador = mapaVacunadores.get(vacuna.vacunadorCedula)
      const infoPaciente = mapaPacientes.get(vacuna.cedula)

      return res.json({
        _id: vacuna._id,
        cedula: vacuna.cedula,
        fecha: vacuna.fecha,
        lugar: vacuna.lugar,
        nombre: vacuna.nombre,

        nombreVacunador: (infoVacunador != null)
          ? `${infoVacunador.nombre} ${infoVacunador.apellido}`
          : 'No encontrado',

        fotoVacunador:
          infoVacunador?.foto ?? 'https://placehold.co/200',

        nombrePaciente: (infoPaciente != null)
          ? `${infoPaciente.nombre} ${infoPaciente.apellido}`
          : 'No encontrado',

        fotoPaciente:
          infoPaciente?.foto ?? 'https://placehold.co/200'
      })
    }

    //  Caso 2: Cédula
    const cedula = Number(id)
    const errorCedula = cedulaEsValida(cedula)
    if (errorCedula !== false) {
      return res.status(400).json(errorCedula)
    }

    const vacunas = await ColVacunas.find({ cedula }).toArray() as Vacuna[]

    const respuesta: VacunaResponse[] = vacunas.map((v) => {
      const infoVacunador = mapaVacunadores.get(v.vacunadorCedula)
      const infoPaciente = mapaPacientes.get(v.cedula)

      return {
        _id: v._id,
        cedula: v.cedula,
        fecha: v.fecha,
        lugar: v.lugar,
        nombre: v.nombre,

        nombreVacunador: (infoVacunador != null)
          ? `${infoVacunador.nombre} ${infoVacunador.apellido}`
          : 'No encontrado',

        fotoVacunador:
          infoVacunador?.foto ?? 'https://placehold.co/200',

        nombrePaciente: (infoPaciente != null)
          ? `${infoPaciente.nombre} ${infoPaciente.apellido}`
          : 'No encontrado',

        fotoPaciente:
          infoPaciente?.foto ?? 'https://placehold.co/200'
      }
    })

    return res.json(respuesta)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ======================================
   5️⃣ POST UNA – Vacunador y Admin
   ====================================== */

export async function postVaccine (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [
      Rol.Vacunador,
      Rol.Administrador
    ])

    const cedula = Number(req.params.id)
    const errorCedula = cedulaEsValida(cedula)

    if (errorCedula !== false) {
      return res.status(400).json(errorCedula)
    }

    const { fecha, nombre, lugar } = req.body

    if (!Object.values(Vacunas).includes(nombre)) {
      return res.status(400).json({
        error: 'Nombre de vacuna inválido'
      })
    }

    const usuarioLogueado = res.locals.usuario as Usuario

    const vacuna: Vacuna = {
      _id: new ObjectId(),
      cedula,
      fecha: new Date(fecha),
      nombre,
      lugar: lugar.trim(),

      vacunadorCedula: usuarioLogueado.cedula,

      agregadoPorRol: usuarioLogueado.rol,
      agregadoPorId: new ObjectId(usuarioLogueado._id) // 🔥 FIX
    }

    await ColVacunas.insertOne(vacuna)

    await ColUsuarios.updateOne(
      { cedula },
      { $push: { vacunas: vacuna._id } }
    )

    return res.status(201).json({
      ...vacuna,
      _id: vacuna._id.toString(),
      fecha: vacuna.fecha.toISOString(),
      agregadoPorId:
    vacuna.agregadoPorId != null
      ? vacuna.agregadoPorId.toString()
      : null
    })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ======================================
   6️⃣ POST MÚLTIPLES – Vac/Admin
   ====================================== */

export async function postMultipleVaccines (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [
      Rol.Vacunador,
      Rol.Administrador
    ])

    const cedula = Number(req.params.id)

    const errorCedula = cedulaEsValida(cedula)
    if (errorCedula !== false) {
      return res.status(400).json(errorCedula)
    }

    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'El cuerpo debe ser un arreglo' })
    }

    const usuarioLogueado = res.locals.usuario as Usuario

    // Crear correctamente las vacunas (SIN usar res aquí)
    const vacunas: Vacuna[] = req.body.map((item: any) => {
      if (!Object.values(Vacunas).includes(item.nombre)) {
        throw new Error('Nombre de vacuna inválido')
      }

      const nuevaVacuna: Vacuna = {
        _id: new ObjectId(),
        cedula,
        nombre: item.nombre,
        fecha: new Date(item.fecha),
        lugar: item.lugar,
        vacunadorCedula: usuarioLogueado.cedula,
        agregadoPorRol: usuarioLogueado.rol,
        agregadoPorId: usuarioLogueado._id
      }

      return nuevaVacuna
    })

    await ColVacunas.insertMany(vacunas)

    await ColUsuarios.updateOne(
      { cedula },
      {
        $push: {
          vacunas: { $each: vacunas.map(v => v._id) }
        }
      }
    )

    // Respuesta correctamente tipada
    return res.status(201).json(
      vacunas.map(v => ({
        _id: v._id.toString(),
        cedula: v.cedula,
        nombre: v.nombre,
        fecha: v.fecha.toISOString(),
        lugar: v.lugar,
        vacunadorCedula: v.vacunadorCedula,
        agregadoPorRol: v.agregadoPorRol ?? null,
        agregadoPorId:
          v.agregadoPorId != null
            ? v.agregadoPorId.toString()
            : null
      }))
    )
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ======================================
   7️⃣ PUT – Vacunador y Admin
   ====================================== */

export async function updateVaccine (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [
      Rol.Vacunador,
      Rol.Administrador
    ])

    const id = validarObjectId(req.params.id)

    const { fecha, nombre, lugar }: {
      fecha?: string
      nombre?: string
      lugar?: string
    } = req.body

    const vacuna = await ColVacunas.findOne({ _id: id })

    if (vacuna == null) {
      return res.status(404).json({ error: 'Vacuna no encontrada' })
    }
    const updateFields: Partial<Vacuna> = {}

    if (typeof fecha === 'string') {
      updateFields.fecha = new Date(fecha)
    }

    if (
      typeof nombre === 'string' &&
  Object.values(Vacunas).includes(nombre as Vacunas)
    ) {
      updateFields.nombre = nombre as Vacunas
    }

    if (typeof lugar === 'string') {
      updateFields.lugar = lugar.trim()
    }

    if (Object.keys(updateFields).length > 0) {
      await ColVacunas.updateOne(
        { _id: id },
        { $set: updateFields }
      )
    }

    const vacunaActualizada = await ColVacunas.findOne({ _id: id })

    return res.json(vacunaActualizada)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

/* ======================================
   8️⃣ DELETE – SOLO ADMINISTRADOR
   ====================================== */
export async function deleteVaccine (req: Request, res: Response): Promise<Response> {
  try {
    validarRolParaAcciones(res.locals.usuario.rol, [
      Rol.Administrador
    ])

    const id = validarObjectId(req.params.id)

    await ColVacunas.deleteOne({ _id: id })
    await ColUsuarios.updateMany(
      {},
      { $pull: { vacunas: id } }
    )

    return res.json({ mensaje: 'Vacuna eliminada correctamente' })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

export const obtenerPacientesConVacunas = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // 1️⃣ Obtener pacientes
    const pacientes: Usuario[] = await ColUsuarios
      .find<Usuario>({ rol: Rol.Paciente, isDeleted: false })
      .toArray()

    // 2️⃣ Obtener vacunadores

    const vacunadores: Usuario[] = await ColUsuarios
      .find<Usuario>({
      rol: { $in: [Rol.Vacunador, Rol.Administrador] }
    })
      .toArray()

    // 3️⃣ Obtener vacunas
    const vacunas: Array<WithId<Vacuna>> =
      await ColVacunas.find({}).toArray()

    // 4️⃣ Mapear pacientes por cédula
    const mapaPacientes: Map<number, Usuario> = new Map()
    for (const paciente of pacientes) {
      mapaPacientes.set(paciente.cedula, paciente)
    }

    // 5️⃣ Mapear vacunadores por cédula 🔥
    const mapaVacunadores: Map<number, Usuario> = new Map()
    for (const vacunador of vacunadores) {
      mapaVacunadores.set(vacunador.cedula, vacunador)
    }

    // 6️⃣ Mapear vacunas por paciente
    const mapaVacunas: Map<number, VacunaResponseOtros[]> = new Map()

    for (const vacuna of vacunas) {
      const paciente = mapaPacientes.get(vacuna.cedula)

      const vacunador = mapaVacunadores.get(
        vacuna.vacunadorCedula
      )

      const vacunaConFotos: VacunaResponseOtros = {
        _id: vacuna._id,
        cedula: vacuna.cedula,
        fecha: vacuna.fecha,
        nombre: vacuna.nombre,
        lugar: vacuna.lugar,

        nombrePaciente:
    paciente != null
      ? `${paciente.nombre} ${paciente.apellido}`
      : 'No encontrado',

        fotoPaciente:
    paciente?.foto ?? 'https://placehold.co/200',

        nombreVacunador:
    vacunador != null
      ? `${vacunador.nombre} ${vacunador.apellido}`
      : 'No encontrado',

        fotoVacunador:
    vacunador?.foto ?? 'https://placehold.co/200'
      }

      const listaActual = mapaVacunas.get(vacuna.cedula)

      if (listaActual != null) {
        listaActual.push(vacunaConFotos)
      } else {
        mapaVacunas.set(vacuna.cedula, [vacunaConFotos])
      }
    }

    // 7️⃣ Construir resultado final
    const resultado = pacientes.map((paciente) => ({
      paciente,
      vacunas: mapaVacunas.get(paciente.cedula) ?? []
    }))

    return res.json(resultado)
  } catch (error) {
    return res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
}
