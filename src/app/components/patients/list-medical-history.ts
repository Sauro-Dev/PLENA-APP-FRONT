export interface ListMedicalHistory {
  id: number;
  report?: {
    idReport: number;
    fileUrl: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadAt: string;
    treatmentMonth: number;
  };
  documentName?: string;
  description?: string;
  contentType?: string;
  name: string;
}
