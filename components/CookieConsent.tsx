
import React, { useState } from 'react';
import { GDPRSettings } from '../types';

interface CookieConsentProps {
  onAccept: (settings: GDPRSettings) => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [settings, setSettings] = useState<GDPRSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    consented: true
  });

  const handleSave = () => {
    onAccept(settings);
  };

  const handleAcceptAll = () => {
    onAccept({ essential: true, analytics: true, marketing: true, consented: true });
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white shadow-2xl rounded-2xl p-6 z-50 border border-slate-200">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">We respect your privacy</h3>
          <p className="text-sm text-slate-500 mt-1">
            We use cookies to improve your experience, analyze site traffic, and serve personalized ads. By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>

        {showPreferences ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Essential</p>
                <p className="text-xs text-slate-400">Required for the site to function</p>
              </div>
              <input type="checkbox" checked disabled className="h-5 w-5 rounded border-slate-300 text-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Analytics</p>
                <p className="text-xs text-slate-400">Help us understand how users use the site</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.analytics}
                onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-blue-600" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Marketing</p>
                <p className="text-xs text-slate-400">Used to deliver personalized advertisements</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.marketing}
                onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-blue-600" 
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3 mt-2">
          <button 
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 px-4 py-2"
          >
            {showPreferences ? 'Cancel' : 'Customize'}
          </button>
          <button 
            onClick={() => onAccept({ essential: true, analytics: false, marketing: false, consented: true })}
            className="text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200"
          >
            Reject Non-Essential
          </button>
          <button 
            onClick={showPreferences ? handleSave : handleAcceptAll}
            className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            {showPreferences ? 'Save Preferences' : 'Accept All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
