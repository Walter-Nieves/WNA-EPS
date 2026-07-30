// import { createContext, useContext, useState, type ReactNode } from "react";

// interface PhotoContextType {
//   fotos: Record<string, string>;
//   actualizarFoto: (usuarioId: string, nuevaFoto: string) => void;
//   triggerVacunador: boolean
//   dispatchTriggerVacunador: () => void
// }

// const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

// export function PhotoProvider({ children }: { children: ReactNode }) {
//   const [triggerVacunador, setTriggerVacunador] = useState<boolean>(false)

//   const dispatchTriggerVacunador = () => setTriggerVacunador(!triggerVacunador)

//   const [fotos, setFotos] = useState<Record<string, string>>({});

//   const actualizarFoto = (usuarioId: string, nuevaFoto: string): void => {
//     setFotos((prev) => ({
//       ...prev,
//       [usuarioId]: nuevaFoto,
//     }));
//   };

//   return (
//     <PhotoContext.Provider value={{ fotos, actualizarFoto, triggerVacunador, dispatchTriggerVacunador }}>
//       {children}
//     </PhotoContext.Provider>
//   );
// }

// // eslint-disable-next-line react-refresh/only-export-components
// export function usePhoto(): PhotoContextType {
//   const context = useContext(PhotoContext);
//   if (!context) {
//     throw new Error("usePhoto debe usarse dentro de PhotoProvider");
//   }
//   return context;
// }


// import { Edit, Settings, LogOut } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import authFetch from "../utils/AuthFetch";
// import type { Usuario } from "../types";
// import { useState } from "react";
// import { usePhoto } from "../Contexts/PhotoContext";
// import EliminarUsuario from "../Componentes/EliminarUsuario";
// import RestaurarUsuario from "../Componentes/RestaurarUsuario";

// interface RolProps {
//   usuario: Usuario;
//   fotoPerfil: string;
//   onEditarFoto: () => void;
//   onAbrirConfig: () => void;
//   mostrarBotonAdmin?: boolean;
//   onModificarUsuario?: () => void;
// }

// function RolLayout({
//   usuario,
//   fotoPerfil,
//   onEditarFoto,
//   onAbrirConfig,
//   mostrarBotonAdmin = false,
//   onModificarUsuario,
// }: RolProps) {
//   const navigate = useNavigate();
//   const [showInfo, setShowInfo] = useState(false);
//   const [showEliminar, setShowEliminar] = useState(false);
//   const [showRestaurar, setShowRestaurar] = useState(false);

//   const { fotos } = usePhoto();
//   const fotoFinal = fotos[usuario._id] || fotoPerfil;

//   const cerrarSesion = async () => {
//     const resp = await authFetch(
//       import.meta.env.VITE_BACKEND + "/auth/logout",
//       { method: "POST" },
//       navigate
//     );

//     if (!resp) return;

//     const data = await resp.json();
//     alert(data?.message);
//     navigate("/");
//   };

//   return (
//     <>
//       <div className="bg-blue-900 w-[20%] h-full flex flex-col items-center text-white relative">
//         {/* FOTO */}
//         <div className="h-[25%] flex flex-col justify-center items-center relative">
//           <button
//             className="absolute top-2 bg-white/80 p-1 rounded-full"
//             onClick={onEditarFoto}
//           >
//             <Edit size={18} className="text-blue-900" />
//           </button>

//           <img
//             src={fotoFinal}
//             onError={(e) => {
//               e.currentTarget.src =
//                 "https://cdn-icons-png.flaticon.com/512/149/149071.png";
//             }}
//             className="w-28 h-28 rounded-full border-2 border-white object-cover"
//           />
//         </div>

//         {/* INFO */}
//         <div className="text-sm space-y-2 text-center">
//           <p
//             className="cursor-pointer"
//             onClick={() => setShowInfo((p) => !p)}
//           >
//             <strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}
//           </p>

