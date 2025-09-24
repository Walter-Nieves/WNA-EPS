import { ObjectId } from 'mongodb'
import { ColUsuarios } from '..'
import { FuncError } from '../types'

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

// export const confirmarClave: FuncError<{ vieja: string, nueva: string }> = ({ vieja, nueva }) => {
//   if (vieja !== nueva) {
//     return { error: 'Las claves no coinciden' }
//   }
//   return false
// }

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

function sanitizarString (valor: string): string {
  return valor
    .trim() // quitar espacios al inicio/fin
    .replace(/\s{2,}/g, ' ') // reducir múltiples espacios a uno
}

export function validarNombreApellido (nombre: unknown, apellido: unknown): { nombre: string, apellido: string } | never {
  // --- función auxiliar para validar ---
  function validarCampo (campo: string, valor: unknown): string | never {
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

export function validarFoto (foto: unknown): string | never {
  if (typeof foto !== 'string') {
    resError(400, 'La foto debe ser un string')
  }

  const limpio = sanitizarString(foto)

  if (limpio === '') {
    resError(400, 'La foto no puede estar vacía')
  }

  // validar que sea URL válida y que termine en una extensión permitida
  const regex = /^(https?:\/\/.*\.(jpg|jpeg|png|gif|avif|webp|bmp))$/i
  if (!regex.test(limpio)) {
    resError(400, 'La foto debe ser una URL válida con extensión de imagen')
  }

  return limpio
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

export function validarTelefono (telefono: unknown): number | never {
  if (typeof telefono !== 'number' || isNaN(telefono)) {
    resError(400, 'El teléfono debe ser un número')
  }
  // convertimos el valor de la variable telefono a un string (cadena de texto) para poder hacer la validacion de la cantirdad de digitos
  const telefonoStr = String(telefono)

  if (telefono <= 0) {
    resError(400, 'El teléfono debe ser mayor a cero')
  }

  if (telefonoStr.length !== 10) {
    resError(400, 'El teléfono debe tener exactamente 10 dígitos')
  }
  return telefono
}

// cuerpo: un objeto (generalmente será el req.body de una petición HTTP).
// deberiaExistir: un booleano que indica si la cédula debería estar ya registrada en la base de datos.
// Devuelve un Promise<number> si la validación es correcta o never si lanza un error con resError.
export async function validarCedula (cuerpo: object, deberiaExistir: boolean): never | Promise<number> {
  // Verifica si el objeto cuerpo tiene la propiedad cedula directamente (sin heredarla de su prototipo).
  if (Object.hasOwn(cuerpo, 'cedula')) {
    // Se usa (cuerpo as any) para que TypeScript no se queje por no conocer la estructura exacta del objeto.
    const cedula = (cuerpo as any).cedula
    if (typeof cedula !== 'number' || isNaN(cedula)) {
      resError(400, 'La cédula debe ser un número')
    }

    if (cedula <= 0 || cedula.toString().length < 5 || cedula.toString().length > 10) {
      resError(400, 'La cédula debe tener entre 5 y 10 dígitos')
    }
    // Llama a la función existeCedula para verificar en la base de datos si la cédula ya existe.
    // existe será true o false.
    const existe = await existeCedula(cedula)
    // Si la cédula ya existe en la DB pero no debería existir (ejemplo: registrar un nuevo usuario con una cédula repetida), devuelve error.
    if (existe && !deberiaExistir) {
      resError(400, 'La cedula ya esta registrada')
    }
    // Si la cédula no existe en la DB pero sí debería existir (ejemplo: actualizar/eliminar un usuario que no está registrado), devuelve error.
    if (!existe && deberiaExistir) {
      resError(400, 'La cedula no esta registrada')
    }
    // Si pasó todas las validaciones, retorna el número de la cédula.
    return cedula
  }
  resError(400, 'Falta la cedula en el cuerpo de la solicitud')
}

// Define una función auxiliar que recibe un número cedula y busca en la colección ColUsuarios si hay algún documento con esa cédula.
// Devuelve true si existe, false si no.
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

  if (limpiaVieja === limpiaNueva) {
    resError(400, 'La clave nueva no puede ser igual a la clave vieja')
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
