import { useState } from "react";
import type { CampoProps } from "../types";
import closedeye from "/icons/eye-slash.svg";
import openedeye from "/icons/eye.svg";
import type { FieldValues } from "react-hook-form";



function Campo<T extends FieldValues>({tipo,placeholder,regis,errors,nombre,disabled=false}:CampoProps<T>) {

    const [mostrarClave, setMostrarClave] = useState<boolean>(false);
    

  return (
    <div className="relative">
        <input className="mt-1 block w-full border rounded-lg p-2 select-none"
        type={tipo == "password" ? !mostrarClave ? "password" : "text" : tipo} placeholder={placeholder}{...regis} disabled={disabled} />
        {tipo == "password" && <button type="button" onClick={()=>setMostrarClave(!mostrarClave)} className="pl-1 cursor-pointer absolute  top-4 right-2" >
            <img src={mostrarClave ? closedeye : openedeye } alt="" />
            </button>}
            {errors[nombre] && <p className="text-red-500 text-[0.625rem] flex justify-start w-full">{errors[nombre]?.message?.toString()}</p>}
    </div>
  )
}

export default Campo