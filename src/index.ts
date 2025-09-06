import cors from 'cors'
import dotenv from 'dotenv'
import Express, { json } from 'express'
import { Collection, Db, MongoClient } from 'mongodb'
import usuarios from './routes/usuarios'
import vacunas from './routes/vacunas'
import { Usuario, Vacuna } from './types'

dotenv.config()

const uri = process.env.MONGO_URI as string
const cliente = new MongoClient(uri)
let db: Db
export let ColUsuarios: Collection<Usuario>
export let ColVacunas: Collection<Vacuna>

const app = Express()
app.use(cors())
app.use(json())
app.use('/api/usuarios', usuarios)
app.use('/api/vacunas', vacunas)

const PORT = Number(process.env.PORT ?? 3000)

app.get('/ping', (_, res) => {
  res.send('pong')
})

async function conectar (): Promise<void> {
  try {
    await cliente.connect()
    console.log('Conectado a MongoDB')

    const database = process.env.MONGO_DB as string
    db = cliente.db(database)

    const colleccionUsuarios = process.env.MONGO_COL_USER as string
    ColUsuarios = db.collection(colleccionUsuarios)

    const colleccionVacunas = process.env.MONGO_COL_VAC as string
    ColVacunas = db.collection(colleccionVacunas)

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error(error)
  }
}

void conectar()
