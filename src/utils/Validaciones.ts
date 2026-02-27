//--- Validación personalizada de correo ---
//Función de validación paso a paso
export const validarCorreo = (campo: string) => {
  const valor = String(campo ?? "").trim();

  if (!valor) return "El correo electrónico es obligatorio";

  // 1. Debe tener exactamente un "@"
  const partes = valor.split("@");
  if (partes.length !== 2) return "El correo debe contener exactamente un @";

  const [local, dominio] = partes;

  // 2. Local-part (antes del @)
  if (/[^a-zA-Z0-9._-]+/.test(local)) {
    return "El nombre de usuario solo puede contener letras (a-z, A-Z), números (0-9), punto (.), guion (-) y guion bajo (_)";
  }
  if (local.startsWith(".") || local.endsWith(".")) {
    return "El nombre de usuario no puede empezar ni terminar con un punto (.)";
  }

  // 3. Dominio
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(dominio)) {
    return "El dominio debe ser válido, por ejemplo: midominio.com o correo.ejemplo.org";
  }

  return true; // válido
};

const PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; 

export function obtenerFotoValida(foto: unknown): string {
  if (typeof foto === "string" && foto.trim() !== "") {
    return foto;
  }
  return PLACEHOLDER;
}