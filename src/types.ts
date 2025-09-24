import { ObjectId } from 'mongodb'

// export type Vacunas = 'Pfizer-BionNTech' | 'Moderna' | 'AztraZeneca' | 'Janssen' | 'Sinopharm'
// cambiar vacunas por enum y mostrar ejemplo de validacion

export enum Vacunas {
  'Pfizer-BionNTech' = 'Pfizer-BionNTech',
  'Moderna' = 'Moderna',
  'AztraZeneca' = 'AztraZeneca',
  'Janssen' = 'Janssen',
  'Sinopharm' = 'Sinopharm'
}

// const nombre = Vacunas['Pfizer-BionNTech'] // ejemplo de uso
// console.log(nombre)

// if (Object.values(Vacunas).includes(nombre)) { // ejemplo de validacion
//   console.log('La vacuna Pfizer-BionNTech es válida')
// }

export interface Vacuna {
  _id: ObjectId
  cedula: number
  fecha: Date
  nombre: Vacunas
  vacunador: string
  lugar: string
}

export interface Usuario {
  _id: ObjectId
  nombre: string
  apellido: string
  foto: string
  cedula: number
  telefono: number
  clave: string
  vacunas: Vacuna[]
}

// Con export type se está creando un alias de tipo llamado FuncError<T>.
// Esto significa que en cualquier archivo donde lo importes podrás usar FuncError<T> como si fuera un tipo definido por TypeScript.
// El <T> indica que es genérico, es decir, que se puede reutilizar con distintos tipos de datos.
// Ejemplo: FuncError<number>, FuncError<string>, FuncError<Usuario>, etc.
// La parte (data: T) => ... significa que este tipo describe una función que:
// Recibe un parámetro llamado data del tipo T (puede ser cualquier cosa, depende de lo que se defina al usarlo).
// Retorna un valor que puede ser false o un objeto con un campo error: string.
// false | { error: string }
// Esto quiere decir que la función puede devolver dos cosas:
// false → indica que no hubo error.
// Un objeto { error: string } → indica que sí hubo un error y lo describe con un mensaje.
// ¿Por qué false y no true?
// Semántica de "no error"
// En lugar de usar true/false como un simple booleano, el desarrollador decidió usar:
// false = “no hay nada que reportar”
// { error: string } = “hay un error y aquí está la explicación”.
// Así, el tipo de retorno no es un boolean, sino una especie de union type (false | objeto).
//  Si fuera true, tendrías que aclarar qué significa el true: ¿es éxito o error? En cambio, false se interpreta como “no hay error” (vacío).
// se cambia esta opcion por validarCuerpo y las demas funciones
export type FuncError<T> = (data: T) => false | { error: string }
