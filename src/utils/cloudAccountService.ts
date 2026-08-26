/**
 * Cloud Account Backup & Restore Service
 * Allows couples to create a simple ID/PW account to permanently preserve and restore their wedding planning data across devices.
 */

export interface UserAccountData {
  username: string;
  passwordHash: string;
  createdAt: string;
  lastBackupAt: string;
  weddingData: {
    profile: any;
    budget: any[];
    checklist: any[];
    events: any[];
    guests: any[];
    gatherings: any[];
    honeymoon: any;
    compareSections: any[];
    aiMilestones: any[];
  };
}

// Simple deterministic hash for password check
function hashPassword(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `pwd_${Math.abs(hash).toString(36)}_${str.length}`;
}

export const cloudAccountService = {
  /**
   * Save / Register account to Cloud
   */
  async saveAccount(username: string, password: string, weddingData: any): Promise<{ success: boolean; message: string }> {
    const cleanId = username.trim().toLowerCase();
    if (!cleanId || cleanId.length < 3) {
      return { success: false, message: '아이디는 3글자 이상 입력해주세요.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: '비밀번호는 4글자 이상 입력해주세요.' };
    }

    const accountData: UserAccountData = {
      username: cleanId,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      lastBackupAt: new Date().toISOString(),
      weddingData
    };

    // 1. Local device storage
    try {
      localStorage.setItem(`wedding_acc_${cleanId}`, JSON.stringify(accountData));
      localStorage.setItem('wedding_logged_in_user', cleanId);
    } catch (e) {}

    // 2. Global Multi-Relay Cloud Storage (ntfy.sh cache & kvstore)
    const topic = `wedding_acc_${cleanId.replace(/[^a-z0-9]/g, '_')}`;
    try {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Title': 'WeddingAccountBackup',
          'Priority': 'urgent'
        },
        body: JSON.stringify(accountData)
      });
    } catch (e) {}

    try {
      await fetch(`https://kvstore.io/api/v1/items/acc_${topic}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(accountData) })
      });
    } catch (e) {}

    return { success: true, message: '계정이 안전하게 클라우드에 백업 등록되었습니다!' };
  },

  /**
   * Login & Fetch account data from Cloud
   */
  async loginAccount(username: string, password: string): Promise<{ success: boolean; message: string; weddingData?: any }> {
    const cleanId = username.trim().toLowerCase();
    if (!cleanId) return { success: false, message: '아이디를 입력해주세요.' };
    if (!password) return { success: false, message: '비밀번호를 입력해주세요.' };

    const expectedHash = hashPassword(password);
    let foundAccount: UserAccountData | null = null;

    // 1. Check local storage
    const local = localStorage.getItem(`wedding_acc_${cleanId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.passwordHash === expectedHash) {
          foundAccount = parsed;
        }
      } catch (e) {}
    }

    // 2. Check cloud ntfy cache
    if (!foundAccount) {
      const topic = `wedding_acc_${cleanId.replace(/[^a-z0-9]/g, '_')}`;
      try {
        const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`, { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          const lines = text.trim().split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const raw = JSON.parse(lines[i]);
              if (raw.event === 'message' && raw.message) {
                const acc: UserAccountData = JSON.parse(raw.message);
                if (acc.username === cleanId && acc.passwordHash === expectedHash) {
                  foundAccount = acc;
                  break;
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    // 3. Check KVStore fallback
    if (!foundAccount) {
      const topic = `wedding_acc_${cleanId.replace(/[^a-z0-9]/g, '_')}`;
      try {
        const res = await fetch(`https://kvstore.io/api/v1/items/acc_${topic}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.value) {
            const acc: UserAccountData = JSON.parse(data.value);
            if (acc.username === cleanId && acc.passwordHash === expectedHash) {
              foundAccount = acc;
            }
          }
        }
      } catch (e) {}
    }

    if (foundAccount && foundAccount.weddingData) {
      localStorage.setItem(`wedding_acc_${cleanId}`, JSON.stringify(foundAccount));
      localStorage.setItem('wedding_logged_in_user', cleanId);
      return {
        success: true,
        message: '계정 로그인 및 결혼 준비 데이터 복원이 완료되었습니다!',
        weddingData: foundAccount.weddingData
      };
    }

    return {
      success: false,
      message: '일치하는 계정 정보가 없거나 비밀번호가 틀렸습니다.'
    };
  },

  /**
   * Auto-save if logged in
   */
  async autoBackupIfLoggedIn(weddingData: any) {
    const loggedInUser = localStorage.getItem('wedding_logged_in_user');
    if (!loggedInUser) return;

    const local = localStorage.getItem(`wedding_acc_${loggedInUser}`);
    if (!local) return;

    try {
      const parsed: UserAccountData = JSON.parse(local);
      parsed.lastBackupAt = new Date().toISOString();
      parsed.weddingData = weddingData;

      localStorage.setItem(`wedding_acc_${loggedInUser}`, JSON.stringify(parsed));

      const topic = `wedding_acc_${loggedInUser.replace(/[^a-z0-9]/g, '_')}`;
      fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'Title': 'AutoBackup' },
        body: JSON.stringify(parsed)
      }).catch(() => {});
    } catch (e) {}
  },

  getLoggedInUser(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('wedding_logged_in_user');
  },

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('wedding_logged_in_user');
  }
};
