import { User } from "lucide-react";

interface Props {
  tipo: "encontrado" | "no-encontrado";
  cedula: string;
  foto?: string;
  onClose: () => void;
}

function ModalUsuarioEstado({ tipo, cedula, foto, onClose }: Props) {
  const esEncontrado = tipo === "encontrado";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div
        className={`bg-white rounded-xl p-6 text-center ${
          esEncontrado ? "w-[28rem] space-y-6" : "w-80 space-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto flex items-center justify-center rounded-full ${
            esEncontrado ? "w-40 h-40 bg-gray-200" : "w-20 h-20"
          }`}
        >
          {esEncontrado && foto ? (
            <img
              src={foto}
              alt="Usuario"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User
              size={esEncontrado ? 120 : 60}
              className={
                esEncontrado ? "text-blue-900" : "text-red-600"
              }
            />
          )}
        </div>

        <h3
          className={`font-bold ${
            esEncontrado
              ? "text-2xl text-blue-900"
              : "text-lg text-red-700"
          }`}
        >
          {esEncontrado
            ? "Usuario encontrado"
            : "Usuario no encontrado"}
        </h3>

        <p className="text-gray-600">
          {esEncontrado
            ? `La cédula ${cedula} existe en el sistema.`
            : `La cédula ${cedula} no existe en el sistema.`}
        </p>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default ModalUsuarioEstado;
