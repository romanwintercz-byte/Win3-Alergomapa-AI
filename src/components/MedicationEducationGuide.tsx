import React, { useState } from 'react';
import { Pill, ChevronDown, ChevronUp, Clock, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MEDICATION_EDUCATION_DATA } from '../data/medicationEducation';
import { cn } from '../lib/utils';

export const MedicationEducationGuide: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full mt-4 mb-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <Pill className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Správné užívání léků</h3>
          <p className="text-sm text-slate-500">Kdy brát na lačno, na co si dát pozor a časté chyby</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {MEDICATION_EDUCATION_DATA.map((item) => {
          const isExpanded = expandedId === item.id;
          
          return (
            <div 
              key={item.id} 
              className={cn(
                "border rounded-2xl overflow-hidden transition-all duration-300",
                isExpanded ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-slate-50 hover:bg-slate-100/70 cursor-pointer"
              )}
            >
              <button 
                onClick={() => toggleExpand(item.id)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              >
                <span className="font-bold text-slate-800">{item.name}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-4 pt-0 text-sm animate-in fade-in slide-in-from-top-2">
                  <p className="text-slate-700 mb-5 leading-relaxed">{item.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white border border-emerald-100 shadow-sm p-4 rounded-xl">
                      <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3 text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Jak správně užívat
                      </h4>
                      <ul className="space-y-2">
                        {item.rules.map((rule, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                      <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-3 text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" /> Časté chyby
                      </h4>
                      <ul className="space-y-2">
                        {item.mistakes.map((mistake, i) => (
                          <li key={i} className="flex items-start gap-2 text-rose-700/80">
                            <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {item.interactions.length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                      <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-3 text-xs uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4" /> Pozor na interakce
                      </h4>
                      <ul className="space-y-2">
                        {item.interactions.map((interaction, i) => (
                          <li key={i} className="flex items-start gap-2 text-amber-700/90 font-medium">
                            <span className="w-1.5 h-1.5 rounded-sm bg-amber-400 mt-1.5 shrink-0" />
                            <span>{interaction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
