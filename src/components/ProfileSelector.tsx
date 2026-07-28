import React, { useState } from 'react';
import { useAppContext } from '../store';
import { UserProfile } from '../types';
import { Plus, Users, Settings2, Trash2, X, Check, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';

const EMOJI_OPTIONS = ['👨', '👩', '👦', '👧', '👶', '👵', '👴', '🧒', '🐶', '🐱'];
const COLOR_OPTIONS = [
  { id: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-600', ring: 'ring-indigo-500' },
  { id: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-500' },
  { id: 'rose', bg: 'bg-rose-500', text: 'text-rose-600', ring: 'ring-rose-500' },
  { id: 'amber', bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-500' },
  { id: 'sky', bg: 'bg-sky-500', text: 'text-sky-600', ring: 'ring-sky-500' },
  { id: 'violet', bg: 'bg-violet-500', text: 'text-violet-600', ring: 'ring-violet-500' },
];

export const ProfileSelector: React.FC = () => {
  const { profiles, activeProfileId, setActiveProfileId, addProfile, updateProfile, deleteProfile } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('👦');
  const [color, setColor] = useState('indigo');

  const openAddModal = () => {
    setEditingProfile(null);
    setName('');
    setAvatarEmoji('👦');
    setColor('emerald');
    setIsModalOpen(true);
  };

  const openEditModal = (p: UserProfile) => {
    setEditingProfile(p);
    setName(p.name);
    setAvatarEmoji(p.avatarEmoji);
    setColor(p.color || 'indigo');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProfile) {
      updateProfile(editingProfile.id, {
        name: name.trim(),
        avatarEmoji,
        color
      });
    } else {
      addProfile({
        name: name.trim(),
        avatarEmoji,
        color,
        trackedAllergens: ['birch', 'grass'],
        customAllergens: []
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200/80 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Rodinné profily</h2>
            <p className="text-xs text-slate-500">Sledujte alergeny pro celou rodinu na jednom místě</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Přidat člena</span>
        </button>
      </div>

      {/* Profiles Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {/* Family Summary Option */}
        <button
          onClick={() => setActiveProfileId('all')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border",
            activeProfileId === 'all'
              ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 scale-[1.02]"
              : "bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-slate-100"
          )}
        >
          <span className="text-base">👨👩👧👦</span>
          <span>Rodinný přehled</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200/60 text-slate-700 font-semibold">
            {profiles.length}
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 shrink-0 mx-1" />

        {/* Individual Profile Pills */}
        {profiles.map((p) => {
          const isActive = activeProfileId === p.id;
          return (
            <div key={p.id} className="relative group shrink-0">
              <button
                onClick={() => setActiveProfileId(p.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]"
                    : "bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-slate-100"
                )}
              >
                <span className="text-base">{p.avatarEmoji}</span>
                <span>{p.name}</span>
                {p.customAllergens.length > 0 && (
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-indigo-200" : "bg-indigo-500"
                  )} />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(p);
                }}
                aria-label={`Upravit profil ${p.name}`}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-500 p-1 rounded-full border border-slate-200 shadow-sm hover:text-indigo-600"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingProfile ? `Upravit profil: ${editingProfile.name}` : 'Přidat nového člena'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Jméno / Přezdívka
                </label>
                <input
                  type="text"
                  required
                  placeholder="např. Adam, Eliška, Babička..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Zvolte ikonu
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      className={cn(
                        "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border",
                        avatarEmoji === emoji
                          ? "bg-indigo-50 border-indigo-500 scale-110 shadow-sm"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {editingProfile && profiles.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Opravdu chcete smazat profil ${editingProfile.name}?`)) {
                        deleteProfile(editingProfile.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Smazat profil</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Uložit</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
