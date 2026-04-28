import React, { useState } from 'react'
import { Scissors, User, Shield, Eye, EyeOff } from 'lucide-react'

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState('client')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin({
      email: formData.email,
      role: role,
      name: role === 'admin' ? 'Carlos Rodríguez' : 'Usuario Cliente',
      avatar: role === 'admin' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        : null
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-barber-darker relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border border-barber-gold rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-barber-gold rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-barber-gold/30 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-barber-gold/10 rounded-full mb-6 border border-barber-gold/30">
            <Scissors className="w-10 h-10 text-barber-gold" />
          </div>
          <h1 className="text-3xl font-bold text-barber-gold mb-2">Estilo_Fino</h1>
          <p className="text-barber-textMuted">Sistema de Gestión de Barbería</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setRole('client')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-300 ${
              role === 'client'
                ? 'bg-barber-gold/20 border-barber-gold text-barber-gold'
                : 'bg-barber-gray border-barber-grayLight text-barber-textMuted hover:text-barber-text'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Cliente</span>
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-300 ${
              role === 'admin'
                ? 'bg-barber-gold/20 border-barber-gold text-barber-gold'
                : 'bg-barber-gray border-barber-grayLight text-barber-textMuted hover:text-barber-text'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Barbero</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-barber-text mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-barber-text mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-barber-textMuted hover:text-barber-gold transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-barber-textMuted cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-barber-grayLighter bg-barber-grayLight text-barber-gold focus:ring-barber-gold" />
              Recordarme
            </label>
            <a href="#" className="text-barber-gold hover:text-barber-goldLight transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="w-full btn-primary text-lg">
            {role === 'admin' ? 'Ingresar como Barbero' : 'Ingresar como Cliente'}
          </button>
        </form>

        <p className="text-center text-barber-textMuted text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <a href="#" className="text-barber-gold hover:text-barber-goldLight transition-colors font-medium">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage