import { Injectable } from '@angular/core';
import { StudyMajor } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly majorNames: Record<StudyMajor, string> = {
    [StudyMajor.GL]: 'Génie Logiciel',
    [StudyMajor.RT]: 'Réseaux et Télécommunications',
    [StudyMajor.IMI]: 'Instrumentation et Maintenance Industrielle',
    [StudyMajor.IIA]: 'Informatique Industrielle & Automatique',
    [StudyMajor.BIO]: 'Biologie Industrielle',
    [StudyMajor.CH]: 'Chimie Industrielle'
  };

  calculateAge(dateOfBirth: string | Date): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getMajorFullName(major: StudyMajor): string {
    return this.majorNames[major] || major;
  }

  getAllMajors(): StudyMajor[] {
    return Object.values(StudyMajor);
  }


  getImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/api/uploads/${imagePath}`;
  }

 
  getUserInitials(name: string | undefined, lastName?: string): string {
    if (!name) return '?';
    if (lastName) {
      return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }


  formatDateForInput(date?: string | Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
}