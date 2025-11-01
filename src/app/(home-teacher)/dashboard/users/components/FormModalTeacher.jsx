"use client";
import React, { useState } from "react";
import InputItem from "@/components/InputItem";
import Icon from "@/components/Icon";
import DataTreatmentModal from "@/components/DataTreatmentModal";

const { FaChalkboardTeacher, HiOutlineXMark, FaEye, FaEyeSlash } = Icon;

const FormModalTeacher = ({
    isOpen,
    onClose,
    formData,
    onChange,
    onSubmit,
    loading = false,
    errors = {},
    errorMessage = "",
}) => {
    if (!isOpen) return null;

    const [showDataTreatmentModal, setShowDataTreatmentModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange?.(name, value);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        onChange?.(name, checked);
    };

    const handleSelectChange = (e) => {
        const { value } = e.target;
        onChange?.("estado", value === "true");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#8F141B] to-[#CE932C] p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <span className="bg-white/20 rounded-full p-3">
                            <FaChalkboardTeacher className="h-8 w-8" />
                        </span>
                        <div>
                            <h2 className="text-2xl font-semibold">Registrar docente</h2>
                            <p className="text-sm text-white/80">
                                Completa la información para vincular un nuevo docente al sistema.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <HiOutlineXMark className="h-8 w-8" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {errorMessage && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputItem
                            labelName="Nombres"
                            name="nombres"
                            placeholder="Ej: Laura"
                            value={formData.nombres}
                            onChange={handleInputChange}
                            error={errors.nombres}
                            disabled={loading}
                            type="text"
                        />
                        <InputItem
                            labelName="Apellidos"
                            name="apellidos"
                            placeholder="Ej: Ramírez"
                            value={formData.apellidos}
                            onChange={handleInputChange}
                            error={errors.apellidos}
                            disabled={loading}
                            type="text"
                        />
                        <InputItem
                            labelName="Correo institucional"
                            name="email"
                            placeholder="docente@usco.edu.co"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            disabled={loading}
                            type="email"
                            autoComplete="email"
                        />
                        <div className="relative w-full">

                            <InputItem
                                labelName="Contraseña"
                                name="password"
                                placeholder="Define una contraseña inicial"
                                value={formData.password}
                                onChange={handleInputChange}
                                error={errors.password}
                                disabled={loading}
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="h-5 w-5" />
                                ) : (
                                    <FaEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-[#4D626C] font-medium block mb-2">
                                Estado del docente
                            </label>
                            <select
                                name="estado"
                                value={String(formData.estado)}
                                onChange={handleSelectChange}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8F141B]/40"
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>


                    </div>

                    <div className="flex items-start gap-3 bg-[#FFF7EB] border border-[#F5D9A6] rounded-xl px-4 py-3">
                        <input
                            id="acepta_tratamiento_datos_docente"
                            name="acepta_tratamiento_datos"
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[#8F141B]"
                            checked={formData.acepta_tratamiento_datos}
                            onChange={handleCheckboxChange}
                            disabled={loading}
                        />
                        <label htmlFor="acepta_tratamiento_datos_docente" className="text-sm leading-5 text-[#4D626C]">
                            Confirmo que el docente autoriza el{' '}
                            <button
                                type="button"
                                onClick={() => setShowDataTreatmentModal(true)}
                                className="text-[#8F141B] underline font-medium"
                            >
                                tratamiento de datos
                            </button>.
                            personales conforme a la política institucional vigente.
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#8F141B] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#8F141B]/90 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Guardando...
                                </span>
                            ) : (
                                "Registrar docente"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <DataTreatmentModal
                isOpen={showDataTreatmentModal}
                onClose={() => setShowDataTreatmentModal(false)}
            />
        </div>
    );
};

export default FormModalTeacher;