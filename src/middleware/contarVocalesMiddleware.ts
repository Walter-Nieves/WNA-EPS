import { NextFunction, Request, Response } from 'express'

// crear un middleware que cuente las vocales por separado y al final diga cuantas vocales son
export function contarVocales (req: Request, res: Response, next: NextFunction): void {
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