//           {showInfo && (
//             <>
//               <p>
//                 <strong>Rol:</strong> {usuario.rol}
//               </p>
//               <p>
//                 <strong>Cédula:</strong> {usuario.cedula}
//               </p>
//               <p>
//                 <strong>Teléfono:</strong> {usuario.telefono}
//               </p>
//             </>
//           )}
//         </div>

//         {/* SOLO ADMIN */}
//         {mostrarBotonAdmin && (
//           <>
//             <button
//               onClick={onModificarUsuario}
//               className="mt-4 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
//             >
//               Modificar usuario
//             </button>

//             <button
//               onClick={() => setShowEliminar(true)}
//               className="mt-2 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
//             >
//               Eliminar usuarios
//             </button>

//             <button
//               onClick={() => setShowRestaurar(true)}
//               className="mt-2 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
//             >
//               Restaurar usuario
//             </button>
//           </>
//         )}

//         {/* FOOTER */}
//         <div className="mt-auto w-full flex justify-between px-4 pb-4">
//           <button onClick={onAbrirConfig}>
//             <Settings />
//           </button>
//           <button onClick={cerrarSesion}>
//             <LogOut />
//           </button>
//         </div>
//       </div>

//       {showEliminar && (
//         <EliminarUsuario onClose={() => setShowEliminar(false)} />
//       )}

//       {showRestaurar && (
//         <RestaurarUsuario onClose={() => setShowRestaurar(false)} />
//       )}
//     </>
//   );
// }

// export default RolLayout;
// import { Plus } from "lucide-react";
// import { useEffect, useState } from "react";
// import Informacion from "../Componentes/Informacion";
// import InfoAdministrador from "../Componentes/InfoAdministrador";
// import ModalAgregar from "../Componentes/ModalAgregar";
// import { Rol } from "../types";
// import type { PacienteConVacunas, Vacuna } from "../types";
// import authFetch from "../utils/AuthFetch";
// import { useNavigate } from "react-router-dom";
// import type { VacunasProps } from "../types";
// import { usePhoto } from "../Contexts/PhotoContext";

// type Vista = "misVacunas" | "pacientes";

// function Vacunas({ rol, usuarioLogueado ,refreshKey}: VacunasProps) {
//   const [vista, setVista] = useState<Vista>("misVacunas");
//   const [vacunas, setVacunas] = useState<Vacuna[]>([]);
//   const [pacientes, setPacientes] = useState<PacienteConVacunas[]>([]);
//   const [mostrarModal, setMostrarModal] = useState(false);

//   const navigate = useNavigate();

//   const esPaciente = rol === Rol.Paciente;
//   const esVacunador = rol === Rol.Vacunador;
//   const esAdministrador = rol === Rol.Administrador;

//   /* ============================================
//      ✅ Agregar vacuna sin recargar
//   ============================================ */
//   const agregarVacunaEnVista = (vacuna: Vacuna): void => {
//     if (vista === "misVacunas") {
//       setVacunas((prev) => [...prev, vacuna]);
//     }

//     if (vista === "pacientes") {
//       setPacientes((prev) =>
//         prev.map((item) =>
//           String(item.paciente.cedula) === String(vacuna.cedula)
//             ? { ...item, vacunas: [...item.vacunas, vacuna] }
//             : item,
//         ),
//       );
//     }
//   };

//   /* ============================================
//      ✅ Cargar datos
//   ============================================ */

//   const { triggerVacunador } = usePhoto()

//   useEffect(() => {
//   const cargarDatos = async (): Promise<void> => {
//     try {
//       const endpoint =
//         vista === "misVacunas"
//           ? "/api/vacunas/me"
//           : "/api/vacunas/pacientes-con-vacunas";

//       const resp = await authFetch(
//         import.meta.env.VITE_BACKEND + endpoint,
//         { credentials: "include" },
//         navigate,
//       );

