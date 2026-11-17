import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { UserRole } from '../types';
import { Sprout, ShieldCheck, UserCheck, ArrowRight, Lock, Mail, User } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setUserRole } = useAppStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Farmer');
  const [name, setName] = useState('Rajesh Patil');
  const [email, setEmail] = useState('rajesh.patil@agri-intelligence.in');
  const [farmName, setFarmName] = useState('Sahyadri Agro Farms');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      id: `usr_${Date.now()}`,
      name: name || 'Rajesh Patil',
      email: email || 'farmer@agri.in',
      role: selectedRole,
      farmName: farmName || 'Sahyadri Agro Farms',
      location: 'Nashik, Maharashtra',
      hectares: 18.5,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      {/* Left Promotional / Image Column */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-cover bg-center relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-emerald-950/40"></div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">CropYield Predictor</span>
        </div>

        <div className="relative z-10 text-white max-w-md">
          <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Agricultural Intelligence</div>
          <h2 className="text-3xl font-black leading-tight">Data-Driven Precision for Modern Agribusiness</h2>
          <p className="mt-4 text-xs text-emerald-100 leading-relaxed">
            "Fusing machine learning algorithms with satellite indices and ground soil telemetry delivers unprecedented yield predictability."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-300">
              98%
            </div>
            <div className="text-[11px] text-emerald-200">
              <b>0.9828 Cross-Val R²</b> benchmark across 101 global agricultural regions.
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-emerald-300/80">
          © 2026 CropYield Predictor Platform. All rights reserved.
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {isLogin ? 'Sign In to Platform' : 'Create Farm Account'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Agricultural Intelligence & Analytics</p>
            </div>
            <Link to="/" className="text-xs font-semibold text-emerald-600 hover:underline">
              Back to site
            </Link>
          </div>

          {/* Role Selection */}
          <div className="my-5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Farmer', 'Agronomist', 'Admin'] as const).map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    selectedRole === role
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Ramesh Deshmukh"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="farmer@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  defaultValue="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Farm / Enterprise Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Sahyadri Agro Farms"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLogin ? 'Enter Platform' : 'Complete Registration'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

