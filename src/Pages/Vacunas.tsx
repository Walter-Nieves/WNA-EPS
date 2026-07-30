import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Informacion from "../Componentes/Informacion";
import InfoAdministrador from "../Componentes/InfoAdministrador";
import ModalAgregar from "../Componentes/ModalAgregar";
import { Rol } from "../types";
import type { PacienteConVacunas, Vacuna } from "../types";
import authFetch from "../utils/AuthFetch";
import { useNavigate } from "react-router-dom";
import type { VacunasProps } from "../types";
import { usePhoto } from "../Contexts/PhotoContext";

type Vista = "misVacunas" | "pacientes";

function Vacunas({ rol, usuarioLogueado ,refreshKey}: VacunasProps) {
  const [vista, setVista] = useState<Vista>("misVacunas");
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [pacientes, setPacientes] = useState<PacienteConVacunas[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  const navigate = useNavigate();

  const esPaciente = rol === Rol.Paciente;
  const esVacunador = rol === Rol.Vacunador;
  const esAdministrador = rol === Rol.Administrador;

  /* ============================================
     ✅ Agregar vacuna sin recargar
  ============================================ */
  const agregarVacunaEnVista = (vacuna: Vacuna): void => {
    if (vista === "misVacunas") {
      setVacunas((prev) => [...prev, vacuna]);
    }

    if (vista === "pacientes") {
      setPacientes((prev) =>
        prev.map((item) =>
          String(item.paciente.cedula) === String(vacuna.cedula)
            ? { ...item, vacunas: [...item.vacunas, vacuna] }
            : item,
        ),
      );
    }
  };

  /* ============================================
     ✅ Cargar datos
  ============================================ */

  const { triggerVacunador,triggerPacientes  } = usePhoto()

  useEffect(() => {
  const cargarDatos = async (): Promise<void> => {
    try {
      const endpoint =
        vista === "misVacunas"
          ? "/api/vacunas/me"
          : "/api/vacunas/pacientes-con-vacunas";

      const resp = await authFetch(
        import.meta.env.VITE_BACKEND + endpoint,
        { credentials: "include" },
        navigate,
      );

      if (!resp || !resp.ok) {
        if (vista === "misVacunas") {
          setVacunas([]);
        } else {
          setPacientes([]);
        }
        return;
      }

      const data: unknown = await resp.json();

      if (vista === "misVacunas") {
        if (Array.isArray(data)) {
          setVacunas(data as Vacuna[]);
        } else {
          setVacunas([]);
        }
      } else {
        if (Array.isArray(data)) {
          setPacientes(data as PacienteConVacunas[]);
        } else {
          setPacientes([]);
        }
      }

    } catch (error) {
      console.error("Error cargando datos:", error);

      if (vista === "misVacunas") {
        setVacunas([]);
      } else {
        setPacientes([]);
      }
    }
  };

  cargarDatos();
}, [vista, navigate, refreshKey, triggerVacunador,triggerPacientes]);

  return (
    <>
      <div className="w-[80%] p-6 space-y-4 overflow-y-auto">
        {esPaciente && (
          <>
            <h1 className="text-[3rem] font-bold text-blue-900">Mis Vacunas</h1>

            {vacunas.length === 0 ? (
              <p className="text-gray-500 text-lg">
                No tienes vacunas registradas.
              </p>
            ) : (
              vacunas.map((vacuna) => (
                <InfoAdministrador
                  key={vacuna._id}
                  vacuna={vacuna}
                  usuarioLogueado={usuarioLogueado}
                />
              ))
            )}
          </>
        )}

        {(esVacunador || esAdministrador) && (
          <>
            <div className="flex w-full items-center justify-between">
              <h1
                onClick={() => setVista("misVacunas")}
                className={`text-[3rem] font-bold cursor-pointer ${
                  vista === "misVacunas" ? "text-blue-900" : "text-gray-400"
                }`}
              >
                Mis Vacunas
              </h1>

              <h2
                onClick={() => setVista("pacientes")}
                className={`text-[3rem] cursor-pointer ${
                  vista === "pacientes"
                    ? "text-blue-900 font-bold"
                    : "text-gray-400"
                }`}
              >
                Vacunas de pacientes
              </h2>
            </div>

            {vista === "misVacunas" ? (
              vacunas.length === 0 ? (
                <p className="text-gray-500 text-lg">
                  No hay vacunas registradas.
                </p>
              ) : (
                vacunas.map((vacuna) => (
                  <Informacion key={vacuna._id} vacuna={vacuna} />
                ))
              )
            ) : pacientes.length === 0 ? (
              <p className="text-gray-500 text-lg">
                No hay pacientes registrados.
              </p>
            ) : (
              pacientes.map(({ paciente, vacunas }) => (
                <div key={paciente._id} className="space-y-2">
                  <h3 className="text-xl font-bold text-blue-900">
                    {paciente.nombre} {paciente.apellido}
                  </h3>

                  {vacunas.length === 0 ? (
                    <p className="text-gray-400 ml-4">
                      Este paciente aún no tiene vacunas registradas.
                    </p>
                  ) : (
                    vacunas.map((vacuna) => (
                      <InfoAdministrador
                        key={vacuna._id}
                        vacuna={vacuna}
                        usuarioLogueado={usuarioLogueado}
                      />
                    ))
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {!esPaciente && (
        <>
          <button
            onClick={() => setMostrarModal(true)}
            className="absolute bottom-6 right-6 bg-blue-900 text-white p-4 rounded-full shadow-lg hover:bg-blue-800"
          >
            <Plus size={14} />
          </button>

          {mostrarModal && (
            <ModalAgregar
              onClose={() => setMostrarModal(false)}
              onVacunaAgregada={agregarVacunaEnVista}
              usuarioLogueado={usuarioLogueado}
            />
          )}
        </>
      )}
    </>
  );
}

export default Vacunas;
