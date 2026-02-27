import { X } from "lucide-react";
import FormularioMod from "./FormularioMod";
import type { Usuario } from "../types";
import type { Dispatch, SetStateAction } from "react";


interface ModalFormularioProps {
  cerrar: () => void;
  usuario: Usuario;
 setUsuario: Dispatch<SetStateAction<Usuario | null>>;
}

function ModalFormulario({
  cerrar,
  usuario,
  setUsuario,
}: ModalFormularioProps) {
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      {/* CONTENEDOR DEL MODAL (80% PANTALLA) */}
      <div className="bg-white w-[80%] h-[80%] rounded-[0.75rem] shadow-[1.2rem] p-6 relative overflow-y-auto">
        {/* BOTÓN CERRAR */}
        <button
          onClick={cerrar}
          className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        {/* FORMULARIO */}
        <FormularioMod
          usuario={usuario}        
          setUsuario={setUsuario} 
          cerrar={cerrar}
        />
      </div>
    </div>
  );
}

export default ModalFormulario;