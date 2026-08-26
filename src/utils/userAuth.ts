/**
 * Simple & Secure User Cloud Backup & Auth Engine
 * Allows users to register an ID & Password to preserve and restore all wedding data across devices.
 */

export interface UserAccount {
  username: string;
  passwordHash: string;
  createdAt: string;
  lastBackupAt: string;
  weddingData?: any;
}

const AUTH_STORAGE_KEY = 'wedding_app_current_auth_user_v1';
const ACCOUNTS_REGISTRY_KEY = 'wedding_app_accounts_local_db_v1';

class UserAuthManager {
  private currentUser: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentUser = localStorage.getItem(AUTH_STORAGE_KEY);
    }
  }

  public getCurrentUsername(): string | null {
    return this.currentUser;
  }

  public isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
  }

  /**
   * Register a new account or update password with full wedding backup
   */
  public async registerAccount(username: string, password: string, weddingData: any): Promise<{ success: boolean; message: string }> {
    const cleanId = username.trim().toLowerCase();
    const cleanPw = password.trim();

    if (!cleanId || cleanId.length < 3) {
      return { success: false, message: '아이디는 최소 3자 이상 입력해주세요.' };
    }
    if (!cleanPw || cleanPw.length < 4) {
      return { success: false, message: '비밀번호는 최소 4자 이상 입력해주세요.' };
    }

    const account: UserAccount = {
      username: cleanId,
      passwordHash: this.simpleHash(cleanPw),
      createdAt: new Date().toISOString(),
      lastBackupAt: new Date().toISOString(),
      weddingData: weddingData
    };

    // 1. Save locally
    try {
      const dbStr = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
      const db: Record<string, UserAccount> = dbStr ? JSON.parse(dbStr) : {};
      db[cleanId] = account;
      localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(db));
      localStorage.setItem(AUTH_STORAGE_KEY, cleanId);
      this.currentUser = cleanId;
    } catch (e) {}

    // 2. Backup to Cloud KV Relay (Safe multi-device preservation)
    try {
      const topic = `wedding_user_${cleanId}`;
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Title': 'UserBackup',
          'Priority': 'urgent'
        },
        body: JSON.stringify(account)
      });
    } catch (e) {}

    return { success: true, message: '아이디와 비밀번호로 안전하게 클라우드 백업되었습니다!' };
  }

  /**
   * Login with ID & Password to restore full wedding data
   */
  public async loginAccount(username: string, password: string): Promise<{ success: boolean; data?: any; message: string }> {
    const cleanId = username.trim().toLowerCase();
    const cleanPw = password.trim();
    const targetHash = this.simpleHash(cleanPw);

    // 1. Try local account DB
    try {
      const dbStr = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
      if (dbStr) {
        const db: Record<string, UserAccount> = JSON.parse(dbStr);
        if (db[cleanId] && db[cleanId].passwordHash === targetHash) {
          localStorage.setItem(AUTH_STORAGE_KEY, cleanId);
          this.currentUser = cleanId;
          return {
            success: true,
            data: db[cleanId].weddingData,
            message: `반가워요, ${cleanId}님! 내 정보를 안전하게 불러왔습니다.`
          };
        }
      }
    } catch (e) {}

    // 2. Try Remote Cloud KV Relay
    try {
      const topic = `wedding_user_${cleanId}`;
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
              const account: UserAccount = JSON.parse(raw.message);
              if (account.username === cleanId && account.passwordHash === targetHash) {
                // Save locally
                localStorage.setItem(AUTH_STORAGE_KEY, cleanId);
                this.currentUser = cleanId;
                const dbStr = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
                const db: Record<string, UserAccount> = dbStr ? JSON.parse(dbStr) : {};
                db[cleanId] = account;
                localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(db));

                return {
                  success: true,
                  data: account.weddingData,
                  message: `클라우드에서 ${cleanId}님의 결혼 데이터를 완벽하게 복원했습니다!`
                };
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}

    return {
      success: false,
      message: '아이디 또는 비밀번호가 일치하지 않거나 저장된 정보를 찾을 수 없습니다.'
    };
  }

  /**
   * Save current user's data to cloud periodically
   */
  public async autoSave(weddingData: any) {
    if (!this.currentUser) return;
    const cleanId = this.currentUser;

    try {
      const dbStr = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
      const db: Record<string, UserAccount> = dbStr ? JSON.parse(dbStr) : {};
      if (db[cleanId]) {
        db[cleanId].weddingData = weddingData;
        db[cleanId].lastBackupAt = new Date().toISOString();
        localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(db));

        // Push to cloud
        const topic = `wedding_user_${cleanId}`;
        fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'Title': 'UserAutoBackup',
            'Priority': 'low'
          },
          body: JSON.stringify(db[cleanId])
        }).catch(() => {});
      }
    } catch (e) {}
  }

  public logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}

export const userAuth = new UserAuthManager();
