// Importa el tipo FieldValues desde react-hook-form para tipar formularios genéricos
import type { FieldValues } from "react-hook-form";
// Importa el tipo SelectProps desde el archivo de tipos local
import type { SelectProps } from "../types";
import { useState } from "react";

function Option({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 border-transparent border-t-white border-1 hover:bg-blue-700 text-xs w-full text-left px-3 py-1"
    >
      {children}
    </button>
  );
}

function Select<T extends FieldValues>({
  titulo,
  nombre,
  errors,
  regis,
  setValue,
  opciones,
   disabled = false,
}: SelectProps<T>) {

  // Estado del valor seleccionado
  const [valor, setValor] = useState("Paciente");

  // Estado para mostrar u ocultar opciones
  const [mostrar, setMostrar] = useState(false);

  return (
    <label
      className={"flex flex-col cursor-pointer select-none" }
     onClick={() => setMostrar(!mostrar)} // despliega/oculta
    >
      <span className="text-[.7rem]">{titulo}</span>

      <div className= {`relative mt-1 block w-full border rounded-lg p-2 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"
        }`} >
        {/* despliega/oculta, aqui toma este onclick */}
        <div onClick={() => !disabled && setMostrar(!mostrar)}>
          {/* Input que despliega y oculta opciones */}
          <input
            className="hidden"
            type="text"
            disabled={true}
            value={valor}
            onClick={() => setMostrar(!mostrar)} // despliega/oculta
            {...regis}
            />
          <p className=" w-full px-2 py-0.5 text-xs rounded h-5">
            {valor}
          </p>

          {/* LISTA DE OPCIONES */}
        </div>
        {!disabled && mostrar && (
          <div className="absolute left-0 top-full flex flex-col bg-blue-600  w-full overflow-hidden rounded-bl rounded-br shadow-md z-10">
            {opciones.map((opcion,index) => (
              <Option
                key={index}
                // seleccionar={()=>{setValue(nombre,op); setSelected(op)}}
                onClick={() => {
                  setValue(nombre,opcion)
                  setValor(opcion); // Guarda selección
                  setMostrar(false); // Oculta las opciones
                }}
              >
                {opcion}
              </Option>
            ))}
          </div>
        )}
      </div>

      {errors[nombre] && (
        <span className="text-red-500 text-[0.5rem]">
          {errors[nombre]?.message?.toString()}
        </span>
      )}
    </label>
  );
}

export default Select;
