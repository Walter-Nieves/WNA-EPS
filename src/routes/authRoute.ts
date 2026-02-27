
import { Router } from 'express'
import { login, logout, refresh } from '../controller/authController'

const authRoute = Router()
// Nuevo: para crear token seguro
authRoute.post('/login', login)
authRoute.post('/refresh', refresh)
authRoute.post('/logout', logout)

export default authRoute
