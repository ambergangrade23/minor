import React, { useState } from 'react';
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
import { Map, X } from 'lucide-react';

export const FuturisticCampusDashboard: React.FC = () => {
  const { buses, routes, activeBus, setActiveBus, activeRoute, setActiveRoute, shift } = useTransit();

  // Character animation state (reacts to user clicks)
  const [characterState, setCharacterState] = useState<CharacterState>('walking');
  const [activeTab, setActiveTab] = useState<string>('home');

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

  // Trigger character reaction and return to default walking after short period
  const handleTriggerCharacter = (state: CharacterState) => {
    setCharacterState(state);
    if (state !== 'walking') {
      setTimeout(() => {
        setCharacterState('walking');
      }, 4200);
    }
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
          LAYER 1: FULL-SCREEN CINEMATIC UNIVERSITY CAMPUS BACKGROUND
          Photorealistic sunny day, blue sky, modern academic buildings, reflective courtyard
          ========================================================================= */}
      <div className="absolute inset-0 z-0">
        <img
          src="/campus_bg.jpg"
          alt="AITR Futuristic University Campus"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.02]"
        />
        {/* Subtle atmospheric vignette & top/bottom glass gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-slate-900/20 pointer-events-none" />
      </div>

      {/* =========================================================================
          LAYER 2: REAL-TIME 3D STUDENT AVATAR CANVAS
          Walking, reacting to user clicks, with soft shadow and contextual 3D HUD tags
          ========================================================================= */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="w-full h-full max-w-7xl mx-auto">
          <Student3DCanvas
            interactionState={characterState}
            className="w-full h-full"
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
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-white/85 hover:bg-white text-[#0f172a] hover:text-[#0284c7] backdrop-blur-xl border border-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.15)] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
      >
        <Map className="w-4 h-4 text-[#0284c7]" />
        <span>{showFullMap ? 'Hide Route Map' : 'Interactive Map'}</span>
      </button>

      {/* Map Drawer Overlay when user requests interactive progression tracking */}
      {showFullMap && (
        <div className="fixed inset-4 sm:inset-10 z-50 bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-2xl p-4 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a]">
                Interactive Campus Fleet & Route Map
              </h3>
            </div>
            <button
              onClick={() => setShowFullMap(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden mt-3 relative">
            <LeafletMap
              activeBus={activeBus}
              activeRoute={activeRoute}
              allActiveBuses={buses}
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
