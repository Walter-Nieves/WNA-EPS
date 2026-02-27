import dotenv from 'dotenv'
import { Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { ColUsuarios } from '..'
import { FuncError, Rol, ServerFile } from '../types'

dotenv.config()

const SECRETO: string = process.env.JWT_SECRET as string

export const cedulaEsValida: FuncError<number> = (cedula) => {
  if (cedula <= 0 || cedula.toString().length < 5 || cedula.toString().length > 10) {
    return { error: 'La cedula debe ser un numero positivo de entre 5 y 10 digitos' }
  }
  return false
}

export const telefonoEsValido: FuncError<number> = (telefono) => {
  if (telefono <= 0 || telefono.toString().length !== 10) {
    return { error: 'El telefono debe ser un numero positivo de 10 digitos' }
  }
  return false
}

export const imagenEsValida: FuncError<string> = (foto) => {
  if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|avif|webp|bmp)$/.test(foto)) {
    return { error: 'La foto debe ser una URL válida de una imagen' }
  }
  return false
}

export const nombreEsValido: FuncError<[string, string]> = ([nombre, apellido]) => {
  if (!/^[a-zA-Z\s]+$/.test(nombre) || !/^[a-zA-Z\s]+$/.test(apellido)) {
    return { error: 'El nombre y el apellido solo pueden contener letras y espacios' }
  }
  return false
}

export const propiedadesSonNulas: FuncError<unknown[]> = (propiedades) => {
  for (const prop of propiedades) {
    if (prop == null) {
      return { error: 'Faltan datos' }
    }
  }
  return false
}

export const sonTipoCorrecto: FuncError<{ valores: unknown[], tipos: string[] }> = ({ valores, tipos }) => {
  for (let i = 0; i < valores.length; i++) {
    // eslint-disable-next-line valid-typeof
    if (typeof valores[i] !== tipos[i]) {
      return { error: `El valor ${String(valores[i])} debe ser del tipo ${tipos[i] as string}` }
    }
  }
  return false
}
// Error intecional para manejar errores en las rutas
export function resError (codigo: number, mensaje: string): never {
  throw new Error(JSON.stringify({ codigo, mensaje }))
}

export function validarCuerpo (cuerpo: unknown, debeSerArray: boolean): object | never {
  if (cuerpo == null) {
    resError(400, 'Falta un cuerpo en la peticion')
  }
  if (typeof cuerpo !== 'object') {
    resError(400, 'El cuerpo de la peticion no es valido')// pregunto si es [] o {}
  }
  if (!debeSerArray && Array.isArray(cuerpo)) { // error si necesito un {} pero reibo un []
    resError(400, 'El cuerpo de la solicitud debe ser un objeto')
  }
  if (debeSerArray && !Array.isArray(cuerpo)) { // error si necesito un [] pero reibo un {}
    resError(400, 'El cuerpo de la solicitud debe ser un arreglo')
  }

  return cuerpo
}

export function responseToError (error: Error, res: Response): Response {
  console.log('prueba')
  console.log(error)
  if (error.message.startsWith('{')) {
    const objetoError = JSON.parse(error.message)
    return res.status(objetoError.codigo).json(objetoError.mensaje)
  }
  return res.status(500).json({ error: 'Error interno en el servidor' })
}

export function validarToken (token: string): JwtPayload | never {
  // verificamos el token que este bien hecho
  try {
    const decodificado = jwt.verify(token, SECRETO) as JwtPayload
    return decodificado
  } catch (error) {
    // este try-catch solo maneja errores del jwt.verify
    resError(401, 'Token de autenticación inválido o expirado')
  }
}

function sanitizarString (valor: string): string {
  return valor
    .trim() // quitar espacios al inicio/fin
    .replace(/\s{2,}/g, ' ') // reducir múltiples espacios a uno
}

