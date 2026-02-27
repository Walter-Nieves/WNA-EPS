import { useState } from "react";
import { User } from "lucide-react";
import type { Vacuna } from "../types";

interface Props {
  onClose: () => void;
  vacuna: Vacuna;
  onGuardar: (vacunaActualizada: Vacuna) => void;
}


const validarLugar = (valor: string): string | null => {
  const lugar = valor.trim();

  if (!lugar) return "El lugar es obligatorio";
  if (lugar.length < 2) return "El lugar debe tener al menos 2 caracteres";
  if (lugar.length > 40) return "El lugar no debe superar 40 caracteres";
  if (/[<>]/.test(lugar)) return "No se permiten los caracteres < o >";
  if (/ {3,}/.test(lugar)) return "No se permiten más de dos espacios seguidos";

  return null;
};

function ModalEditar({ onClose, vacuna, onGuardar }: Props) {
  const [formData, setFormData] = useState({
    lugar: vacuna.lugar,
    nombre: vacuna.nombre,
  });

  const [errorLugar, setErrorLugar] = useState<string | null>(null);

  /* ===========================
     🔍 DETECTAR CAMBIOS
  =========================== */
  const hayCambios =
    formData.lugar !== vacuna.lugar || formData.nombre !== vacuna.nombre;



  /* ===========================
     💾 GUARDAR INFORMACIÓN
  =========================== */
  const guardarInformacion = async (): Promise<void> => {
    if (!hayCambios) return;

    try {
      const resp = await fetch(
        import.meta.env.VITE_BACKEND + `/api/vacunas/${vacuna._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            lugar: formData.lugar,
            nombre: formData.nombre,
          }),
        },
      );

      if (!resp.ok) {
        throw new Error("Error actualizando vacuna");
      }
      await resp.json(); // no necesitamos usar lo que devuelve

      const vacunaActualizada: Vacuna = {
        ...vacuna, // mantiene todo lo anterior
        nombre: formData.nombre,
        lugar: formData.lugar,
      };

      onGuardar(vacunaActualizada);
      onClose();
    } catch (error) {
      console.error("Error guardando vacuna:", error);
      alert("No se pudo actualizar la vacuna");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[22rem] space-y-4">
          <h2 className="text-xl font-bold text-blue-900">
            Editar información
          </h2>

          {/* CÉDULA + FOTO */}
          <div className="flex items-center border rounded overflow-hidden">
            <input
              className="w-[80%] p-2 outline-none bg-gray-100"
              value={vacuna.cedula}
              disabled
            />
            <div className="w-[20%] flex items-center justify-center bg-gray-100">
              {vacuna.fotoPaciente ? (
                <img
                  src={vacuna.fotoPaciente}
                  alt="Paciente"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="text-blue-900" />
              )}
            </div>
          </div>

          {/* LUGAR */}
          <div>
            <input
              className={`w-full border rounded p-2 ${
                errorLugar ? "border-red-500" : ""
              }`}
              placeholder="Lugar de la vacuna"
              value={formData.lugar}
              onChange={(e) => {
                const value = e.target.value;

                setFormData({
                  ...formData,
                  lugar: value,
                });

                const error = validarLugar(value);
                setErrorLugar(error);
              }}
            />

            {errorLugar && (
              <p className="text-red-500 text-sm mt-1">{errorLugar}</p>
            )}
          </div>

          {/* VACUNA */}
          <select
            className="w-full p-2 border rounded bg-white"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({
                ...formData,
                nombre: e.target.value,
              })
            }
          >
            <option value="Pfizer-BionNTech">Pfizer-BionNTech</option>
            <option value="Moderna">Moderna</option>
            <option value="AztraZeneca">AztraZeneca</option>
            <option value="Janssen">Janssen</option>
            <option value="Sinopharm">Sinopharm</option>
          </select>

          {/* BOTONES */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded bg-gray-300"
            >
              Cancelar
            </button>

            <button
              onClick={guardarInformacion}
              disabled={!hayCambios}
              className={`flex-1 px-4 py-2 rounded text-white ${
                hayCambios
                  ? "bg-blue-900 hover:bg-blue-800"
                  : "bg-blue-400 cursor-not-allowed"
              }`}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalEditar;