//       if (!resp || !resp.ok) {
//         if (vista === "misVacunas") {
//           setVacunas([]);
//         } else {
//           setPacientes([]);
//         }
//         return;
//       }

//       const data: unknown = await resp.json();

//       if (vista === "misVacunas") {
//         if (Array.isArray(data)) {
//           setVacunas(data as Vacuna[]);
//         } else {
//           setVacunas([]);
//         }
//       } else {
//         if (Array.isArray(data)) {
//           setPacientes(data as PacienteConVacunas[]);
//         } else {
//           setPacientes([]);
//         }
//       }

//     } catch (error) {
//       console.error("Error cargando datos:", error);

//       if (vista === "misVacunas") {
//         setVacunas([]);
//       } else {
//         setPacientes([]);
//       }
//     }
//   };

//   cargarDatos();
// }, [vista, navigate, refreshKey, triggerVacunador]);

//   return (
//     <>
//       <div className="w-[80%] p-6 space-y-4 overflow-y-auto">
//         {esPaciente && (
//           <>
//             <h1 className="text-[3rem] font-bold text-blue-900">Mis Vacunas</h1>

//             {vacunas.length === 0 ? (
//               <p className="text-gray-500 text-lg">
//                 No tienes vacunas registradas.
//               </p>
//             ) : (
//               vacunas.map((vacuna) => (
//                 <InfoAdministrador
//                   key={vacuna._id}
//                   vacuna={vacuna}
//                   usuarioLogueado={usuarioLogueado}
//                 />
//               ))
//             )}
//           </>
//         )}

//         {(esVacunador || esAdministrador) && (
//           <>
//             <div className="flex w-full items-center justify-between">
//               <h1
//                 onClick={() => setVista("misVacunas")}
//                 className={`text-[3rem] font-bold cursor-pointer ${
//                   vista === "misVacunas" ? "text-blue-900" : "text-gray-400"
//                 }`}
//               >
//                 Mis Vacunas
//               </h1>

//               <h2
//                 onClick={() => setVista("pacientes")}
//                 className={`text-[3rem] cursor-pointer ${
//                   vista === "pacientes"
//                     ? "text-blue-900 font-bold"
//                     : "text-gray-400"
//                 }`}
//               >
//                 Vacunas de pacientes
//               </h2>
//             </div>

//             {vista === "misVacunas" ? (
//               vacunas.length === 0 ? (
//                 <p className="text-gray-500 text-lg">
//                   No hay vacunas registradas.
//                 </p>
//               ) : (
//                 vacunas.map((vacuna) => (
//                   <Informacion key={vacuna._id} vacuna={vacuna} />
//                 ))
//               )
//             ) : pacientes.length === 0 ? (
//               <p className="text-gray-500 text-lg">
//                 No hay pacientes registrados.
//               </p>
//             ) : (
//               pacientes.map(({ paciente, vacunas }) => (
//                 <div key={paciente._id} className="space-y-2">
//                   <h3 className="text-xl font-bold text-blue-900">
//                     {paciente.nombre} {paciente.apellido}
//                   </h3>

//                   {vacunas.length === 0 ? (
//                     <p className="text-gray-400 ml-4">
//                       Este paciente aún no tiene vacunas registradas.
//                     </p>
//                   ) : (
//                     vacunas.map((vacuna) => (
//                       <InfoAdministrador
//                         key={vacuna._id}
//                         vacuna={vacuna}
//                         usuarioLogueado={usuarioLogueado}
//                       />
//                     ))
//                   )}
//                 </div>
//               ))
//             )}
//           </>
//         )}
//       </div>

//       {!esPaciente && (
//         <>
//           <button
//             onClick={() => setMostrarModal(true)}
//             className="absolute bottom-6 right-6 bg-blue-900 text-white p-4 rounded-full shadow-lg hover:bg-blue-800"
//           >
//             <Plus size={28} />
//           </button>

