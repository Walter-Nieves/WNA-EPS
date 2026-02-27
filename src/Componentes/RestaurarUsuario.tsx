import { X, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authFetch from "../utils/AuthFetch";
import ModalUsuarioEstado from "./ModalUsuarioEstado";
import type { Usuario } from "../types";

interface Props {
  onClose: () => void;
}

function RestaurarUsuario({ onClose }: Props) {
  const navigate = useNavigate();

  const [cedula, setCedula] = useState<number | "">("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [estadoBusqueda, setEstadoBusqueda] =
    useState<"encontrado" | "no-encontrado" | null>(null);

  const buscarUsuario = async () => {
    if (!cedula) return;

    const resp = await authFetch(
      `${import.meta.env.VITE_BACKEND}/api/usuarios/eliminado/${cedula}`,
      { method: "GET" },
      navigate
    );

    if (!resp || resp.status !== 200) {
      setEstadoBusqueda("no-encontrado");
      return;
    }

    const data: Usuario = await resp.json();
    setUsuario(data);
    setEstadoBusqueda("encontrado");
  };

  const confirmarRestaurar = async () => {
    if (!usuario) return;

    if (!confirm("¿Está seguro que quiere restaurar este usuario?")) return;

    await authFetch(
      `${import.meta.env.VITE_BACKEND}/api/usuarios/restore/${usuario._id}`,
      { method: "PATCH" },
      navigate
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl p-6 w-[30rem] relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X />
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          Restaurar usuario
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="number"
            placeholder="Cédula"
            disabled={usuario !== null}
            value={cedula}
            onChange={(e) =>
              setCedula(e.target.value ? Number(e.target.value) : "")
            }
            className="border p-2 rounded w-full"
          />

          <button
            onClick={buscarUsuario}
            className="bg-blue-900 text-white px-3 rounded"
          >
            <User />
          </button>
        </div>

        {estadoBusqueda && (
          <ModalUsuarioEstado
            tipo={estadoBusqueda}
            cedula={String(cedula)}
            foto={usuario?.foto}
            onClose={() => setEstadoBusqueda(null)}
          />
        )}

        {usuario && (
          <>
            <input
              value={usuario.cedula}
              disabled
              className="border p-2 rounded w-full mb-2"
            />

            <input
              value={usuario.nombre}
              disabled
              className="border p-2 rounded w-full mb-2"
            />

            <input
              value={usuario.apellido}
              disabled
              className="border p-2 rounded w-full mb-4"
            />

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="w-1/2 bg-gray-400 text-white py-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarRestaurar}
                className="w-1/2 bg-blue-900 text-white py-2 rounded"
              >
                Restaurar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RestaurarUsuario;
