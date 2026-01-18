import { Injectable } from '@angular/core';

/**
 * Service pour gérer l'upload et la validation de fichiers
 */
@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  // Taille maximale : 2 MB
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024;

  // Types d'images autorisés
  private readonly ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  /**
   * Valider un fichier image
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // Vérifier le type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Format non autorisé. Utilisez PNG, JPG ou JPEG.',
      };
    }

    // Vérifier la taille
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille max : ${this.MAX_FILE_SIZE / (1024 * 1024)} MB.`,
      };
    }

    return { valid: true };
  }

  /**
   * Convertir un fichier en base64 (pour preview)
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Créer un FormData pour l'upload
   */
  createFormData(data: Record<string, any>, fileField?: string, file?: File): FormData {
    const formData = new FormData();

    // Ajouter les champs normaux
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Ajouter le fichier si présent
    if (fileField && file) {
      formData.append(fileField, file, file.name);
    }

    return formData;
  }

  /**
   * Obtenir l'extension d'un fichier
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Formater la taille d'un fichier
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
