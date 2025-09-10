
export function cedulaEsValida (cedula: number): false | { error: string } {
  if (cedula <= 0 || cedula.toString().length < 5 || cedula.toString().length > 10) {
    return { error: 'La cedula debe ser un numero positivo de entre 5 y 10 digitos' }
  }
  return false
}
