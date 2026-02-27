import { useState } from "react";
import { User } from "lucide-react";
import type { Vacuna, Usuario } from "../types";
import authFetch from "../utils/AuthFetch";
import { useNavigate } from "react-router-dom";

interface UsuarioLogueado {
  cedula: number;
  nombre: string;
  foto: string;
}

interface ModalAgregarProps {
  onClose: () => void;
  onVacunaAgregada: (vacuna: Vacuna) => void;
  usuarioLogueado: UsuarioLogueado;
}

type EstadoBusqueda = "existe" | "no-existe" | null;

function ModalAgregar({
  onClose,
  onVacunaAgregada,
  usuarioLogueado,
}: ModalAgregarProps) {
  const [cedula, setCedula] = useState<string>("");
  const [estadoBusqueda, setEstadoBusqueda] = useState<EstadoBusqueda>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<Usuario | null>(
    null,
  );

  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    lugar: "",
  });

  const [errores, setErrores] = useState<{
    nombre?: string;
    fecha?: string;
    lugar?: string;
  }>({});

  const validarLugar = (valor: string): string | null => {
  const lugar = valor.trim();

  if (!lugar) return "El lugar es obligatorio";
  if (lugar.length < 2) return "El lugar debe tener al menos 2 caracteres";
  if (lugar.length > 40) return "El lugar no debe superar 40 caracteres";
  if (/[<>]/.test(lugar)) return "No se permiten los caracteres < o >";
  if (/ {2,}/.test(lugar))
    return "No se permiten más de dos espacios seguidos";

  return null;
};


  const [, setCargando] = useState<boolean>(false);
  const navigate = useNavigate();

  /* ===========================
     🔎 BUSCAR PACIENTE
  =========================== */
  const buscarPaciente = async (): Promise<void> => {
    if (!cedula.trim()) return;

    try {
      setCargando(true);

      const resp = await authFetch(
        import.meta.env.VITE_BACKEND + `/api/usuarios/${cedula}`,
        { credentials: "include" },
        navigate,
      );

      if (!resp) return;

      if (!resp.ok) {
        setEstadoBusqueda("no-existe");
        return;
      }

      const usuario: Usuario = await resp.json();
      setUsuarioEncontrado(usuario);
      setEstadoBusqueda("existe");
    } catch {
      setEstadoBusqueda("no-existe");
    } finally {
      setCargando(false);
    }
  };

  /* ===========================
     💉 GUARDAR VACUNA
  =========================== */

  const guardarVacuna = async (): Promise<void> => {
    const nuevosErrores: typeof errores = {};

    if (!formData.nombre) {
      nuevosErrores.nombre = "El nombre de la vacuna es obligatorio";
    }

    if (!formData.fecha) {
      nuevosErrores.fecha = "La fecha es obligatoria";
    }

    const errorLugar = validarLugar(formData.lugar);
    if (errorLugar) {
      nuevosErrores.lugar = errorLugar;
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    try {
      setCargando(true);

      const resp = await authFetch(
        import.meta.env.VITE_BACKEND + `/api/vacunas/${cedula}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        },
        navigate,
      );

      if (!resp) return;

      if (!resp.ok) {
        alert("Error al guardar vacuna");
        return;
      }

      const backendVacuna = await resp.json();

      const vacunaCompleta: Vacuna = {
        _id: backendVacuna._id,
        cedula: Number(cedula),
        nombre: backendVacuna.nombre,
        fecha: backendVacuna.fecha,
        lugar: backendVacuna.lugar,
        nombreVacunador: usuarioLogueado.nombre,
        fotoVacunador: usuarioLogueado.foto,
        nombrePaciente:
          usuarioEncontrado != null
            ? `${usuarioEncontrado.nombre} ${usuarioEncontrado.apellido}`
            : "No encontrado",
        fotoPaciente: usuarioEncontrado?.foto ?? "",
      };

      onVacunaAgregada(vacunaCompleta);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-[24rem] space-y-4">
          <h2 className="text-xl font-bold text-blue-900">Agregar vacuna</h2>

          <div className="flex items-center border rounded overflow-hidden">
            <input
              className="w-[80%] p-2 outline-none"
              placeholder="Cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
            />

            <button
              onClick={buscarPaciente}
              disabled={!cedula.trim()}
              className={`w-[20%] flex items-center justify-center ${
                cedula.trim()
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
              type="button"
            >
              {usuarioEncontrado?.foto ? (
                <img
                  src={usuarioEncontrado.foto}
                  alt="Paciente"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="text-blue-900" />
              )}
            </button>
          </div>

          {mostrarFormulario && (
            <div className="space-y-3">
              <div>
                <select
                  required
                  className={`w-full p-2 border rounded bg-white ${
                    errores.nombre ? "border-red-500" : ""
                  }`}
                  value={formData.nombre}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData({
                      ...formData,
                      nombre: value,
                    });

                    if (errores.nombre) {
                      setErrores((prev) => ({ ...prev, nombre: undefined }));
                    }
                  }}
                >
                  <option value="" disabled>
                    Nombre de la vacuna
                  </option>
                  <option value="Pfizer-BionNTech">Pfizer-BionNTech</option>
                  <option value="Moderna">Moderna</option>
                  <option value="AztraZeneca">AztraZeneca</option>
                  <option value="Janssen">Janssen</option>
                  <option value="Sinopharm">Sinopharm</option>
                </select>

                {errores.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
                )}
              </div>
              <div>
                <input
                  type="date"
                  required
                  className={`w-full p-2 border rounded ${
                    errores.fecha ? "border-red-500" : ""
                  }`}
                  value={formData.fecha}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData({
                      ...formData,
                      fecha: value,
                    });

                    if (errores.fecha) {
                      setErrores((prev) => ({ ...prev, fecha: undefined }));
                    }
                  }}
                />

                {errores.fecha && (
                  <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>
                )}
              </div>

              <div>
                <input
                  required
                  className={`w-full p-2 border rounded ${
                    errores.lugar ? "border-red-500" : ""
                  }`}
                  placeholder="Lugar"
                  value={formData.lugar}
                  onChange={(e) => {
                    const value = e.target.value;
                    
                    setFormData({
                      ...formData,
                      lugar:value,
                    });

                    const error = validarLugar(value);

                    setErrores((prev) => ({
                      ...prev,
                      lugar:error ?? undefined,
                    }))
                  }}
                />
                {errores.lugar && (
                  <p className="text-red-500 text-sm mt-1">{errores.lugar}</p>
                )}
              </div>

              <button
                onClick={guardarVacuna}
                className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800"
              >
                Guardar vacuna
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* ✅ MODAL EXISTE */}
      {estadoBusqueda === "existe" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="font-semibold text-blue-900">
              La persona se encuentra en la base de datos
            </p>
            <button
              onClick={() => {
                setEstadoBusqueda(null);
                setMostrarFormulario(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-900 text-white rounded"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL NO EXISTE (NUEVO) */}
      {estadoBusqueda === "no-existe" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="font-semibold text-red-600">
              La persona no se encuentra en la base de datos
            </p>
            <button
              onClick={() => {
                setEstadoBusqueda(null);
              }}
              className="mt-4 px-4 py-2 bg-blue-900 text-white rounded"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalAgregar;
