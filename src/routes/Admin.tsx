import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type {
  BookingStatus,
  MerakiBooking,
  PaymentMode,
  ScheduleConfig,
  StaffAccessEntry,
  UserLoyaltyProfile,
} from '../types';
import {
  DEFAULT_SCHEDULE_CONFIG,
  LIMA_DISTRICT_NAMES,
  OFFICIAL_TIME_SLOTS,
  buildBlockedSlotKey,
} from '../utils/scheduleEngine';
import {
  adminSaveVipCardProfile,
  adminStampUserVip,
  deleteStaffAccessEntry,
  deleteVipCardAdmin,
  fetchAllStaffAccess,
  fetchAllVipUsers,
  fetchBookingsForAdmin,
  fetchScheduleConfig,
  saveScheduleConfig,
  saveStaffAccessEntry,
  updateBookingStatusAdmin,
} from '../services/merakiFirestore';
import { CENTRAL_OWNER_EMAIL } from '../data/spaData';
import { AdminRouteMap } from '../components/admin/AdminRouteMap';
import { CATALOG_SERVICES } from '../data/catalog';
import {
  ShieldCheck,
  Users,
  Calendar,
  MapPin,
  Award,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Save,
  Search,
  RefreshCw,
  Pencil,
  UserPlus,
  Phone,
  Sparkles,
} from 'lucide-react';

type AdminTab = 'bookings' | 'agenda' | 'vip' | 'staff';

