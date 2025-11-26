'use client'
import Icon from '@/components/Icon'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/authStore'
import React, { useMemo, useState } from 'react'
import axiosPrivate from '@/apis/axiosPrivate'

const { HiMenuAlt3, CiLogout, LuUser, HiChevronDown } = Icon;

const TeacherNavbar = ({ toggleSidebar, isSidebarOpen }) => {
    const router = useRouter()
    const logout = useAuthStore((state) => state.logout);
    const decodedToken = useAuthStore((state) => state.decodedToken);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        const refresh_token = localStorage.getItem("refresh_token");
        const token_fcm = localStorage.getItem("fcm_token");
        try {
            await axiosPrivate.post(
                `${process.env.NEXT_PUBLIC_BACKEND_LOGOUT}`, {
                refresh_token,
                token_fcm,
            }
            )
            logout();
            sessionStorage.clear();
            router.push('/auth/teacher')
        } catch (error) {
            console.error('No se pudo cerrar sesión correctamente')
            // Incluso si falla la petición, cerramos sesión localmente
            logout();
            sessionStorage.clear();
            router.push('/auth/teacher')
        }
    }

    // Capitalizar el primer rol del usuario
    const userRole = useMemo(() => {
        if (decodedToken?.roles && decodedToken.roles.length > 0) {
            const role = decodedToken.roles[0];
            return role.charAt(0).toUpperCase() + role.slice(1);
        }
        return 'Profesor';
    }, [decodedToken]);

    return (
        <nav className='sticky top-0 z-50 w-full border-b border-[#DBE0E2] shadow-sm bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80'>
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    {/* Botón hamburguesa */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                    >
                        <HiMenuAlt3 className="h-6 w-6 text-gray-600" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <Image
                            src={'/image.png'}
                            alt='Logo Universidad Surcolombiana'
                            width={200}
                            height={50}
                            className="h-10 w-auto"
                            priority
                        />
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium text-[#8F141B]">Panel Administrativo</p>
                        <p className="text-xs text-gray-500">Gestión de Equivalencias</p>
                    </div>
                    
                    {/* Perfil del profesor con dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 px-3 py-2 bg-[#F4E7E8] rounded-lg hover:bg-[#F4E7E8]/80 transition-colors"
                        >
                            <LuUser className="h-5 w-5 text-[#8F141B]" />
                            <div className="hidden sm:block text-sm">
                                <p className="font-medium text-[#8F141B]">{userRole}</p>
                                <p className="text-xs text-gray-600">Administrador</p>
                            </div>
                            <HiChevronDown className={`h-4 w-4 text-[#8F141B] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <>
                                {/* Overlay para cerrar el dropdown */}
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setShowDropdown(false)}
                                />
                                
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors text-gray-700 hover:text-red-600"
                                    >
                                        <CiLogout className="h-5 w-5" />
                                        <span className="font-medium text-sm">Cerrar Sesión</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default TeacherNavbar