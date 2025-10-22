import {  type FieldValues, type FieldErrors , type UseFormRegisterReturn } from "react-hook-form"

export interface CampoProps<T extends FieldValues>{
    // titulo:string;
    tipo:"text" | "password" | "number" | "file";
    placeholder:string;
    regis: UseFormRegisterReturn;
    errors:FieldErrors<T>;
    nombre:keyof T;
}


export type FormValues = {
  nombre: string;
  apellido: string;
  correo: string;
  foto: FileList;
  cedula: string;
  telefono: string;
  clave: string;
  confirmarClave: string;
};

export type LoginInputs = {

  clave: string;
  cedula: number;
};