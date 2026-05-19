// frontend/src/pages/client/ClientProfile.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useProfile } from '@hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Lock, Save, Loader2,
  CheckCircle, XCircle, Eye, EyeOff
} from 'lucide-react';

export default function ClientProfile() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const { user, loading, updating, error, success, fetchProfile, updateProfile, clearMessages } = useProfile();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      // Manejar error de contraseñas no coinciden
      return;
    }

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
    };

    if (formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    await updateProfile(payload);
    
    if (!error) {
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <nav className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/client/dashboard')}
            className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Mi Perfil</h1>
            <p className="text-xs text-[#9CA3AF]">Gestiona tu información</p>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 flex items-center justify-center border-2 border-[#C9A84C]/20">
            <User size={36} className="text-[#C9A84C]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {authUser?.firstName} {authUser?.lastName}
            </h2>
            <p className="text-[#9CA3AF] text-sm">{authUser?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-xs rounded-full border border-[#C9A84C]/20">
              Cliente
            </span>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <XCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información personal */}
          <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User size={18} className="text-[#C9A84C]" />
              Información Personal
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9CA3AF] text-sm mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#9CA3AF] text-sm mb-2">Apellido</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className=" text-[#9CA3AF] text-sm mb-2 flex items-center gap-2">
                  <Mail size={14} />
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={authUser?.email || ''}
                  disabled
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] rounded-xl px-4 py-3 cursor-not-allowed"
                />
                <p className="text-[#9CA3AF] text-xs mt-1">El correo no se puede cambiar</p>
              </div>

              <div>
                <label className=" text-[#9CA3AF] text-sm mb-2 flex items-center gap-2">
                  <Phone size={14} />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="300 123 4567"
                  className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A]"
                />
              </div>
            </div>
          </div>

          {/* Cambio de contraseña */}
          <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Lock size={18} className="text-[#C9A84C]" />
              Cambiar Contraseña
            </h3>
            <p className="text-[#9CA3AF] text-sm mb-4">Deja en blanco si no deseas cambiarla</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#9CA3AF] text-sm mb-2">Contraseña actual</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9CA3AF] text-sm mb-2">Nueva contraseña</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#9CA3AF] text-sm mb-2">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={updating}
            className="w-full py-4 bg-[#C9A84C] hover:bg-[#B8983F] disabled:bg-[#C9A84C]/50 disabled:cursor-not-allowed text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}