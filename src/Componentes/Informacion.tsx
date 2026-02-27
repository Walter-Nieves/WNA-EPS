import { useState } from "react";
import { ChevronDown, User } from "lucide-react";
import type { Vacuna } from "../types";
import { usePhoto } from "../Contexts/PhotoContext";

interface Props {
  vacuna: Vacuna;
}

function Informacion({ vacuna }: Props) {
  const [abierto, setAbierto] = useState(false);
  const fechaFormateada = new Date(vacuna.fecha).toLocaleDateString();
  const { fotos } = usePhoto();

  const fotoVacunador =
    fotos[vacuna.vacunadorId ?? ""] || vacuna.fotoVacunador;

  return (
    <div className="bg-blue-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex items-center justify-center">
            {fotoVacunador ? (
              <img
                src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-blue-900" size={28} />
            )}
          </div>

          <p className="font-bold text-blue-900 text-lg">
            {vacuna.nombre}
          </p>

          <p>
            <strong>Fecha:</strong> {fechaFormateada}
          </p>
        </div>

        <button onClick={() => setAbierto((prev) => !prev)}>
          <ChevronDown />
        </button>
      </div>

      {abierto && (
        <div className="pl-[4.5rem] text-lg space-y-2">
          <p>
            <strong>Lugar:</strong> {vacuna.lugar}
          </p>

          <p>
            <strong>Vacunador:</strong>{" "}
            {vacuna.nombreVacunador}
          </p>
        </div>
      )}
    </div>
  );
}

export default Informacion;
