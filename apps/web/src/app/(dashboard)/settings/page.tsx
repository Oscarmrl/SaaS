'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import {
  IconUser, IconAlertTriangle, IconShield,
} from '@tabler/icons-react'
import { createClient } from '@/lib/supabase'
import { api } from '@/lib/api-client'
import { useUser } from '@/contexts/UserContext'

type Section = 'profile' | 'security' | 'danger'

const NAV: { id: Section; icon: React.ElementType; label: string; desc: string }[] = [
  { id: 'profile',  icon: IconUser,          label: 'Perfil',          desc: 'Nombre y email'  },
  { id: 'security', icon: IconShield,        label: 'Seguridad',       desc: 'Contraseña'      },
  { id: 'danger',   icon: IconAlertTriangle, label: 'Zona de peligro', desc: 'Eliminar cuenta' },
]

export default function SettingsPage() {
  const { user, displayName, avatarUrl } = useUser()
  const router   = useRouter()
  const supabase = createClient()

  const isGoogleUser = user?.app_metadata?.['provider'] === 'google'
  const initials     = displayName.charAt(0).toUpperCase()

  const [activeSection, setActiveSection] = useState<Section>('profile')

  /* ── Perfil ── */
  const [name,          setName]          = useState(displayName)
  const [savingProfile, setSavingProfile] = useState(false)

  async function handleProfileSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSavingProfile(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } })
      if (error) throw error
      await api.patch('/user', { name: trimmed })
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSavingProfile(false)
    }
  }

  /* ── Seguridad ── */
  const [currentPwd,     setCurrentPwd]     = useState('')
  const [newPwd,         setNewPwd]         = useState('')
  const [confirmPwd,     setConfirmPwd]     = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  async function handlePasswordChange() {
    if (newPwd !== confirmPwd) { toast.error('Las contraseñas no coinciden'); return }
    if (newPwd.length < 8)     { toast.error('La contraseña debe tener mínimo 8 caracteres'); return }
    setSavingPassword(true)
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '', password: currentPwd,
      })
      if (signInErr) throw new Error('Contraseña actual incorrecta')
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      toast.success('Contraseña actualizada')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setSavingPassword(false)
    }
  }

  /* ── Eliminar cuenta ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm,   setDeleteConfirm]   = useState('')
  const [deleting,        setDeleting]        = useState(false)

  function closeDeleteModal() {
    if (deleting) return
    setShowDeleteModal(false); setDeleteConfirm('')
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'ELIMINAR') return
    setDeleting(true)
    try {
      await api.delete('/user')
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar cuenta')
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Ajustes</h1>
          <p className="page-subtitle">Gestiona tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">

        {/* Nav lateral (desktop) */}
        <nav className="hidden md:flex flex-col w-[196px] flex-shrink-0 space-y-0.5 sticky top-8">
          {NAV.map(({ id, icon: Icon, label, desc }) => {
            const active   = activeSection === id
            const isDanger = id === 'danger'
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left w-full
                  transition-all duration-150
                  ${active
                    ? isDanger ? 'bg-red-50 text-red-600' : 'bg-[#09090B] text-white'
                    : isDanger ? 'text-[#71717A] hover:bg-red-50 hover:text-red-600'
                               : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#09090B]'
                  }
                `}
              >
                <Icon size={16} stroke={active ? 2 : 1.7} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight">{label}</p>
                  <p className={`text-[10px] leading-tight mt-0.5 truncate ${
                    active ? (isDanger ? 'text-red-400' : 'text-white/60') : 'text-[#A1A1AA]'
                  }`}>{desc}</p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Tabs (móvil) */}
        <div className="md:hidden flex gap-1.5 mb-2 overflow-x-auto pb-1 w-full">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${activeSection === id
                  ? id === 'danger' ? 'bg-red-500 text-white' : 'bg-[#09090B] text-white'
                  : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]'
                }
              `}
            >
              <Icon size={12} stroke={1.7} />
              {label}
            </button>
          ))}
        </div>

        {/* Panel de contenido */}
        <div className="flex-1 min-w-0">

          {/* PERFIL */}
          {activeSection === 'profile' && (
            <div className="card !p-4 sm:!p-6 space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-[#09090B]">Perfil</h2>
                <p className="text-xs text-[#71717A] mt-0.5">Tu información personal y de cuenta</p>
              </div>

              <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-[10px] bg-[#FAFAFA] border border-[#F4F4F5]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl} alt={displayName} width={60} height={60}
                    className="rounded-full border-2 border-white shadow-sm object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[60px] h-[60px] rounded-full bg-[#09090B] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xl font-bold text-white">{initials}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#09090B]">{displayName}</p>
                  <p className="text-xs text-[#71717A] mt-0.5">{user?.email}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${
                    isGoogleUser ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#F4F4F5] text-[#71717A]'
                  }`}>
                    {isGoogleUser ? 'Google OAuth' : 'Email / contraseña'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Nombre</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Email</label>
                  <input type="email" value={user?.email ?? ''} disabled className="input opacity-50 cursor-not-allowed" />
                  <p className="text-[10px] text-[#A1A1AA] mt-1.5">El email no se puede cambiar</p>
                </div>
              </div>

              <div className="flex justify-end pt-1 border-t border-[#F4F4F5]">
                <button
                  onClick={handleProfileSave}
                  disabled={savingProfile || !name.trim() || name.trim() === displayName}
                  className="btn-primary text-xs px-5 py-2.5 w-full sm:w-auto"
                >
                  {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )}

          {/* SEGURIDAD */}
          {activeSection === 'security' && (
            <div className="card !p-4 sm:!p-6 space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-[#09090B]">Seguridad</h2>
                <p className="text-xs text-[#71717A] mt-0.5">Administra cómo accedes a tu cuenta</p>
              </div>

              {isGoogleUser ? (
                <div className="flex items-start gap-4 p-5 rounded-[10px] bg-[#FAFAFA] border border-[#F4F4F5]">
                  <div className="w-9 h-9 rounded-[8px] bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                    <IconShield size={17} stroke={1.7} className="text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#09090B]">Cuenta vinculada con Google</p>
                    <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                      Tu contraseña está administrada por Google. Para cambiarla, visita la configuración de seguridad de tu cuenta de Google.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-[#3F3F46] mb-4">Cambiar contraseña</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Contraseña actual</label>
                        <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="input" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Nueva contraseña</label>
                        <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="input" placeholder="Mínimo 8 caracteres" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">Confirmar contraseña</label>
                        <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="input" placeholder="Repite la nueva contraseña" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1 border-t border-[#F4F4F5]">
                    <button
                      onClick={handlePasswordChange}
                      disabled={savingPassword || !currentPwd || !newPwd || !confirmPwd}
                      className="btn-primary text-xs px-5 py-2.5 w-full sm:w-auto"
                    >
                      {savingPassword ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ZONA DE PELIGRO */}
          {activeSection === 'danger' && (
            <div className="rounded-[12px] border border-red-200 bg-white overflow-hidden">
              <div className="px-4 sm:px-6 py-4 bg-red-50 border-b border-red-100">
                <h2 className="text-sm font-semibold text-[#09090B]">Zona de peligro</h2>
                <p className="text-xs text-[#71717A] mt-0.5">Estas acciones son permanentes e irreversibles</p>
              </div>
              <div className="p-4 sm:p-6 flex flex-col gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#09090B]">Eliminar cuenta</p>
                  <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                    Se eliminarán permanentemente tu cuenta, todas tus marcas, los assets generados y los créditos restantes. Esta acción no tiene vuelta atrás.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full sm:w-auto sm:self-start px-4 py-2.5 text-xs font-semibold text-red-600 border border-red-300 rounded-[8px] bg-white hover:bg-red-50 transition-colors"
                >
                  Eliminar cuenta
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDeleteModal} />
          <div className="relative bg-white rounded-[16px] p-6 w-full max-w-[400px] shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <IconAlertTriangle size={20} stroke={1.7} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#09090B] text-center mb-1.5">¿Eliminar tu cuenta?</h3>
            <p className="text-xs text-[#71717A] text-center mb-5 leading-relaxed">
              Esta acción es permanente. Se borrarán todos tus datos: marcas, assets y créditos.
            </p>
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#3F3F46] mb-1.5">
                Escribe <span className="font-bold font-mono text-[#09090B]">ELIMINAR</span> para confirmar
              </label>
              <input
                type="text" value={deleteConfirm} autoComplete="off" disabled={deleting}
                onChange={e => setDeleteConfirm(e.target.value)}
                className="input" placeholder="ELIMINAR"
              />
            </div>
            <div className="flex gap-2.5">
              <button onClick={closeDeleteModal} disabled={deleting}
                className="flex-1 py-2.5 text-xs font-semibold text-[#71717A] border border-[#E4E4E7] rounded-[8px] hover:bg-[#F4F4F5] transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'ELIMINAR' || deleting}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-500 rounded-[8px] hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {deleting ? 'Eliminando...' : 'Sí, eliminar todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
