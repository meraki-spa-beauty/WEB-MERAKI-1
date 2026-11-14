import { useState } from 'react';
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
  const [claimedSuccess, setClaimedSuccess] = useState<boolean>(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);

    try {
      await login();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error al iniciar sesión con Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleClaim = () => {
    const success = claimReward();

    if (success) {
      setClaimedSuccess(true);
      setTimeout(() => setClaimedSuccess(false), 4000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] border border-[#D5A688]/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-[#111111] relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto my-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#5E765E]/10 hover:bg-[#5E765E]/20 text-[#5E765E] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Cerrar modal VIP"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="meraki-editorial-pill inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] mb-2">
            <Sparkles className="w-3 h-3 text-[#D5A688]" />
            <span>Meraki Club VIP</span>
          </span>
          <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111]">
            {user ? `¡Hola, ${user.displayName || 'Clienta VIP'}!` : 'Mi Cuenta & Tarjeta de Puntos'}
          </h3>
          <p className="text-xs text-[#111111]/70 font-light mt-1">
            {user
              ? 'Acumula sellos en tus visitas y obtén beneficios exclusivos en Meraki Spa.'
              : 'Inicia sesión con tu cuenta de Google para acceder a tu tarjeta de puntos y beneficios.'}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <strong>Nota de configuración:</strong> Para activar el inicio de sesión con Google real, completa tu archivo <code>firebase-applet-config.json</code> en la raíz del proyecto con las credenciales de tu consola de Firebase.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {!user ? (
          /* Not Logged In View */
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-[#5E765E]/10 text-[#5E765E] flex items-center justify-center mx-auto mb-2">
              <UserIcon className="w-8 h-8 text-[#5E765E]" />
            </div>

            <div className="space-y-2 text-xs text-[#111111]/80 font-light">
              <p>✨ <strong>Tarjeta de Sellos Digital:</strong> Completa 5 visitas y recibe un tratamiento de parafina de regalo.</p>
              <p>📅 <strong>Historial de Citas:</strong> Consulta tus servicios agendados en estudio o a domicilio.</p>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          /* Logged In View: Punch Card & History */
          <div className="space-y-6">
            
            {/* User Profile Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF2DE]/60 border border-[#D5A688]/30">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-10 h-10 rounded-full object-cover border border-[#5E765E]/30" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center font-bold">
                    {user.displayName?.[0] || 'M'}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-xs text-[#111111]">{user.displayName}</h4>
                  <p className="text-[11px] text-[#111111]/60 font-light">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-[#111111]/60 hover:text-red-600 p-2 rounded-full transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Digital Punch Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#5E765E] to-[#4d634d] text-[#FFF2DE] shadow-md relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D5A688]" />
                  <span className="text-xs uppercase tracking-[0.18em] font-semibold">Tarjeta Meraki VIP</span>
                </div>
                <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-medium">
                  {loyalty.stamps} / 5 Sellos
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 my-4">
                {[1, 2, 3, 4, 5].map((stampNum) => {
                  const isStamped = stampNum <= loyalty.stamps;

                  return (
                    <div
                      key={stampNum}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                        isStamped
                          ? 'bg-[#D5A688] text-[#111111] border-[#D5A688] shadow-inner font-bold'
                          : 'bg-white/10 border-white/20 text-white/40'
                      }`}
                    >
                      {isStamped ? <CheckCircle2 className="w-5 h-5 mb-0.5" /> : <span className="text-xs">{stampNum}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-[#FFF2DE]/80 font-light text-center mt-2">
                {loyalty.stamps >= 5
                  ? '¡Felicidades! Tienes un tratamiento de parafina o descuento listo para canjear.'
                  : `Te faltan ${5 - loyalty.stamps} visitas para tu beneficio Meraki.`}
              </div>

              {loyalty.stamps >= 5 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleClaim}
                    className="w-full bg-[#D5A688] hover:bg-[#c89777] text-[#111111] font-semibold py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Canjear Beneficio VIP</span>
                  </button>
                </div>
              )}

              {claimedSuccess && (
                <div className="mt-3 p-2 rounded-xl bg-white/20 text-center text-xs font-semibold animate-pulse">
                  ¡Beneficio canjeado con éxito! Muéstrale este aviso a Ana María en tu próxima cita.
                </div>
              )}
            </div>

            {/* History section */}
            <div>
              <h5 className="font-semibold text-xs uppercase tracking-wider text-[#111111]/70 mb-2.5">
                Historial de Visitas ({loyalty.history.length})
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {loyalty.history.map((h) => (
                  <div key={h.id} className="p-2.5 rounded-xl bg-white border border-[#D5A688]/20 flex items-center justify-between text-xs">
                    <div>
                      <strong className="font-semibold text-[#111111] block">{h.service}</strong>
                      <span className="text-[10px] text-[#111111]/60">{h.date}</span>
                    </div>
                    <span className="font-semibold text-[#5E765E]">
                      {h.price > 0 ? `S/ ${h.price}` : 'Regalo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
