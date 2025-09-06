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
