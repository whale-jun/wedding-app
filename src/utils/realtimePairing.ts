/**
 * Robust Realtime Couple Pairing & Sync Engine (Triple Redundancy)
 * 1. ntfy.sh Public Global WebSocket & REST Pub/Sub
 * 2. Serverless State Polling (Instant fallback for sleep/background)
 * 3. BroadcastChannel & LocalStorage (Same-origin sync)
 */
import { playWeddingChime, sendLocalNotification } from './notifications';
import { triggerPartnerToast } from '../components/common/PartnerActivityToast';

export interface PairingActivity {
  category: 'checklist' | 'calendar' | 'budget' | 'profile' | 'general';
  title: string;
  detail?: string;
}

export interface PairingPayload {
  type: 'PAIR_REQUEST' | 'PAIR_ACCEPT' | 'SYNC_DATA' | 'PING' | 'PONG' | 'DISCONNECT';
  roomCode: string;
  senderId: string;
  senderName: string;
  senderRole: 'groom' | 'bride';
  senderCode: string;
  timestamp: number;
  data?: any;
  activity?: PairingActivity;
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
  private lastProcessedTimestamp: number = 0;

  constructor() {
    this.myClientId = typeof window !== 'undefined'
      ? (localStorage.getItem('wedding_client_id') || `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`)
      : `client_${Date.now()}`;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding_client_id', this.myClientId);
      
      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('wedding_app_realtime_channel');
          this.broadcastChannel.onmessage = (event) => {
            this.handleIncomingRaw(event.data);
          };
        } catch (e) {}
      }

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
   * Start listening on a specific room code (invite room)
   */
  public joinRoom(roomCode: string, onMessage?: MessageCallback) {
    const formatted = roomCode.trim().toUpperCase();
    if (!formatted) return;

    if (onMessage) {
      this.messageListeners.add(onMessage);
    }

    if (this.activeRoom === formatted && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.activeRoom = formatted;
    this.isDestroyed = false;
    this.connectWebSocket(formatted);

    // Continuous 1.2s rapid polling fallback (catches updates when phone screen turns on or WS disconnects)
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (this.activeRoom && !this.isDestroyed) {
        this.pollRemoteCache(this.activeRoom);
      }
    }, 1200);
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

      this.ws.onerror = () => {
        // Handled silently
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed && this.activeRoom) {
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            if (this.activeRoom && !this.isDestroyed) {
              this.connectWebSocket(this.activeRoom);
            }
          }, 2500);
        }
      };
    } catch (e) {}
  }

  /**
   * Fast Remote Polling Fallback
   */
  private async pollRemoteCache(roomCode: string) {
    const topic = `wedding_sync_${roomCode.replace(/[^A-Z0-9]/gi, '_').toLowerCase()}`;
    try {
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const raw = JSON.parse(lines[i]);
            if (raw.event === 'message' && raw.message) {
              const payload: PairingPayload = JSON.parse(raw.message);
              if (payload.roomCode.toUpperCase() === roomCode.toUpperCase()) {
                if (payload.timestamp > this.lastProcessedTimestamp && payload.senderId !== this.myClientId) {
                  this.handleIncomingRaw(payload);
                }
                return;
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  /**
   * Publish payload across all available channels
   */
  public async publish(payload: PairingPayload) {
    payload.timestamp = Date.now();

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

    // 3. ntfy.sh HTTP POST Publish (Worldwide WebSocket & REST delivery)
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

  /**
   * Handle incoming raw message and notify listeners + trigger alarms
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

    // Deduplicate older timestamps
    if (payload.timestamp && payload.timestamp <= this.lastProcessedTimestamp) {
      return;
    }
    this.lastProcessedTimestamp = payload.timestamp || Date.now();

    // Trigger In-App Notification Toast and Chime if activity is present
    if (payload.activity) {
      triggerPartnerToast({
        id: `act_${Date.now()}`,
        senderName: payload.senderName,
        senderRole: payload.senderRole,
        category: payload.activity.category,
        title: payload.activity.title,
        detail: payload.activity.detail,
        timestamp: payload.timestamp
      });
      playWeddingChime();
      sendLocalNotification(`[웨딩어플] ${payload.senderName || '배우자'}님의 알림`, {
        body: `${payload.activity.title} ${payload.activity.detail || ''}`
      });
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
 * Generate a smart shareable URL containing invitation room & compressed basic profile
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
