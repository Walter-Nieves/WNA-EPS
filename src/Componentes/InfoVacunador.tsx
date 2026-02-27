// import { useState } from "react";
// import { ChevronDown, Pencil, User } from "lucide-react";
// import ModalEditar from "./ModalEditar";
// import ModalVacunador from "./ModalVacunador";

// function InfoVacunador() {
//   const [abierto, setAbierto] = useState(false);
//   const [modalEditar, setModalEditar] = useState(false);
//   const [modalVacunador, setModalVacunador] = useState(false);

//   return (
//     <>
//       {/* CARD */}
//       <div className="bg-blue-100 rounded-xl p-4 space-y-3">
//         {/* FILA PRINCIPAL */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4 w-full">
//             {/* ICONO PERSONA */}
//             <div className="w-14 h-14 flex items-center justify-center bg-white rounded-full">
//               <User className="text-blue-900" size={28} />
//             </div>

//             {/* NOMBRE PACIENTE */}
//             <p className="font-bold text-blue-900 text-lg flex-1">Juan Pérez</p>

//             {/* FECHA */}
//             <p className="text-lg whitespace-nowrap">
//               <strong>Fecha:</strong> 12/05/2024
//             </p>
//           </div>

//           {/* ICONOS DERECHA */}
//           <div className="flex items-center gap-3 ml-4">
//             <button
//               onClick={() => setAbierto((prev) => !prev)}
//               className="hover:opacity-70"
//             >
//               <ChevronDown
//                 className={`transition-transform duration-300 ${
//                   abierto ? "rotate-180" : ""
//                 }`}
//               />
//             </button>
//           </div>
//         </div>

//         {/* INFO DESPLEGABLE */}
//         {abierto && (
//           <div className="pl-[4.5rem] text-lg">
//             <div className="flex justify-items-start gap-24">
//               {/* CONTENEDOR 1 — INFO PRINCIPAL */}
//               <div className="flex flex-col items-start space-y-3">
//                 {/* <p className="font-bold text-blue-900 text-lg">Juan Pérez</p> */}

//                 <p className="flex justify-items-start items-start">
//                   <strong>Vacuna:</strong> COVID-19
//                 </p>

//                 <p>
//                   <strong>Lugar:</strong> Centro de Salud San Martín
//                 </p>

//                 <button
//                   onClick={() => setModalEditar(true)}
//                   className="flex items-center gap-2 text-blue-900 hover:opacity-70 mt-2"
//                 >
//                   <Pencil size={18} />
//                   <span className="text-base">Editar información</span>
//                 </button>
//               </div>

//               {/* CONTENEDOR 2 — VACUNADOR */}
//               <div className="flex flex-col items-center space-y-2">
//                 <p>
//                   <strong>Vacunador:</strong> Dra. Carolina Ruiz
//                 </p>

//                 <button
//                   onClick={() => setModalVacunador(true)}
//                   className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow hover:scale-105 transition"
//                   title="Ver vacunador"
//                 >
//                   <User size={28} className="text-blue-900" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* MODALES */}
//       {modalEditar && <ModalEditar onClose={() => setModalEditar(false)} />}
//       {modalVacunador && (<ModalVacunador onClose={() => setModalVacunador(false)} />)}
//     </>
//   );
// }

// export default InfoVacunador;
