'use client'
import { Open_Sans } from "next/font/google";
import "../globals.css";
import React, { useState } from 'react'
import TeacherNavbar from './components/TeacherNavbar';
import TeacherSidebar from './components/TeacherSidebar';

const geistOpen = Open_Sans({
    variable: "--font-open-sans",
    subsets: ["latin"],
});

export default function TeacherLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed)
    }

    return (
        <html lang="en">
            <body className={`${geistOpen.variable} antialiased`}>
                <div className="min-h-screen bg-gray-50 overflow-x-hidden">
                    {/* Navbar */}
                    <TeacherNavbar 
                        toggleSidebar={toggleSidebar} 
                        isSidebarOpen={isSidebarOpen}
                    />
                    
                    <div className="flex">
                        {/* Sidebar */}
                        <TeacherSidebar 
                            isOpen={isSidebarOpen}
                            toggleSidebar={toggleSidebar}
                            isCollapsed={isSidebarCollapsed}
                            toggleCollapse={toggleSidebarCollapse}
                        />
                        
                        {/* Contenido principal */}
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
            </body>
        </html>
    )
}
