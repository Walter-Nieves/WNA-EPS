import { Router } from 'express'
import {
  deleteVaccine,
  getAllVaccines,
  getMyVaccines,
  getOtherVaccines,
  getVaccineByIdOrCedula,
  obtenerPacientesConVacunas,
  postMultipleVaccines,
  postVaccine,
  updateVaccine
} from '../controller/vaccineController'
import { authVerify } from '../middleware/authMiddleware'

const vaccineRoutes = Router()

vaccineRoutes.get('/', authVerify(true), getAllVaccines)
vaccineRoutes.get('/me', authVerify(true), getMyVaccines)
vaccineRoutes.get('/others/:cedula', authVerify(true), getOtherVaccines)
vaccineRoutes.get('/pacientes-con-vacunas', authVerify(true), obtenerPacientesConVacunas)
vaccineRoutes.get('/:id', authVerify(true), getVaccineByIdOrCedula)

vaccineRoutes.post('/:id', authVerify(true), postVaccine)
vaccineRoutes.post('/:id/multiples', authVerify(true), postMultipleVaccines)

vaccineRoutes.put('/:id', authVerify(true), updateVaccine)
vaccineRoutes.delete('/:id', authVerify(true), deleteVaccine)

export default vaccineRoutes
