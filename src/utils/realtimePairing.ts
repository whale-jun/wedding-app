/**
 * Robust Realtime Couple Pairing & Sync Engine
 * Enables 100% serverless, zero-config real-time pairing & data sync between two mobile devices / browsers.
 * 
 * Channels:
 * 1. ntfy.sh Public WebSocket & REST Pub/Sub (Fast, reliable cross-device real-time relay)
 * 2. BroadcastChannel (Same-device multi-tab / window sync)
 * 3. LocalStorage Event (Fallback for same-origin tabs)
 */

export interface PairingPayload {
  type: 'PAIR_REQUEST' | 'PAIR_ACCEPT' | 'SYNC_DATA' | 'PING' | 'PONG' | 'DISCONNECT';
  roomCode: string;
  senderId: string;
  senderName: string;
  senderRole: 'groom' | 'bride';
  senderCode: string;
  timestamp: number;
  data?: any; // Full or partial wedding data
}

type MessageCallback = (payload: PairingPayload) => void;

class RealtimePairingManager {
  private activeRoom: string | null = null;
  private myClientId: string;
  private ws: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private messageListeners: Set<MessageCallback> = new Set();
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private isDestroyed = false;

  constructor() {
    this.myClientId = typeof window !== 'undefined'
      ? (localStorage.getItem('wedding_client_id') || `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`)
      : `client_${Date.now()}`;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding_client_id', this.myClientId);
      
      // 1. Setup BroadcastChannel for same-device multi-tabs
      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('wedding_app_realtime_channel');
          this.broadcastChannel.onmessage = (event) => {
            this.handleIncomingRaw(event.data);
          };
        } catch (e) {
          console.warn('BroadcastChannel not supported', e);
        }
      }

      // 2. Storage event fallback
      window.addEventListener('storage', (e) => {
        if (e.key === 'wedding_app_relay_event' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.handleIncomingRaw(parsed);
          } catch (err) {}
        }
      });
    }
  }

  public getClientId(): string {
    return this.myClientId;
  }

  /**
   * Start listening on a specific room code (invite code)
   */
  public joinRoom(roomCode: string, onMessage?: MessageCallback) {
    const formatted = roomCode.trim().toUpperCase();
    if (!formatted) return;

    if (onMessage) {
      this.messageListeners.add(onMessage);
    }

    if (this.activeRoom === formatted && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already joined and connected
    }

    this.activeRoom = formatted;
    this.isDestroyed = false;
    this.connectWebSocket(formatted);

    // Setup periodic ping to keep socket alive and notify presence
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.activeRoom) {
        this.publish({
          type: 'PING',
          roomCode: this.activeRoom,
          senderId: this.myClientId,
          senderName: '',
          senderRole: 'groom',
          senderCode: this.activeRoom,
          timestamp: Date.now()
        });
      }
    }, 25000);
  }

  public addListener(cb: MessageCallback) {
    this.messageListeners.add(cb);
    return () => {
      this.messageListeners.delete(cb);
    };
  }

  public removeListener(cb: MessageCallback) {
    this.messageListeners.delete(cb);
  }

  /**
   * Connect to public ntfy.sh WebSocket endpoint
   */
  private connectWebSocket(roomCode: string) {
    if (this.isDestroyed || typeof window === 'undefined') return;

    try {
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
        this.ws = null;
      }

      // Format clean topic name (alphanumeric and underscores)
      const sanitizedTopic = `wedding_sync_${roomCode.replace(/[^A-Z0-9]/gi, '_').toLowerCase()}`;
      const wsUrl = `wss://ntfy.sh/${sanitizedTopic}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Connected!
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          // ntfy.sh sends messages in { event: 'message', message: '...', ... } format
          if (raw.event === 'message' && raw.message) {
            try {
              const payload: PairingPayload = JSON.parse(raw.message);
              this.handleIncomingRaw(payload);
            } catch (e) {
              // Message is not JSON, ignore
            }
          }
        } catch (e) {
          // non-json frame
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Realtime WS error, falling back to HTTP sync', err);
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed && this.activeRoom) {
          // Reconnect with backoff
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            if (this.activeRoom && !this.isDestroyed) {
              this.connectWebSocket(this.activeRoom);
            }
          }, 3000);
        }
      };
    } catch (e) {
      console.warn('Failed to initialize WebSocket', e);
    }
  }

  /**
   * Publish payload across all available channels (ntfy REST, BroadcastChannel, LocalStorage)
   */
  public async publish(payload: PairingPayload) {
    // 1. BroadcastChannel (Same browser tabs)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {}
    }

    // 2. LocalStorage Event (Same origin fallback)
    try {
      localStorage.setItem('wedding_app_relay_event', JSON.stringify({
        ...payload,
        _rnd: Math.random()
      }));
    } catch (e) {}

    // 3. ntfy.sh HTTP POST Publish (Delivers to all connected WebSockets cross-device worldwide)
    const topic = `wedding_sync_${payload.roomCode.replace(/[^A-Z0-9]/gi, '_').toLowerCase()}`;
    try {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Title': 'WeddingAppSync',
          'Priority': 'urgent'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('ntfy HTTP POST failed:', err);
    }
  }

  /**
   * Handle incoming raw message and notify listeners
   */
  private handleIncomingRaw(payload: PairingPayload) {
    if (!payload || !payload.roomCode || !payload.type) return;

    // Ignore messages sent by ourselves
    if (payload.senderId === this.myClientId) {
      return;
    }

    // Check if room matches
    if (this.activeRoom && payload.roomCode.toUpperCase() !== this.activeRoom.toUpperCase()) {
      return;
    }

    // Dispatch to listeners
    this.messageListeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in message listener:', err);
      }
    });
  }

  /**
   * Disconnect and clean up
   */
  public leaveRoom() {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.activeRoom = null;
    this.messageListeners.clear();
  }
}

export const realtimePairing = new RealtimePairingManager();

/**
 * Generate a smart shareable URL containing invitation code & compressed basic profile
 */
export function buildInviteUrl(params: {
  code: string;
  groomName?: string;
  brideName?: string;
  myRole?: 'groom' | 'bride';
  weddingDate?: string;
  weddingVenue?: string;
  budgetGoal?: number;
}): string {
  const origin = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : 'https://whale-jun.github.io/wedding-app/';

  const searchParams = new URLSearchParams();
  searchParams.set('code', params.code.trim().toUpperCase());
  
  if (params.myRole) searchParams.set('role', params.myRole);
  if (params.groomName) searchParams.set('groom', params.groomName);
  if (params.brideName) searchParams.set('bride', params.brideName);
  if (params.weddingDate) searchParams.set('date', params.weddingDate);
  if (params.weddingVenue) searchParams.set('venue', params.weddingVenue);
  if (params.budgetGoal) searchParams.set('budget', String(params.budgetGoal));

  return `${origin}?${searchParams.toString()}`;
}

/**
 * Parse invite details from window.location.search
 */
export function parseInviteFromUrl(): {
  code: string | null;
  role: 'groom' | 'bride' | null;
  groomName: string | null;
  brideName: string | null;
  weddingDate: string | null;
  weddingVenue: string | null;
  budgetGoal: number | null;
} | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (!code) return null;

  return {
    code: code.trim().toUpperCase(),
    role: (params.get('role') as 'groom' | 'bride') || null,
    groomName: params.get('groom'),
    brideName: params.get('bride'),
    weddingDate: params.get('date'),
    weddingVenue: params.get('venue'),
    budgetGoal: params.get('budget') ? Number(params.get('budget')) : null
  };
}
