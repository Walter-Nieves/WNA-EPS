import { User } from "lucide-react";

interface ModalPersonaProps {
  onClose: () => void;
  titulo: "Paciente" | "Vacunador" | "Administrador";
  nombre: string;
  foto?: string;
}

function ModalPersona({
  onClose,
  titulo,
  nombre,
  foto,
}: ModalPersonaProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[24rem] space-y-6 text-center">
        <h2 className="text-xl font-bold text-blue-900">
          {titulo}
        </h2>

        {/* FOTO MÁS GRANDE */}
        <div className="w-40 h-40 mx-auto rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {foto ? (
            <img
              src={foto}
              alt={titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={80} className="text-gray-500" />
          )}
        </div>

        <p className="font-semibold text-lg">
          {nombre}
        </p>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-blue-900 text-white"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default ModalPersona;
