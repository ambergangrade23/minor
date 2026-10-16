import React, { useState, useRef } from 'react';
import { useTransit } from '../context/TransitContext';
import { Student3DCanvas, CharacterState } from './Student3DCanvas';
import { FuturisticSidebar } from './FuturisticSidebar';
import { TopCenterBranding } from './TopCenterBranding';
import { StudentProfilePanel } from './StudentProfilePanel';
import { BusStatusPanel } from './BusStatusPanel';
import { QuickActionsPanel } from './QuickActionsPanel';
import { RecentUpdatesPanel } from './RecentUpdatesPanel';
import { HeroMessage } from './HeroMessage';
import { FindMyBusModal } from './FindMyBusModal';
import { BusAlertsModal } from './BusAlertsModal';
import { DriverDetailsModal } from './DriverDetailsModal';
import { ReportProblemModal } from './ReportProblemModal';
import { SettingsModal } from './SettingsModal';
import { NearbyAlternativesModal } from './NearbyAlternativesModal';
import { RouteScheduleModal } from './RouteScheduleModal';
import { ProblemAreasDirectoryModal } from './ProblemAreasDirectoryModal';
import { LeafletMap } from './LeafletMap';
import { Bus, Route } from '../types/transit';
import { Map, X, Maximize2, Minimize2 } from 'lucide-react';

