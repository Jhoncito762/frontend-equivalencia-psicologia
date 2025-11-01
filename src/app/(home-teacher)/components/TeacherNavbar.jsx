'use client'
import Icon from '@/components/Icon'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/authStore'
import React, { useMemo } from 'react'

const { HiMenuAlt3, CiLogout, LuUser } = Icon;

const TeacherNavbar = ({ toggleSidebar, isSidebarOpen }) => {
    const router = useRouter()
    const decodedToken = useAuthStore((state) => state.decodedToken);

    const handleLogout = async () => {
        router.push('/auth/teacher')
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
                    
                    {/* Perfil del profesor */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-[#F4E7E8] rounded-lg">
                        <LuUser className="h-5 w-5 text-[#8F141B]" />
                        <div className="hidden sm:block text-sm">
                            <p className="font-medium text-[#8F141B]">{userRole}</p>
                            <p className="text-xs text-gray-600">Administrador</p>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        </nav>
    )
}

export default TeacherNavbar