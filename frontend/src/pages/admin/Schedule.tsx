// frontend/src/pages/admin/Schedule.tsx
import { useState } from 'react';
import { useBarberSchedule } from '@hooks/useBarberSchedule';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Calendar, Plus, Trash2, AlertCircle,
  CheckCircle2, Loader2, ChevronDown,
  Sun, Moon, Briefcase, Coffee, Timer, X, Info, ArrowLeft
} from 'lucide-react';

const DAYS = [
  { id: 0, name: 'Domingo', short: 'Dom', emoji: '☀️' },
  { id: 1, name: 'Lunes', short: 'Lun', emoji: '📅' },
  { id: 2, name: 'Martes', short: 'Mar', emoji: '💈' },
  { id: 3, name: 'Miércoles', short: 'Mié', emoji: '✂️' },
  { id: 4, name: 'Jueves', short: 'Jue', emoji: '🔥' },
  { id: 5, name: 'Viernes', short: 'Vie', emoji: '🎉' },
  { id: 6, name: 'Sábado', short: 'Sáb', emoji: '🌟' },
];

export default function AdminSchedule() {
  const {
    profile,
    loading,
    saving,
    error,
    successMessage,
    updateSchedule,
    addBreak,
    removeBreak,
    addDayOff,
    removeDayOff,
    clearMessages,
  } = useBarberSchedule();

  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [newBreakStart, setNewBreakStart] = useState('');
  const [newBreakEnd, setNewBreakEnd] = useState('');
  const [newDayOffDate, setNewDayOffDate] = useState('');
  const [newDayOffReason, setNewDayOffReason] = useState('');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const navigate = useNavigate();

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-3 border-[#C9A84C] border-t-transparent" />
          <p className="text-[#9CA3AF] text-sm animate-pulse">Cargando tu agenda...</p>
        </div>
      </div>
    );
  }

  const getScheduleForDay = (dayOfWeek: number) => {
    return profile?.schedules.find((s) => s.dayOfWeek === dayOfWeek);
  };

  const getBreaksForDay = (dayOfWeek: number) => {
    return profile?.breaks.filter((b) => b.dayOfWeek === dayOfWeek) || [];
  };

  const handleToggleDay = (dayOfWeek: number, current: any) => {
    if (current) {
      updateSchedule(dayOfWeek, current.startTime, current.endTime, !current.isActive);
    } else {
      updateSchedule(dayOfWeek, '09:00', '21:00', true);
    }
  };

  const handleTimeChange = (dayOfWeek: number, field: 'start' | 'end', value: string) => {
    const current = getScheduleForDay(dayOfWeek);
    if (!current) return;
    updateSchedule(dayOfWeek, field === 'start' ? value : current.startTime, field === 'end' ? value : current.endTime, current.isActive);
  };

  const handleAddBreak = (dayOfWeek: number) => {
    if (!newBreakStart || !newBreakEnd) return;
    addBreak(Number(dayOfWeek), newBreakStart, newBreakEnd);
    setNewBreakStart('');
    setNewBreakEnd('');
  };

  const handleAddDayOff = () => {
    if (!newDayOffDate) return;
    addDayOff(newDayOffDate, newDayOffReason || undefined);
    setNewDayOffDate('');
    setNewDayOffReason('');
  };

  const activeDays = profile?.schedules.filter((s) => s.isActive).length || 0;
  const totalBreaks = profile?.breaks.length || 0;
  const totalDaysOff = profile?.daysOff.length || 0;

  // Calcular horas totales de trabajo semanal
  const totalWeeklyHours = profile?.schedules.reduce((acc, s) => {
    if (!s.isActive) return acc;
    const [startH, startM] = s.startTime.split(':').map(Number);
    const [endH, endM] = s.endTime.split(':').map(Number);
    return acc + ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all flex-shrink-0"
                title="Volver al dashboard"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center border border-[#C9A84C]/20 flex-shrink-0">
                    <Clock size={16} className="md:size-[20px] text-[#C9A84C]" />
                  </div>
                  <span className="truncate">Configuración de Agenda</span>
                </h1>
                <p className="text-[#9CA3AF] text-xs md:text-sm mt-1 md:mt-2 ml-10 md:ml-[52px]">
                  Gestiona tus horarios de trabajo, descansos y días libres
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {saving && (
                <div className="hidden sm:flex items-center gap-2 text-[#C9A84C] text-sm bg-[#C9A84C]/10 px-4 py-2 rounded-full border border-[#C9A84C]/20 animate-pulse">
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        {/* Mensajes con animación */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={clearMessages} className="ml-auto p-1 hover:bg-red-500/10 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400 animate-in slide-in-from-top-2">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <span className="text-sm">{successMessage}</span>
            <button onClick={clearMessages} className="ml-auto p-1 hover:bg-green-500/10 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats Cards mejoradas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { 
              label: 'Días laborales', 
              value: activeDays, 
              icon: Briefcase, 
              color: 'text-[#C9A84C]', 
              bg: 'bg-[#C9A84C]/10',
              border: 'border-[#C9A84C]/20'
            },
            { 
              label: 'Horas semanales', 
              value: `${Math.round(totalWeeklyHours)}h`, 
              icon: Timer, 
              color: 'text-blue-400', 
              bg: 'bg-blue-400/10',
              border: 'border-blue-400/20'
            },
            { 
              label: 'Descansos', 
              value: totalBreaks, 
              icon: Coffee, 
              color: 'text-orange-400', 
              bg: 'bg-orange-400/10',
              border: 'border-orange-400/20'
            },
            { 
              label: 'Días libres', 
              value: totalDaysOff, 
              icon: Calendar, 
              color: 'text-purple-400', 
              bg: 'bg-purple-400/10',
              border: 'border-purple-400/20'
            },
          ].map((stat) => (
            <div key={stat.label} className={`bg-[#1E1E1E] rounded-xl p-3 md:p-4 border ${stat.border} hover:border-opacity-50 transition-all group`}>
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon size={14} className={`md:size-[16px] ${stat.color}`} />
                </div>
                <span className={`text-xl md:text-2xl font-bold text-white`}>{stat.value}</span>
              </div>
              <p className="text-[#9CA3AF] text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Horario Semanal */}
        <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 md:p-6 border-b border-[#2A2A2A] flex items-center gap-3">
            <Sun size={18} className="md:size-[20px] text-[#C9A84C]" />
            <h2 className="text-base md:text-lg font-semibold text-white">Horario semanal</h2>
            <span className="text-[#9CA3AF] text-xs md:text-sm ml-auto">
              {activeDays} de 7 días activos
            </span>
          </div>

          <div className="divide-y divide-[#2A2A2A]/50">
            {DAYS.map((day) => {
              const schedule = getScheduleForDay(day.id);
              const breaks = getBreaksForDay(day.id);
              const isExpanded = expandedDay === day.id;
              const isActive = schedule?.isActive ?? false;
              const isHovered = hoveredDay === day.id;

              return (
                <div 
                  key={day.id} 
                  className={`transition-all duration-200 ${isHovered && !isExpanded ? 'bg-[#1A1A1A]' : ''}`}
                  onMouseEnter={() => setHoveredDay(day.id)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Fila principal */}
                  <div className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
                    {/* Toggle switch mejorado */}
                    <button
                      onClick={() => handleToggleDay(day.id, schedule)}
                      className={`relative w-10 h-6 md:w-12 md:h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                        isActive ? 'bg-[#C9A84C]' : 'bg-[#3A3A3A]'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${
                        isActive ? 'translate-x-4 md:translate-x-5' : 'translate-x-0.5'
                      }`}>
                        {isActive ? (
                          <Sun size={10} className="md:size-[12px] text-[#C9A84C]" />
                        ) : (
                          <Moon size={10} className="md:size-[12px] text-[#9CA3AF]" />
                        )}
                      </div>
                    </button>

                    {/* Info del día */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base md:text-lg">{day.emoji}</span>
                        <h3 className={`font-semibold text-sm md:text-base transition-colors ${isActive ? 'text-white' : 'text-[#9CA3AF]'}`}>
                          {day.name}
                        </h3>
                        {isActive && (
                          <span className="hidden sm:inline px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                            Activo
                          </span>
                        )}
                      </div>

                      {schedule ? (
                        <p className="text-[#9CA3AF] text-xs md:text-sm mt-1 flex items-center gap-2 flex-wrap">
                          {isActive ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              {schedule.startTime} - {schedule.endTime}
                              {breaks.length > 0 && (
                                <span className="text-orange-400 flex items-center gap-1">
                                  <Coffee size={12} />
                                  {breaks.length} descanso{breaks.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-[#3A3A3A]">
                              <Moon size={12} />
                              Día de descanso
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-[#3A3A3A] text-xs md:text-sm">Sin configurar • Activa para empezar</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      {schedule && isActive && (
                        <button
                          onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                          className={`p-2 rounded-xl transition-all ${
                            isExpanded 
                              ? 'bg-[#C9A84C]/10 text-[#C9A84C] rotate-180' 
                              : 'hover:bg-[#252525] text-[#9CA3AF] hover:text-white'
                          }`}
                        >
                          <ChevronDown size={16} className="md:size-[18px]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Panel expandible con animación */}
                  {isExpanded && schedule && isActive && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5 pl-14 md:pl-[72px] space-y-4 md:space-y-5 animate-in slide-in-from-top-2 duration-200">
                      {/* Selector de horario */}
                      <div className="bg-[#252525] rounded-xl p-3 md:p-4 border border-[#2A2A2A]">
                        <p className="text-[#9CA3AF] text-xs font-medium mb-3 uppercase tracking-wider">Horario de trabajo</p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex-1">
                            <label className="text-[#9CA3AF] text-xs mb-1 block">Inicio</label>
                            <div className="relative">
                              <Sun size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                              <input
                                type="time"
                                value={schedule.startTime}
                                onChange={(e) => handleTimeChange(day.id, 'start', e.target.value)}
                                className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                              />
                            </div>
                          </div>

                          <div className="text-[#9CA3AF] pt-0 sm:pt-5 text-center">
                            <span className="text-lg">→</span>
                          </div>

                          <div className="flex-1">
                            <label className="text-[#9CA3AF] text-xs mb-1 block">Fin</label>
                            <div className="relative">
                              <Moon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                              <input
                                type="time"
                                value={schedule.endTime}
                                onChange={(e) => handleTimeChange(day.id, 'end', e.target.value)}
                                className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descansos existentes */}
                      {breaks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                            <Coffee size={12} className="text-orange-400" />
                            Descansos programados
                          </p>
                          {breaks.map((b) => {
                            const [startH, startM] = b.startTime.split(':').map(Number);
                            const [endH, endM] = b.endTime.split(':').map(Number);
                            const duration = (endH * 60 + endM) - (startH * 60 + startM);

                            return (
                              <div key={b.id} className="flex items-center justify-between bg-[#252525] rounded-xl px-3 md:px-4 py-2.5 md:py-3 border border-[#2A2A2A] group hover:border-orange-500/30 transition-all">
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <Coffee size={12} className="md:size-[14px] text-orange-400" />
                                  </div>
                                  <div>
                                    <span className="text-white text-sm font-medium">
                                      {b.startTime} - {b.endTime}
                                    </span>
                                    <span className="text-[#9CA3AF] text-xs ml-2">
                                      ({duration} min)
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeBreak(b.id)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-[#9CA3AF] hover:text-red-400 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                                  title="Eliminar descanso"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Agregar descanso */}
                      <div className="bg-[#252525] rounded-xl p-3 md:p-4 border border-[#2A2A2A]">
                        <p className="text-[#9CA3AF] text-xs font-medium mb-3 uppercase tracking-wider">Agregar descanso</p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex-1 relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                              type="time"
                              value={newBreakStart}
                              onChange={(e) => setNewBreakStart(e.target.value)}
                              placeholder="Inicio"
                              className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                            />
                          </div>
                          <span className="text-[#9CA3AF] text-sm hidden sm:block">a</span>
                          <div className="flex-1 relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                              type="time"
                              value={newBreakEnd}
                              onChange={(e) => setNewBreakEnd(e.target.value)}
                              placeholder="Fin"
                              className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                            />
                          </div>
                          <button
                            onClick={() => handleAddBreak(day.id)}
                            disabled={!newBreakStart || !newBreakEnd}
                            className="p-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#B8983F] disabled:bg-[#C9A84C]/20 disabled:cursor-not-allowed text-[#1A1A1A] transition-all hover:scale-105 disabled:hover:scale-100 flex-shrink-0"
                            title="Agregar descanso"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Días libres */}
        <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] overflow-hidden">
          <div className="p-4 md:p-6 border-b border-[#2A2A2A] flex items-center gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="md:size-[16px] text-purple-400" />
            </div>
            <h2 className="text-base md:text-lg font-semibold text-white">Días libres</h2>
            <span className="text-[#9CA3AF] text-xs md:text-sm ml-auto">
              {totalDaysOff} programados
            </span>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Lista de días libres */}
            {profile?.daysOff && profile.daysOff.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.daysOff.map((d) => {
                  const date = new Date(d.date);
                  const isPast = date < new Date(new Date().setHours(0,0,0,0));

                  return (
                    <div key={d.id} className={`flex items-center gap-3 bg-[#252525] rounded-xl px-3 md:px-4 py-2.5 md:py-3 border transition-all group ${
                      isPast ? 'border-[#2A2A2A] opacity-50' : 'border-[#2A2A2A] hover:border-purple-500/30'
                    }`}>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                        isPast ? 'bg-[#1E1E1E]' : 'bg-purple-500/10'
                      }`}>
                        <span className={`text-xs font-bold ${isPast ? 'text-[#3A3A3A]' : 'text-purple-400'}`}>
                          {date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className={`text-base md:text-lg font-bold leading-none ${isPast ? 'text-[#3A3A3A]' : 'text-white'}`}>
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isPast ? 'text-[#3A3A3A]' : 'text-white'}`}>
                          {date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric' })}
                        </p>
                        {d.reason && (
                          <p className="text-[#9CA3AF] text-xs truncate">{d.reason}</p>
                        )}
                        {isPast && <span className="text-[#3A3A3A] text-xs">Pasado</span>}
                      </div>
                      <button
                        onClick={() => removeDayOff(d.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-[#9CA3AF] hover:text-red-400 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 flex-shrink-0"
                        title="Eliminar día libre"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#252525] flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="md:size-[32px] text-[#3A3A3A]" />
                </div>
                <p className="text-[#9CA3AF] text-sm">No tienes días libres programados</p>
                <p className="text-[#3A3A3A] text-xs mt-1">Agrega uno para vacaciones o eventos especiales</p>
              </div>
            )}

            {/* Agregar día libre */}
            <div className="bg-[#252525] rounded-xl p-4 md:p-5 border border-[#2A2A2A]">
              <p className="text-[#9CA3AF] text-xs font-medium mb-4 uppercase tracking-wider flex items-center gap-2">
                <Plus size={12} />
                Programar nuevo día libre
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="text-[#9CA3AF] text-xs mb-1 block">Fecha</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="date"
                      value={newDayOffDate}
                      onChange={(e) => setNewDayOffDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex-[2]">
                  <label className="text-[#9CA3AF] text-xs mb-1 block">Motivo (opcional)</label>
                  <div className="relative">
                    <Info size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={newDayOffReason}
                      onChange={(e) => setNewDayOffReason(e.target.value)}
                      placeholder="Ej: Vacaciones, cita médica..."
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg pl-9 pr-3 py-2.5 text-white text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddDayOff}
                  disabled={!newDayOffDate}
                  className="px-4 md:px-5 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#B8983F] disabled:bg-[#C9A84C]/20 disabled:cursor-not-allowed text-[#1A1A1A] font-medium transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Agregar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 flex items-start gap-3">
          <Info size={18} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
          <div className="text-[#9CA3AF] text-sm space-y-1">
            <p>
              Tu agenda está activa para <strong className="text-white">{activeDays} días</strong> a la semana, 
              con un total de <strong className="text-white">{Math.round(totalWeeklyHours)} horas</strong> de trabajo.
            </p>
            {totalBreaks > 0 && (
              <p>Tienes <strong className="text-orange-400">{totalBreaks} descansos</strong> configurados durante la semana.</p>
            )}
            {totalDaysOff > 0 && (
              <p>Tienes <strong className="text-purple-400">{totalDaysOff} días libres</strong> programados.</p>
            )}
            <p className="text-xs mt-2 text-[#3A3A3A]">
              Los clientes solo podrán agendar en los horarios que definas aquí. Los descansos se reservan automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}