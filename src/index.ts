import cors from 'cors'
import dotenv from 'dotenv'
import Express, { json, NextFunction, Request, Response } from 'express'
import { Collection, Db, MongoClient } from 'mongodb'
import morgan from 'morgan'
import login from './routes/logins'
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
app.use(morgan('dev')) // morgan como middleware de logging en el servidor Express

app.use(sapo) // middleware de prueba
app.use(contarVocales) // middleware de practica
app.use(metodoEnEspanol)// middleware de practica
app.use(mostrarRutaEnFlechas)// middleware de practica

app.use('/api/usuarios', usuarios)
app.use('/api/vacunas', vacunas)
app.use('/api/login', login)

function sapo (req: Request, res: Response, next: NextFunction): void {
  console.log(`Alguien hizo una peticion en${req.url}`)
  console.log(`La peticion fue del tipo ${req.method}`)
  console.log('Cuidado')
  next()
}

// hacer un middleware que diga el metodo usado en español
// GET => Quieres obtener algo
// POST => Quieres agregar algo
// PUT => Quieres modificar algo
// PATCH => Quieres corregir algo
// DELETE => Quieres borrar algo
// OTROS =>Que quieres que haga
function metodoEnEspanol (req: Request, res: Response, next: NextFunction): void {
  const mensajes: Record<string, string> = { // Creamos un diccionario que asocia cada método HTTP con su descripción en español.
    GET: 'Quieres obtener algo',
    POST: 'Quieres agregar algo',
    PUT: 'Quieres modificar algo',
    PATCH: 'Quieres corregir algo',
    DELETE: 'Quieres borrar algo'
  }

  // Verifica si el método existe en el objeto mensajes, si no => "OTROS"
  const mensaje = mensajes[req.method] ?? '¿Qué quieres que haga?' // Si req.method existe en mensajes, usamos su valor.

  console.log(`➡️ Método usado: ${req.method} → ${mensaje}`)

  next()
}

// crear un middleware que cuente las vocales por separado y al final diga cuantas vocales son
function contarVocales (req: Request, res: Response, next: NextFunction): void {
  const url = req.url.toLowerCase() // pasamos a minúscula para evitar problemas

  // Inicializamos el contador de cada vocal
  const contador = {
    a: 0,
    e: 0,
    i: 0,
    o: 0,
    u: 0,
    total: 0
  }

  // Recorremos cada carácter de la URL
  for (const char of url) {
    if ('aeiou'.includes(char)) { // Preguntamos: ¿el carácter actual (char) está dentro del string "aeiou"?
      contador[char as keyof typeof contador]++ // contador[char] accede dinámicamente a la vocal que encontramos. se usa as keyof typeof contador para decirle "confía, este valor sí es una key del objeto contador".
      contador.total++
    }
  }

  // Mostramos en consola el resultado
  console.log(`🔎 Vocales en la URL "${req.url}":`, contador)

  next() // sigue con el siguiente middleware o ruta
}

// hacer un middleware que muestre la ruta completa pero en vez ce / lo reemplaza por > y se imprima asi por ejemplo la ruta es
//  /api/pokemon/pikachu/poder/attacktrueno debe dar de resultado >api >>pokemon >>>pikchu >>>>poder >>>>>attacktrueno
function mostrarRutaEnFlechas (req: Request, res: Response, next: NextFunction): void {
  // Tomamos la URL completa (sin query params)
  const url = req.path

  // Quitamos el primer "/" y separamos por "/" ,split Divide la cadena en partes:
  // filter(Boolean) Elimina strings vacíos (el primero es vacío por el / inicial).
  const partes = url.split('/').filter(Boolean)

  // Recorremos cada parte y vamos agregando flechas
  partes.forEach((parte, index) => {
    console.log(`${'>'.repeat(index + 1)}${parte}`)
  })

  next()
}

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
