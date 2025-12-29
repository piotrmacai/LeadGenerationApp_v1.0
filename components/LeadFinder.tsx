import React, { useState } from 'react';
import { SearchParams } from '../types';

interface LeadFinderProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const LeadFinder: React.FC<LeadFinderProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query && location) {
      onSearch({ query, location, radius });
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Scoping Module</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Deployment Parameters</p>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 animate-pulse">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Processing Data</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Industry/Niche</label>
            <div className="relative group">
              <input
                type="text"
                className="w-full bg-slate-50 px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500/50 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder-slate-400 shadow-inner"
                placeholder="e.g. BioTech Labs, Luxury Hotels"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Geographic Target</label>
            <input
              type="text"
              className="w-full bg-slate-50 px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500/50 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder-slate-400 shadow-inner"
              placeholder="City, State or Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="lg:col-span-1 flex flex-col justify-end">
            <div className="flex items-center justify-between mb-3 px-1">
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Radius</label>
               <span className="text-sm font-bold text-indigo-600">{radius}km</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 shadow-inner">
              <input
                type="range"
                min="1"
                max="100"
                step="5"
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !query || !location}
          className={`group w-full py-5 px-6 rounded-[1.5rem] font-extrabold text-white shadow-xl shadow-indigo-200/50 transition-all flex justify-center items-center gap-3 relative overflow-hidden
            ${isLoading || !query || !location 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] active:shadow-inner'}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="uppercase tracking-[0.2em] text-sm">Synchronizing Intelligence...</span>
            </>
          ) : (
            <>
              <span className="uppercase tracking-[0.2em] text-sm">Initiate Prospecting Engine</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LeadFinder;