import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Key, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signIn, session, perfil } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Failed attempts tracking
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Redirect if already logged in and active
  useEffect(() => {
    if (session && perfil && perfil.activo) {
      navigate('/equipo/panel');
    }
  }, [session, perfil, navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    setLoading(true);

    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      setFailedAttempts(0);
      navigate('/equipo/panel');
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 5) {
        setLockoutSeconds(60);
        setError('Demasiados intentos fallidos. Acceso bloqueado por 60 segundos.');
      } else {
        setError(result.error || 'Correo o contraseña incorrectos.');
      }
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-[#FAF7F2]">
      {/* LEFT PANEL: 50% Editorial Visual Showcase */}
      <div className="relative w-full md:w-1/2 h-72 md:h-auto md:min-h-screen overflow-hidden bg-[#1E1B19] flex flex-col justify-between p-6 md:p-12 select-none">
        {/* Full Bleed Photography */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3PNgmDv0gm3SIWb3DYf2RHR9K30ImoZ8y71QnEiyfpyYsy_Nb6EQisw2ALq8clIUu0O8kIKJuDdtEqglZNfEDUlFaq7joP0UCliw_vD_FJJnvaTWBmk4JRj9aeg-Z-Rs9NY2IpJRYY5e5S694sKZxSB2zv-J6k4gYfNoVsLMDOryNGezgwm4XWCQLN4HBz31QNzcjVFryxHKJAsZYwt1HvM8N6avKtkKl27-VyO1wQXvQegL-2d5c"
          alt="Alta costura editorial VSHEIN Atelier"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.03]"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B19]/90 via-[#1E1B19]/30 to-black/40 pointer-events-none" />

        {/* Top Branding Layer */}
        <div className="relative z-10 flex items-center justify-between w-full text-white/90">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFDADb]" />
            <span className="text-xs uppercase tracking-[0.2em] font-medium">Privé Archive</span>
          </div>
          <span className="text-xs tracking-widest uppercase text-white/70">Est. 2018</span>
        </div>

        {/* Bottom Statement */}
        <div className="relative z-10 max-w-md my-auto md:my-0 md:mt-auto text-white">
          <p className="text-xs tracking-[0.25em] uppercase text-[#FFDADb] mb-2 font-semibold">
            Boutique Haute Couture
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white tracking-tight leading-none mb-4 font-normal">
            VSHEIN
          </h1>
          <div className="w-12 h-px bg-white/40 mb-4" />
          <p className="text-xs md:text-sm text-white/80 leading-relaxed font-light">
            Atelier & Management Portal / Edición 2026. Espacio reservado para la curaduría interna, control de inventario y atención directa de clientela distinguida.
          </p>
        </div>

        {/* Bottom indicator */}
        <div className="relative z-10 hidden md:flex items-center justify-between pt-6 border-t border-white/10 text-xs text-white/60">
          <span>Sistema Centralizado de Operaciones</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FF4E3] animate-pulse" />
            <span>Servidor Seguro</span>
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: 50% Clean Administrative Canvas */}
      <div className="w-full md:w-1/2 flex flex-col justify-between items-center bg-[#FAF7F2] p-6 md:p-12 relative">
        {/* Top Utility Return */}
        <div className="w-full max-w-[440px] flex justify-between items-center mb-6 md:mb-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-[#57534E] hover:text-[#9F1D3A] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Site</span>
          </Link>
          <span className="text-xs text-[#8C7072] font-mono">v2.6.4</span>
        </div>

        {/* Main Login Card */}
        <div className="w-full max-w-[440px] my-auto">
          <div className="bg-white border border-[#E7E0D6] rounded-[12px] p-8 md:p-10 shadow-sm">
            {/* Header */}
            <div className="mb-8 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4ECE8] rounded-[4px] border border-[#E7E0D6] mb-3">
                <Lock className="w-3.5 h-3.5 text-[#9F1D3A]" />
                <span className="text-[10px] font-semibold text-[#57534E] uppercase tracking-wider">
                  Acceso Interno
                </span>
              </div>
              <h2 className="font-display text-2xl text-[#1C1917] font-semibold tracking-tight mb-1">
                Panel del equipo
              </h2>
              <p className="text-xs text-[#57534E]">
                Ingresa tus credenciales autorizadas para gestionar el catálogo y consultas.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-6 p-3 rounded-[4px] bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]" htmlFor="admin-email">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7072] pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vshein.com"
                    disabled={lockoutSeconds > 0}
                    className="w-full bg-white text-[#1C1917] placeholder:text-[#8C7072]/60 border border-[#E7E0D6] rounded-[4px] pl-9 pr-3.5 py-2.5 text-xs focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]" htmlFor="admin-pass">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7072] pointer-events-none">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={lockoutSeconds > 0}
                    className="w-full bg-white text-[#1C1917] placeholder:text-[#8C7072]/60 border border-[#E7E0D6] rounded-[4px] pl-9 pr-10 py-2.5 text-xs focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7072] hover:text-[#1C1917]"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Utilities */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#57534E]">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded-[3px] border-[#E7E0D6] text-[#9F1D3A] focus:ring-[#9F1D3A]"
                  />
                  <span>Recordar sesión</span>
                </label>
                <a
                  href="mailto:soporte@vshein.com?subject=Recuperación de contraseña atelier"
                  className="text-[#57534E] hover:text-[#9F1D3A] transition-colors"
                >
                  Olvidé mi contraseña
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || lockoutSeconds > 0}
                className="w-full h-11 bg-[#9F1D3A] hover:bg-[#7F1730] text-white text-xs font-semibold uppercase tracking-wider rounded-[4px] transition-all active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer select-none"
              >
                <span>{lockoutSeconds > 0 ? `Bloqueado (${lockoutSeconds}s)` : 'Entrar'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>



            {/* Advisory Footnote */}
            <div className="mt-6 pt-4 border-t border-[#E7E0D6] flex items-center gap-2 text-[11px] text-[#8C7072]">
              <ShieldCheck className="w-4 h-4 text-[#8C7072] shrink-0" />
              <span>Canal de autenticación encriptado y monitoreado. Sesiones registradas con firma IP.</span>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#9F1D3A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver al sitio público</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full max-w-[440px] pt-4 mt-6 md:mt-0 flex flex-col md:flex-row items-center justify-between text-center border-t border-[#E7E0D6]/60 text-[11px] text-[#8C7072]">
          <span>© {new Date().getFullYear()} VSHEIN Atelier. Internal Staff Access.</span>
          <div className="flex items-center gap-2 mt-1 md:mt-0">
            <Link to="/politicas/privacidad" className="hover:text-[#9F1D3A]">Privacidad</Link>
            <span>·</span>
            <Link to="/politicas/terminos" className="hover:text-[#9F1D3A]">Términos</Link>
          </div>
        </footer>
      </div>
    </main>
  );
};
