import React, { useState, useMemo } from 'react';
import { Lead } from '../types';

interface LeadsTableProps {
  leads: Lead[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const uniqueTypes = useMemo(() => {
    const types = new Set(leads.map(l => l.type || 'Undefined'));
    return ['All', ...Array.from(types)];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'All' || (lead.type || 'Undefined') === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [leads, searchTerm, typeFilter]);

  if (leads.length === 0) return null;

  const handleExportCSV = () => {
    const headers = ["Name", "Address", "Website", "Email", "Phone", "Type", "Rating"];
    const csvRows = [
      headers.join(","),
      ...filteredLeads.map(l => [
        `"${l.name || ''}"`, 
        `"${l.address || ''}"`, 
        `"${l.website || ''}"`, 
        `"${l.email || ''}"`, 
        `"${l.phone || ''}"`, 
        `"${l.type || ''}"`,
        `"${l.rating || ''}"`
      ].join(","))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vantage_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden flex flex-col h-full transition-all">
      {/* Table Header */}
      <div className="px-10 py-8 border-b border-slate-100 flex flex-wrap justify-between items-center bg-white/30 gap-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Intelligence Output</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Verified Entity Matrix</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 bg-indigo-50 rounded-full text-[11px] font-bold text-indigo-600 uppercase border border-indigo-100">
            {filteredLeads.length} {filteredLeads.length === 1 ? 'Record' : 'Records'} Matched
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Intel
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-10 py-4 bg-slate-50/40 border-b border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type:</label>
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer min-w-[140px]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Table Area */}
      <div className="overflow-auto flex-1 custom-scrollbar">
        {filteredLeads.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Identity</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Classification</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Contact Vector</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Locality</th>
                <th className="px-10 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Metrics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.map((lead, index) => (
                <tr key={index} className="group hover:bg-indigo-50/30 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lead.name}</span>
                      {lead.website && (
                        <a 
                          href={lead.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[11px] font-medium text-slate-400 hover:text-indigo-600 transition-colors mt-0.5 inline-flex items-center gap-1"
                        >
                           View Site
                           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
                      {lead.type || 'Undefined'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1.5">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-2 truncate max-w-[180px]" title={lead.email}>
                           <div className="h-5 w-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                           </div>
                           {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                          <div className="h-5 w-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          </div>
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-start gap-2 max-w-[200px]" title={lead.address}>
                      <div className="h-5 w-5 shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      </div>
                      <span className="text-[11px] leading-relaxed text-slate-500 font-medium line-clamp-2">{lead.address}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {lead.rating ? (
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < Math.floor(Number(lead.rating)) ? "#f59e0b" : "none"} stroke={i < Math.floor(Number(lead.rating)) ? "#f59e0b" : "#e2e8f0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          ))}
                        </div>
                        <span className="text-xs font-black text-slate-800 ml-1">{lead.rating}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-300">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Matching Leads Found</p>
             <button 
              onClick={() => { setSearchTerm(''); setTypeFilter('All'); }}
              className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
             >
               Reset Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;