export const FuturisticCampusDashboard: React.FC = () => {
  const { buses, routes, activeBus, setActiveBus, activeRoute, setActiveRoute, shift } = useTransit();

  // Character animation state (reacts to user clicks)
  const [characterState, setCharacterState] = useState<CharacterState>('walking');
  const [activeTab, setActiveTab] = useState<string>('home');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [isFindBusOpen, setIsFindBusOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isProblemAreasModalOpen, setIsProblemAreasModalOpen] = useState<boolean>(false);
  const [showFullMap, setShowFullMap] = useState<boolean>(false);
  const [isMapMaximized, setIsMapMaximized] = useState<boolean>(true);

  // Trigger character reaction and return to default walking after short period
  const handleTriggerCharacter = (state: CharacterState, durationMs: number = 3800) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCharacterState(state);
    if (state !== 'walking') {
      timeoutRef.current = setTimeout(() => {
        setCharacterState('walking');
      }, durationMs);
    }
  };

  // Direct click on the character cycles through fun reactions
  const handleDirectCharacterClick = () => {
    const funReactions: CharacterState[] = ['wave', 'cheer', 'react_bus', 'looking_around'];
    const nextReaction = funReactions[Math.floor(Math.random() * funReactions.length)];
    handleTriggerCharacter(nextReaction, 3200);
  };

  const handleSidebarTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      setShowFullMap(false);
      handleTriggerCharacter('walking');
    } else if (tabId === 'find_bus') {
      setIsFindBusOpen(true);
      handleTriggerCharacter('react_bus');
    } else if (tabId === 'alerts') {
      setIsAlertsOpen(true);
      handleTriggerCharacter('react_alert');
    } else if (tabId === 'nearby') {
      setIsNearbyModalOpen(true);
      handleTriggerCharacter('react_route');
    } else if (tabId === 'drivers') {
      setIsDriverModalOpen(true);
      handleTriggerCharacter('react_driver');
    } else if (tabId === 'report') {
      setIsReportModalOpen(true);
      handleTriggerCharacter('idle');
    } else if (tabId === 'settings') {
      setIsSettingsModalOpen(true);
      handleTriggerCharacter('idle');
    }
  };

  const handleSelectRouteBus = (route: Route, bus: Bus) => {
    setActiveRoute(route);
    setActiveBus(bus);
    handleTriggerCharacter('react_bus');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-900 font-sans">
      {/* =========================================================================
          LAYER 1: CINEMATIC CAMPUS BACKGROUND
          A high-tech campus courtyard photograph with subtle depth
          ========================================================================= */}
      <div className="absolute inset-0 z-0">
        <img
          src="/campus_bg.jpg"
          alt="AITR Futuristic University Campus"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.02]"
        />
        {/* Subtle atmospheric vignette & glass gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-slate-900/20 pointer-events-none" />
      </div>

      {/* =========================================================================
          LAYER 2: 3D WALKING / INTERACTIVE BOY AVATAR
          Renders 3D boy walking and dynamically reacting to user clicks
          ========================================================================= */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center">
          <Student3DCanvas
            interactionState={characterState}
            className="w-full h-full"
            onCharacterClick={handleDirectCharacterClick}
          />
        </div>
      </div>

      {/* =========================================================================
          LAYER 3: NARROW LEFT VERTICAL SIDEBAR
          ========================================================================= */}
      <FuturisticSidebar
        activeTab={activeTab}
        onTabChange={handleSidebarTabChange}
        onTriggerCharacter={handleTriggerCharacter}
      />

      {/* =========================================================================
          LAYER 4: TOP-CENTER BRANDING (AITR BUS TRACKING ETA)
          ========================================================================= */}
      <TopCenterBranding
        onOpenAlerts={() => {
          handleTriggerCharacter('react_alert');
          setIsAlertsOpen(true);
        }}
        onOpenSettings={() => {
          handleTriggerCharacter('idle');
          setIsSettingsModalOpen(true);
        }}
      />

      {/* =========================================================================
          LAYER 5: FLOATING TRANSLUCENT GLASSMORPHISM PANELS (DESKTOP & MOBILE HUD)
          ========================================================================= */}
      <div className="relative z-20 w-full h-full pt-20 pb-6 px-4 sm:px-8 pl-20 sm:pl-28 pointer-events-none flex flex-col justify-between">
        {/* Upper Zone: Profile Panel (Left) & Bus Status Card (Right) */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 w-full">
          {/* Upper Left Floating Card: Welcome Student */}
          <div className="pointer-events-auto">
            <StudentProfilePanel
              onFindBus={() => {
                handleTriggerCharacter('react_bus');
                setIsFindBusOpen(true);
              }}
              onBusAlerts={() => {
                handleTriggerCharacter('react_alert');
                setIsAlertsOpen(true);
              }}
              onTriggerCharacter={handleTriggerCharacter}
            />
          </div>

          {/* Upper Right Floating Stack: Today's Bus Status & Quick Actions */}
          <div className="pointer-events-auto space-y-4 flex flex-col items-end">
            <BusStatusPanel
              onOpenDetails={() => {
                handleTriggerCharacter('react_bus');
                setIsDriverModalOpen(true);
              }}
              onTriggerCharacter={handleTriggerCharacter}
            />

            <QuickActionsPanel
              onNearbyRoutes={() => {
                handleTriggerCharacter('react_route');
                setIsNearbyModalOpen(true);
              }}
              onDriverDetails={() => {
                handleTriggerCharacter('react_driver');
                setIsDriverModalOpen(true);
              }}
              onReportProblem={() => {
                handleTriggerCharacter('idle');
                setIsReportModalOpen(true);
              }}
              onViewAlerts={() => {
                handleTriggerCharacter('react_alert');
                setIsAlertsOpen(true);
              }}
              onTriggerCharacter={handleTriggerCharacter}
            />
          </div>
        </div>

        {/* Lower Zone: Recent Updates Timeline (Left) & Hero Message (Right/Center) */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-4 w-full mt-auto">
          {/* Lower Left: Recent Bus Updates Timeline */}
          <div className="pointer-events-auto">
            <RecentUpdatesPanel
              onViewAll={() => {
                handleTriggerCharacter('react_alert');
                setIsAlertsOpen(true);
              }}
              onSelectRoute={(busNum) => {
                handleTriggerCharacter('react_bus');
                setIsFindBusOpen(true);
              }}
              onTriggerCharacter={handleTriggerCharacter}
            />
          </div>

          {/* Bottom Right / Center: Cinematic Hero Text block */}
          <div className="pointer-events-auto">
            <HeroMessage
              onFindAlternatives={() => {
                handleTriggerCharacter('react_route');
                setIsNearbyModalOpen(true);
              }}
              onTriggerCharacter={handleTriggerCharacter}
            />
          </div>
        </div>
      </div>

      {/* Floating Map HUD Toggle Button (Quickly reveal GPS Corridor Map Overlay) */}
      <button
        onClick={() => setShowFullMap(!showFullMap)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-white/85 hover:bg-white text-[#0f172a] hover:text-[#0284c7] backdrop-blur-xl border border-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.15)] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
      >
        <Map className="w-4 h-4 text-[#0284c7]" />
        <span>{showFullMap ? 'Hide Route Map' : 'Interactive Map'}</span>
      </button>

      {/* Map Drawer Overlay when user requests interactive progression tracking */}
      {showFullMap && (
        <div
          className={`fixed z-50 bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl flex flex-col flex-grow grow transition-all duration-300 animate-fade-in ${
            isMapMaximized
              ? 'inset-0 w-screen h-screen rounded-none p-3 sm:p-4'
              : 'inset-2 sm:inset-4 md:inset-6 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] rounded-3xl p-3 sm:p-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shadow-sm">
                <Map className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a]">
                  Interactive Campus Fleet & Route Map
                </h3>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Live real-time telemetry across college transit corridors
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMapMaximized(!isMapMaximized)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-200"
                title={isMapMaximized ? 'Restore framed window' : 'Expand to 100% screen'}
              >
                {isMapMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isMapMaximized ? 'Restore' : '100% View'}</span>
              </button>
              <button
                onClick={() => setShowFullMap(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Close Map"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dynamic 100% Flex-Grow Map Canvas Area */}
          <div className="flex-1 flex-grow grow min-h-0 w-full h-full flex flex-col rounded-2xl overflow-hidden mt-2.5 relative shadow-inner">
            <LeafletMap
              activeBus={activeBus}
              activeRoute={activeRoute}
              allActiveBuses={buses}
              height="100%"
              enableD3Progression={true}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          FUNCTIONAL MODALS LAYER (BUS SEARCH, ALERTS, DRIVERS, PROBLEM REPORT)
          ========================================================================= */}
      <FindMyBusModal
        isOpen={isFindBusOpen}
        onClose={() => setIsFindBusOpen(false)}
        onSelectRouteBus={handleSelectRouteBus}
      />

      <BusAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onSelectBus={(busNum) => {
          setIsFindBusOpen(true);
        }}
      />

      <DriverDetailsModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        selectedBus={activeBus}
      />

      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <NearbyAlternativesModal
        isOpen={isNearbyModalOpen}
        onClose={() => setIsNearbyModalOpen(false)}
        initialStopName={activeBus?.pickup_areas?.[0] || 'Bhanwarkua Chouraha'}
      />

      <ProblemAreasDirectoryModal
        isOpen={isProblemAreasModalOpen}
        onClose={() => setIsProblemAreasModalOpen(false)}
      />

      <RouteScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        routes={routes}
        buses={buses}
        currentShift={shift}
        onSelectRouteForTracking={(route, bus) => {
          setActiveRoute(route);
          if (bus) setActiveBus(bus);
        }}
      />
    </div>
  );
};
