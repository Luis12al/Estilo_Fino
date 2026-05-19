import { BarberSelector } from '@components/features/booking/BarberSelector';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scissors, Sparkles } from 'lucide-react';

export default function ClientBarbers() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Navbar con glass effect */}
      <nav className="sticky top-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#2A2A2A]/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            to="/client/dashboard"
            className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center border border-[#C9A84C]/20">
              <Scissors size={20} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Nuestros Barberos</h1>
              <p className="text-xs text-[#9CA3AF]">Elige tu profesional</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[#C9A84C] text-sm">
            <Sparkles size={16} />
            {/* <span className="font-medium">Premium</span> */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero section */}
        <div className="mb-8 bg-[#1E1E1E] rounded-2xl p-8 border border-[#2A2A2A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">
              Elige tu <span className="text-[#C9A84C]">barbero</span>
            </h2>
            <p className="text-[#9CA3AF] max-w-lg leading-relaxed">
              Selecciona un profesional para ver su disponibilidad en tiempo real. 
              Todos nuestros barberos son expertos certificados.
            </p>
          </div>
        </div>

        <BarberSelector />
      </main>
    </div>
  );
}