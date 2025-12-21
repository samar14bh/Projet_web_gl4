import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private clients = new Map<number, Subject<any>>();

  addClient(userId: number): Observable<any> {
    const subject = new Subject<any>();
    this.clients.set(userId, subject);
    console.log(`Client SSE ajouté pour l'utilisateur ${userId}`);
    return subject.asObservable();
  }

  removeClient(userId: number): void {
    const subject = this.clients.get(userId);
    if (subject) {
      subject.complete();
    }
    this.clients.delete(userId);
    console.log(`Client SSE retiré pour l'utilisateur ${userId}`);
  }

  sendNotification(userId: number, data: any): boolean {
    const client = this.clients.get(userId);
    if (client) {
      client.next({ data });
      return true;
    }
    return false;
  }

  broadcastToUsers(userIds: number[], data: any): void {
    userIds.forEach(userId => this.sendNotification(userId, data));
  }

  // Nouvelle méthode pour envoyer des notifications avec format standardisé
  sendFormattedNotification(userId: number, notification: any): boolean {
    const formattedData = {
      type: 'notification',
      data: notification
    };
    return this.sendNotification(userId, formattedData);
  }

  // Vérifier si un utilisateur est connecté en SSE
  isUserConnected(userId: number): boolean {
    return this.clients.has(userId);
  }
}