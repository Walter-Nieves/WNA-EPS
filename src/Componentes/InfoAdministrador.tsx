import { useState, useEffect } from "react";
import { ChevronDown, Pencil, User } from "lucide-react";
import type { Vacuna, Usuario } from "../types";
import { Rol } from "../types";
import ModalEditar from "./ModalEditar";
import ModalPersona from "./ModalPersona";
import { usePhoto } from "../Contexts/PhotoContext";

interface Props {
  vacuna: Vacuna;
  usuarioLogueado: Usuario;
}

function InfoAdministrador({ vacuna, usuarioLogueado }: Props) {
  const [vacunaLocal, setVacunaLocal] = useState<Vacuna>(vacuna);
  const [abierto, setAbierto] = useState<boolean>(false);
  const [modalEditar, setModalEditar] = useState<boolean>(false);
  const [modalVacunador, setModalVacunador] = useState<boolean>(false);
  const [modalPaciente, setModalPaciente] = useState<boolean>(false);

  const { fotos } = usePhoto();

  useEffect(() => {
    setVacunaLocal(vacuna);
  }, [vacuna]);

  const fechaBase = vacunaLocal.fecha.split("T")[0];
  const [anio, mes, dia] = fechaBase.split("-");
  const fechaFormateada = `${dia}/${mes}/${anio}`;

  /* ===================== FOTO PACIENTE ===================== */

  const fotoPacienteActual =
    fotos[vacunaLocal.pacienteId ?? ""] ||
    (usuarioLogueado.rol === Rol.Paciente &&
    usuarioLogueado.cedula === vacunaLocal.cedula
      ? usuarioLogueado.foto
      : vacunaLocal.fotoPaciente);

  /* ===================== RESPONSABLE ===================== */

  const esVistaPaciente =
    usuarioLogueado.rol === Rol.Paciente;

  const fueAgregadaPorAdmin =
    vacunaLocal.agregadoPorRol === Rol.Administrador;

  const nombreResponsable =
    esVistaPaciente && fueAgregadaPorAdmin
      ? vacunaLocal.nombreAdministrador ?? "No encontrado"
      : vacunaLocal.nombreVacunador ?? "No encontrado";

  const idResponsable =
    esVistaPaciente && fueAgregadaPorAdmin
      ? vacunaLocal.agregadoPorId ?? undefined
      : vacunaLocal.vacunadorId ?? undefined;

  /* FIX DEFINITIVO REACTIVO */

  const esResponsableUsuarioLogueado =
    idResponsable != null &&
    idResponsable === usuarioLogueado._id;

  const fotoResponsable =
    esResponsableUsuarioLogueado
      ? usuarioLogueado.foto
      : fotos[idResponsable ?? ""] ||
        (esVistaPaciente && fueAgregadaPorAdmin
          ? vacunaLocal.fotoAdministrador
          : vacunaLocal.fotoVacunador);

  return (
    <>
      <div className="bg-blue-100 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => setModalPaciente(true)}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full overflow-hidden hover:scale-105 transition"
            >
              {fotoPacienteActual ? (
                <img
                  src={fotoPacienteActual}
                  alt="Paciente"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-blue-900" size={28} />
              )}
            </button>

            <p className="font-bold text-blue-900 text-lg flex-1">
              Cédula: {vacunaLocal.cedula}
            </p>

            <p className="text-lg whitespace-nowrap">
              <strong>Fecha:</strong> {fechaFormateada}
            </p>
          </div>

          <button
            onClick={() => setAbierto((prev) => !prev)}
            className="hover:opacity-70"
          >
            <ChevronDown
              className={`transition-transform duration-300 ${
                abierto ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {abierto && (
          <div className="pl-[4.5rem] text-lg">
            <div className="flex justify-items-start gap-24">
              <div className="flex flex-col items-start space-y-3">
                <p>
                  <strong>Vacuna:</strong> {vacunaLocal.nombre}
                </p>

                <p>
                  <strong>Lugar:</strong> {vacunaLocal.lugar}
                </p>

                {(usuarioLogueado.rol === Rol.Administrador ||
                  usuarioLogueado.rol === Rol.Vacunador) && (
                  <button
                    onClick={() => setModalEditar(true)}
                    className="flex items-center gap-2 text-blue-900 hover:opacity-70 mt-2"
                  >
                    <Pencil size={18} />
                    <span className="text-base">
                      Editar información
                    </span>
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center space-y-2">
                <p>
                  <strong>
                    {esVistaPaciente && fueAgregadaPorAdmin
                      ? "Administrador"
                      : "Vacunador"}
                    :
                  </strong>{" "}
                  {nombreResponsable}
                </p>

                <button
                  onClick={() => setModalVacunador(true)}
                  className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow hover:scale-105 transition overflow-hidden"
                >
                  {fotoResponsable ? (
                    <img
                      src={fotoResponsable}
                      alt="Responsable"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={28} className="text-blue-900" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalEditar && (
        <ModalEditar
          onClose={() => setModalEditar(false)}
          vacuna={vacunaLocal}
          onGuardar={(vacunaActualizada) => {
            setVacunaLocal(vacunaActualizada);
            setModalEditar(false);
          }}
        />
      )}

      {modalPaciente && (
        <ModalPersona
          onClose={() => setModalPaciente(false)}
          titulo="Paciente"
          nombre={vacunaLocal.nombrePaciente}
          foto={fotoPacienteActual}
        />
      )}

      {modalVacunador && (
        <ModalPersona
          onClose={() => setModalVacunador(false)}
          titulo={
            esVistaPaciente && fueAgregadaPorAdmin
              ? "Administrador"
              : "Vacunador"
          }
          nombre={nombreResponsable}
          foto={fotoResponsable}
        />
      )}
    </>
  );
}

export default InfoAdministrador;
