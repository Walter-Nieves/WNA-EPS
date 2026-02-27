// import { useState } from "react";
// import ModalFormulario from "../Componentes/ModalFormulario";
// import ModalFotoPerfil from "../Componentes/ModalFotoPerfil";
// import ModalAgregar from "../Componentes/ModalAgregar";
// import type { Usuario } from "../types";
// import RolLayout from "./RolLayout";
// import Vacunas from "./Vacunas";
// import { Rol } from "../types";

// interface PacienteProp {
//   usuario: Usuario;
// }

// function Vacunador({ usuario }: PacienteProp) {
//   const [showModal, setShowModal] = useState(false);
//   const [showFotoModal, setShowFotoModal] = useState(false);
//   const [modalAgregar, setModalAgregar] = useState(false);

//   const [fotoPerfil, setFotoPerfil] = useState(
//     "https://cdn-icons-png.flaticon.com/512/149/149071.png",
//   );

//   return (
//     <div>
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

//       {showModal && <ModalFormulario cerrar={() => setShowModal(false)} />}
//       {modalAgregar && <ModalAgregar onClose={() => setModalAgregar(false)} />}

//       <div className="bg-white w-screen h-screen flex overflow-hidden relative">
//         {/* PANEL IZQUIERDO */}
//         <RolLayout
//           usuario={usuario}
//           fotoPerfil={fotoPerfil}
//           onEditarFoto={() => setShowFotoModal(true)}
//           onAbrirConfig={() => setShowModal(true)}
//         />
//         {/* PARTE DERECHA */}
//         <Vacunas rol={Rol.Vacunador} onAgregar={() => setModalAgregar(true)} /> 
//       </div>
//     </div>
//   );
// }

// export default Vacunador;