//           {mostrarModal && (
//             <ModalAgregar
//               onClose={() => setMostrarModal(false)}
//               onVacunaAgregada={agregarVacunaEnVista}
//               usuarioLogueado={usuarioLogueado}
//             />
//           )}
//         </>
//       )}
//     </>
//   );
// }

// export default Vacunas;
// import { X, User } from "lucide-react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import authFetch from "../utils/AuthFetch";
// import ModalUsuarioEstado from "./ModalUsuarioEstado";
// import type { Usuario } from "../types";

// interface Props {
//   onClose: () => void;
// }

// function EliminarUsuario({ onClose }: Props) {
//   const navigate = useNavigate();

//   const [tipo, setTipo] = useState<"temporal" | "definitivo" | null>(null);
//   const [cedula, setCedula] = useState<number | "">("");
//   const [usuario, setUsuario] = useState<Usuario | null>(null);
//   const [estadoBusqueda, setEstadoBusqueda] =
//     useState<"encontrado" | "no-encontrado" | null>(null);

//   const buscarUsuario = async () => {
//     if (!cedula) return;

//     const resp = await authFetch(
//       `${import.meta.env.VITE_BACKEND}/api/usuarios/activo/${cedula}`,
//       { method: "GET" },
//       navigate
//     );

//     if (!resp || resp.status !== 200) {
//       setEstadoBusqueda("no-encontrado");
//       return;
//     }

//     const data: Usuario = await resp.json();
//     setUsuario(data);
//     setEstadoBusqueda("encontrado");
//   };

//   const confirmarEliminar = async () => {
//     if (!usuario) return;

//     const mensaje =
//       tipo === "temporal"
//         ? "¿Está seguro que quiere eliminar este usuario temporalmente?"
//         : "¿Está seguro que quiere eliminar este usuario definitivamente?";

//     if (!confirm(mensaje)) return;

//     const endpoint =
//       tipo === "temporal"
//         ? `/api/usuarios/soft/${usuario._id}`
//         : `/api/usuarios/force/${usuario._id}`;

//     await authFetch(
//        `${import.meta.env.VITE_BACKEND}${endpoint}`,
//       { method: "DELETE" },
//       navigate
//     );

//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
//       <div className="bg-white rounded-xl p-6 w-[30rem] relative">
//         <button onClick={onClose} className="absolute top-3 right-3">
//           <X />
//         </button>

//         {!tipo ? (
//           <>
//             <h2 className="text-xl font-bold mb-6 text-center">
//               Seleccione tipo de eliminación
//             </h2>

//             <div className="flex gap-4 justify-center">
//               <button
//                 onClick={() => setTipo("temporal")}
//                 className="bg-blue-900 text-white px-4 py-2 rounded-lg"
//               >
//                 Eliminar temporalmente
//               </button>

//               <button
//                 onClick={() => setTipo("definitivo")}
//                 className="bg-red-700 text-white px-4 py-2 rounded-lg"
//               >
//                 Eliminar definitivamente
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             <h2 className="text-xl font-bold text-center mb-4">
//               {tipo === "temporal"
//                 ? "Eliminar usuario temporalmente"
//                 : "Eliminar usuario definitivamente"}
//             </h2>

//             <div className="flex gap-2 mb-4">
//               <input
//                 type="number"
//                 placeholder="Cédula"
//                 disabled={usuario !== null}
//                 value={cedula}
//                 onChange={(e) =>
//                   setCedula(e.target.value ? Number(e.target.value) : "")
//                 }
//                 className="border p-2 rounded w-full"
//               />

//               <button
//                 onClick={buscarUsuario}
//                 className="bg-blue-900 text-white px-3 rounded"
//               >
//                 <User />
//               </button>
//             </div>

//             {estadoBusqueda && (
//               <ModalUsuarioEstado
//                 tipo={estadoBusqueda}
//                 cedula={String(cedula)}
//                 foto={usuario?.foto}
//                 onClose={() => setEstadoBusqueda(null)}
//               />
//             )}

