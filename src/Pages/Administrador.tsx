// import { useState } from "react";
// import ModalFormulario from "../Componentes/ModalFormulario";
// import ModalFotoPerfil from "../Componentes/ModalFotoPerfil";
// import ModalAgregar from "../Componentes/ModalAgregar";
// import type { Usuario } from "../types";
// import FormularioModAdmin from "../Componentes/FormularioModAdmin";
// import RolLayout from "./RolLayout";
// import Vacunas from "./Vacunas";
// import { Rol } from "../types";


// interface PacienteProp {
//   usuario: Usuario;
// }

// function Administrador({ usuario }: PacienteProp) {
//   const [showModal, setShowModal] = useState(false);
//   const [showFotoModal, setShowFotoModal] = useState(false);
//   const [modalAgregar, setModalAgregar] = useState(false);
//   const [showModalAdmin, setShowModalAdmin] = useState(false);

//   const [fotoPerfil, setFotoPerfil] = useState(
//     "https://cdn-icons-png.flaticon.com/512/149/149071.png",
//   );

//   return (
//     <div>
//       {/* MODAL FOTO */}
//       {showFotoModal && (
//         <ModalFotoPerfil
//           fotoActual={fotoPerfil}
//           onGuardar={(nuevaFoto) => {
//             setFotoPerfil(nuevaFoto);
//             setShowFotoModal(false);
//           }}
//           onCancelar={() => setShowFotoModal(false)}
//         />
//       )}

//       {modalAgregar && <ModalAgregar onClose={() => setModalAgregar(false)} />}
//       {showModal && <ModalFormulario cerrar={() => setShowModal(false)} />}

//       {/* MODAL MODIFICAR USUARIO */}
//       {showModalAdmin && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-[95%] max-w-xl rounded-2xl p-6 relative">
//             <FormularioModAdmin />
//             <button
//               onClick={() => setShowModalAdmin(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
//             >
//               X
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="bg-white w-screen h-screen flex overflow-hidden relative">
//         {/* PANEL IZQUIERDO */}
//         <RolLayout
//           usuario={usuario}
//           fotoPerfil={fotoPerfil}
//           onEditarFoto={() => setShowFotoModal(true)}
//           onAbrirConfig={() => setShowModal(true)}
//           mostrarBotonAdmin
//           onModificarUsuario={() => setShowModalAdmin(true)}
//         />
//         {/* PARTE DERECHA */}
//         <Vacunas
//           rol={Rol.Administrador} 
//           onAgregar={() => setModalAgregar(true)}
//         />
//       </div>
//     </div>
//   );
// }

// export default Administrador;
