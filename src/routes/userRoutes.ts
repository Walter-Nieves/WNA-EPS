
// routes/userRoutes.ts
import { Router } from 'express'
import multer from 'multer'
import { actualizarUsuario, actualizarUsuarioMe, crearUsuario, eliminarUsuario, eliminarUsuarioForce, obtenerUsuarioActivo, obtenerUsuarioActual, obtenerUsuarioEliminado, obtenerUsuarioPorId, obtenerUsuarios, restaurarUsuario } from '../controller/userController'
import { authVerify } from '../middleware/authMiddleware'

const subir = multer({ limits: { fileSize: 15 * 1024 * 1024 } }) // 15 MB
const userRoutes = Router()

// 🔹 Obtener todos los usuarios
userRoutes.get('/', authVerify(true), obtenerUsuarios)

// 🔹 Crear nuevo usuario
// Esa parte subir.single('foto') pertenece al middleware Multer, que se usa para manejar subidas de archivos
//  (imágenes, PDFs, etc.) desde un formulario o una petición POST y PUT con multipart/form-data.
userRoutes.post('/', authVerify(false), subir.single('foto'), crearUsuario)

userRoutes.put('/me', authVerify(true), subir.single('foto'), actualizarUsuarioMe)

// 🔹 Obtener usuario autenticado (/me)
userRoutes.get('/me', authVerify(true), obtenerUsuarioActual)

// 🔹 Buscar usuario activo
userRoutes.get('/activo/:cedula', authVerify(true), obtenerUsuarioActivo)

// 🔹 Buscar usuario eliminado
userRoutes.get('/eliminado/:cedula', authVerify(true), obtenerUsuarioEliminado)

userRoutes.patch('/restore/:id/', authVerify(true), restaurarUsuario)

// 🔹 Eliminar usuario
userRoutes.delete('/soft/:id', authVerify(true), eliminarUsuario)
userRoutes.delete('/force/:id', authVerify(true), eliminarUsuarioForce)

// 🔹 ESTA SIEMPRE VA DE ÚLTIMA
// 🔹 Obtener usuario por ID o cédula
userRoutes.get('/:id', authVerify(true), obtenerUsuarioPorId)

// 🔹 Actualizar usuarioEs un middleware de Multer //Se usa en una ruta POST/PUT //Espera un archivo con el campo "foto"
// Guarda la info del archivo en req.file //Permite validar o guardar imágenes en el servidor o base de datos
userRoutes.put('/:id', authVerify(true), subir.single('foto'), actualizarUsuario)

// las rutas con /:param siempre al final
export default userRoutes