//             {usuario && (
//               <>
//                 <input
//                   value={usuario.cedula}
//                   disabled
//                   className="border p-2 rounded w-full mb-2"
//                 />

//                 <input
//                   value={usuario.nombre}
//                   disabled
//                   className="border p-2 rounded w-full mb-2"
//                 />

//                 <input
//                   value={usuario.apellido}
//                   disabled
//                   className="border p-2 rounded w-full mb-4"
//                 />

//                 <div className="flex gap-4">
//                   <button
//                     onClick={onClose}
//                     className="w-1/2 bg-gray-400 text-white py-2 rounded"
//                   >
//                     Cancelar
//                   </button>

//                   <button
//                     onClick={confirmarEliminar}
//                     className="w-1/2 bg-red-700 text-white py-2 rounded"
//                   >
//                     Eliminar
//                   </button>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default EliminarUsuario;
// import { X, User } from "lucide-react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import authFetch from "../utils/AuthFetch";
// import ModalUsuarioEstado from "./ModalUsuarioEstado";
// import type { Usuario } from "../types";

// interface Props {
//   onClose: () => void;
// }

// function RestaurarUsuario({ onClose }: Props) {
//   const navigate = useNavigate();

//   const [cedula, setCedula] = useState<number | "">("");
//   const [usuario, setUsuario] = useState<Usuario | null>(null);
//   const [estadoBusqueda, setEstadoBusqueda] =
//     useState<"encontrado" | "no-encontrado" | null>(null);

//   const buscarUsuario = async () => {
//     if (!cedula) return;

//     const resp = await authFetch(
//       `${import.meta.env.VITE_BACKEND}/api/usuarios/eliminado/${cedula}`,
//       { method: "GET" },
//       navigate
//     );

//     if (!resp || resp.status !== 200) {
//       setEstadoBusqueda("no-encontrado");
//       return;
//     }

//     const data: Usuario = await resp.json();
//     setUsuario(data);
//     setEstadoBusqueda("encontrado");
//   };

//   const confirmarRestaurar = async () => {
//     if (!usuario) return;

//     if (!confirm("¿Está seguro que quiere restaurar este usuario?")) return;

//     await authFetch(
//       `${import.meta.env.VITE_BACKEND}/api/usuarios/restore/${usuario._id}`,
//       { method: "PATCH" },
//       navigate
//     );

//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
//       <div className="bg-white rounded-xl p-6 w-[30rem] relative">
//         <button onClick={onClose} className="absolute top-3 right-3">
//           <X />
//         </button>

//         <h2 className="text-xl font-bold text-center mb-4">
//           Restaurar usuario
//         </h2>

//         <div className="flex gap-2 mb-4">
//           <input
//             type="number"
//             placeholder="Cédula"
//             disabled={usuario !== null}
//             value={cedula}
//             onChange={(e) =>
//               setCedula(e.target.value ? Number(e.target.value) : "")
//             }
//             className="border p-2 rounded w-full"
//           />

//           <button
//             onClick={buscarUsuario}
//             className="bg-blue-900 text-white px-3 rounded"
//           >
//             <User />
//           </button>
//         </div>

//         {estadoBusqueda && (
//           <ModalUsuarioEstado
//             tipo={estadoBusqueda}
//             cedula={String(cedula)}
//             foto={usuario?.foto}
//             onClose={() => setEstadoBusqueda(null)}
//           />
//         )}

//         {usuario && (
//           <>
//             <input
//               value={usuario.cedula}
//               disabled
//               className="border p-2 rounded w-full mb-2"
//             />

//             <input
//               value={usuario.nombre}
//               disabled
//               className="border p-2 rounded w-full mb-2"
//             />

//             <input
//               value={usuario.apellido}
//               disabled
//               className="border p-2 rounded w-full mb-4"
//             />

