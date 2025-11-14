// Permite leer cookies fácilmente desde req.cookies.
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import Express, { json } from 'express'
import { Collection, Db, MongoClient } from 'mongodb'
import morgan from 'morgan'

import { contarVocales } from './middleware/contarVocalesMiddleware'
import { metodoEnEspanol } from './middleware/metodoEnEspanolMiddleware'
import { mostrarRutaEnFlechas } from './middleware/mostrarRutaEnFlechasMiddleware'
import { sapo } from './middleware/sapoMiddleware'

import authRoute from './routes/authRoute'
import userRoutes from './routes/userRoutes'
import vaccineRoutes from './routes/vaccineRoutes'

import { authVerify } from './middleware/authVerifyMiddleware'
import { Usuario, Vacuna } from './types'

dotenv.config()

const uri = process.env.MONGO_URI as string
const PORT = Number(process.env.PORT ?? 3000)

const cliente = new MongoClient(uri)
let db: Db
export let ColUsuarios: Collection<Usuario>
export let ColVacunas: Collection<Vacuna>

const app = Express()
app.use(cors({ origin: process.env.FRONT_DOMAIN, credentials: true }))// doble signo de pregunta operador ternario de typescript
// Permitir envío de cookies cors({ credentials: true })
// Necesario si tu frontend y backend están en dominios diferentes y quieres enviar cookies.
app.use(json())
app.use(cookieParser()) //  NUEVO: permite leer cookies
app.use(morgan('dev')) // morgan como middleware de logging en el servidor Express

app.use('/api/usuarios', userRoutes)
app.use('/api/vacunas', authVerify, vaccineRoutes)
app.use('/auth', authRoute)

app.use(sapo) // middleware de prueba
app.use(contarVocales) // middleware de practica
app.use(metodoEnEspanol)// middleware de practica
app.use(mostrarRutaEnFlechas)// middleware de practica

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
