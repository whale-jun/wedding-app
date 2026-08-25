import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import {
  CoupleProfile,
  BudgetItem,
  ChecklistItem,
  CalendarEvent,
  CompareSection,
  GuestItem,
  GatheringItem,
  HoneymoonData,
  AiScheduleMilestone
} from '../types';
import {
  initialProfile,
  initialBudget,
  initialChecklist,
  initialEvents,
  initialCompareSections,
  initialGuests,
  initialGatherings,
  initialHoneymoon
} from '../utils/mockData';
import { playWeddingChime, sendLocalNotification } from '../utils/notifications';
import { generateAiWeddingMilestones } from '../utils/aiScheduleGenerator';
import { generateCoupleInviteCode } from '../utils/codeGenerator';
import { realtimePairing } from '../utils/realtimePairing';

interface WeddingContextType {
  // Data
  profile: CoupleProfile;
  budget: BudgetItem[];
  checklist: ChecklistItem[];
  events: CalendarEvent[];
  compareSections: CompareSection[];
  guests: GuestItem[];
  gatherings: GatheringItem[];
  honeymoon: HoneymoonData;
  aiMilestones: AiScheduleMilestone[];

  // View state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean | ((prev: boolean) => boolean)) => void;

  // AI Planner Actions
  generateAiSchedule: (weddingDate?: string) => void;
  selectMilestoneOption: (milestoneId: string, optionIndex: number) => void;
  applyMilestoneToCalendar: (milestoneId: string) => void;
  applyAllMilestonesToCalendar: () => void;

  // Actions - Profile & Couple Pairing & Onboarding & Feedback
  isOnboardingDone: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  isProfileModalOpen: boolean;
  profileModalTab: 'info' | 'invite';
  openProfileModal: (tab?: 'info' | 'invite') => void;
  closeProfileModal: () => void;
  updateProfile: (profile: Partial<CoupleProfile>) => void;
  generateNewInviteCode: () => string;
  connectPartnerWithCode: (code: string) => Promise<boolean>;
  disconnectPartner: () => void;
  dDay: number;

  // Actions - Budget
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  loadBudgetPreset: (presetType: 'standard' | 'economy' | 'luxury') => void;

  // Actions - Checklist
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  updateChecklistItem: (id: string, item: Partial<ChecklistItem>) => void;
  toggleChecklistItem: (id: string) => void;
  deleteChecklistItem: (id: string) => void;

  // Actions - Calendar
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Actions - Comparison
  addCompareOption: (sectionId: string, option: Omit<import('../types').CompareOption, 'id'>) => void;
  updateCompareOption: (sectionId: string, optionId: string, option: Partial<import('../types').CompareOption>) => void;
  deleteCompareOption: (sectionId: string, optionId: string) => void;
  pickCompareOption: (sectionId: string, optionId: string) => void;
  addCompareSection: (title: string, category: import('../types').CompareCategory) => void;

  // Actions - Guests
  addGuest: (guest: Omit<GuestItem, 'id'>) => void;
  updateGuest: (id: string, guest: Partial<GuestItem>) => void;
  deleteGuest: (id: string) => void;
  toggleAttendance: (id: string, status: import('../types').AttendanceStatus) => void;
  importGuestsFromCSV: (csvData: string) => void;

  // Actions - Gatherings
  addGathering: (gathering: Omit<GatheringItem, 'id'>) => void;
  updateGathering: (id: string, gathering: Partial<GatheringItem>) => void;
  deleteGathering: (id: string) => void;

  // Actions - Honeymoon
  updateHoneymoon: (data: Partial<HoneymoonData>) => void;
  togglePackingItem: (id: string) => void;
  addPackingItem: (item: Omit<import('../types').HoneymoonPackingItem, 'id'>) => void;
  deletePackingItem: (id: string) => void;
  addItineraryActivity: (dayNumber: number, activity: { time: string; description: string; location?: string; cost?: number }) => void;
  deleteItineraryActivity: (dayNumber: number, activityIndex: number) => void;

  // Global actions
  triggerConfetti: () => void;
  resetToSampleData: () => void;
  exportAllDataJSON: () => void;
  importAllDataJSON: (jsonString: string) => boolean;

  // Computed Summaries
  budgetStats: {
    totalGoal: number;
    totalContract: number;
    totalSpent: number;
    totalBalanceDue: number;
    groomShareTarget: number;
    groomActualPaid: number;
    brideShareTarget: number;
    brideActualPaid: number;
    jointActualPaid: number;
    progressPercentage: number;
  };
  checklistStats: {
    total: number;
    completed: number;
    percentage: number;
  };
  guestStats: {
    totalGuests: number;
    confirmedGuests: number;
    totalMeals: number;
    groomGuests: number;
    brideGuests: number;
    totalGiftAmount: number;
    paperSent: number;
    mobileSent: number;
  };
  packingStats: {
    total: number;
    packed: number;
    percentage: number;
  };
  
