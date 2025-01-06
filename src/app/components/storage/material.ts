export interface Material {
  idMaterial?: string;  // Se recibe después de la creación
  nombre: string;
  descripcion: string;
  stock: number;
  esCompleto: boolean;
  esSoporte: boolean;
  estado: string;
  fechaAlta?: string;
}
