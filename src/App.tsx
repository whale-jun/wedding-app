import React from 'react';
import { WeddingProvider, useWedding } from './context/WeddingContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { AiPlannerView } from './components/aiPlanner/AiPlannerView';
import { BudgetView } from './components/budget/BudgetView';
import { ChecklistView } from './components/checklist/ChecklistView';
import { CalendarView } from './components/calendar/CalendarView';
import { ComparisonView } from './components/comparison/ComparisonView';
import { GuestView } from './components/guest/GuestView';
import { InvitationView } from './components/invitation/InvitationView';
import { HoneymoonView } from './components/honeymoon/HoneymoonView';
import { OnboardingView } from './components/onboarding/OnboardingView';
import { ProfileModal } from './components/common/ProfileModal';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    isOnboardingDone, 
    completeOnboarding
  } = useWedding();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'aiPlanner':
        return <AiPlannerView />;
      case 'budget':
        return <BudgetView />;
      case 'checklist':
        return <ChecklistView />;
      case 'calendar':
        return <CalendarView />;
      case 'comparison':
        return <ComparisonView />;
      case 'guest':
        return <GuestView />;
      case 'invitation':
        return <InvitationView />;
      case 'honeymoon':
        return <HoneymoonView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-slate-800 flex flex-col items-center justify-start antialiased selection:bg-rose-500 selection:text-white">
      {/* Native App Container: 100% full screen on mobile, elegant mobile app shell on desktop */}
      <div className="w-full max-w-lg min-h-screen bg-[#faf7f5] flex flex-col relative shadow-2xl md:border-x md:border-rose-100/60 overflow-x-hidden">
        {!isOnboardingDone ? (
          <OnboardingView onComplete={completeOnboarding} />
        ) : (
          <>
            <Header />
            <Navigation />
            <main className="flex-1 p-3.5 sm:p-5 w-full pb-28 md:pb-8 overflow-y-auto">
              {renderActiveView()}
            </main>
          </>
        )}

        {/* Global Centered Profile & Invite Modal */}
        <ProfileModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WeddingProvider>
      <MainContent />
    </WeddingProvider>
  );
}
