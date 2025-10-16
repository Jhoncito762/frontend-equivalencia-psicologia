"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AiOutlineClose, AiOutlineCheckCircle } from "react-icons/ai";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function UniversityModal({
    isOpen,
    onClose,
    type,
    title,
    message,
    showLogo = true,
}) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isSuccess = type === "success";
    const iconColor = isSuccess ? "text-green-600" : "text-red-600";
    const primaryButtonColor = isSuccess ? "#CE932C" : "#8f141b";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo oscuro */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-lg animate-in fade-in zoom-in duration-200`}
            >
                <div className="bg-white rounded-lg shadow-2xl relative">
                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-[#4d626c] hover:text-[#8f141b] transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <AiOutlineClose className="h-5 w-5" />
                    </button>

                    {/* Contenido */}
                    <div className="p-8 text-center">
                        {/* Logo */}
                        {showLogo && (
                            <div className="mb-6 flex justify-center">
                                <Image
                                    src="https://www.usco.edu.co/imagen-institucional/facultades/ciencias-sociales-y-humanas.png"
                                    alt="Universidad Surcolombiana"
                                    width={200}
                                    height={80}
                                    className="h-auto w-48"
                                />
                            </div>
                        )}

                        {/* Icono */}
                        <div className="mb-4 flex justify-center">
                            {isSuccess ? (
                                <div className=" flex items-center justify-center">
                                    <AiOutlineCheckCircle className={`${iconColor}`} size={80}/>
                                </div>

                            ) : (
                                <HiOutlineExclamationCircle
                                    className={`h-16 w-16 ${iconColor}`}
                                />
                            )}
                        </div>

                        {/* Título */}
                        <h2 className="mb-3 text-2xl font-bold text-[#8f141b]">{title}</h2>

                        {/* Mensaje */}
                        <p className="mb-6 text-[#4d626c] leading-relaxed">{message}</p>

                        {/* Botón Aceptar */}
                        <button
                            onClick={onClose}
                            className="w-full rounded-lg px-6 py-3 font-semibold text-white transition-colors focus:outline-none"
                            style={{ backgroundColor: primaryButtonColor }}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
