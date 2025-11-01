'use client'
import axiosPrivate from '@/apis/axiosPrivate';
import axiosPublic from '@/apis/axiosPublic';
import Icon from '@/components/Icon'
import { useAuthStore } from '@/hooks/authStore';
import { useRouter, usePathname } from 'next/navigation'
import React, { useMemo } from 'react'

const { MdDashboard, CiLogout, HiChevronLeft, HiChevronRight, FaUsers } = Icon;

const TeacherSidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
    const logout = useAuthStore((state) => state.logout);
    const decodedToken = useAuthStore((state) => state.decodedToken);
    const permissions = useAuthStore((state) => state.permissions);
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        const refresh_token = localStorage.getItem("refresh_token");
        const token_fcm = localStorage.getItem("fcm_token");
        try {
            const response = await axiosPrivate.post(
                `${process.env.NEXT_PUBLIC_BACKEND_LOGOUT}`, {
                refresh_token,
                token_fcm,
            }
            )
            logout();
            sessionStorage.clear();
            router.push('/auth/teacher')
        } catch (error) {
            console.error('No se pudo cerrar sesion correctamente')
        }
    }

    // Filtrar los items del menú según los roles
    const menuItems = useMemo(() => {
        const allMenuItems = [
            {
                id: 'dashboard',
                name: 'Ver equivalencias',
                icon: MdDashboard,
                path: '/dashboard/equivalences',
                description: 'Gestiona las equivalencias',
                requiredRole: null // Siempre visible para todos
            },
            {
                id: 'teachers',
                name: 'Docentes',
                icon: FaUsers,
                path: '/dashboard/users',
                description: 'Gestiona los docentes del sistema',
                requiredRole: 'administrador' // Solo visible para administradores
            }
        ];

        const userRoles = decodedToken?.roles || [];

        // Filtrar items según roles
        return allMenuItems.filter(item => {
            if (!item.requiredRole) return true; // Sin requisito, siempre visible
            return userRoles.includes(item.requiredRole);
        });
    }, [decodedToken]);

    const navigateTo = (path) => {
        router.push(path)
        // Cerrar sidebar en móvil después de navegar
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            toggleSidebar()
        }
    }

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg
                transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isCollapsed ? 'w-16' : 'w-64'}
                lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]
            `}>
                <div className="flex flex-col h-full">
                    {/* Header del sidebar */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#8F141B] rounded-lg flex items-center justify-center">
                                    <MdDashboard className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-[#8F141B]">Administración</h2>
                                    <p className="text-xs text-gray-500">Equivalencias</p>
                                </div>
                            </div>
                        )}

                        {/* Botón colapsar (solo visible en desktop) */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isCollapsed ? (
                                <HiChevronRight className="w-4 h-4 text-gray-600" />
                            ) : (
                                <HiChevronLeft className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* Menú de navegación */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            {menuItems.map((item) => {
                                const IconComponent = item.icon
                                const isActive = pathname?.startsWith(item.path)
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigateTo(item.path)}
                                        className={`
                                            w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                                            group relative
                                            ${isActive ? 'bg-[#F4E7E8] text-[#8F141B]/70 shadow-md' : 'text-gray-700 hover:bg-[#F4E7E8] hover:text-[#8F141B]'}
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                        `}
                                        title={isCollapsed ? item.name : ''}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#8F141B]/70' : ''}`} />

                                        {!isCollapsed && (
                                            <div className="flex-1 text-left">
                                                <p className="font-medium">{item.name}</p>
                                                <p className={`text-xs ${isActive ? 'text-[#8F141B]/70' : 'text-gray-500 group-hover:text-[#8F141B]/70'}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Tooltip para vista colapsada */}
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                                {item.name}
                                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Footer con logout */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                                hover:bg-red-50 hover:text-red-600 text-gray-700
                                group relative
                                ${isCollapsed ? 'justify-center' : 'justify-start'}
                            `}
                            title={isCollapsed ? 'Cerrar Sesión' : ''}
                        >
                            <CiLogout className="w-5 h-5 flex-shrink-0" />

                            {!isCollapsed && (
                                <span className="font-medium">Cerrar Sesión</span>
                            )}

                            {/* Tooltip para vista colapsada */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Cerrar Sesión
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default TeacherSidebar