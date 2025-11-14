import { NextFunction, Request, Response } from 'express'

// hacer un middleware que muestre la ruta completa pero en vez ce / lo reemplaza por > y se imprima asi por ejemplo la ruta es
//  /api/pokemon/pikachu/poder/attacktrueno debe dar de resultado >api >>pokemon >>>pikchu >>>>poder >>>>>attacktrueno
export function mostrarRutaEnFlechas (req: Request, res: Response, next: NextFunction): void {
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