  // Sync state
  weddingId: string | null;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

const STORAGE_KEYS = {
  WEDDING_ID: 'wedding_app_id_v1',
  PROFILE: 'wedding_app_profile_v1',
  BUDGET: 'wedding_app_budget_v1',
  CHECKLIST: 'wedding_app_checklist_v1',
  EVENTS: 'wedding_app_events_v1',
  COMPARE: 'wedding_app_compare_v1',
  GUESTS: 'wedding_app_guests_v1',
  GATHERINGS: 'wedding_app_gatherings_v1',
  HONEYMOON: 'wedding_app_honeymoon_v1',
};

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- SYNC STATE ---
  const [weddingId, setWeddingId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.WEDDING_ID));
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false); // To prevent infinite loops

  // State Initialization from LocalStorage with safe defaults
  const [profile, setProfile] = useState<CoupleProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialProfile,
          ...parsed,
          inviteCode: parsed.inviteCode || generateCoupleInviteCode(),
          myRole: parsed.myRole || 'groom',
          isPartnerConnected: !!parsed.isPartnerConnected
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      ...initialProfile,
      inviteCode: generateCoupleInviteCode()
    };
  });

  const [budget, setBudget] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return saved ? JSON.parse(saved) : initialBudget;
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    return saved ? JSON.parse(saved) : initialChecklist;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [compareSections, setCompareSections] = useState<CompareSection[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPARE);
    return saved ? JSON.parse(saved) : initialCompareSections;
  });

  const [guests, setGuests] = useState<GuestItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GUESTS);
    return saved ? JSON.parse(saved) : initialGuests;
  });

  const [gatherings, setGatherings] = useState<GatheringItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GATHERINGS);
    return saved ? JSON.parse(saved) : initialGatherings;
  });

  const [honeymoon, setHoneymoon] = useState<HoneymoonData>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HONEYMOON);
    return saved ? JSON.parse(saved) : initialHoneymoon;
  });

  const [aiMilestones, setAiMilestones] = useState<AiScheduleMilestone[]>(() => {
    const saved = localStorage.getItem('wedding_app_ai_milestones_v1');
    if (saved) return JSON.parse(saved);
    return generateAiWeddingMilestones(initialProfile.weddingDate);
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    const saved = localStorage.getItem('wedding_app_mobile_frame_v1');
    return saved !== null ? JSON.parse(saved) : true; // 기본값: 모바일 시뮬레이터 켜짐
  });

  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean>(() => {
    const saved = localStorage.getItem('wedding_app_onboarding_done_v1');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fb7185', '#fda4af', '#f43f5e', '#fef08a', '#e11d48']
      });
      playWeddingChime();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Active Room Code for cross-device realtime sync
  const activeSyncRoom = (profile.isPartnerConnected && weddingId) 
    ? weddingId 
    : (profile.inviteCode || 'WD-DEFAULT');

  // Listen for realtime pairing and data updates
  useEffect(() => {
    if (!activeSyncRoom) return;

    realtimePairing.joinRoom(activeSyncRoom);

    const unsubscribe = realtimePairing.addListener((payload) => {
      // 1. Incoming Connection Request (Partner entered our code)
      if (payload.type === 'PAIR_REQUEST') {
        const partnerName = payload.senderName || '배우자';
        const partnerRole = payload.senderRole || (profile.myRole === 'groom' ? 'bride' : 'groom');

        setIsRemoteUpdate(true);
        setProfile(prev => ({
          ...prev,
          isPartnerConnected: true,
          partnerConnectedAt: new Date().toISOString(),
          brideName: prev.myRole === 'groom' ? (partnerName || prev.brideName) : prev.brideName,
          groomName: prev.myRole === 'bride' ? (partnerName || prev.groomName) : prev.groomName,
        }));
        setWeddingId(activeSyncRoom);
        setLastSyncedAt(new Date().toISOString());
        setIsOnboardingDone(true);
        localStorage.setItem('wedding_app_onboarding_done_v1', 'true');
        setIsProfileModalOpen(false);

        // Respond with PAIR_ACCEPT containing our full latest data
        const myName = profile.myRole === 'groom' ? (profile.groomName || '신랑') : (profile.brideName || '신부');
        realtimePairing.publish({
          type: 'PAIR_ACCEPT',
          roomCode: activeSyncRoom,
          senderId: realtimePairing.getClientId(),
          senderName: myName,
          senderRole: profile.myRole || 'groom',
          senderCode: profile.inviteCode || activeSyncRoom,
          timestamp: Date.now(),
          data: {
            profile: {
              ...profile,
              isPartnerConnected: true,
              partnerConnectedAt: new Date().toISOString(),
              brideName: profile.myRole === 'groom' ? partnerName : profile.brideName,
              groomName: profile.myRole === 'bride' ? partnerName : profile.groomName,
            },
            budget,
            checklist,
            events,
            compareSections,
            guests,
            gatherings,
            honeymoon,
            aiMilestones
          }
        });

        triggerConfetti();
        alert(`🎉 축하합니다! 상대방(${partnerName}님)이 연결되었습니다!\n실시간 웨딩 데이터 동기화가 활성화되었습니다. 💕`);
        setTimeout(() => setIsRemoteUpdate(false), 300);
      }

      // 2. Incoming Pair Acceptance (Partner accepted our request or sent full data)
      else if (payload.type === 'PAIR_ACCEPT') {
        setIsRemoteUpdate(true);
        const partnerName = payload.senderName || '배우자';

        if (payload.data) {
          const d = payload.data;
          if (d.profile) {
            setProfile(prev => ({
              ...prev,
              ...d.profile,
              isPartnerConnected: true,
              partnerConnectedAt: new Date().toISOString(),
              groomName: prev.myRole === 'groom' ? prev.groomName : (d.profile.groomName || prev.groomName),
              brideName: prev.myRole === 'bride' ? prev.brideName : (d.profile.brideName || prev.brideName),
            }));
          }
          if (d.budget && Array.isArray(d.budget)) setBudget(d.budget);
          if (d.checklist && Array.isArray(d.checklist)) setChecklist(d.checklist);
          if (d.events && Array.isArray(d.events)) setEvents(d.events);
          if (d.compareSections && Array.isArray(d.compareSections)) setCompareSections(d.compareSections);
          if (d.guests && Array.isArray(d.guests)) setGuests(d.guests);
          if (d.gatherings && Array.isArray(d.gatherings)) setGatherings(d.gatherings);
          if (d.honeymoon) setHoneymoon(d.honeymoon);
          if (d.aiMilestones && Array.isArray(d.aiMilestones)) setAiMilestones(d.aiMilestones);
        } else {
          setProfile(prev => ({
            ...prev,
            isPartnerConnected: true,
            partnerConnectedAt: new Date().toISOString(),
            brideName: prev.myRole === 'groom' ? (partnerName || prev.brideName) : prev.brideName,
            groomName: prev.myRole === 'bride' ? (partnerName || prev.groomName) : prev.groomName,
          }));
        }

        setWeddingId(activeSyncRoom);
        setLastSyncedAt(new Date().toISOString());
        setIsOnboardingDone(true);
        localStorage.setItem('wedding_app_onboarding_done_v1', 'true');
        setIsProfileModalOpen(false);
        triggerConfetti();
        alert(`🎉 축하합니다! 상대방(${partnerName}님)과 성공적으로 커플 연결되었습니다!\n모든 일정과 예산이 실시간으로 동기화됩니다. 💕`);
        setTimeout(() => setIsRemoteUpdate(false), 300);
      }

      // 3. Realtime Live Data Sync
      else if (payload.type === 'SYNC_DATA') {
        if (payload.data) {
          setIsRemoteUpdate(true);
          const d = payload.data;
          if (d.profile) {
            setProfile(prev => ({
              ...prev,
              ...d.profile,
              // Keep my local role & identity
              myRole: prev.myRole,
              groomName: prev.myRole === 'groom' ? prev.groomName : (d.profile.groomName || prev.groomName),
              brideName: prev.myRole === 'bride' ? prev.brideName : (d.profile.brideName || prev.brideName),
            }));
          }
          if (d.budget && Array.isArray(d.budget)) setBudget(d.budget);
          if (d.checklist && Array.isArray(d.checklist)) setChecklist(d.checklist);
          if (d.events && Array.isArray(d.events)) setEvents(d.events);
          if (d.compareSections && Array.isArray(d.compareSections)) setCompareSections(d.compareSections);
          if (d.guests && Array.isArray(d.guests)) setGuests(d.guests);
          if (d.gatherings && Array.isArray(d.gatherings)) setGatherings(d.gatherings);
          if (d.honeymoon) setHoneymoon(d.honeymoon);
          if (d.aiMilestones && Array.isArray(d.aiMilestones)) setAiMilestones(d.aiMilestones);
          
          setLastSyncedAt(new Date().toISOString());
          setTimeout(() => setIsRemoteUpdate(false), 300);
        }
      }

      // 4. Partner Disconnected
      else if (payload.type === 'DISCONNECT') {
        setProfile(prev => ({
          ...prev,
          isPartnerConnected: false,
          partnerConnectedAt: undefined
        }));
        alert('상대방이 커플 연결을 해제했습니다.');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeSyncRoom, profile, budget, checklist, events, compareSections, guests, gatherings, honeymoon, aiMilestones]);

  // Broadcast data changes to connected partner in realtime
  useEffect(() => {
    if (!profile.isPartnerConnected || isRemoteUpdate || !activeSyncRoom) return;

    const timer = setTimeout(() => {
      const myName = profile.myRole === 'groom' ? (profile.groomName || '신랑') : (profile.brideName || '신부');
      setIsSyncing(true);
      realtimePairing.publish({
        type: 'SYNC_DATA',
        roomCode: activeSyncRoom,
        senderId: realtimePairing.getClientId(),
        senderName: myName,
        senderRole: profile.myRole || 'groom',
        senderCode: profile.inviteCode || activeSyncRoom,
        timestamp: Date.now(),
        data: {
          profile,
          budget,
          checklist,
          events,
          compareSections,
          guests,
          gatherings,
          honeymoon,
          aiMilestones
        }
      }).finally(() => {
        setIsSyncing(false);
        setLastSyncedAt(new Date().toISOString());
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [profile, budget, checklist, events, compareSections, guests, gatherings, honeymoon, aiMilestones, profile.isPartnerConnected, isRemoteUpdate, activeSyncRoom]);

  useEffect(() => {
    localStorage.setItem('wedding_app_mobile_frame_v1', JSON.stringify(isMobileFrame));
  }, [isMobileFrame]);

  useEffect(() => {
    localStorage.setItem('wedding_app_onboarding_done_v1', JSON.stringify(isOnboardingDone));
  }, [isOnboardingDone]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'info' | 'invite'>('info');

  // --- OPTIONAL FIREBASE SYNC LOGIC (Preserved as Secondary Cloud Backup) ---
  useEffect(() => {
    if (!weddingId) return;
    localStorage.setItem(STORAGE_KEYS.WEDDING_ID, weddingId);
    
    try {
      const weddingDocRef = doc(db, 'weddings', weddingId);
      const unsubscribe = onSnapshot(weddingDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setIsRemoteUpdate(true);
          if (data.profile) setProfile(data.profile);
          if (data.budget) setBudget(data.budget);
          if (data.checklist) setChecklist(data.checklist);
          if (data.events) setEvents(data.events);
          if (data.compareSections) setCompareSections(data.compareSections);
          if (data.guests) setGuests(data.guests);
          if (data.gatherings) setGatherings(data.gatherings);
          if (data.honeymoon) setHoneymoon(data.honeymoon);
          if (data.aiMilestones) setAiMilestones(data.aiMilestones);
          setLastSyncedAt(new Date().toISOString());
          setTimeout(() => setIsRemoteUpdate(false), 100);
        }
      }, () => {});
      return () => unsubscribe();
    } catch (e) {}
  }, [weddingId]);

  const updateRemoteData = useCallback(async () => {
    if (!weddingId || isRemoteUpdate) return;
    try {
      const weddingDocRef = doc(db, 'weddings', weddingId);
      await setDoc(weddingDocRef, {
        profile,
        budget,
        checklist,
        events,
        compareSections,
        guests,
        gatherings,
        honeymoon,
        aiMilestones,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {}
  }, [weddingId, profile, budget, checklist, events, compareSections, guests, gatherings, honeymoon, aiMilestones, isRemoteUpdate]);

  // 3. Trigger remote update when local state changes (and it's not a remote update)
  useEffect(() => {
    if (weddingId && !isRemoteUpdate) {
      const timer = setTimeout(() => {
        updateRemoteData();
      }, 1000); // Debounce sync by 1s
      return () => clearTimeout(timer);
    }
  }, [profile, budget, checklist, events, compareSections, guests, gatherings, honeymoon, aiMilestones, weddingId, isRemoteUpdate, updateRemoteData]);

  const openProfileModal = (tab: 'info' | 'invite' = 'info') => {
    setProfileModalTab(tab);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const completeOnboarding = () => {
    setIsOnboardingDone(true);
    triggerConfetti();
  };

  const resetOnboarding = () => {
    setIsOnboardingDone(false);
  };

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist)); }, [checklist]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(compareSections)); }, [compareSections]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests)); }, [guests]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GATHERINGS, JSON.stringify(gatherings)); }, [gatherings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HONEYMOON, JSON.stringify(honeymoon)); }, [honeymoon]);
  useEffect(() => { localStorage.setItem('wedding_app_ai_milestones_v1', JSON.stringify(aiMilestones)); }, [aiMilestones]);

  // AI Schedule Generator Method
  const generateAiSchedule = (weddingDateOverride?: string) => {
    const targetDate = weddingDateOverride || profile.weddingDate;
    const generated = generateAiWeddingMilestones(targetDate);
    setAiMilestones(generated);
    triggerConfetti();
  };

  // Select one of the 3 candidate options for a milestone
  const selectMilestoneOption = (milestoneId: string, optionIndex: number) => {
    setAiMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          selectedOptionIndex: optionIndex
        };
      }
      return m;
    }));
  };

  // Apply single milestone to 캘린더 & 체리리스트
  const applyMilestoneToCalendar = (milestoneId: string) => {
    const milestone = aiMilestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const opt = milestone.options[milestone.selectedOptionIndex];
    if (!opt) return;

    // Check if event already exists
    const eventTitle = `✨ [AI플래너] ${milestone.title}`;
    const exists = events.some(e => e.title === eventTitle || e.title === milestone.title);
    if (!exists) {
      addEvent({
        title: eventTitle,
        startDate: opt.date,
        startTime: opt.time,
        category: milestone.category === 'hall' ? 'wedding' : milestone.category === 'fitting' ? 'fitting' : milestone.category === 'sdm' ? 'studio' : milestone.category === 'invitation' ? 'meeting' : 'wedding',
        location: '',
        notes: `${milestone.description}\n${milestone.aiAdvice}`,
        alarmEnabled: true,
        alarmOffsetMinutes: 1440,
        color: milestone.category === 'hall' ? '#e11d48' : milestone.category === 'fitting' ? '#ec4899' : '#8b5cf6'
      });
    }

    setAiMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, isAppliedToCalendar: true } : m));
    triggerConfetti();
  };

  // Apply all selected milestones to calendar at once
  const applyAllMilestonesToCalendar = () => {
    let addedCount = 0;
    aiMilestones.forEach(m => {
      const opt = m.options[m.selectedOptionIndex];
      const eventTitle = `✨ [AI플래너] ${m.title}`;
      const exists = events.some(e => e.title === eventTitle || e.title === m.title);
      if (!exists) {
        addEvent({
          title: eventTitle,
          startDate: opt.date,
          startTime: opt.time,
          category: m.category === 'hall' ? 'wedding' : m.category === 'fitting' ? 'fitting' : m.category === 'sdm' ? 'studio' : m.category === 'invitation' ? 'meeting' : 'wedding',
          location: '',
          notes: `${m.description}\n${m.aiAdvice}`,
          alarmEnabled: true,
          alarmOffsetMinutes: 1440,
          color: m.category === 'hall' ? '#e11d48' : m.category === 'fitting' ? '#ec4899' : '#8b5cf6'
        });
        addedCount++;
      }
    });

    setAiMilestones(prev => prev.map(m => ({ ...m, isAppliedToCalendar: true })));
    triggerConfetti();
    alert(`AI 웨딩 플래너가 추천한 핵심 일정 ${aiMilestones.length}개가 캘린더 및 알람에 완벽하게 등록되었습니다!`);
  };

  // D-Day calculation
  const calculateDDay = (dateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dDay = calculateDDay(profile.weddingDate);

  // Profile & Partner Connection
  const generateNewInviteCode = (): string => {
    const newCode = generateCoupleInviteCode();
    setProfile(prev => ({
      ...prev,
      inviteCode: newCode
    }));
    return newCode;
  };

  const updateProfile = (newProfile: Partial<CoupleProfile>) => {
    setProfile(prev => {
      const updated = { 
        ...prev, 
        ...newProfile,
        inviteCode: newProfile.inviteCode || prev.inviteCode || generateCoupleInviteCode()
      };
      if (newProfile.weddingDate && newProfile.weddingDate !== prev.weddingDate) {
        // Automatically regenerate AI schedule if wedding date changes!
        const newMilestones = generateAiWeddingMilestones(newProfile.weddingDate);
        setAiMilestones(newMilestones);
      }
      return updated;
    });
  };

  const connectPartnerWithCode = async (code: string): Promise<boolean> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return false;

    setIsSyncing(true);
    try {
      // 1. Set weddingId and join partner's room on realtime relay
      setWeddingId(trimmed);
      realtimePairing.joinRoom(trimmed);

      // 2. Broadcast PAIR_REQUEST to partner's room
      const myName = profile.myRole === 'groom' ? (profile.groomName || '신랑') : (profile.brideName || '신부');
      await realtimePairing.publish({
        type: 'PAIR_REQUEST',
        roomCode: trimmed,
        senderId: realtimePairing.getClientId(),
        senderName: myName,
        senderRole: profile.myRole || 'groom',
        senderCode: profile.inviteCode || trimmed,
        timestamp: Date.now(),
        data: {
          profile: {
            ...profile,
            isPartnerConnected: true,
            partnerConnectedAt: new Date().toISOString()
          }
        }
      });

      // 3. Mark locally connected
      setProfile(prev => ({
        ...prev,
        isPartnerConnected: true,
        partnerConnectedAt: new Date().toISOString()
      }));

      // 4. Try Firestore sync in background if available
      try {
        const q = query(collection(db, 'weddings'), where('profile.inviteCode', '==', trimmed));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const foundWeddingId = querySnapshot.docs[0].id;
          setWeddingId(foundWeddingId);
        }
      } catch (e) {}

      triggerConfetti();
      return true;
    } catch (e) {
      console.error("Connection error:", e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectPartner = () => {
    const roomToDisconnect = weddingId || profile.inviteCode;
    if (roomToDisconnect) {
      realtimePairing.publish({
        type: 'DISCONNECT',
        roomCode: roomToDisconnect,
        senderId: realtimePairing.getClientId(),
        senderName: profile.myRole === 'groom' ? profile.groomName : profile.brideName,
        senderRole: profile.myRole || 'groom',
        senderCode: profile.inviteCode || '',
        timestamp: Date.now()
      });
    }
    setWeddingId(null);
    localStorage.removeItem(STORAGE_KEYS.WEDDING_ID);
    setProfile(prev => ({
      ...prev,
      isPartnerConnected: false,
      partnerConnectedAt: undefined
    }));
  };

  // Budget Actions
  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `b-${Date.now()}`
    };
    setBudget(prev => [newItem, ...prev]);
  };

  const updateBudgetItem = (id: string, item: Partial<BudgetItem>) => {
    setBudget(prev => prev.map(b => b.id === id ? { ...b, ...item } : b));
  };

  const deleteBudgetItem = (id: string) => {
    setBudget(prev => prev.filter(b => b.id !== id));
  };

  const loadBudgetPreset = (presetType: 'standard' | 'economy' | 'luxury') => {
    if (!confirm('현재 예산 목록을 선택한 프리셋 템플릿으로 대체하시겠습니까?')) return;
    
    let goal = 45000000;
    if (presetType === 'economy') goal = 28000000;
    if (presetType === 'luxury') goal = 75000000;

    updateProfile({ budgetGoal: goal });
    // Adjust budget list proportionally
    const multiplier = presetType === 'economy' ? 0.65 : presetType === 'luxury' ? 1.7 : 1.0;
    const newBudget = initialBudget.map(item => ({
      ...item,
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      estimatedCost: Math.round(item.estimatedCost * multiplier / 10000) * 10000,
      contractCost: Math.round(item.contractCost * multiplier / 10000) * 10000,
      depositPaid: Math.round(item.depositPaid * multiplier / 10000) * 10000,
      balanceDue: Math.round(item.balanceDue * multiplier / 10000) * 10000,
    }));
    setBudget(newBudget);
    triggerConfetti();
  };

  // Checklist Actions
  const addChecklistItem = (item: Omit<ChecklistItem, 'id'>) => {
    const newItem: ChecklistItem = {
      ...item,
      id: `c-${Date.now()}`
    };
    setChecklist(prev => [newItem, ...prev]);
  };

  const updateChecklistItem = (id: string, item: Partial<ChecklistItem>) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, ...item } : c));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(c => {
      if (c.id === id) {
        const nextCompleted = !c.completed;
        if (nextCompleted) {
          triggerConfetti();
        }
        return {
          ...c,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString().slice(0, 10) : undefined
        };
      }
      return c;
    }));
  };

  const deleteChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
  };

  // Calendar Actions
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `ev-${Date.now()}`
    };
    setEvents(prev => [...prev, newEvent]);
    if (event.alarmEnabled) {
      sendLocalNotification(`[새 일정] ${event.title}`, {
        body: `${event.startDate} ${event.startTime || ''} ${event.location || ''}`
      });
    }
  };

  const updateEvent = (id: string, event: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...event } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Comparison Actions
  const addCompareSection = (title: string, category: import('../types').CompareCategory) => {
    const newSection: CompareSection = {
      id: `comp-${Date.now()}`,
      category,
      title,
      options: []
    };
    setCompareSections(prev => [...prev, newSection]);
  };

  const addCompareOption = (sectionId: string, option: Omit<import('../types').CompareOption, 'id'>) => {
    const newOption = {
      ...option,
      id: `opt-${Date.now()}`
    };
    setCompareSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          options: [...sec.options, newOption]
        };
      }
      return sec;
    }));
  };

  const updateCompareOption = (sectionId: string, optionId: string, option: Partial<import('../types').CompareOption>) => {
    setCompareSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          options: sec.options.map(opt => opt.id === optionId ? { ...opt, ...option } : opt)
        };
      }
      return sec;
    }));
  };

  const deleteCompareOption = (sectionId: string, optionId: string) => {
    setCompareSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          options: sec.options.filter(opt => opt.id !== optionId)
        };
      }
      return sec;
    }));
  };

  const pickCompareOption = (sectionId: string, optionId: string) => {
    setCompareSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          options: sec.options.map(opt => ({
            ...opt,
            isPicked: opt.id === optionId ? !opt.isPicked : false
          }))
        };
      }
      return sec;
    }));
    triggerConfetti();
  };

  // Guest Actions
  const addGuest = (guest: Omit<GuestItem, 'id'>) => {
    const newGuest: GuestItem = {
      ...guest,
      id: `g-${Date.now()}`
    };
    setGuests(prev => [newGuest, ...prev]);
  };

  const updateGuest = (id: string, guest: Partial<GuestItem>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...guest } : g));
  };

  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  const toggleAttendance = (id: string, status: import('../types').AttendanceStatus) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, attendance: status } : g));
  };

  const importGuestsFromCSV = (csvData: string) => {
    try {
      const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) return;
      const imported: GuestItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length < 3) continue;
        const [sideRaw, groupRaw, name, phone, attRaw, companionRaw, , mealRaw, inviteRaw, giftRaw, returnRaw, memo] = parts;
        if (!name) continue;

        const side: import('../types').GuestSide = sideRaw?.includes('신랑') ? 'groom' : sideRaw?.includes('신부') ? 'bride' : 'joint';
        const group: import('../types').GuestGroup = 
          groupRaw?.includes('가족') ? 'family' :
          groupRaw?.includes('친인척') ? 'relatives' :
          groupRaw?.includes('직장') ? 'work' :
          groupRaw?.includes('친구') ? 'friends' :
          groupRaw?.includes('동문') ? 'school' : 'other';
        
        const attendance: import('../types').AttendanceStatus =
          attRaw?.includes('불참') ? 'declined' :
          attRaw?.includes('확정') || attRaw?.includes('참석') ? 'confirmed' :
          attRaw?.includes('온라인') ? 'online' : 'pending';

        const invitationSent: 'paper' | 'mobile' | 'both' | 'none' =
          inviteRaw?.includes('둘다') ? 'both' :
          inviteRaw?.includes('종이') ? 'paper' :
          inviteRaw?.includes('모바일') ? 'mobile' : 'none';

        imported.push({
          id: `g-${Date.now()}-${i}`,
          side,
          group,
          name,
          phone: phone || '',
          attendance,
          companionCount: parseInt(companionRaw) || 0,
          mealCount: parseInt(mealRaw) || (attendance === 'confirmed' ? 1 + (parseInt(companionRaw) || 0) : 0),
          invitationSent,
          giftAmount: parseInt(giftRaw) || 0,
          hasReturnedGift: returnRaw === '완료',
          memo: memo || ''
        });
      }

      if (imported.length > 0) {
        setGuests(prev => [...imported, ...prev]);
        alert(`총 ${imported.length}명의 하객 정보를 불러왔습니다!`);
        triggerConfetti();
      }
    } catch {
      alert('CSV 파싱 중 오류가 발생했습니다. 포맷을 확인해주세요.');
    }
  };

  // Gatherings Actions
  const addGathering = (gathering: Omit<GatheringItem, 'id'>) => {
    const newG: GatheringItem = {
      ...gathering,
      id: `gat-${Date.now()}`
    };
    setGatherings(prev => [newG, ...prev]);
  };

  const updateGathering = (id: string, gathering: Partial<GatheringItem>) => {
    setGatherings(prev => prev.map(g => g.id === id ? { ...g, ...gathering } : g));
  };

  const deleteGathering = (id: string) => {
    setGatherings(prev => prev.filter(g => g.id !== id));
  };

  // Honeymoon Actions
  const updateHoneymoon = (data: Partial<HoneymoonData>) => {
    setHoneymoon(prev => ({ ...prev, ...data }));
  };

  const togglePackingItem = (id: string) => {
    setHoneymoon(prev => ({
      ...prev,
      packingList: prev.packingList.map(p => p.id === id ? { ...p, packed: !p.packed } : p)
    }));
  };

  const addPackingItem = (item: Omit<import('../types').HoneymoonPackingItem, 'id'>) => {
    const newItem = { ...item, id: `p-${Date.now()}` };
    setHoneymoon(prev => ({
      ...prev,
      packingList: [newItem, ...prev.packingList]
    }));
  };

  const deletePackingItem = (id: string) => {
    setHoneymoon(prev => ({
      ...prev,
      packingList: prev.packingList.filter(p => p.id !== id)
    }));
  };

  const addItineraryActivity = (dayNumber: number, activity: { time: string; description: string; location?: string; cost?: number }) => {
    setHoneymoon(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(day => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            activities: [...day.activities, { ...activity, completed: false }]
          };
        }
        return day;
      })
    }));
  };

  const deleteItineraryActivity = (dayNumber: number, activityIndex: number) => {
    setHoneymoon(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(day => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            activities: day.activities.filter((_, idx) => idx !== activityIndex)
          };
        }
        return day;
      })
    }));
  };

  // Global Actions
  const resetToSampleData = () => {
    if (confirm('모든 데이터를 초기 샘플 데이터로 복원하시겠습니까?')) {
      setProfile(initialProfile);
      setBudget(initialBudget);
      setChecklist(initialChecklist);
      setEvents(initialEvents);
      setCompareSections(initialCompareSections);
      setGuests(initialGuests);
      setGatherings(initialGatherings);
      setHoneymoon(initialHoneymoon);
      triggerConfetti();
    }
  };

  const exportAllDataJSON = () => {
    const allData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      budget,
      checklist,
      events,
      compareSections,
      guests,
      gatherings,
      honeymoon
    };
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `으ㅔ딩어픙_전체데이터백업_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAllDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.budget) setBudget(parsed.budget);
      if (parsed.checklist) setChecklist(parsed.checklist);
      if (parsed.events) setEvents(parsed.events);
      if (parsed.compareSections) setCompareSections(parsed.compareSections);
      if (parsed.guests) setGuests(parsed.guests);
      if (parsed.gatherings) setGatherings(parsed.gatherings);
      if (parsed.honeymoon) setHoneymoon(parsed.honeymoon);
      triggerConfetti();
      return true;
    } catch (e) {
      console.error(e);
      alert('백업 파일 형식이 올바르지 않습니다.');
      return false;
    }
  };

  // Computed Summaries
  const budgetStats = (() => {
    const totalGoal = profile.budgetGoal || 0;
    let totalContract = 0;
    let totalSpent = 0;
    let totalBalanceDue = 0;
    let groomActualPaid = 0;
    let brideActualPaid = 0;
    let jointActualPaid = 0;

    budget.forEach(item => {
      const contract = item.contractCost || item.estimatedCost || 0;
      const spent = (item.depositPaid || 0) + (item.interimPaid || 0) + (item.isPaid ? (item.balanceDue || 0) : 0);
      const balance = item.isPaid ? 0 : (item.balanceDue || (contract - spent));

      totalContract += contract;
      totalSpent += spent;
      totalBalanceDue += Math.max(0, balance);

      if (item.payer === 'groom') groomActualPaid += spent;
      else if (item.payer === 'bride') brideActualPaid += spent;
      else jointActualPaid += spent;
    });

    const groomRatio = (profile.groomBudgetShareRatio || 50) / 100;
    const groomShareTarget = Math.round(totalContract * groomRatio);
    const brideShareTarget = totalContract - groomShareTarget;
    const progressPercentage = totalGoal > 0 ? Math.min(100, Math.round((totalSpent / totalGoal) * 100)) : 0;

    return {
      totalGoal,
      totalContract,
      totalSpent,
      totalBalanceDue,
      groomShareTarget,
      groomActualPaid,
      brideShareTarget,
      brideActualPaid,
      jointActualPaid,
      progressPercentage
    };
  })();

  const checklistStats = (() => {
    const total = checklist.length;
    const completed = checklist.filter(c => c.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  })();

  const guestStats = (() => {
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.attendance === 'confirmed').length;
    const totalMeals = guests.reduce((sum, g) => sum + (g.mealCount || 0), 0);
    const groomGuests = guests.filter(g => g.side === 'groom').length;
    const brideGuests = guests.filter(g => g.side === 'bride').length;
    const totalGiftAmount = guests.reduce((sum, g) => sum + (g.giftAmount || 0), 0);
    const paperSent = guests.filter(g => g.invitationSent === 'paper' || g.invitationSent === 'both').length;
    const mobileSent = guests.filter(g => g.invitationSent === 'mobile' || g.invitationSent === 'both').length;

    return {
      totalGuests,
      confirmedGuests,
      totalMeals,
      groomGuests,
      brideGuests,
      totalGiftAmount,
      paperSent,
      mobileSent
    };
  })();

  const packingStats = (() => {
    const total = honeymoon.packingList.length;
    const packed = honeymoon.packingList.filter(p => p.packed).length;
    const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
    return { total, packed, percentage };
  })();

  useEffect(() => {
    if (!weddingId && profile.inviteCode) {
      setWeddingId(profile.inviteCode);
    }
  }, [profile.inviteCode, weddingId]);

  return (
    <WeddingContext.Provider
      value={{
        profile,
        budget,
        checklist,
        events,
        compareSections,
        guests,
        gatherings,
        honeymoon,
        aiMilestones,
        activeTab,
        setActiveTab,
        isMobileFrame,
        setIsMobileFrame,
        generateAiSchedule,
        selectMilestoneOption,
        applyMilestoneToCalendar,
        applyAllMilestonesToCalendar,
        updateProfile,
        generateNewInviteCode,
        isOnboardingDone,
        completeOnboarding,
        resetOnboarding,
        isProfileModalOpen,
        profileModalTab,
        openProfileModal,
        closeProfileModal,
        connectPartnerWithCode,
        disconnectPartner,
        dDay,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        loadBudgetPreset,
        addChecklistItem,
        updateChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        addEvent,
        updateEvent,
        deleteEvent,
        addCompareSection,
        addCompareOption,
        updateCompareOption,
        deleteCompareOption,
        pickCompareOption,
        addGuest,
        updateGuest,
        deleteGuest,
        toggleAttendance,
        importGuestsFromCSV,
        addGathering,
        updateGathering,
        deleteGathering,
        updateHoneymoon,
        togglePackingItem,
        addPackingItem,
        deletePackingItem,
        addItineraryActivity,
        deleteItineraryActivity,
        triggerConfetti,
        resetToSampleData,
        exportAllDataJSON,
        importAllDataJSON,
        budgetStats,
        checklistStats,
        guestStats,
        packingStats,
        weddingId,
        isSyncing,
        lastSyncedAt
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
