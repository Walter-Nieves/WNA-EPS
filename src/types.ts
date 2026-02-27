import { type FieldErrors, type FieldValues, type Path, type PathValue, type UseFormRegisterReturn, type UseFormSetValue } from "react-hook-form";


export interface CampoProps<T extends FieldValues>{
  tipo: "text" | "password" | "number" | "file" | "email";
  placeholder: string;
  regis: UseFormRegisterReturn;
  errors: FieldErrors<T>;
  nombre: Path<T>;
  disabled?: boolean; 
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
  rol:Rol
};

export type LoginInputs = {

  clave: string;
  cedula: number;
};

export enum Rol {
  'Vacunador' = 'Vacunador',
  'Paciente' = 'Paciente',
  'Administrador' = 'Administrador'
}

export interface SelectProps <T extends FieldValues>{
  titulo:string;
  regis: UseFormRegisterReturn;
  errors:FieldErrors<T>;
  nombre:Path<T>;
  opciones:PathValue<T,Path<T>>[];
  setValue:UseFormSetValue<T>;
  disabled?: boolean;
}

export interface Vacuna {
  _id?: string
  cedula: number
  nombre: string
  fecha: string
  lugar: string

  nombrePaciente: string 
  nombreVacunador: string
  fotoPaciente?: string
  fotoVacunador: string
  vacunadorId?: string
  pacienteId?: string
  vacunadorCedula?: number

  nombreAdministrador?: string
  fotoAdministrador?: string
  agregadoPorRol: Rol   
  agregadoPorId: string
}

export interface UsuarioLogueado {
  cedula: number
  nombre: string
  foto: string
}

export interface Props {
  usuarioLogueado: UsuarioLogueado
}


export interface InfoVacunaProps {
  nombre: string;
  fecha: string;
  vacunador: string;
  lugar: string;
}
export interface VacunasProps {
  rol: Rol;
  usuarioLogueado: Usuario;
  refreshKey:number;
}

export interface ModalFotoPerfilProps {
  fotoActual: string;
  onGuardar: (foto: string) => void;
  onCancelar: () => void;
}
export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  cedula: number;
  telefono: string;
  foto: string;
  isDeleted: boolean
}
export interface PacienteConVacunas {
  paciente: Usuario;
  vacunas: Vacuna[];
}