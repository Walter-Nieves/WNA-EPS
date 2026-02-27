import { Router } from 'express'
import multer from 'multer'
import { deleteEnumVaccines, getAllEnumVaccines, postEnumVaccines, putEnumVaccines, restoreEnumVaccines } from '../controller/enumVaccineController'
const subir = multer({ limits: { fieldSize: 15 * 1024 * 1024 } })

const router = Router()

router.get('/', getAllEnumVaccines)
router.post('/', subir.single('foto'), postEnumVaccines)
router.put('/:id', subir.single('foto'), putEnumVaccines)
router.delete('/:id', deleteEnumVaccines)
router.patch('/:id/restore', restoreEnumVaccines)

export default router
