import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private clients = new Map<number, Subject<any>>();

  addClient(userId: number): Observable<any> {
    const subject = new Subject<any>();
    this.clients.set(userId, subject);
    console.log(`[SSE Backend] ✅ Client ajouté pour userId ${userId}, total clients: ${this.clients.size}`);
    
    // Envoyer un message de connexion réussie
    setTimeout(() => {
      subject.next({
        type: 'connection',
        data: { status: 'connected', userId, timestamp: new Date() }
      });
    }, 100);

    const heartbeatInterval = setInterval(() => {
      if (this.clients.has(userId)) {
        subject.next({
          type: 'heartbeat',
          data: { timestamp: new Date() }
        });
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 10000);
    
    return subject.asObservable();
  }

  removeClient(userId: number): void {
    const subject = this.clients.get(userId);
    if (subject) {
      subject.complete();
    }
    this.clients.delete(userId);
    console.log(`[SSE Backend] ❌ Client retiré pour userId ${userId}, total clients: ${this.clients.size}`);
  }

  sendNotification(userId: number, data: any): boolean {
    const client = this.clients.get(userId);
    if (client) {
      console.log(`[SSE Backend] 📤 Envoi notification à userId ${userId}:`, data);
      client.next(data);
      return true;
    }
    console.warn(`[SSE Backend] ⚠️ Client non connecté pour userId ${userId}`);
    return false;
  }

  broadcastToUsers(userIds: number[], data: any): void {
    userIds.forEach(userId => this.sendNotification(userId, data));
  }

  // Méthode pour envoyer des notifications avec format standardisé
  sendFormattedNotification(userId: number, notification: any): boolean {
    const formattedData = {
      type: 'notification',
      data: notification
    };
    console.log(`[SSE Backend] Envoi notification formatée à userId ${userId}:`, formattedData);
    return this.sendNotification(userId, formattedData);
  }

  // Vérifier si un utilisateur est connecté en SSE
  isUserConnected(userId: number): boolean {
    const connected = this.clients.has(userId);
    console.log(`[SSE Backend] Vérification connexion userId ${userId}: ${connected ? 'OUI' : 'NON'}`);
    return connected;
  }

  // Debug: Lister tous les clients connectés
  getConnectedUsers(): number[] {
    return Array.from(this.clients.keys());
  }
}