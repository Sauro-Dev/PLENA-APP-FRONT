export interface DocumentBase {
  fileUrl: string;
  fileName: string;
  name: string;
  description?: string;
  contentType: string;
  fileSize: number;
  uploadAt: string;
}
