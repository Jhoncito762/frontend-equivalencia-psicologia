'use client'
import Icon from '@/components/Icon'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const { CiLogout } = Icon;

const NavBar = () => {

    const router = useRouter()

    const handleLogout = async () => {
        sessionStorage.clear();
        router.push('/auth/student')
    }

    return (
        <nav className='sticky top-0 z-50 w-full border-b border-[#DBE0E2] shadow-sm bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80'>
            <div className=" flex h-16 items-center justify-between px-10">
                <div className="flex  gap-3 justify-between">
                    <Image
                        src={'/image.png'}
                        alt='Logo Universidad Surcolombiana'
                        width={200}
                        height={50}
                        className="h-10 w-auto"
                        priority
                    />
                </div>
                <div className="flex items-center gap-5">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium">Sistema de Equivalencias</p>
                        <p className="text-xs text-muted-foreground">Gestión Académica</p>
                    </div>
                    <button onClick={handleLogout} className="gap-2 flex items-center border border-gray-500 px-2 py-1 rounded-lg hover:cursor-pointer">
                        <CiLogout className="h-4 w-4" />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default NavBar