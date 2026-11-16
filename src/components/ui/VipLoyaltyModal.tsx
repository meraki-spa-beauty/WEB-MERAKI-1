import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Award, LogOut, CheckCircle2, Gift, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface VipLoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VipLoyaltyModal({ isOpen, onClose }: VipLoyaltyModalProps) {
  const { user, loyalty, login, logout, claimReward, isConfigured } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimedSuccess, setClaimedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);

    try {
      await login();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error al iniciar sesión con Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleClaim = async () => {
    if (isClaiming) return;

    setIsClaiming(true);

    try {
      const success = await claimReward();

      if (success) {
        setClaimedSuccess(true);
        window.setTimeout(() => setClaimedSuccess(false), 4500);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return createPortal(
    <div
      className="meraki-overlay-enter fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-modal-title"
      onClick={onClose}
    >
      <div
        className="meraki-modal-panel bg-[#FFFDF9] border border-[#D5A688]/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-[#111111] relative max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#5E765E]/10 hover:bg-[#5E765E]/20 text-[#5E765E] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Cerrar modal Club VIP"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="meraki-editorial-pill inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] mb-2">
            <Sparkles className="w-3 h-3 text-[#D5A688]" />
            <span>Meraki Club VIP</span>
          </span>
          <h3 id="vip-modal-title" className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111]">
            {user ? `¡Hola, ${user.displayName || 'Clienta VIP'}!` : 'Mi Cuenta & Tarjeta de Puntos'}
          </h3>
          <p className="text-xs text-[#111111]/75 font-light mt-1">
            {user
              ? 'Acumula sellos verificados en cada visita y desbloquea beneficios exclusivos en Meraki Spa.'
              : 'Inicia sesión con tu cuenta de Google para revisar tus tarjetas de fidelización y sellos acumulados.'}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <strong>Nota de configuración:</strong> Para activar el inicio de sesión con Google real, completa tu configuración de Firebase.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {!user ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-[#5E765E]/10 text-[#5E765E] flex items-center justify-center mx-auto mb-2">
              <UserIcon className="w-8 h-8 text-[#5E765E]" />
            </div>

            <div className="space-y-2 text-xs text-[#111111]/85 font-light">
              <p>✨ <strong>Tarjeta de Sellos Digital:</strong> Completa 5 visitas y recibe un tratamiento de parafina o beneficio VIP.</p>
              <p>📅 <strong>Historial de Visitas:</strong> Nuestras especialistas marcan cada sello directamente tras tu atención.</p>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF2DE]/70 border border-[#D5A688]/30">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-10 h-10 rounded-full object-cover border border-[#5E765E]/30 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center font-bold shrink-0">
                    {user.displayName?.[0] || 'M'}
                  </div>
                )}
                <div className="min-w-0 text-left">
                  <h4 className="font-semibold text-xs text-[#111111] truncate">{user.displayName}</h4>
                  <p className="text-[11px] text-[#111111]/65 font-light truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-[#111111]/60 hover:text-red-600 p-2 rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#5E765E] to-[#4d634d] text-[#FFF2DE] shadow-md relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D5A688]" />
                  <span className="text-xs uppercase tracking-[0.16em] font-semibold">Tarjeta Meraki VIP</span>
                </div>
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
                  {loyalty.stamps} / 5 Sellos
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#FFF2DE]/90 mb-3 bg-black/15 px-3 py-1.5 rounded-xl">
                <span>Tarjetas completadas:</span>
                <strong className="font-semibold text-[#D5A688]">
                  {loyalty.rewardsClaimed} {loyalty.rewardsClaimed === 1 ? 'tarjeta' : 'tarjetas'}
                </strong>
              </div>

              <div className="grid grid-cols-5 gap-2 my-4">
                {[1, 2, 3, 4, 5].map((stampNum) => {
                  const isStamped = stampNum <= loyalty.stamps;

                  return (
                    <div
                      key={stampNum}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 ${
                        isStamped
                          ? 'bg-[#D5A688] text-[#111111] border-[#D5A688] shadow-inner font-bold'
                          : 'bg-white/15 border-white/35 text-white/90 font-semibold'
                      }`}
                    >
                      {isStamped ? <CheckCircle2 className="w-5 h-5 mb-0.5" /> : <span className="text-xs">{stampNum}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-[#FFF2DE]/90 font-light text-center mt-2">
                {loyalty.stamps >= 5
                  ? '¡Felicidades! Tienes un tratamiento de parafina o beneficio listo para canjear.'
                  : `Te faltan ${5 - loyalty.stamps} ${5 - loyalty.stamps === 1 ? 'visita' : 'visitas'} para completar esta tarjeta.`}
              </div>

              {loyalty.stamps >= 5 && (
                <div className="mt-4">
                  <button
                    type="button"
                    disabled={isClaiming}
                    onClick={handleClaim}
                    className="w-full bg-[#D5A688] hover:bg-[#c89777] text-[#111111] font-semibold py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isClaiming ? 'Canjeando...' : 'Canjear Beneficio VIP'}</span>
                  </button>
                </div>
              )}

              {claimedSuccess && (
                <div className="mt-3 p-2.5 rounded-xl bg-white/20 text-center text-xs font-semibold">
                  ¡Beneficio canjeado con éxito! Muéstrale este aviso a Ana María en tu próxima cita.
                </div>
              )}
            </div>

            <div>
              <h5 className="font-semibold text-xs uppercase tracking-wider text-[#111111]/75 mb-2.5 text-left">
                Historial de Visitas ({loyalty.history.length})
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-left">
                {loyalty.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-white border border-[#D5A688]/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="font-semibold text-[#111111] block">{h.service}</strong>
                      <span className="text-[10px] text-[#111111]/60">{h.date}</span>
                    </div>
                    <span className="font-semibold text-[#5E765E]">
                      {h.price > 0 ? `S/ ${h.price}` : 'Beneficio'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
