import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import {
  Smartphone,
  Tablet,
  Monitor,
  QrCode,
  Wifi,
  Battery,
  RotateCcw,
  Sparkles,
  X,
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export interface DeviceSpec {
  id: string;
  name: string;
  type: 'iphone' | 'galaxy' | 'tablet';
  width: number;
  height: number;
  borderRadius: string;
  notchType: 'dynamic-island' | 'punch-hole' | 'tablet-bezel';
  bezelWidth: string;
}

export const DEVICES: DeviceSpec[] = [
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    type: 'iphone',
    width: 393,
    height: 852,
    borderRadius: '48px',
    notchType: 'dynamic-island',
    bezelWidth: '10px'
  },
  {
    id: 'iphone-16-promax',
    name: 'iPhone 16 Pro Max',
    type: 'iphone',
    width: 430,
    height: 932,
    borderRadius: '52px',
    notchType: 'dynamic-island',
    bezelWidth: '11px'
  },
  {
    id: 'galaxy-s24',
    name: 'Galaxy S24',
    type: 'galaxy',
    width: 360,
    height: 780,
    borderRadius: '40px',
    notchType: 'punch-hole',
    bezelWidth: '8px'
  },
  {
    id: 'galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra',
    type: 'galaxy',
    width: 412,
    height: 915,
    borderRadius: '36px',
    notchType: 'punch-hole',
    bezelWidth: '9px'
  },
  {
    id: 'ipad-mini',
    name: 'iPad Mini (태블릿)',
    type: 'tablet',
    width: 600,
    height: 860,
    borderRadius: '32px',
    notchType: 'tablet-bezel',
    bezelWidth: '14px'
  }
];

