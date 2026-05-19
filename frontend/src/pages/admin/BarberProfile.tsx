// frontend/src/pages/admin/BarberProfile.tsx
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useBarberProfile } from '@hooks/useBarberProfile';
import {
  ArrowLeft, User, Save, Loader2, CheckCircle, XCircle,
  Scissors, Clock, FileText, Camera, Star, Calendar,
  TrendingUp, Award, Phone, Mail, Edit2, X,
  Briefcase, ChevronRight, LogOut
} from 'lucide-react';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function BarberProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    profile,
    stats,
    loading,
    updating,
    uploadingAvatar,
    error,
    success,
    updateProfile,
    uploadAvatar,
    clearMessages,
  } = useBarberProfile();

  // Estados locales para edición
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    defaultSlotDuration: 60,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar form cuando carga profile
  useState(() => {
    if (profile && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: profile.bio || '',
        defaultSlotDuration: profile.defaultSlotDuration || 60,
      });
    }
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar: resetear
      if (profile && user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          bio: profile.bio || '',
          defaultSlotDuration: profile.defaultSlotDuration || 60,
        });
      }
    }
    setIsEditing(!isEditing);
    clearMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    await updateProfile({
      firstName: formData.firstName,   // ← AHORA SÍ se envía
      lastName: formData.lastName,     // ← AHORA SÍ se envía
      phone: formData.phone,           // ← AHORA SÍ se envía
      bio: formData.bio,
      defaultSlotDuration: formData.defaultSlotDuration,
    });

    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    await uploadAvatar(file);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#2A2A2A]/50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white">Mi Perfil</h1>
              <p className="text-xs text-[#9CA3AF] hidden sm:block">Gestiona tu información profesional</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#252525] hover:bg-[#3A3A3A] text-white rounded-xl text-xs md:text-sm font-medium transition-all border border-[#2A2A2A]"
              >
                <Edit2 size={16} />
                <span className="hidden sm:inline">Editar perfil</span>
              </button>
            ) : (
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#252525] hover:bg-red-500/10 hover:text-red-400 text-[#9CA3AF] rounded-xl text-xs md:text-sm font-medium transition-all border border-[#2A2A2A]"
              >
                <X size={16} />
                <span className="hidden sm:inline">Cancelar</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-500/10 text-[#9CA3AF] hover:text-red-400 transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Mensajes */}
        {error && (
          <div className="mb-4 md:mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
            <XCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={clearMessages} className="ml-auto text-xs text-red-400 hover:text-red-300">Cerrar</button>
          </div>
        )}
        {success && (
          <div className="mb-4 md:mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
            <button onClick={clearMessages} className="ml-auto text-xs text-green-400 hover:text-green-300">Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Columna izquierda: Info principal */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Card de perfil */}
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] overflow-hidden">
              {/* Banner */}
              <div className="h-24 md:h-32 bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/10 to-transparent relative" />

              <div className="px-4 md:px-6 pb-4 md:pb-6 relative">
                {/* Avatar grande con upload */}
                <div className="relative -mt-12 md:-mt-16 mb-4 inline-block">
                  <div 
                    onClick={!isEditing ? undefined : handleAvatarClick}
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#1A1A1A] border-4 border-[#0F0F0F] flex items-center justify-center overflow-hidden relative ${
                      isEditing ? 'cursor-pointer group' : ''
                    }`}
                  >
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={36} className="md:size-[48px] text-[#C9A84C]" />
                    )}

                    {isEditing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    )}

                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 size={24} className="text-[#C9A84C] animate-spin" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-[#C9A84C] rounded-full flex items-center justify-center border-4 border-[#0F0F0F]">
                      <Camera size={12} className="md:size-[14px] text-[#1A1A1A]" />
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Info básica */}
                <div className="mb-4 md:mb-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[#9CA3AF] text-xs mb-2">Nombre</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[#9CA3AF] text-xs mb-2">Apellido</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {user?.firstName} {user?.lastName}
                    </h2>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-[#9CA3AF]">
                    <span className="flex items-center gap-1">
                      <Mail size={14} className="text-[#C9A84C]" />
                      {user?.email}
                    </span>
                    {user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} className="text-[#C9A84C]" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-sm font-medium text-[#9CA3AF] mb-3 flex items-center gap-2">
                    <FileText size={14} />
                    Biografía
                  </h3>

                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Cuéntale a tus clientes sobre tu experiencia, especialidades y estilo de trabajo..."
                      rows={4}
                      maxLength={500}
                      className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] text-sm resize-none placeholder:text-[#3A3A3A]"
                    />
                  ) : (
                    <p className="text-sm text-[#9CA3AF] leading-relaxed bg-[#252525] rounded-xl p-4">
                      {profile?.bio || 'Sin biografía. Agrega una para que tus clientes te conozcan mejor.'}
                    </p>
                  )}
                </div>

                {/* Configuración profesional */}
                <div>
                  <h3 className="text-sm font-medium text-[#9CA3AF] mb-3 flex items-center gap-2">
                    <Scissors size={14} />
                    Configuración profesional
                  </h3>

                  {isEditing ? (
                    <div className="bg-[#252525] rounded-xl p-4">
                      <label className="block text-[#9CA3AF] text-xs mb-3">
                        Duración default de slots (minutos)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[30, 45, 60, 90].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setFormData({ ...formData, defaultSlotDuration: mins })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              formData.defaultSlotDuration === mins
                                ? 'bg-[#C9A84C] text-[#1A1A1A]'
                                : 'bg-[#1E1E1E] text-[#9CA3AF] hover:text-white border border-[#2A2A2A]'
                            }`}
                          >
                            {mins} min
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-[#252525] rounded-xl p-4">
                      <Clock size={16} className="text-[#C9A84C]" />
                      <div>
                        <p className="text-sm text-white font-medium">
                          {profile?.defaultSlotDuration || 60} minutos
                        </p>
                        <p className="text-xs text-[#9CA3AF]">Duración default por cita</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón guardar */}
                {isEditing && (
                  <div className="mt-4 md:mt-6 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-[#C9A84C] hover:bg-[#B8983F] disabled:bg-[#C9A84C]/50 text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02]"
                    >
                      {updating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Horario semanal resumen */}
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2 text-sm md:text-base">
                  <Calendar size={18} className="text-[#C9A84C]" />
                  Horario semanal
                </h3>
                <Link 
                  to="/admin/schedule" 
                  className="text-[#C9A84C] hover:text-[#B8983F] text-sm flex items-center gap-1 transition-colors"
                >
                  Gestionar
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-2">
                {DAYS.map((day, idx) => {
                  const schedule = profile?.schedules.find(s => s.dayOfWeek === idx);
                  const isActive = schedule?.isActive ?? false;

                  return (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-[#2A2A2A] last:border-0">
                      <span className="text-sm text-white font-medium w-20 md:w-24">{day}</span>
                      {isActive ? (
                        <span className="text-sm text-[#9CA3AF] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          {schedule!.startTime} - {schedule!.endTime}
                        </span>
                      ) : (
                        <span className="text-sm text-[#3A3A3A] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#3A3A3A]" />
                          No laborable
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna derecha: Stats y acciones */}
          <div className="space-y-4 md:space-y-6">
            {/* Stats card */}
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] p-4 md:p-6">
              <h3 className="text-xs font-medium text-[#9CA3AF] mb-4 uppercase tracking-wider">
                Rendimiento
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                    <Calendar size={18} className="md:size-[20px] text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stats?.completedThisMonth ?? 0}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Citas este mes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp size={18} className="md:size-[20px] text-green-400" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      ${(stats?.totalRevenue ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Ingresos totales</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Award size={18} className="md:size-[20px] text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stats?.totalAppointments ?? 0}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Citas totales</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Star size={18} className="md:size-[20px] text-yellow-400 fill-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stats?.rating ?? 4.8}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Calificación</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
                  <Briefcase size={12} />
                  Miembro desde {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] p-4 md:p-6">
              <h3 className="text-xs font-medium text-[#9CA3AF] mb-4 uppercase tracking-wider">
                Accesos rápidos
              </h3>

              <div className="space-y-2">
                {[
                  { label: 'Mi Agenda', icon: Calendar, path: '/admin/schedule', desc: 'Configurar horarios' },
                  { label: 'Citas', icon: Calendar, path: '/admin/appointments', desc: 'Ver historial' },
                  { label: 'Servicios', icon: Scissors, path: '/admin/services', desc: 'Gestionar precios' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#252525] hover:bg-[#2A2A2A] border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all group"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1E1E1E] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon size={16} className="md:size-[18px] text-[#C9A84C]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{item.label}</p>
                      <p className="text-xs text-[#9CA3AF]">{item.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-[#3A3A3A] group-hover:text-[#C9A84C] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}