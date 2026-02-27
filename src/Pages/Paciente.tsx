// import { useState } from "react";
// import ModalFormulario from "../Componentes/ModalFormulario";
// import ModalFotoPerfil from "../Componentes/ModalFotoPerfil";
// import type { Usuario } from "../types";
// import RolLayout from "./RolLayout";
// import Vacunas from "./Vacunas";
// import { Rol } from "../types";


// interface PacienteProp {
//   usuario: Usuario;
// }

// function Paciente({ usuario }: PacienteProp) {
//   const [showModal, setShowModal] = useState(false);
//   const [showFotoModal, setShowFotoModal] = useState(false);
//   const [fotoPerfil, setFotoPerfil] = useState(
//     "https://cdn-icons-png.flaticon.com/512/149/149071.png",
//   );

//   return (
//     <div>
//       {/* MODALES (SIN CAMBIOS) */}
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

//       <div className="bg-white w-screen h-screen flex overflow-hidden">
//         {/* PANEL IZQUIERDO */}
//         <RolLayout
//           usuario={usuario}
//           fotoPerfil={fotoPerfil}
//           onEditarFoto={() => setShowFotoModal(true)}
//           onAbrirConfig={() => setShowModal(true)}
//         />
//         {/* PARTE DERECHA */}
//         <Vacunas rol={Rol.Paciente} onAgregar={() => {}} /> 
//       </div>
//     </div>
//   );
// }

// export default Paciente;
