import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SseService {
  private readonly authService = inject(AuthService);
  private abortController: AbortController | null = null;
  private reconnectTimeout: any = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  
  isConnected = signal<boolean>(false);
  
  async connect(
    onMessage: (data: any) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    console.log('[SSE] connect() appelé');
    this.disconnect();

    const token = this.authService.accessToken();
    console.log('[SSE] Token disponible:', token ? `Oui (${token.substring(0, 20)}...)` : 'NON');
    
    if (!token) {
      console.error('[SSE] Pas de token disponible, abandon');
      return;
    }

    this.abortController = new AbortController();
    const url = `${environment.apiUrl}/notifications/sse`;

    try {
      console.log('[SSE] Tentative de connexion vers:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        signal: this.abortController.signal,
      });

      console.log('[SSE] Réponse reçue, status:', response.status);
      if (response.status === 401) {
        console.warn('[SSE] Token expiré (401), reconnexion dans 2s...');
        this.isConnected.set(false);
        setTimeout(() => {
          if (this.authService.isAuthenticated()) {
            console.log('[SSE] Nouvelle tentative de connexion avec token rafraîchi');
            this.connect(onMessage, onError);
          }
        }, 2000);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SSE] Erreur HTTP:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body available');
      }

      this.isConnected.set(true);
      console.log('[SSE]Connexion établie avec succès');

      this.reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('[SSE] Début de lecture du stream...');

      while (true) {
        const { done, value } = await this.reader.read();
        
        if (done) {
          console.log('[SSE] Stream terminé');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        console.log('[SSE] Chunk reçu, buffer size:', buffer.length);
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; 
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          console.log('[SSE] Ligne:', trimmedLine);
          
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              console.log('[SSE] Message reçu:', parsed);
              onMessage(parsed);
            } catch (e) {
              console.error('[SSE] Erreur parsing JSON:', e, 'Data:', data);
            }
          } else if (trimmedLine.startsWith(':')) {
            console.log('[SSE]  Keep-alive reçu');
          } else if (trimmedLine === '') {
            console.log('[SSE] Ligne vide (séparateur de message)');
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[SSE] Connexion annulée volontairement');
        return;
      }

      console.error('[SSE] Erreur de connexion:', error);
      this.isConnected.set(false);
      
      if (onError) {
        onError(error);
      }
      if (this.authService.isAuthenticated()) {
        console.log('[SSE] Tentative de reconnexion dans 5s...');
        this.reconnectTimeout = setTimeout(() => {
          console.log('[SSE] Reconnexion...');
          this.connect(onMessage, onError);
        }, 5000);
      }
    }
  }

  disconnect(): void {
    console.log('[SSE] Déconnexion...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.reader) {
      this.reader.cancel().catch(err => {
        console.error('[SSE] Erreur lors de la fermeture du reader:', err);
      });
      this.reader = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.isConnected.set(false);
    console.log('[SSE] Déconnecté');
  }
}