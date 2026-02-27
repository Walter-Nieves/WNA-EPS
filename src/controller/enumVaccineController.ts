import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { colEnumVaccines } from '..'
import { enumVaccine, Rol } from '../types'
import { resError, responseToError, validarCampo, validarCuerpo, validarFoto, validarRolParaAcciones } from '../utilidades/validaciones'

export async function getAllEnumVaccines (_: Request, res: Response): Promise<Response> {
  try {
    const resultado = await colEnumVaccines.find().toArray() as enumVaccine[]
    return res.json(resultado)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}
export async function postEnumVaccines (req: Request, res: Response): Promise<Response> {
  try {
    const body = req.body
    validarCuerpo(body, false)
    const nombre = validarCampo('nombre', body.nombre)
    const foto = validarFoto(req.file)
    const _id = new ObjectId()

    const nuevaVacuna: enumVaccine = {
      _id,
      nombre,
      foto,
      isDeleted: false
    }
    return res.json(nuevaVacuna)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}
export async function putEnumVaccines (req: Request, res: Response): Promise<Response> {
  try {
    validarRolParaAcciones(
      res.locals.usuario.rol,
      [
        Rol.Administrador
      ]
    )

    const id = req.params.id as string
    const posibleEnumVacuna = await colEnumVaccines.findOne({ _id: new ObjectId(id) }) as enumVaccine

    if (posibleEnumVacuna == null) {
      return resError(404, 'Vacuna no encontrada')
    }
    const body = req.body
    validarCuerpo(body, false)
    const nombre = validarCampo('nombre', body.nombre)
    const foto = validarFoto(req.file)
    const vacunaActualizada: Omit<enumVaccine, '_id'> = {
      nombre,
      foto,
      isDeleted: false
    }

    const result = await colEnumVaccines.updateOne({ _id: new ObjectId(id) }, { $set: vacunaActualizada })
    if (result.modifiedCount === 0) {
      return resError(404, 'Vacuna no encontrada')
    }
    return res.json(vacunaActualizada)
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

export async function deleteEnumVaccines (req: Request, res: Response): Promise<Response> {
  try {
    validarRolParaAcciones(
      res.locals.usuario.rol,
      [Rol.Administrador]
    )

    const id = req.params.id as string

    const vacuna = await colEnumVaccines.findOne({
      _id: new ObjectId(id),
      isDeleted: false
    }) as enumVaccine

    if (vacuna == null) {
      return resError(404, 'Vacuna no encontrada')
    }

    const result = await colEnumVaccines.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true } }
    )

    if (result.modifiedCount === 0) {
      return resError(400, 'No se pudo eliminar la vacuna')
    }

    return res.json({ message: 'Vacuna eliminada correctamente' })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

export async function restoreEnumVaccines (req: Request, res: Response): Promise<Response> {
  try {
    validarRolParaAcciones(
      res.locals.usuario.rol,
      [Rol.Administrador]
    )

    const id = req.params.id as string

    const vacuna = await colEnumVaccines.findOne({
      _id: new ObjectId(id),
      isDeleted: true
    }) as enumVaccine

    if (vacuna == null) {
      return resError(404, 'Vacuna no encontrada o ya está activa')
    }

    const result = await colEnumVaccines.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: false } }
    )

    if (result.modifiedCount === 0) {
      return resError(400, 'No se pudo restaurar la vacuna')
    }

    return res.json({ message: 'Vacuna restaurada correctamente' })
  } catch (error) {
    return responseToError(error as Error, res)
  }
}