//             <div className="flex gap-4">
//               <button
//                 onClick={onClose}
//                 className="w-1/2 bg-gray-400 text-white py-2 rounded"
//               >
//                 Cancelar
//               </button>

//               <button
//                 onClick={confirmarRestaurar}
//                 className="w-1/2 bg-blue-900 text-white py-2 rounded"
//               >
//                 Restaurar
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default RestaurarUsuario;
// import Campo from "./Campo";
// import Select from "./Select";
// import { useForm } from "react-hook-form";
// import type { FormValues, Usuario } from "../types";
// import { Rol } from "../types";
// import { useState } from "react";
// import { User } from "lucide-react";
// import ModalUsuarioEstado from "./ModalUsuarioEstado";

// interface Props {
//   onClose: () => void;
//   onUsuarioActualizado: (usuario: Usuario) => void;
// }

// function FormularioModAdmin({ onClose, onUsuarioActualizado }: Props) {
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     trigger,
//     formState: { errors },
//   } = useForm<FormValues>();

//   const [usuarioEncontrado, setUsuarioEncontrado] = useState<Usuario | null>(
//     null,
//   );

//   const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);

//   const [estadoUsuario, setEstadoUsuario] = useState<
//     "encontrado" | "no-encontrado" | null
//   >(null);

//   const cedula = watch("cedula");

//   /* =======================
//      BUSCAR USUARIO MANUAL
//   ======================= */

//   const buscarUsuarioManual = async () => {
//     const esValido = await trigger("cedula");

//     if (!esValido) return; //  Si no pasa validación, muestra error y NO busca

//     if (!cedula) return;

//     try {
//       const resp = await fetch(
//         import.meta.env.VITE_BACKEND + "/api/usuarios/" + cedula,
//         { credentials: "include" },
//       );

//       if (resp.status === 404) {
//         setEstadoUsuario("no-encontrado");
//         setUsuarioEncontrado(null);
//         return;
//       }

//       if (!resp.ok) return;

//       const usuario: Usuario = await resp.json();

//       setUsuarioEncontrado(usuario);
//       setEstadoUsuario("encontrado");

//       setValue("nombre", usuario.nombre);
//       setValue("apellido", usuario.apellido);
//       setValue("telefono", usuario.telefono);
//       setValue("rol", usuario.rol as Rol);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   /* =======================
//      DETECTAR CAMBIOS
//   ======================= */
//   const valores = watch();

//   const hayCambios =
//     usuarioEncontrado &&
//     (valores.nombre !== usuarioEncontrado.nombre ||
//       valores.apellido !== usuarioEncontrado.apellido ||
//       valores.telefono !== usuarioEncontrado.telefono ||
//       valores.rol !== usuarioEncontrado.rol ||
//       valores.foto?.length > 0);

//   /* =======================
//      MODIFICAR USUARIO
//   ======================= */
//   const handlerSubmit = handleSubmit(async (data) => {
//     if (!usuarioEncontrado) return;

//     try {
//       const cuerpo = new FormData();
//       cuerpo.append("cedula", String(data.cedula));
//       cuerpo.append("nombre", data.nombre);
//       cuerpo.append("apellido", data.apellido);
//       cuerpo.append("telefono", String(data.telefono));
//       cuerpo.append("rol", data.rol);

//       if (data.foto?.[0]) cuerpo.append("foto", data.foto[0]);

//       const peticion = await fetch(
//         import.meta.env.VITE_BACKEND + "/api/usuarios/" + usuarioEncontrado._id,
//         {
//           method: "PUT",
//           body: cuerpo,
//           credentials: "include",
//         },
//       );

//       if (!peticion.ok) throw new Error();

//       const usuarioActualizado: Usuario = await peticion.json();

//       setUsuarioEncontrado(usuarioActualizado);

//       alert("Usuario modificado con éxito");
//       // avisar al padre que refresque
//       onUsuarioActualizado(usuarioActualizado);
//       //  cerrar modal principal
//       onClose();
//     } catch (error) {
//       alert("Ha ocurrido un error");
//       console.error(error);
//     }
//   });

