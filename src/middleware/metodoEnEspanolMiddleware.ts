import { NextFunction, Request, Response } from 'express'

// hacer un middleware que diga el metodo usado en español
// GET => Quieres obtener algo
// POST => Quieres agregar algo
// PUT => Quieres modificar algo
// PATCH => Quieres corregir algo
// DELETE => Quieres borrar algo
// OTROS =>Que quieres que haga
export function metodoEnEspanol (req: Request, res: Response, next: NextFunction): void {
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