export function validarCampo (campo: string, valor: unknown): string | never {
  if (typeof valor !== 'string') {
    resError(400, `${campo} debe ser un string`)
  }

  const limpio = sanitizarString(valor)

  if (limpio === '') {
    resError(400, `${campo} no puede estar vacío`)
  }

  if (limpio.length < 2) {
    resError(400, `${campo} debe tener al menos 2 caracteres`)
  }

  if (!/^(?!.*\s{2})[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(limpio)) {
    resError(400, `${campo} solo puede contener letras y espacios (no se permiten dos espacios seguidos)`)
  }

  return limpio
}
export function validarNombreApellido (nombre: unknown, apellido: unknown): { nombre: string, apellido: string } | never {
  // --- función auxiliar para validar ---

  // --- validaciones ---
  const nombreLimpio = validarCampo('nombre', nombre)
  const apellidoLimpio = validarCampo('apellido', apellido)

  // --- concatenar ---
  const nombreCompleto = {
    nombre: nombreLimpio,
    apellido: apellidoLimpio
  }

  return nombreCompleto
}

export function validarNombres (propiedad: string, valor: unknown): never | string {
  if (valor == null) {
    resError(400, `Falta el ${propiedad} en el cuerpo de la solicitud`)
  }

  if (typeof valor !== 'string') {
    resError(400, `El ${propiedad} debe ser una cadena de texto`)
  }

  let valor2 = valor.trim()
  valor2 = valor2.replace(/\s{2,}/g, ' ')

  if (valor2.length < 3 || valor2.length > 50) {
    resError(400, 'El nombre debe tener entre 3 y 50 caracteres')
  }

  valor2 = valor2.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return valor2
}

export function validarFoto (foto: unknown): never | string {
  if (foto == null) {
    resError(400, 'Falta la foto en el cuerpo de la solicitud')
  }
  if (typeof foto !== 'object') {
    resError(400, 'Formato de foto inválido: se esperaba un objeto')
  }

  const f: ServerFile = foto as ServerFile

  if (typeof f.fieldname !== 'string' || f.fieldname.trim() === '') {
    resError(400, "Propiedad 'fieldname' inválida o faltante")
  }

  if (typeof f.originalname !== 'string' || f.originalname.trim() === '') {
    resError(400, "Propiedad 'originalname' inválida o faltante")
  }

  if (typeof f.encoding !== 'string' || f.encoding.trim() === '') {
    resError(400, "Propiedad 'encoding' inválida o faltante")
  }

  if (typeof f.mimetype !== 'string' || f.mimetype.trim() === '') {
    resError(400, "Propiedad 'mimetype' inválida o faltante")
  }

  if (typeof f.size !== 'number' || !Number.isFinite(f.size) || f.size < 0) {
    resError(400, "Propiedad 'size' inválida o faltante")
  }
  if (!Buffer.isBuffer(f.buffer)) {
    resError(400, "Propiedad 'buffer' inválida o faltante")
  }
  return fromMulterToUri(f)
}
export function fromMulterToUri (serverFile: ServerFile): string {
  return `data:${serverFile.mimetype};base64,${serverFile.buffer.toString('base64')}`
}

export function validarClave (clave: unknown): string | never {
  if (typeof clave !== 'string') {
    resError(400, 'La clave debe ser un string')
  }

  const limpio = sanitizarString(clave)

  if (limpio === '') {
    resError(400, 'La clave no puede estar vacía')
  }

  if (limpio.length < 6) {
    resError(400, 'La clave debe tener al menos 6 caracteres')
  }

  return limpio
}

export function validarTelefono (telefono: unknown): string {
  if (telefono == null) {
    return resError(400, 'Falta el teléfono en el cuerpo de la solicitud')
  }

  if (typeof telefono !== 'string') {
    return resError(400, 'El teléfono debe ser texto')
  }

  const tel = telefono.trim().toLowerCase()

  if (!/^[0-9\s()+ext]+$/i.test(tel)) {
    return resError(400, 'El teléfono contiene caracteres inválidos')
  }

  const extMatches = tel.match(/ext/g) ?? []
  if (extMatches.length > 1) {
    return resError(400, "La palabra 'ext' solo se puede usar una vez")
  }

  const plusMatches = tel.match(/\+/g) ?? []
  if (plusMatches.length > 1) {
    return resError(400, "Solo se permite un '+'")
  }

  const openParMatches = tel.match(/\(/g) ?? []
  const closeParMatches = tel.match(/\)/g) ?? []

  if (openParMatches.length > 1 || closeParMatches.length > 1) {
    return resError(400, 'Solo se permite un paréntesis de apertura y cierre')
  }

  if (tel.length < 10) {
    return resError(400, 'El teléfono es demasiado corto')
  }

  return tel
}

// Unexpected nullable object value in conditional. An explicit null check is reqired
// la propiedad 'length' no existe en el tipo 'true | never[]'.la propiedad 'length ' no existe en el tipo 'true'.
// la propiedad 'length' no existe en el tipo 'true | never[]'.la propiedad 'length ' no existe en el tipo 'true'.

export async function validarCedula (cedula: unknown, deberiaExistir: boolean): never | Promise<number> {
  if (cedula == null) {
    resError(400, 'La cédula es obligatoria')
  }
  console.log(cedula)
  console.log(typeof cedula)
  const cedulaNumerica = Number(cedula)
  if (typeof cedulaNumerica !== 'number' || Number.isNaN(cedulaNumerica) || !Number.isInteger(cedulaNumerica)) {
    resError(400, 'La cédula debe ser un número entero')
  }

  if (cedulaNumerica <= 0 || cedulaNumerica.toString().length < 5 || cedulaNumerica.toString().length > 10) {
    resError(400, 'La cédula debe tener entre 5 y 10 dígitos')
  }
  // Llama a la función existeCedula para verificar en la base de datos si la cédula ya existe.
  // existe será true o false.
  const existe = await existeCedula(cedulaNumerica)
  // Si la cédula ya existe en la DB pero no debería existir (ejemplo: registrar un nuevo usuario con una cédula repetida), devuelve error.
  if (existe && !deberiaExistir) {
    resError(409, 'La cedula ya esta registrada')
  }
  // Si la cédula no existe en la DB pero sí debería existir (ejemplo: actualizar/eliminar un usuario que no está registrado), devuelve error.
  if (!existe && deberiaExistir) {
    resError(404, 'La cedula no esta registrada')
  }
  // Si pasó todas las validaciones, retorna el número de la cédula.
  return cedulaNumerica
}

async function existeCedula (cedula: number): Promise<boolean> | never {
  const cedulaExistente = await ColUsuarios.findOne({ cedula })
  return cedulaExistente != null
}

// --- validar ObjectId (para DELETE y PUT) ---
export function validarObjectId (id: unknown): ObjectId | never {
  if (typeof id !== 'string') {
    resError(400, '_id debe ser un string')
  }

  if (!ObjectId.isValid(id)) {
    resError(400, '_id no es un ObjectId válido')
  }

  return new ObjectId(id)
}

// --- validar clave para actualizaciones (clave vieja y nueva) ---
export function validarClavesActualizacion (claveVieja: unknown, claveNueva: unknown): { claveVieja: string, claveNueva: string } | never {
  if (typeof claveVieja !== 'string' || typeof claveNueva !== 'string') {
    resError(400, 'Ambas claves deben ser strings')
  }

  const limpiaVieja = sanitizarString(claveVieja)
  const limpiaNueva = sanitizarString(claveNueva)

  if (limpiaVieja === '' || limpiaNueva === '') {
    resError(400, 'Las claves no pueden estar vacías')
  }

  if (limpiaNueva.length < 6) {
    resError(400, 'La clave nueva debe tener al menos 6 caracteres')
  }

  return { claveVieja: limpiaVieja, claveNueva: limpiaNueva }
}

// --- validar cuerpo para PUT ---
export function validarCuerpoActualizacion (cuerpo: any): void | never {
  if (typeof cuerpo !== 'object' || cuerpo == null || Array.isArray(cuerpo)) {
    resError(400, 'El cuerpo de la solicitud debe ser un objeto válido')
  }

  if (!Object.hasOwn(cuerpo, '_id') && !Object.hasOwn(cuerpo, 'cedula')) {
    resError(400, 'Debe enviarse _id o cedula para actualizar el usuario')
  }
}

export function validarRolParaAcciones (rolActual: Rol, rolEsperado: Rol[]): never | void {
  if (!rolEsperado.includes(rolActual)) {
    resError(403, 'Tu Rol no tiene permisos para realizar esta acción')
  }
}

export function validarRolDelBody (rolRecibido: unknown, rolEsperado: Rol[]): never | Rol {
// Rol del body si existe
  if (rolRecibido == null) {
    resError(400, 'El rol es obligatorio en el cuerpo de la solicitud')
  }
  if (!Object.values(Rol).includes(rolRecibido as Rol)) {
    resError(400, 'El rol no es válido')
  }
  if (!rolEsperado.includes(rolRecibido as Rol)) {
    resError(403, 'Tu Rol no esta hecho para realizar esta acción')
  }
  return rolRecibido as Rol
}