interface DeviceSimulatorProps {
  children: React.ReactNode;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children }) => {
  const { isMobileFrame, setIsMobileFrame } = useWedding();
  const [selectedDevice, setSelectedDevice] = useState<DeviceSpec>(DEVICES[0]);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [studioTheme, setStudioTheme] = useState<'dark' | 'light'>('dark');

  // Live time for status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const localIp = window.location.hostname;
  const port = window.location.port || '5173';
  const mobileAccessUrl = `http://${localIp === 'localhost' ? '내-컴퓨터-IP주소' : localIp}:${port}`;

  // If running inside native iOS / Android app container
  if (Capacitor.isNativePlatform()) {
    return (
      <div className="min-h-screen bg-[#fdfaf8] flex flex-col">
        {children}
      </div>
    );
  }

  if (!isMobileFrame) {
    // Desktop Fullscreen Mode
    return (
      <div className="min-h-screen bg-[#fdfaf8] transition-colors">
        {/* Top Desktop Helper Floating Banner to switch back to Simulator */}
        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-rose-500 font-bold text-[10px]">PC 와이드 모드</span>
            <span className="text-slate-300 hidden sm:inline">현재 데스크톱 와이드 화면으로 보고 있습니다.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-300" />
              <span>실제 휴대폰으로 보기</span>
            </button>
            <button
              onClick={() => setIsMobileFrame(true)}
              className="px-3.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>스마트폰 시뮬레이터 켜기</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-40px)]">
          {children}
        </div>

        {/* QR / Phone Guide Modal */}
        {isQrModalOpen && (
          <QrModal
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
            url={mobileAccessUrl}
          />
        )}
      </div>
    );
  }

  // Mobile Simulator Mode
  return (
    <div className={`min-h-screen flex flex-col justify-between items-center transition-colors duration-300 ${
      studioTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#e2e8f0]'
    }`}>
      {/* 1. TOP SIMULATOR CONTROLLER TOOLBAR */}
      <header className="w-full max-w-6xl px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-lg">
        {/* Device selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
              <Smartphone className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-sm tracking-tight hidden sm:inline">
              모바일 앱 시뮬레이터
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedDevice.id}
              onChange={e => {
                const found = DEVICES.find(d => d.id === e.target.value);
                if (found) setSelectedDevice(found);
              }}
              className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 outline-none hover:border-rose-400 cursor-pointer transition"
            >
              {DEVICES.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.width} × {device.height}px)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Middle quick controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded-xl px-2 py-1 border border-slate-700 text-xs">
            <button
              onClick={() => setScale(prev => Math.max(0.7, prev - 0.05))}
              className="p-1 hover:text-rose-400 text-slate-400"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-semibold">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(prev => Math.min(1.15, prev + 0.05))}
              className="p-1 hover:text-rose-400 text-slate-400"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme switch */}
          <button
            onClick={() => setStudioTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition"
            title={studioTheme === 'dark' ? '라이트 스튜디오 배경' : '다크 스튜디오 배경'}
          >
            {studioTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="실제 휴대폰에서 보기"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>내 폰으로 직접 확인</span>
          </button>

          <button
            onClick={() => setIsMobileFrame(false)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="PC 와이드 모드로 전환"
          >
            <Monitor className="w-3.5 h-3.5 text-rose-400" />
            <span>PC 전체화면</span>
          </button>
        </div>
      </header>

      {/* 2. DEVICE SIMULATOR FRAME AREA */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10 px-4 w-full overflow-x-auto">
        <div
          className="relative flex-shrink-0 select-none bg-[#fdfaf8] overflow-hidden flex flex-col transition-all duration-300"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: `${selectedDevice.width}px`,
            height: `${selectedDevice.height}px`,
            borderRadius: selectedDevice.borderRadius,
            border: `${selectedDevice.bezelWidth} solid #1e293b`,
            boxShadow: studioTheme === 'dark' 
              ? '0 30px 90px -15px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)' 
              : '0 25px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)'
          }}
        >
          {/* TOP STATUS BAR (Native Smartphone Style) */}
          <div className="sticky top-0 z-50 bg-[#fdfaf8]/95 backdrop-blur-md px-6 pt-2 pb-1 flex items-center justify-between text-xs font-bold text-slate-800">
            {/* Left Clock */}
            <span className="font-semibold text-[13px] tracking-tight">{currentTime}</span>

            {/* Middle Notch / Dynamic Island */}
            {selectedDevice.notchType === 'dynamic-island' && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-2 w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900/90 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900" />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[9px] text-amber-200 font-black">으ㅔ딩</span>
                </div>
              </div>
            )}

            {selectedDevice.notchType === 'punch-hole' && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-950" />
              </div>
            )}

            {/* Right Icons: Signal, Wifi, Battery */}
            <div className="flex items-center space-x-1.5 text-slate-700">
              <span className="text-[10px] font-extrabold tracking-tighter">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center">
                <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-0.5 flex items-center">
                  <div className="w-3 h-full bg-slate-800 rounded-xs" />
                </div>
                <div className="w-0.5 h-1 bg-slate-700 rounded-r-xs" />
              </div>
            </div>
          </div>

          {/* INNER APP CONTENT SCROLL CONTAINER */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative scroll-smooth">
            {children}
          </div>

          {/* BOTTOM HOME INDICATOR BAR (iOS / Android Gestures) */}
          <div className="sticky bottom-0 z-50 bg-[#fdfaf8]/95 backdrop-blur-md pt-1 pb-2 flex justify-center items-center pointer-events-none">
            <div className="w-36 h-1 bg-slate-400/80 rounded-full" />
          </div>
        </div>
      </main>

      {/* 3. BOTTOM INFO FOOTER */}
      <footer className="w-full max-w-6xl px-4 py-2.5 text-center text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80 bg-slate-900/60">
        <span>💡 <strong>Tip:</strong> 마우스 휠이나 터치로 스마트폰 화면 내부를 스크롤해보세요.</span>
        <span className="font-mono text-[11px] text-slate-400">
          뷰포트: {selectedDevice.width} × {selectedDevice.height} px
        </span>
      </footer>

      {/* QR / Local Network Access Modal */}
      {isQrModalOpen && (
        <QrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          url={mobileAccessUrl}
        />
      )}
    </div>
  );
};

// Sub-component: QR code and Mobile Access Instructions Modal
const QrModal: React.FC<{ isOpen: boolean; onClose: () => void; url: string }> = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  // Generate dynamic QR code URL using public QR server API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1e293b&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-rose-100 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold">내 스마트폰에서 실시간 보기</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          {/* QR Code */}
          <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-md">
            <img
              src={qrApiUrl}
              alt="Mobile Access QR Code"
              className="w-48 h-48 rounded-xl object-contain"
            />
          </div>

          <div className="text-center space-y-1">
            <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold">
              📱 카메라로 QR코드를 스캔하세요!
            </span>
            <p className="text-xs text-slate-500 pt-1">
              컴퓨터와 스마트폰이 <strong>같은 Wi-Fi</strong>에 연결되어 있다면 바로 열립니다.
            </p>
          </div>
        </div>

        {/* IP Address Direct Copy Box */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          <span className="font-semibold text-slate-600">휴대폰 브라우저에 직접 입력 시:</span>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border font-mono text-slate-800 text-xs font-bold">
            <span className="truncate">{url}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(url);
                alert('주소가 복사되었습니다!');
              }}
              className="text-rose-600 hover:underline flex-shrink-0 ml-2"
            >
              복사
            </button>
          </div>
        </div>

        {/* PWA Home screen add tip */}
        <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            홈 화면에 앱으로 추가하는 법 (PWA)
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            • <strong>아이폰(Safari)</strong>: 하단 공유 버튼 ➔ [홈 화면에 추가] ➔ 앱 아이콘 생성!<br />
            • <strong>갤럭시(Chrome)</strong>: 우측 상단 메뉴(⋮) ➔ [홈 화면에 추가] ➔ 네이티브 앱처럼 주소창 없이 실행!
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl shadow transition"
        >
          확인 완료
        </button>
      </div>
    </div>
  );
};
