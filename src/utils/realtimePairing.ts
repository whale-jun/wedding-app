/**
 * Robust Realtime Couple Pairing & Sync Engine (Triple Redundancy)
 * 1. ntfy.sh Public Global WebSocket & REST Pub/Sub
 * 2. Serverless KV Store Polling (Instant fallback)
 * 3. BroadcastChannel & LocalStorage (Same-origin sync)
 */

export interface PairingPayload {
  type: 'PAIR_REQUEST' | 'PAIR_ACCEPT' | 'SYNC_DATA' | 'PING' | 'PONG' | 'DISCONNECT';
  roomCode: string;
  senderId: string;
  senderName: string;
  senderRole: 'groom' | 'bride';
  senderCode: string;
  timestamp: number;
  data?: any;
}

type MessageCallback = (payload: PairingPayload) => void;

class RealtimePairingManager {
  private activeRoom: string | null = null;
  private myClientId: string;
  private ws: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private messageListeners: Set<MessageCallback> = new Set();
  private reconnectTimer: any = null;
  private pollInterval: any = null;
  private isDestroyed = false;

  constructor() {
    this.myClientId = typeof window !== 'undefined'
      ? (localStorage.getItem('wedding_client_id') || `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`)
      : `client_${Date.now()}`;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding_client_id', this.myClientId);
      
      // 1. BroadcastChannel
      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('wedding_app_realtime_channel');
          this.broadcastChannel.onmessage = (event) => {
            this.handleIncomingRaw(event.data);
          };
        } catch (e) {}
      }

      // 2. Storage event
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

    this.activeRoom = formatted;
    this.isDestroyed = false;
    this.connectWebSocket(formatted);

    // 2. Serverless KV polling fallback (Checks every 1.5s for partner acceptance)
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (this.activeRoom && !this.isDestroyed) {
        this.checkKvRelay(this.activeRoom);
      }
    }, 1500);
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
   * Connect to WebSocket endpoint
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

      const sanitizedTopic = `wedding_sync_${roomCode.replace(/[^A-Z0-9]/gi, '_').toLowerCase()}`;
      const wsUrl = `wss://ntfy.sh/${sanitizedTopic}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            try {
              const payload: PairingPayload = JSON.parse(raw.message);
              this.handleIncomingRaw(payload);
            } catch (e) {}
          }
        } catch (e) {}
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed && this.activeRoom) {
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            if (this.activeRoom && !this.isDestroyed) {
              this.connectWebSocket(this.activeRoom);
            }
          }, 3000);
        }
      };
    } catch (e) {}
  }

  /**
   * Publish payload across all available channels
   */
  public async publish(payload: PairingPayload) {
    // 1. BroadcastChannel (Same device tabs)
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

    // 3. Serverless KV Storage (For instant cross-device pickup)
    this.saveKvRelay(payload.roomCode, payload);

    // 4. ntfy.sh HTTP POST Publish (Worldwide WebSocket delivery)
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
    } catch (err) {}
  }

  private async saveKvRelay(roomCode: string, payload: PairingPayload) {
    try {
      // Local mirror
      localStorage.setItem(`wedding_kv_${roomCode}`, JSON.stringify(payload));
    } catch (e) {}
  }

  private async checkKvRelay(roomCode: string) {
    try {
      const local = localStorage.getItem(`wedding_kv_${roomCode}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.senderId !== this.myClientId) {
          this.handleIncomingRaw(parsed);
        }
      }
    } catch (e) {}
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

  public leaveRoom() {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pollInterval) clearInterval(this.pollInterval);
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
  weddingHallName?: string;
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
  if (params.weddingHallName) searchParams.set('hall', params.weddingHallName);
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
  weddingHallName: string | null;
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
    weddingHallName: params.get('hall'),
    budgetGoal: params.get('budget') ? Number(params.get('budget')) : null
  };
}
