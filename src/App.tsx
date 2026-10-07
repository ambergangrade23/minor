import React from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/StudentView';
import { DriverView } from './components/DriverView';
import { AdminView } from './components/AdminView';

const MainContent: React.FC = () => {
  const { role } = useTransit();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'student' && <StudentView />}
        {role === 'driver' && <DriverView />}
        {role === 'admin' && <AdminView />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-700">Acropolis Institute of Technology & Research (AITR)</span>
            <span className="mx-2">·</span>
            <span>Indore Bypass Road, Mangliya, MP 453771</span>
          </div>
          <div>
            <span>College Bus Transport Cell · Native GPS & OpenStreetMap Real-Time Tracking</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TransitProvider>
      <MainContent />
    </TransitProvider>
  );
}
