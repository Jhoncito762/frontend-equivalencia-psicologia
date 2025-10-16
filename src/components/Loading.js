import React from 'react'

export default function Loading({ message = "Cargando contenido…" }) {
    return (
        <div
            className="fixed left-0 right-0 bottom-0 z-40 grid place-items-center bg-white/90 backdrop-blur-sm"
            style={{ top: '64px' }} // Altura del navbar (h-16 = 64px)
            aria-busy="true"
            aria-live="polite"
        >
            <div className="flex flex-col items-center gap-4">
                <img
                    src="https://www.usco.edu.co/imagen-institucional/logo/precarga-usco.gif"
                    alt="Logo USCO animado"
                    className="h-28 w-auto"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        // Fallback si la imagen no carga
                        const fallback = document.createElement('div');
                        fallback.className = 'animate-spin rounded-full h-16 w-16 border-b-2 border-[#8F141B]';
                        e.target.parentNode.appendChild(fallback);
                    }}
                />
                <p className="text-[#4D626C] font-medium text-lg">{message}</p>
            </div>
            <span className="sr-only">Cargando…</span>
        </div>
    );
}
