import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { BellRing, CheckCircle, AlertTriangle, Info, ShieldAlert, MessageSquare, Mail, Smartphone } from 'lucide-react';

export const AlertsCenterPage: React.FC = () => {
  const { alerts, markAlertAsRead } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="h-6 w-6 text-emerald-600" />
            Alerts & Field Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Realtime agronomic warning dispatch: soil moisture deficits, pest incursions, and weather extremes
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1 rounded-lg capitalize ${
                filter === sev
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Channels Toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Automated Field Dispatch Channels</h3>
        <p className="text-xs text-slate-500 mb-4">Select where critical notifications are instantly pushed to your phone</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Alerts</div>
                <div className="text-[10px] text-slate-400">+91 98220 •••••</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappEnabled}
              onChange={() => setWhatsappEnabled(!whatsappEnabled)}
              className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">SMS Notification</div>
                <div className="text-[10px] text-slate-400">Direct carrier text</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={() => setSmsEnabled(!smsEnabled)}
              className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Email Summary</div>
                <div className="text-[10px] text-slate-400">Weekly agronomy audit</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={() => setEmailEnabled(!emailEnabled)}
              className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              alert.read 
                ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 opacity-75' 
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
              }`}>
                {alert.severity === 'critical' ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{alert.title}</h4>
                  <span className="text-[10px] font-semibold text-slate-400">• {alert.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
              </div>
            </div>

            {!alert.read && (
              <button
                onClick={() => markAlertAsRead(alert.id)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 whitespace-nowrap p-1.5"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