//   return (
//     <div className="bg-white h-full w-full flex justify-center items-center flex-col rounded-[1.5rem]">
//       <form onSubmit={handlerSubmit} className="w-full">
//         <h2 className="flex justify-center items-center pb-4 text-4xl">
//           Modificar usuario
//         </h2>

//         {/* CÉDULA */}
//         <div className="flex w-full gap-[0.5rem] mb-[0.5rem]">
//           <div className="w-[80%]">
//             <Campo
//               nombre="cedula"
//               placeholder="Número de cédula"
//               tipo="number"
//               disabled={mostrarFormulario}
//               errors={errors}
//               regis={register("cedula", {
//                 required: "La cédula es obligatoria",
//                 validate: (value) =>
//                   value.toString().length >= 6 ||
//                   "La cédula ingresada debe tener al menos seis digitos",
//               })}
//             />
//           </div>

//           {/* ICONO QUE DISPARA LA BÚSQUEDA */}
//           <div
//             onClick={buscarUsuarioManual}
//             className="w-[20%] flex items-center justify-center rounded-lg bg-gray-200 cursor-pointer"
//           >
//             {usuarioEncontrado?.foto ? (
//               <img
//                 src={usuarioEncontrado.foto}
//                 className="w-12 h-12 rounded-full object-cover"
//               />
//             ) : (
//               <User size={32} />
//             )}
//           </div>
//         </div>

//         {mostrarFormulario && usuarioEncontrado && (
//           <>
//             <Campo
//               nombre="nombre"
//               placeholder="Nombres"
//               tipo="text"
//               errors={errors}
//               regis={register("nombre", {
//                 required: "El nombre es obligatorio",
//                 minLength: {
//                   value: 2,
//                   message: "El nombre debe tener al menos 2 caracteres",
//                 },
//                 maxLength: {
//                   value: 40,
//                   message: "El nombre no debe superar 40 caracteres",
//                 },
//                 validate: (valor) => {
//                   if (/[<>]/.test(valor))
//                     return "No se permiten los caracteres < o >";
//                   if (/ {3,}/.test(valor))
//                     return "No se permiten más de dos espacios seguidos";
//                   if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor))
//                     return "Solo se permiten letras y espacios";
//                   return true;
//                 },
//               })}
//             />

//             <Campo
//               nombre="apellido"
//               placeholder="Apellidos"
//               tipo="text"
//               errors={errors}
//               regis={register("apellido", {
//                 required: "El apellido es obligatorio",
//                 minLength: {
//                   value: 2,
//                   message: "El apellido debe tener al menos 2 caracteres",
//                 },
//                 maxLength: {
//                   value: 40,
//                   message: "El apellido no debe superar 40 caracteres",
//                 },
//                 validate: (valor) => {
//                   if (/[<>]/.test(valor))
//                     return "No se permiten los caracteres < o >";
//                   if (/ {2,}/.test(valor))
//                     return "No se permiten más de dos espacios seguidos";
//                   if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor))
//                     return "Solo se permiten letras y espacios";
//                   return true;
//                 },
//               })}
//             />

//             <Campo
//               nombre="telefono"
//               placeholder="Telefono"
//               tipo="text"
//               errors={errors}
//               regis={register("telefono", {
//                 required: "El telefono es obligatorio",
//                 minLength: {
//                   value: 10,
//                   message: "El teléfono debe tener mínimo 10 caracteres",
//                 },
//                 maxLength: {
//                   value: 35,
//                   message: "El teléfono no debe superar 35 caracteres",
//                 },
//                 validate: (valor) => {
//                   const telefono = String(valor ?? "").toLowerCase();

//                   if (/[<>]/.test(telefono))
//                     return "No se permiten los caracteres < o >";

//                   if (/ {2,}/.test(telefono))
//                     return "No se permiten más de dos espacios seguidos";

