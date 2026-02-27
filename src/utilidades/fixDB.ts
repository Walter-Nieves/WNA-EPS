import { writeFile } from 'fs/promises'
import { Collection, Db, MongoClient } from 'mongodb'
import { Rol, Usuario, Vacuna } from '../types'

const uri = 'mongodb+srv://nievesw51:72009692@cluster0.ck9ryrs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// mongoDB
const cliente = new MongoClient(uri)
let db: Db
export let ColUsuarios: Collection<Usuario>
export let ColVacunas: Collection<Vacuna>

void async function traerDatos (): Promise<void> {
  try {
    await cliente.connect()
    console.log('Conectado a MongoDB')

    db = cliente.db('VacunasWNA')

    ColUsuarios = db.collection('Usuarios')

    ColVacunas = db.collection('Vacunas')

    const todoslosUsuarios = await ColUsuarios.find().toArray()

    const convertirAJson = JSON.stringify(todoslosUsuarios, null, 2)
    // guardar en un archivo
    await writeFile('./backup.json', convertirAJson, { encoding: 'utf8' })
  } catch (error) {
    console.error(error)
  }
}

export async function agregarRol (rol: Rol): Promise<void> {
  try {
    await cliente.connect()
    console.log('Conectado a MongoDB')
    db = cliente.db('VacunasWNA')
    ColUsuarios = db.collection('Usuarios')
    ColVacunas = db.collection('Vacunas')

    const resultado = await ColUsuarios.updateMany(
      { },
      { $rename: { Rol: 'rol' } }
    )
    if (resultado.modifiedCount === 0) {
      console.log('No se actualizaron documentos')
    } else {
      console.log('Actualizacion exitosa')
    }
    return await Promise.resolve()
  } catch (error) {

  }
}
void agregarRol(Rol.Paciente)
