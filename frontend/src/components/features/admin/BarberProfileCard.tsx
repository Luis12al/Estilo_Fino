// frontend/src/components/features/admin/BarberProfileCard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Star, Calendar, Clock, TrendingUp,
  Edit2, Check, X, Award, ChevronRight,
  Scissors, Settings
} from 'lucide-react';
import type { BarberProfile } from '@api/barber.api';

interface BarberProfileCardProps {
  profile: BarberProfile;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  onUpdateBio: (bio: string) => Promise<void>;
  stats?: {
    totalAppointments: number;
    completedThisMonth: number;
    rating: number;
    experienceYears: number;
  };
}

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const BarberProfileCard = ({
  profile,
  user,
  onUpdateBio,
  stats = { totalAppointments: 0, completedThisMonth: 0, rating: 4.8, experienceYears: 2 }
}: BarberProfileCardProps) => {
  const navigate = useNavigate();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile.bio || '');
  const [savingBio, setSavingBio] = useState(false);

  // Próximos 3 días laborales
  const nextWorkDays = profile.schedules
    .filter(s => s.isActive)
    .sort((a, b) => {
      const today = new Date().getDay();
      const distA = (a.dayOfWeek - today + 7) % 7;
      const distB = (b.dayOfWeek - today + 7) % 7;
      return distA - distB;
    })
    .slice(0, 3);

  const handleSaveBio = async () => {
    if (bioDraft.trim() === (profile.bio || '')) {
      setIsEditingBio(false);
      return;
    }
    setSavingBio(true);
    try {
      await onUpdateBio(bioDraft.trim());
      setIsEditingBio(false);
    } catch {
      // Error manejado por padre
    } finally {
      setSavingBio(false);
    }
  };

  const handleCancelBio = () => {
    setBioDraft(profile.bio || '');
    setIsEditingBio(false);
  };

  return (
    <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] overflow-hidden">
      {/* Header con banner sutil */}
      <div className="h-24 bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/10 to-transparent relative">
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          {/* Avatar grande */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#1A1A1A] border-2 border-[#2A2A2A] flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-[#C9A84C]" />
              )}
            </div>
            {/* Indicador online */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1A1A1A] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1A1A]" />
            </div>
          </div>
          
          <div className="mb-1">
            <h2 className="text-xl font-bold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
              <span className="text-[#C9A84C] font-medium">Barbero Experto</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star size={12} className="text-[#C9A84C] fill-[#C9A84C]" />
                {stats.rating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content padding top para compensar avatar */}
      <div className="pt-12 px-6 pb-6">
        {/* Bio editable */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Biografía</span>
            {!isEditingBio && (
              <button
                onClick={() => setIsEditingBio(true)}
                className="p-1.5 rounded-lg hover:bg-[#252525] text-[#9CA3AF] hover:text-[#C9A84C] transition-all"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
          
          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="Cuéntale a tus clientes sobre tu experiencia y estilo..."
                rows={3}
                maxLength={280}
                className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A] resize-none text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#3A3A3A]">{bioDraft.length}/280</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelBio}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#9CA3AF] hover:text-white hover:bg-[#252525] transition-all"
                  >
                    <X size={14} className="inline mr-1" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    className="px-3 py-1.5 rounded-lg text-xs bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] font-medium transition-all disabled:opacity-50"
                  >
                    {savingBio ? (
                      <span className="inline-block w-3 h-3 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={14} className="inline mr-1" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              {profile.bio || 'Sin biografía. Agrega una para que tus clientes te conozcan mejor.'}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#252525] rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar size={14} className="text-[#C9A84C]" />
              <span className="text-lg font-bold text-white">{stats.completedThisMonth}</span>
            </div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Citas este mes</p>
          </div>
          <div className="bg-[#252525] rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-lg font-bold text-white">{stats.totalAppointments}</span>
            </div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Total citas</p>
          </div>
          <div className="bg-[#252525] rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award size={14} className="text-blue-400" />
              <span className="text-lg font-bold text-white">{stats.experienceYears}a</span>
            </div>
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Experiencia</p>
          </div>
        </div>

        {/* Próximos días laborales */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={12} />
            Próximos días de trabajo
          </h4>
          <div className="space-y-2">
            {nextWorkDays.length > 0 ? (
              nextWorkDays.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between bg-[#252525] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-[#3A3A3A]'}`} />
                    <span className="text-sm text-white font-medium">
                      {DAYS_SHORT[schedule.dayOfWeek]}
                    </span>
                  </div>
                  <span className="text-sm text-[#9CA3AF]">
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#3A3A3A] text-center py-2">
                No tienes días laborales configurados
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/admin/schedule')}
            className="flex items-center gap-2 p-3 rounded-xl bg-[#252525] hover:bg-[#2A2A2A] border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all group"
          >
            <Calendar size={16} className="text-[#C9A84C] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm text-white font-medium">Mi Agenda</p>
              <p className="text-[10px] text-[#9CA3AF]">Configurar horarios</p>
            </div>
            <ChevronRight size={14} className="text-[#3A3A3A] ml-auto" />
          </button>
          
          <button
            onClick={() => navigate('/admin/services')}
            className="flex items-center gap-2 p-3 rounded-xl bg-[#252525] hover:bg-[#2A2A2A] border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all group"
          >
            <Scissors size={16} className="text-[#C9A84C] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm text-white font-medium">Servicios</p>
              <p className="text-[10px] text-[#9CA3AF]">Gestionar precios</p>
            </div>
            <ChevronRight size={14} className="text-[#3A3A3A] ml-auto" />
          </button>
        </div>

        {/* Footer link */}
        <button
          onClick={() => navigate('/admin/profile')}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#2A2A2A] text-[#9CA3AF] hover:text-white hover:border-[#C9A84C]/30 transition-all text-sm"
        >
          <Settings size={14} />
          Configuración avanzada del perfil
        </button>
      </div>
    </div>
  );
};