export function Admin() {
  const { user, loading, adminPermissions, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');

  // Bookings State
  const [bookings, setBookings] = useState<MerakiBooking[]>([]);
  const [filterDate, setFilterDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Schedule Config State
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);
  const [agendaDate, setAgendaDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [agendaScope, setAgendaScope] = useState<'all' | 'estudio' | 'domicilio'>('all');
  const [savingAgenda, setSavingAgenda] = useState<boolean>(false);

  // Staff Matrix State (Pancake style, Owner-only)
  const [staffList, setStaffList] = useState<StaffAccessEntry[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');

  // VIP Club Management State
  const [vipUsers, setVipUsers] = useState<UserLoyaltyProfile[]>([]);
  const [vipSearch, setVipSearch] = useState('');
  const [stampServiceName, setStampServiceName] = useState(CATALOG_SERVICES[0]?.name || 'Soft Gel');
  const [editingVipUid, setEditingVipUid] = useState<string | null>(null);
  const [vipEditName, setVipEditName] = useState('');
  const [vipEditPhone, setVipEditPhone] = useState('');
  const [vipEditEmail, setVipEditEmail] = useState('');
  const [vipEditNote, setVipEditNote] = useState('');
  const [savingVipUid, setSavingVipUid] = useState<string | null>(null);
  const [showNewVipForm, setShowNewVipForm] = useState(false);
  const [newVipName, setNewVipName] = useState('');
  const [newVipPhone, setNewVipPhone] = useState('');
  const [newVipEmail, setNewVipEmail] = useState('');
  const [newVipNote, setNewVipNote] = useState('');
  const [confirmDeleteVipUid, setConfirmDeleteVipUid] = useState<string | null>(null);

  // Toast notice
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  useEffect(() => {
    if (!adminPermissions.isAuthorizedAdmin) return;

    const loadAll = async () => {
      setLoadingData(true);

      try {
        const [cfg, allBookings] = await Promise.all([
          fetchScheduleConfig(),
          adminPermissions.canManageBookings ? fetchBookingsForAdmin() : Promise.resolve([]),
        ]);

        setScheduleConfig(cfg);
        setBookings(allBookings);

        if (adminPermissions.canStampVip) {
          const users = await fetchAllVipUsers();

          setVipUsers(users);
        }

        if (adminPermissions.isCentralOwner) {
          const staff = await fetchAllStaffAccess();

          setStaffList(staff);
        }
      } catch {
        showNotice('Error al cargar datos administrativos.');
      } finally {
        setLoadingData(false);
      }
    };

    void loadAll();
  }, [adminPermissions]);

  const handleToggleDateBlock = (targetDate: string) => {
    const exists = scheduleConfig.blockedDates.includes(targetDate);
    const nextDates: string[] = [];

    if (exists) {
      for (const d of scheduleConfig.blockedDates) {
        if (d !== targetDate) nextDates.push(d);
      }
    } else {
      for (const d of scheduleConfig.blockedDates) {
        nextDates.push(d);
      }

      nextDates.push(targetDate);
    }

    setScheduleConfig((prev) => ({ ...prev, blockedDates: nextDates }));
  };

  const handleToggleSlotBlock = (slot: string) => {
    const key = buildBlockedSlotKey(agendaDate, slot, agendaScope);
    const exists = scheduleConfig.blockedSlots.includes(key);
    const nextSlots: string[] = [];

    if (exists) {
      for (const item of scheduleConfig.blockedSlots) {
        if (item !== key) nextSlots.push(item);
      }
    } else {
      for (const item of scheduleConfig.blockedSlots) {
        nextSlots.push(item);
      }

      nextSlots.push(key);
    }

    setScheduleConfig((prev) => ({ ...prev, blockedSlots: nextSlots }));
  };

  const handleSaveSchedule = async () => {
    setSavingAgenda(true);

    try {
      await saveScheduleConfig(scheduleConfig, user?.email || CENTRAL_OWNER_EMAIL);
      showNotice('Agenda y reglas guardadas correctamente.');
    } catch {
      showNotice('No tienes permisos para guardar la agenda o ocurrió un error.');
    } finally {
      setSavingAgenda(false);
    }
  };

  const handleChangeBookingStatus = async (bookingCode: string, status: BookingStatus) => {
    try {
      await updateBookingStatusAdmin(bookingCode, status);
      setBookings((prev) =>
        prev.map((b) => (b.bookingCode === bookingCode ? { ...b, status } : b)),
      );
      showNotice(`Cita ${bookingCode} actualizada a "${status}".`);
    } catch {
      showNotice('Error al actualizar estado de cita.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStaffEmail.trim() || !newStaffName.trim()) return;

    try {
      await saveStaffAccessEntry({
        email: newStaffEmail.trim(),
        name: newStaffName.trim(),
        isActive: true,
        canManageAgenda: true,
        canManageBookings: true,
        canStampVip: true,
        actorEmail: user?.email || CENTRAL_OWNER_EMAIL,
        isNew: true,
      });

      const refreshed = await fetchAllStaffAccess();

      setStaffList(refreshed);
      setNewStaffEmail('');
      setNewStaffName('');
      showNotice('Acceso agregado correctamente.');
    } catch {
      showNotice('No se pudo crear el acceso.');
    }
  };

  const handleToggleStaffPerm = async (
    staff: StaffAccessEntry,
    field: 'isActive' | 'canManageAgenda' | 'canManageBookings' | 'canStampVip',
  ) => {
    const updated: StaffAccessEntry = {
      ...staff,
      [field]: !staff[field],
    };

    try {
      await saveStaffAccessEntry({
        email: updated.email,
        name: updated.name,
        isActive: updated.isActive,
        canManageAgenda: updated.canManageAgenda,
        canManageBookings: updated.canManageBookings,
        canStampVip: updated.canStampVip,
        actorEmail: user?.email || CENTRAL_OWNER_EMAIL,
        isNew: false,
      });

      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showNotice(`Permisos actualizados para ${updated.name}.`);
    } catch {
      showNotice('Error al actualizar permisos.');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await deleteStaffAccessEntry(staffId);
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      showNotice('Acceso revocado y eliminado.');
    } catch {
      showNotice('No se pudo eliminar el acceso.');
    }
  };

  const handleVipAction = async (targetUser: UserLoyaltyProfile, action: 'stamp' | 'redeem') => {
    setSavingVipUid(targetUser.uid);

    try {
      const updated = await adminStampUserVip({
        user: targetUser,
        serviceName: stampServiceName,
        pricePEN: 0,
        action,
      });

      setVipUsers((prev) => prev.map((u) => (u.uid === updated.uid ? updated : u)));
      showNotice(
        action === 'stamp'
          ? `+1 sello asignado a ${updated.displayName} (${updated.stamps}/5)`
          : `Beneficio canjeado para ${updated.displayName}`,
      );
    } catch (err) {
      console.error('VIP action failed:', err);
      showNotice('No se pudo actualizar la tarjeta VIP. Revisa tu conexión o recarga las tarjetas.');
    } finally {
      setSavingVipUid(null);
    }
  };

  const openEditVipCard = (u: UserLoyaltyProfile) => {
    setEditingVipUid(u.uid);
    setVipEditName(u.displayName === 'Clienta VIP' ? '' : u.displayName);
    setVipEditPhone(u.phone || '');
    setVipEditEmail(u.email || '');
    setVipEditNote(u.adminNote || '');
  };

  const handleSaveVipProfile = async (targetUser: UserLoyaltyProfile) => {
    setSavingVipUid(targetUser.uid);

    try {
      const updated = await adminSaveVipCardProfile({
        existing: targetUser,
        displayName: vipEditName || targetUser.displayName,
        email: vipEditEmail,
        phone: vipEditPhone,
        adminNote: vipEditNote,
      });

      setVipUsers((prev) => prev.map((u) => (u.uid === updated.uid ? updated : u)));
      setEditingVipUid(null);
      showNotice(`Tarjeta identificada para ${updated.displayName}.`);
    } catch {
      showNotice('No se pudieron guardar los datos de la tarjeta VIP.');
    } finally {
      setSavingVipUid(null);
    }
  };

  const handleApplyBookingIdentity = async (targetUser: UserLoyaltyProfile, booking: MerakiBooking) => {
    setSavingVipUid(targetUser.uid);

    try {
      const updated = await adminSaveVipCardProfile({
        existing: targetUser,
        displayName: booking.clientName || targetUser.displayName,
        email: targetUser.email || booking.clientEmail,
        phone: targetUser.phone || booking.clientPhone,
        adminNote: targetUser.adminNote || `Cita ${booking.bookingCode}`,
      });

      setVipUsers((prev) => prev.map((u) => (u.uid === updated.uid ? updated : u)));
      showNotice(`Datos de ${updated.displayName} aplicados desde su cita.`);
    } catch {
      showNotice('No se pudieron vincular los datos de la cita.');
    } finally {
      setSavingVipUid(null);
    }
  };

  const handleCreateManualVipCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVipName.trim() || !newVipPhone.trim()) return;

    setSavingVipUid('new');

    try {
      const created = await adminSaveVipCardProfile({
        displayName: newVipName.trim(),
        phone: newVipPhone.trim(),
        email: newVipEmail.trim(),
        adminNote: newVipNote.trim(),
      });

      setVipUsers((prev) => [created, ...prev]);
      setNewVipName('');
      setNewVipPhone('');
      setNewVipEmail('');
      setNewVipNote('');
      setShowNewVipForm(false);
      showNotice(`Nueva tarjeta VIP creada para ${created.displayName}.`);
    } catch {
      showNotice('No se pudo crear la nueva tarjeta VIP.');
    } finally {
      setSavingVipUid(null);
    }
  };

  const handleDeleteVipCard = async (targetUser: UserLoyaltyProfile) => {
    if (!adminPermissions.isCentralOwner) return;

    setSavingVipUid(targetUser.uid);

    try {
      await deleteVipCardAdmin(targetUser.uid);
      setVipUsers((prev) => prev.filter((u) => u.uid !== targetUser.uid));
      setConfirmDeleteVipUid(null);
      showNotice(`Tarjeta #${targetUser.uid.slice(0, 8).toUpperCase()} eliminada.`);
    } catch {
      showNotice('No se pudo eliminar la tarjeta VIP.');
    } finally {
      setSavingVipUid(null);
    }
  };

  const findSuggestedBookingForVip = (u: UserLoyaltyProfile): MerakiBooking | null => {
    const cleanEmail = u.email.trim().toLowerCase();

    for (const b of bookings) {
      if (b.uid && b.uid === u.uid) return b;

      if (cleanEmail && b.clientEmail.trim().toLowerCase() === cleanEmail) return b;
    }

    return null;
  };

  const filteredVipUsers = useMemo(() => {
    const q = vipSearch.toLowerCase().trim();

    if (!q) return vipUsers;

    const matched: UserLoyaltyProfile[] = [];

    for (const u of vipUsers) {
      if (
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.adminNote || '').toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
      ) {
        matched.push(u);
      }
    }

    return matched;
  }, [vipUsers, vipSearch]);

  const filteredBookings = useMemo(() => {
    if (!filterDate) return bookings;

    const list: MerakiBooking[] = [];

    for (const b of bookings) {
      if (b.date === filterDate) list.push(b);
    }

    return list;
  }, [bookings, filterDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF0E1] flex items-center justify-center p-6">
        <progress className="loading-spinner" aria-label="Cargando acceso administrativo" />
      </div>
    );
  }

  // Unauthenticated stealth Google Sign-In Gate
  if (!user) {
    return (
      <div className="min-h-screen meraki-editorial-canvas flex items-center justify-center p-6 font-['Montserrat',sans-serif]">
        <div className="theme-card-surface rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-[#D5A688]" />
          </div>
          <div>
            <h1 className="font-['Cormorant_Garamond',serif] text-3xl text-[#111111]">
              Acceso Interno Meraki
            </h1>
            <p className="text-xs text-[#111111]/70 mt-2 leading-relaxed">
              Portal restringido para administración central y equipo autorizado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void login()}
            className="w-full py-3.5 px-6 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
          >
            Iniciar Sesión con Google
          </button>
        </div>
      </div>
    );
  }

  // Authenticated but unauthorized email
  if (!adminPermissions.isAuthorizedAdmin) {
    return (
      <div className="min-h-screen meraki-editorial-canvas flex items-center justify-center p-6 font-['Montserrat',sans-serif]">
        <div className="theme-card-surface rounded-3xl p-8 max-w-md w-full text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111]">
            Cuenta sin Permisos Administrativos
          </h1>
          <p className="text-xs text-[#111111]/75 leading-relaxed">
            Sesión actual: <strong>{user.email}</strong>. Solo la cuenta central o miembros habilitados en el panel de accesos pueden ingresar.
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5E765E] text-white text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF2EC] text-[#111111] font-['Montserrat',sans-serif] pb-16">
      {/* Top Bar */}
      <header className="bg-[#5E765E] text-[#FFF2DE] py-4 px-4 sm:px-8 shadow-sm border-b border-[#D5A688]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <ShieldCheck className="w-6 h-6 text-[#D5A688]" />
            <div>
              <h1 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-white leading-none">
                Panel Central Meraki Spa
              </h1>
              <span className="text-[11px] text-[#FFF2DE]/80 block mt-0.5">
                {user.email} • {adminPermissions.isCentralOwner ? 'Propietaria Central' : 'Staff Autorizado'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6 text-left">
        {statusNotice && (
          <div className="p-3.5 rounded-2xl bg-[#5E765E] text-[#FFF2DE] text-xs font-medium flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-[#D5A688]" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {adminPermissions.canManageBookings && (
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#5E765E] text-[#FFF2DE] shadow-sm'
                  : 'bg-white text-[#111111] border border-[#5E765E]/20'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#D5A688]" />
              <span>Citas &amp; Ruta Diaria</span>
            </button>
          )}

          {adminPermissions.canManageAgenda && (
            <button
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-[#5E765E] text-[#FFF2DE] shadow-sm'
                  : 'bg-white text-[#111111] border border-[#5E765E]/20'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#D5A688]" />
              <span>Agenda (06:00–20:00) &amp; Reglas</span>
            </button>
          )}

          {adminPermissions.canStampVip && (
            <button
              type="button"
              onClick={() => setActiveTab('vip')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer ${
                activeTab === 'vip'
                  ? 'bg-[#5E765E] text-[#FFF2DE] shadow-sm'
                  : 'bg-white text-[#111111] border border-[#5E765E]/20'
              }`}
            >
              <Award className="w-4 h-4 text-[#D5A688]" />
              <span>Sellos Club VIP</span>
            </button>
          )}

          {adminPermissions.isCentralOwner && (
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-[#5E765E] text-[#FFF2DE] shadow-sm'
                  : 'bg-white text-[#111111] border border-[#5E765E]/20'
              }`}
            >
              <Users className="w-4 h-4 text-[#D5A688]" />
              <span>Accesos Staff (Pancake)</span>
            </button>
          )}
        </div>

        {/* TAB PANELS WITH SMOOTH TRANSITION */}
        <div key={activeTab} className="meraki-step-enter">
          {/* TAB 1: BOOKINGS & GOOGLE MAPS ROUTE MAP */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#5E765E]/20 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                    Citas Programadas y Mapa de Ruta Diaria
                  </h2>
                  <p className="text-xs text-[#111111]/65">
                    Filtra por día para visualizar las visitas a domicilio en Lima desde Pueblo Libre.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="admin-filter-date" className="text-xs font-semibold">
                    Fecha:
                  </label>
                  <input
                    id="admin-filter-date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setFilterDate('')}
                    className="px-3 py-2 rounded-xl bg-[#EDF2EC] text-xs font-semibold text-[#5E765E] cursor-pointer"
                  >
                    Ver Todas
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const list = await fetchBookingsForAdmin();

                      setBookings(list);
                    }}
                    className="p-2 rounded-xl bg-[#EDF2EC] text-[#5E765E] cursor-pointer"
                    aria-label="Actualizar citas"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {filterDate && <AdminRouteMap selectedDate={filterDate} bookings={bookings} />}
            </div>

            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-xs text-[#111111]/65 border border-[#5E765E]/15">
                  No hay citas registradas para este filtro.
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.bookingCode}
                    className="bg-white rounded-2xl p-5 border border-[#5E765E]/20 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#5E765E]">{b.bookingCode}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#EDF2EC] font-semibold">
                          {b.date} • {b.timeSlot} hrs
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFF2DE] text-[#9A6342] font-semibold">
                          {b.locationType === 'estudio' ? 'Estudio Pueblo Libre' : `Domicilio: ${b.district}`}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-[#111111]">
                        {b.clientName} ({b.clientPhone})
                      </p>
                      <p className="text-[#111111]/80">{b.servicesSummary}</p>
                      <p className="text-[#111111]/65">
                        Total: S/ {b.totalPEN} • Adelanto: S/ {b.advancePEN}{' '}
                        {b.yapeOperationCode ? `• Yape: #${b.yapeOperationCode}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(['pending_yape', 'manual_code_submitted', 'confirmed', 'completed', 'cancelled'] as const).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => void handleChangeBookingStatus(b.bookingCode, st)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                              b.status === st
                                ? 'bg-[#5E765E] text-white border-[#5E765E]'
                                : 'bg-white text-[#111111]/75 border-[#5E765E]/20 hover:bg-[#EDF2EC]'
                            }`}
                          >
                            {st === 'pending_yape'
                              ? 'Pendiente Yape'
                              : st === 'manual_code_submitted'
                                ? 'Código Enviado'
                                : st === 'confirmed'
                                  ? 'Confirmar'
                                  : st === 'completed'
                                    ? 'Atendida'
                                    : 'Cancelar'}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AGENDA 06:00-20:00 & LOCATION RULES & PAYMENT MODE */}
        {activeTab === 'agenda' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/20 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#5E765E]/15 pb-4">
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                  Gestión de Horarios (06:00 – 20:00) y Reglas Operativas
                </h2>
                <p className="text-xs text-[#111111]/65">
                  Bloquea o libera turnos por fecha/modalidad, ajusta reglas geográficas y cambia el modo de pago.
                </p>
              </div>
              <button
                type="button"
                disabled={savingAgenda}
                onClick={() => void handleSaveSchedule()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#D5A688]" />
                <span>{savingAgenda ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label htmlFor="agenda-date" className="block text-xs font-semibold mb-1">
                      Fecha a Gestionar
                    </label>
                    <input
                      id="agenda-date"
                      type="date"
                      value={agendaDate}
                      onChange={(e) => setAgendaDate(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="agenda-scope" className="block text-xs font-semibold mb-1">
                      Alcance de Bloqueo
                    </label>
                    <select
                      id="agenda-scope"
                      value={agendaScope}
                      onChange={(e) => {
                        const val = e.target.value;

                        if (val === 'all' || val === 'estudio' || val === 'domicilio') {
                          setAgendaScope(val);
                        }
                      }}
                      className="px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                    >
                      <option value="all">Todas las modalidades</option>
                      <option value="estudio">Solo Estudio</option>
                      <option value="domicilio">Solo Domicilio</option>
                    </select>
                  </div>

                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => handleToggleDateBlock(agendaDate)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        scheduleConfig.blockedDates.includes(agendaDate)
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-red-700 border-red-300'
                      }`}
                    >
                      {scheduleConfig.blockedDates.includes(agendaDate)
                        ? 'Día Cerrado (Clic para abrir)'
                        : 'Bloquear Día Completo'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold mb-2">
                    Horarios Visibles (06:00 a 20:00 únicamente):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {OFFICIAL_TIME_SLOTS.map((slot) => {
                      const blocked = scheduleConfig.blockedSlots.includes(
                        buildBlockedSlotKey(agendaDate, slot, agendaScope),
                      );

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleToggleSlotBlock(slot)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                            blocked
                              ? 'bg-red-50 border-red-300 text-red-700 line-through'
                              : 'bg-[#EDF2EC] border-[#5E765E]/25 text-[#5E765E]'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Operational Rules & Payment Mode */}
              <div className="space-y-4 bg-[#FAF0E1]/60 p-5 rounded-2xl border border-[#D5A688]/30">
                <h3 className="text-sm font-bold text-[#5E765E] uppercase tracking-wider">
                  Reglas Inteligentes &amp; Modo de Pago
                </h3>

                <div className="flex items-center gap-2">
                  <input
                    id="rule-0800-enable"
                    type="checkbox"
                    checked={scheduleConfig.enableConditional0800}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        enableConditional0800: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="rule-0800-enable" className="text-xs">
                    Habilitar bloque temprano de 08:00 AM
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="rule-0800-nearby"
                    type="checkbox"
                    checked={scheduleConfig.requireNearby0600For0800}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        requireNearby0600For0800: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="rule-0800-nearby" className="text-xs">
                    08:00 AM a domicilio solo si ya existe ruta 06:00 AM cercana
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="rule-max-travel" className="block text-xs font-semibold mb-1">
                      Límite traslado sin mínimo (min)
                    </label>
                    <input
                      id="rule-max-travel"
                      type="number"
                      min="10"
                      max="90"
                      value={scheduleConfig.maxTravelMinutes}
                      onChange={(e) =>
                        setScheduleConfig((prev) => ({
                          ...prev,
                          maxTravelMinutes: Number(e.target.value) || 28,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="rule-distant-min" className="block text-xs font-semibold mb-1">
                      Ticket mínimo distritos lejanos (S/)
                    </label>
                    <input
                      id="rule-distant-min"
                      type="number"
                      min="0"
                      max="1000"
                      value={scheduleConfig.distantMinOrderPEN}
                      onChange={(e) =>
                        setScheduleConfig((prev) => ({
                          ...prev,
                          distantMinOrderPEN: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rule-payment-mode" className="block text-xs font-semibold mb-1">
                    Modo de Pago en Paso 4
                  </label>
                  <select
                    id="rule-payment-mode"
                    value={scheduleConfig.paymentMode}
                    onChange={(e) => {
                      const val = e.target.value;

                      const nextMode: PaymentMode =
                        val === 'gateway_checkout' ? 'gateway_checkout' : 'manual_yape';

                      setScheduleConfig((prev) => ({ ...prev, paymentMode: nextMode }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                  >
                    <option value="manual_yape">Yape Directo Manual + Ficha WhatsApp</option>
                    <option value="gateway_checkout">Pasarela Online (Culqi / Mercado Pago)</option>
                  </select>
                </div>

                <p className="text-[11px] text-[#111111]/65">
                  Distritos monitoreados ({LIMA_DISTRICT_NAMES.length}): Pueblo Libre, Jesús María, Miraflores, San Isidro, Surco, La Molina y más.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VIP STAMPS MANAGEMENT */}
        {activeTab === 'vip' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/20 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                  Tarjetas de Fidelidad Club VIP
                </h2>
                <p className="text-xs text-[#111111]/65">
                  Las clientas registran su nombre, correo y consentimiento al activar su tarjeta. También puedes identificar tarjetas anteriores o eliminar duplicados.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Servicio a registrar en sello VIP"
                  value={stampServiceName}
                  onChange={(e) => setStampServiceName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                >
                  {CATALOG_SERVICES.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#5E765E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    aria-label="Buscar tarjeta VIP por nombre, WhatsApp, correo o código"
                    placeholder="Nombre, WhatsApp, correo o ID..."
                    value={vipSearch}
                    onChange={(e) => setVipSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl border border-[#5E765E]/25 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewVipForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDF2EC] hover:bg-[#5E765E] hover:text-white text-[#5E765E] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Nueva Tarjeta</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const users = await fetchAllVipUsers();

                    setVipUsers(users);
                  }}
                  className="p-2 rounded-xl bg-[#EDF2EC] text-[#5E765E] cursor-pointer"
                  aria-label="Actualizar tarjetas VIP"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {showNewVipForm && (
              <form
                onSubmit={handleCreateManualVipCard}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF0E1]/75 border border-[#D5A688]/40 space-y-3"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5E765E]">
                  Registrar Nueva Tarjeta VIP Manual
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    aria-label="Nombre completo de la clienta"
                    placeholder="Nombre completo *"
                    value={newVipName}
                    onChange={(e) => setNewVipName(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                  />
                  <input
                    type="tel"
                    required
                    aria-label="WhatsApp de la clienta"
                    placeholder="WhatsApp *"
                    value={newVipPhone}
                    onChange={(e) => setNewVipPhone(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                  />
                  <input
                    type="email"
                    aria-label="Correo Google opcional"
                    placeholder="Correo Google (opcional)"
                    value={newVipEmail}
                    onChange={(e) => setNewVipEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                  />
                  <input
                    type="text"
                    aria-label="Nota interna opcional"
                    placeholder="Nota (distrito o preferencia)"
                    value={newVipNote}
                    onChange={(e) => setNewVipNote(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewVipForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#111111]/70 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingVipUid === 'new'}
                    className="px-4 py-1.5 rounded-lg bg-[#5E765E] text-[#FFF2DE] text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {savingVipUid === 'new' ? 'Creando...' : 'Crear Tarjeta VIP'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVipUsers.map((u) => {
                const isEditing = editingVipUid === u.uid;
                const isUnidentified = u.displayName === 'Clienta VIP' && !u.phone;
                const suggestedBooking = isUnidentified ? findSuggestedBookingForVip(u) : null;
                const lastEntry = u.history[0];
                const isBusy = savingVipUid === u.uid;
                const isConfirmingDelete = confirmDeleteVipUid === u.uid;

                return (
                  <div
                    key={u.uid}
                    className="p-4 rounded-2xl bg-[#FAF0E1]/50 border border-[#D5A688]/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-sm text-[#111111] truncate">{u.displayName}</p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#5E765E]/20 text-[#5E765E]">
                            #{u.uid.slice(0, 8).toUpperCase()}
                          </span>
                          {u.dataConsentAccepted ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDF2EC] text-[#5E765E] font-semibold">
                              Consentimiento ✓
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                              {isUnidentified ? 'Sin identificar' : 'Sin consentimiento'}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#111111]/70 truncate">
                          {u.email || 'Sin correo visible'}
                        </p>

                        {u.phone && (
                          <p className="text-[11px] text-[#5E765E] font-medium inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{u.phone}</span>
                          </p>
                        )}

                        {u.adminNote && (
                          <p className="text-[11px] text-[#9A6342] bg-[#FFF2DE]/90 px-2 py-0.5 rounded-lg inline-block">
                            {u.adminNote}
                          </p>
                        )}

                        <p className="text-xs font-semibold text-[#5E765E] pt-1">
                          Sellos: {u.stamps}/5 • Tarjetas completadas: {u.rewardsClaimed}
                        </p>

                        {lastEntry && (
                          <p className="text-[10px] text-[#111111]/55">
                            Último movimiento: {lastEntry.service} ({lastEntry.date || 'reciente'})
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={u.stamps >= 5 || isBusy}
                          onClick={() => void handleVipAction(u, 'stamp')}
                          className="px-3 py-1.5 rounded-lg bg-[#5E765E] hover:bg-[#4d634d] disabled:opacity-45 text-white text-xs font-semibold cursor-pointer"
                        >
                          {isBusy ? 'Guardando...' : '+1 Sello'}
                        </button>
                        {u.stamps >= 5 && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleVipAction(u, 'redeem')}
                            className="px-3 py-1.5 rounded-lg bg-[#D5A688] text-[#111111] text-xs font-bold cursor-pointer disabled:opacity-45"
                          >
                            Registrar Canje
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingVipUid(null) : openEditVipCard(u))}
                          className="px-3 py-1 rounded-lg bg-white border border-[#5E765E]/25 text-[#5E765E] text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer hover:bg-[#EDF2EC]"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{isEditing ? 'Cerrar' : 'Identificar'}</span>
                        </button>
                        {adminPermissions.isCentralOwner && !isConfirmingDelete && (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteVipUid(u.uid)}
                            className="px-3 py-1 rounded-lg bg-white border border-red-200 text-red-600 text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        )}
                        {adminPermissions.isCentralOwner && isConfirmingDelete && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleDeleteVipCard(u)}
                              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteVipUid(null)}
                              className="px-2 py-1 rounded-lg bg-white border border-[#5E765E]/25 text-[10px] text-[#111111]/70 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {suggestedBooking && !isEditing && (
                      <div className="p-2.5 rounded-xl bg-white border border-[#5E765E]/25 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1.5 text-[#111111]/80">
                          <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
                          <span>
                            Coincide con cita de <strong>{suggestedBooking.clientName}</strong> ({suggestedBooking.clientPhone})
                          </span>
                        </span>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleApplyBookingIdentity(u, suggestedBooking)}
                          className="px-2.5 py-1 rounded-lg bg-[#5E765E] text-white font-semibold cursor-pointer"
                        >
                          Aplicar nombre y WhatsApp
                        </button>
                      </div>
                    )}

                    {isEditing && (
                      <div className="pt-3 border-t border-[#D5A688]/30 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            aria-label="Editar nombre completo"
                            placeholder="Nombre completo"
                            value={vipEditName}
                            onChange={(e) => setVipEditName(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                          />
                          <input
                            type="tel"
                            aria-label="Editar WhatsApp"
                            placeholder="WhatsApp"
                            value={vipEditPhone}
                            onChange={(e) => setVipEditPhone(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                          />
                          <input
                            type="email"
                            aria-label="Editar correo"
                            placeholder="Correo"
                            value={vipEditEmail}
                            onChange={(e) => setVipEditEmail(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                          />
                          <input
                            type="text"
                            aria-label="Editar nota interna"
                            placeholder="Nota interna (ej. alias, distrito)"
                            value={vipEditNote}
                            onChange={(e) => setVipEditNote(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#5E765E]/25 bg-white text-xs"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingVipUid(null)}
                            className="px-3 py-1 rounded-lg text-xs text-[#111111]/70 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleSaveVipProfile(u)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#5E765E] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                            <span>{isBusy ? 'Guardando...' : 'Guardar Datos'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PANCAKE-STYLE STAFF ACCESS MATRIX (OWNER ONLY) */}
        {activeTab === 'staff' && adminPermissions.isCentralOwner && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/20 shadow-xs space-y-6">
            <div>
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                Panel de Accesos Delegados
              </h2>
              <p className="text-xs text-[#111111]/65">
                Cuenta Central Propietaria: <strong>{CENTRAL_OWNER_EMAIL}</strong>. Agrega especialistas o asistentes por correo Google y controla sus módulos permitidos.
              </p>
            </div>

            <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Nombre de especialista"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs"
              />
              <input
                type="email"
                required
                placeholder="correo@gmail.com"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E765E] text-[#FFF2DE] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D5A688]" />
                <span>Agregar Acceso</span>
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#5E765E]/20 text-[#5E765E] uppercase text-[10px]">
                    <th className="py-2.5 px-2 text-left">Especialista / Correo</th>
                    <th className="py-2.5 px-2 text-center">Activo</th>
                    <th className="py-2.5 px-2 text-center">Agenda</th>
                    <th className="py-2.5 px-2 text-center">Citas</th>
                    <th className="py-2.5 px-2 text-center">Sellos VIP</th>
                    <th className="py-2.5 px-2 text-right">Revocar</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((st) => (
                    <tr key={st.id} className="border-b border-[#5E765E]/10">
                      <td className="py-3 px-2">
                        <p className="font-semibold text-[#111111]">{st.name}</p>
                        <p className="text-[11px] text-[#111111]/65">{st.email}</p>
                      </td>
                      {(['isActive', 'canManageAgenda', 'canManageBookings', 'canStampVip'] as const).map(
                        (perm) => (
                          <td key={perm} className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => void handleToggleStaffPerm(st, perm)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                                st[perm]
                                  ? 'bg-[#5E765E] text-white'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {st[perm] ? 'Sí' : 'No'}
                            </button>
                          </td>
                        ),
                      )}
                      <td className="py-3 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => void handleDeleteStaff(st.id)}
                          aria-label={`Eliminar acceso de ${st.email}`}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
