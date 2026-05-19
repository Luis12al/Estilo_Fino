import { Link } from 'react-router-dom';
import { Scissors, Calendar, Star, ArrowRight, Clock, Shield, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#2A2A2A]/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <Scissors size={20} className="text-[#C9A84C]" />
            </div>
            <span className="text-xl font-bold text-white">Estilo Fino</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[#9CA3AF] hover:text-white transition-colors text-sm font-medium"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full px-4 py-2 mb-8">
            <Star size={14} className="text-[#C9A84C]" />
            <span className="text-[#C9A84C] text-sm font-medium">La mejor barbería de la ciudad</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu estilo, <span className="text-[#C9A84C]">nuestra pasión</span>
          </h1>
          <p className="text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10 leading-relaxed">
            Reserva tu cita en segundos con los mejores barberos. 
            Cortes clásicos, fades modernos y cuidado profesional de barba.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              Reservar ahora
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border border-[#2A2A2A] hover:border-[#C9A84C] text-white px-8 py-4 rounded-xl font-semibold transition-all"
            >
              <Calendar size={20} />
              Ver agenda
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-8 border-t border-[#2A2A2A]">
            <div>
              <div className="text-3xl font-bold text-[#C9A84C]">15+</div>
              <div className="text-[#9CA3AF] text-sm mt-1">Barberos expertos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#C9A84C]">10k+</div>
              <div className="text-[#9CA3AF] text-sm mt-1">Clientes felices</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#C9A84C]">4.9</div>
              <div className="text-[#9CA3AF] text-sm mt-1">Calificación promedio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Preview */}
      <section className="py-20 px-6 bg-[#1A1A1A]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Nuestros servicios</h2>
            <p className="text-[#9CA3AF]">Todo lo que necesitas para lucir impecable</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Corte de cabello', price: '$20.000', time: '60 min', icon: Scissors },
              { name: 'Arreglo de cejas', price: '$4.000', time: '5 min', icon: Star },
              { name: 'Cuidado de barba', price: '$8.000', time: '10 min', icon: Shield },
              { name: 'Pigmentación', price: '$5.000', time: '10 min', icon: Clock },
            ].map((service) => (
              <div
                key={service.name}
                className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center mb-4 group-hover:bg-[#C9A84C]/20 transition-colors">
                  <service.icon size={24} className="text-[#C9A84C]" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{service.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#C9A84C] font-bold">{service.price}</span>
                  <span className="text-[#9CA3AF]">{service.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-[#1E1E1E] rounded-3xl p-12 text-center border border-[#2A2A2A]">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para tu nuevo look?</h2>
          <p className="text-[#9CA3AF] mb-8 max-w-lg mx-auto">
            Agenda tu cita ahora y descubre por qué somos la barbería preferida de la ciudad.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
          >
            Comenzar ahora
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2A] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
            <MapPin size={16} />
            <span>Calle Principal #123, Centro</span>
          </div>
          <div className="text-[#9CA3AF] text-sm">
            © 2026 Estilo Fino. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}