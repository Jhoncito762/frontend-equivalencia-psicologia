'use client'
import React, { useState, useEffect } from 'react'
import { Open_Sans } from "next/font/google";
import TeacherNavbar from './components/TeacherNavbar';
import TeacherSidebar from './components/TeacherSidebar';
import { useAuthStore } from '@/hooks/authStore';

const geistOpen = Open_Sans({
    variable: "--font-open-sans",
    subsets: ["latin"],
});

const TeacherShell = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const initAuth = useAuthStore((state) => state.initAuth);

    // Inicializar autenticación al montar el componente
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className={`${geistOpen.variable} antialiased`}>
            <div className="min-h-screen bg-gray-50 overflow-x-hidden">
                <TeacherNavbar
                    toggleSidebar={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                />

                <div className="flex">
                    <TeacherSidebar
                        isOpen={isSidebarOpen}
                        toggleSidebar={toggleSidebar}
                        isCollapsed={isSidebarCollapsed}
                        toggleCollapse={toggleSidebarCollapse}
                    />

                    <main
                        className={`
                            flex-1 transition-all duration-300 ease-in-out
                            h-[calc(100vh-4rem)]
                            overflow-x-hidden overflow-y-auto
                        `}
                    >
                        <div className="p-6 h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TeacherShell;
