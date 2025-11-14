
import { Router } from 'express'
import { login, refresh } from '../controller/authController'

const authRoute = Router()
// Nuevo: para crear token seguro
authRoute.post('/login', login)
authRoute.post('/refresh', refresh)

export default authRoute

// dotenv.config()

//   try {

//     // NUEVO: Eliminamos la contraseña del usuario antes de responder
//     const { clave: _, _id, ...usuarioSinClave } = posibleUsuario

//     // 🟦 NUEVO: Generar token JWT
//     const token = jwt.sign(
//       { id: _id.toString(), cedula: posibleUsuario.cedula },
//       process.env.JWT_SECRET ?? 'clave_secreta',
//       { expiresIn: '1h' }
//     )

//     // NUEVO: Configurar cookie HttpOnly
//     res.cookie('token', token, {
//       httpOnly: true, // 🔒 No accesible por JS
//       secure: process.env.NODE_ENV === 'production', // 🧱 Solo HTTPS en producción
//       sameSite: 'lax', // Permite navegación entre dominio frontend-backend
//       maxAge: 2 * 60 * 1000, // 2 minutos
//       path: '/' // Disponible en todo el sitio => asegura que la cookie se envíe en todas las rutas
//     })

//     //  NUEVO: Respuesta segura sin incluir clave
//     return res.json({
//       mensaje: 'Bienvenido',
//       info: { ...usuarioSinClave, _id: _id.toString() }
//     })
//   } catch (error) {
//     const e = error as Error
//     if (e.message.startsWith('{')) {
//       const objetoError = JSON.parse(e.message)
//       return res.status(objetoError.codigo).json(objetoError.mensaje)
//     }
//     return res.status(500).json({ error: 'Error interno en el servidor' })
//   }
// })

// login.get('/perfil', async (req, res) => {
//   try {
//     // 🟦 Verificar que exista la cookie con el token
//     const token = req.cookies?.token

//     if (typeof token !== 'string') {
//       return resError(401, 'No se proporcionó token de autenticación')
//     }

//     // Verificar y decodificar el token JWT
//     const payload = jwt.verify(
//       token,
//       process.env.JWT_SECRET ?? 'clave_secreta'
//     ) as JwtPayload

//     // TypeScript fix:
//     // Definimos un type guard para asegurar que el payload tiene la propiedad "id"
//     if (!('id' in payload) || typeof payload.id !== 'string') { // ✅ FIX: validación tipada
//       console.error('El token no contiene un campo id válido:', payload)
//       return resError(400, 'Token inválido: falta id de usuario')
//     }

//     // Buscar al usuario en la base de datos (Mongo usa ObjectId)
//     const usuario: Usuario | null = await ColUsuarios.findOne({
//       _id: new ObjectId(payload.id) // ✅ ahora TS sabe que es string
//     })

//     if (usuario == null) {
//       return resError(404, 'Usuario no encontrado')
//     }

//     // Eliminar campos sensibles antes de responder
//     const { clave: _, ...usuarioSinClave } = usuario

//     return res.json({
//       mensaje: 'Perfil obtenido correctamente',
//       info: usuarioSinClave
//     })
//   } catch (error) {
//     const e = error as Error
//     console.error('❌ Error en /api/perfil:', e.message)

//     if (e instanceof jwt.JsonWebTokenError) {
//       return resError(401, 'Token de autenticación inválido o expirado')
//     }

//     if (e instanceof TypeError && e.message.includes('ObjectId')) {
//       return resError(400, 'ID de usuario inválido en el token')
//     }

//     return resError(500, 'Error interno en el servidor')
//   }
// })

// login.post('/', async (req, res) => {
//   try {
//     const body = req.body
//     validarCuerpo(body, false)
//     const cedula = await validarCedula(body.cedula, true)
//     const clave = validarClave(body.clave)
//     const posibleUsuario: Usuario | null = await ColUsuarios.findOne({ cedula })
//     if (posibleUsuario == null) {
//       return res.status(404).json({ error: 'La cédula no está registrada' })
//     }
//     const esValida = await bcrypt.compare(clave, posibleUsuario.clave)
//     if (!esValida) {
//       return res.status(401).json({ error: 'La clave ingresada no coincide con la registrada' })
//     }

// const usuarioRetornar: Omit <Usuario, 'clave' | '_id'> = posibleUsuario

// if (posibleUsuario.clave !== clave) {
//   return res.status(401).json({ error: 'La clave ingresada no coincide con la registrada' })
// }
//   res.json({
//     mensaje: 'Bienvenido',
//     info: { ...usuarioRetornar, _id: posibleUsuario._id.toString() }
//   })
// } catch (error) {
//   const e = error as Error
//   if (e.message.startsWith('{')) {
//     const objetoError = JSON.parse(e.message)
//     return res.status(objetoError.codigo).json(objetoError.mensaje)
//   }
//   return res.status(500).json({ error: 'Error interno en el servidor' })
// }

// if (req.body == null || typeof req.body !== 'object' || Array.isArray(req.body)) {
//   res.status(400).json({ error: 'Falta el cuerpo de la peticion' })
// }

// const { cedula, clave } = req.body

// if (cedula == null || clave == null) {
//   return res.status(400).json({ error: 'Tipo de datos invalidos' })
// }

// const errorCedula = cedulaEsValida(cedula); if (errorCedula !== false) return res.status(400).json(errorCedula)
