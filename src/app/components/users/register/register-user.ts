export interface RegisterUser {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  lastNamePaterno: string;
  lastNameMaterno: string;
  dni: string;
  email: string;
  address: string;
  birthdate: Date;
  phone: string;
  backupPhone: string;
  role: string;
  isAdmin: boolean;
  paymentSession?: number;
  paymentMonthly?: number;
  adminPassword?: string;
}