//                   if ((telefono.match(/\+/g) || []).length > 1)
//                     return "El signo '+' solo se puede usar una vez";

//                   if (
//                     (telefono.match(/\(/g) || []).length > 1 ||
//                     (telefono.match(/\)/g) || []).length > 1
//                   )
//                     return "Los paréntesis solo se pueden usar una vez";

//                   if (/[^0-9\s()+ext]/i.test(telefono))
//                     return "El teléfono contiene caracteres inválidos";

//                   if ((telefono.match(/ext/g) || []).length > 1)
//                     return "La palabra 'ext' solo se puede usar una vez";

//                   return true;
//                 },
//               })}
//             />

//             <Campo
//               nombre="foto"
//               placeholder="Modificar foto"
//               tipo="file"
//               errors={errors}
//               regis={register("foto")}
//             />

//             <Select
//               nombre="rol"
//               titulo="Rol"
//               errors={errors}
//               setValue={setValue}
//               regis={register("rol")}
//               opciones={Object.values(Rol)}
//             />

//             <button
//               type="submit"
//               disabled={!hayCambios}
//               className={`w-full py-[0.5rem] rounded-lg mt-[0.5rem] text-white ${
//                 hayCambios
//                   ? "bg-blue-600 hover:bg-blue-700"
//                   : "bg-gray-400 cursor-not-allowed"
//               }`}
//             >
//               Modificar
//             </button>
//           </>
//         )}
//       </form>

//       {estadoUsuario && (
//         <ModalUsuarioEstado
//           tipo={estadoUsuario}
//           cedula={cedula}
//           foto={usuarioEncontrado?.foto}
//           onClose={() => {
//             if (estadoUsuario === "encontrado") {
//               setMostrarFormulario(true);
//             }
//             setEstadoUsuario(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// export default FormularioModAdmin;

// todo esta funcionando perfecto solo quiero dos cambios y es que cuando se elimine un usuario se debe borrar enseguida de la vista 
// type Vista = "misVacunas" | "pacientes"; pacientes o si se restaura un usuario debe verse enseguida en la lista pacientes 
// ahora mismo se ven unicamente despues de recargar la pagina la idea es que funcione como cuando se modifica la informacion del 
// usuario cambia enseguida sin necesidad de recargar la pagina . 

// hacer el cambio sin afectar estilos actuales ,  sin borrar funciones actuales,  solo agregar la nueva solicitud , dar codigo 
// completo para copiar y pegar 

import { createContext, useContext, useState, type ReactNode } from "react";

interface PhotoContextType {
  fotos: Record<string, string>;
  actualizarFoto: (usuarioId: string, nuevaFoto: string) => void;

  triggerVacunador: boolean;
  dispatchTriggerVacunador: () => void;

  // ✅ NUEVO
  triggerPacientes: boolean;
  dispatchTriggerPacientes: () => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [triggerVacunador, setTriggerVacunador] = useState<boolean>(false);

  const dispatchTriggerVacunador = () =>
    setTriggerVacunador(!triggerVacunador);

  // ✅ NUEVO
  const [triggerPacientes, setTriggerPacientes] = useState<boolean>(false);

  const dispatchTriggerPacientes = () =>
    setTriggerPacientes(!triggerPacientes);

  const [fotos, setFotos] = useState<Record<string, string>>({});

  const actualizarFoto = (
    usuarioId: string,
    nuevaFoto: string
  ): void => {
    setFotos((prev) => ({
      ...prev,
      [usuarioId]: nuevaFoto,
    }));
  };

  return (
    <PhotoContext.Provider
      value={{
        fotos,
        actualizarFoto,
        triggerVacunador,
        dispatchTriggerVacunador,

        // ✅ NUEVO
        triggerPacientes,
        dispatchTriggerPacientes,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePhoto(): PhotoContextType {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhoto debe usarse dentro de PhotoProvider");
  }
  return context;
}