import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Eye, EyeOff, Scissors, Check } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    const { confirmPassword, ...registerData } = formData;
    // El rol no se envía — el backend asigna CLIENT automáticamente
    const result = await register(registerData);

    if (result.success) {
      navigate('/client/dashboard'); // Siempre redirige a cliente
    } else {
      setError(result.error || 'Error al registrar');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C9A84C]/10 rounded-2xl mb-4 border border-[#C9A84C]/20">
            <Scissors size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-[#9CA3AF] mt-2">Únete a Estilo Fino</p>
        </div>

        <div className="bg-[#1E1E1E] rounded-2xl p-8 border border-[#2A2A2A] shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[#252525] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#C9A84C] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Apellido</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[#252525] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#C9A84C] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Correo electrónico</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-[#252525] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#C9A84C] transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3.5 bg-[#252525] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#C9A84C] transition-all"
                placeholder="+57 300 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[#252525] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#C9A84C] transition-all pr-12"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#9CA3AF] hover:text-white transition-colors rounded-lg hover:bg-[#2A2A2A]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Confirmar contraseña</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3.5 bg-[#252525] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#C9A84C] transition-all"
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1A1A1A] border-t-transparent" />
              ) : (
                <>
                  Crear cuenta
                  <Check size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#9CA3AF] text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#C9A84C] hover:text-[#B8983F] font-semibold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}