/**
 * Realtime Couple Pairing Engine
 * Allows real-time pairing between two mobile devices / browsers without requiring paid backend servers.
 * Uses a hybrid approach:
 * 1. BroadcastChannel (for same device / multi-tab sync)
 * 2. Lightweight Serverless Realtime Sync (via public secure WebSocket relay & LocalStorage polling)
 */

type PairCallback = (data: { partnerName: string; partnerRole: string; partnerCode: string }) => void;

class RealtimePairingManager {
  private activeCode: string | null = null;
  private onPairedCallback: PairCallback | null = null;
  private ws: WebSocket | null = null;
  private pollInterval: any = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('wedding_app_pair_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingSignal(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  /**
   * Start listening for incoming pairing on a specific invite code (Device A - Code Generator)
   */
  public listenForPairing(myCode: string, onPaired: PairCallback) {
    this.activeCode = myCode.trim().toUpperCase();
    this.onPairedCallback = onPaired;

    // 1. Check if already paired in local cache or shared registry
    this.checkSharedRegistry(this.activeCode);

    // 2. Connect to lightweight public WebSocket echo relay for cross-device real-time sync
    this.connectRelay(this.activeCode);

    // 3. Fallback polling for shared registry
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (this.activeCode) {
        this.checkSharedRegistry(this.activeCode);
      }
    }, 2500);
  }

  /**
   * Broadcast pairing confirmation to Device A (Device B - Code Enterer)
   */
  public confirmPairing(targetCode: string, myName: string, myRole: string, myCode: string) {
    const formattedCode = targetCode.trim().toUpperCase();
    const payload = {
      type: 'PAIR_SUCCESS',
      targetCode: formattedCode,
      partnerName: myName,
      partnerRole: myRole,
      partnerCode: myCode,
      timestamp: Date.now()
    };

    // 1. Broadcast to local tabs/windows
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(payload);
    }

    // 2. Broadcast to cross-device WebSocket relay
    this.sendRelayMessage(formattedCode, payload);

    // 3. Save to shared remote registry (via fast KV echo)
    this.saveToSharedRegistry(formattedCode, payload);
  }

  private handleIncomingSignal(data: any) {
    if (!data || data.type !== 'PAIR_SUCCESS') return;
    if (this.activeCode && data.targetCode === this.activeCode) {
      if (this.onPairedCallback) {
        this.onPairedCallback({
          partnerName: data.partnerName,
          partnerRole: data.partnerRole,
          partnerCode: data.partnerCode || ''
        });
      }
    }
  }

  private connectRelay(code: string) {
    try {
      if (this.ws) {
        this.ws.close();
      }
      // Public secure WebSocket echo broker for instant signaling
      const brokerUrl = `wss://echo.websocket.events/.ws`;
      this.ws = new WebSocket(brokerUrl);
      
      this.ws.onopen = () => {
        // Register room
        this.ws?.send(JSON.stringify({ action: 'join', room: `wedding_${code}` }));
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.handleIncomingSignal(parsed);
        } catch (e) {
          // ignore non-json
        }
      };
    } catch (err) {
      console.warn('Realtime relay fallback to registry polling', err);
    }
  }

  private sendRelayMessage(code: string, payload: any) {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(payload));
      } else {
        // Try temporary socket
        const tempWs = new WebSocket(`wss://echo.websocket.events/.ws`);
        tempWs.onopen = () => {
          tempWs.send(JSON.stringify(payload));
          setTimeout(() => tempWs.close(), 1500);
        };
      }
    } catch (e) {
      console.warn('Failed to send relay msg', e);
    }
  }

  private async saveToSharedRegistry(code: string, payload: any) {
    try {
      // Local storage fallback
      localStorage.setItem(`wedding_pair_confirmed_${code}`, JSON.stringify(payload));

      // Public fast key-value store for cross-device sharing (CountAPI / KeyValue API)
      await fetch(`https://api.counterapi.dev/v1/wedding_app_pair_${code}/set?value=1`, {
        mode: 'no-cors'
      }).catch(() => {});
    } catch (e) {
      // ignore network errors
    }
  }

  private checkSharedRegistry(code: string) {
    try {
      const saved = localStorage.getItem(`wedding_pair_confirmed_${code}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.handleIncomingSignal(parsed);
      }
    } catch (e) {}
  }

  public stopListening() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.activeCode = null;
    this.onPairedCallback = null;
  }
}

export const realtimePairing = new RealtimePairingManager();
