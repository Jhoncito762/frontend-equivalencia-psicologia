"use client";
import React from "react";
import Icon from "@/components/Icon";

const { HiOutlineXMark, CiWarning } = Icon;

const ConfirmDeleteTeacher = ({
    isOpen,
    teacherName,
    onClose,
    onConfirm,
    loading = false,
    errorMessage = "",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-[#8F141B] text-white">
                    <div className="flex items-center gap-3">
                        <span className="bg-white/20 rounded-full p-2">
                            <CiWarning className="h-6 w-6" />
                        </span>
                        <h2 className="text-lg font-semibold">Confirmar eliminación</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                        aria-label="Cerrar"
                        disabled={loading}
                    >
                        <HiOutlineXMark className="h-6 w-6" />
                    </button>
                </div>

                <div className="px-6 py-6 space-y-4">
                    <p className="text-sm text-[#4D626C] leading-relaxed">
                        Esta acción eliminará al docente <span className="font-semibold text-[#8F141B]">{teacherName}</span> del sistema.
                        Esta operación no se puede deshacer. ¿Desea continuar?
                    </p>

                    {errorMessage && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#8F141B] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#8F141B]/90 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Eliminando...
                                </span>
                            ) : (
                                "Eliminar docente"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteTeacher;
