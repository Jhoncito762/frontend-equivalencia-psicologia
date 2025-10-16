"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Icon from "@/components/Icon";
import InputItem from "@/components/InputItem";
import axiosPublic from "@/apis/axiosPublic";
import UniversityModal from "@/components/UniversityModal";

const { IoDocumentTextOutline } = Icon;

export default function FormModal({ isOpen, onClose }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [estudianteId, setEstudianteId] = useState(null);
    const [showUniversityModal, setShowUniversityModal] = useState(false);
    const [showExistingModal, setShowExistingModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        type: "success",
        title: "",
        message: "",
        onAccept: null,
    });

    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        codigo_estudiantil: "",
    });

    // Reset form and internal state each time the modal is opened
    useEffect(() => {
        if (isOpen) {
            setFormData({ nombres: "", apellidos: "", codigo_estudiantil: "" });
            setError(null);
            setLoading(false);
            setEstudianteId(null);
            setShowUniversityModal(false);
            setShowExistingModal(false);
            setModalConfig({ type: "success", title: "", message: "", onAccept: null });
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUniversityModalClose = () => {
        setShowUniversityModal(false);
        if (modalConfig.onAccept) modalConfig.onAccept();
    };

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await axiosPublic.post(process.env.NEXT_PUBLIC_BACKEND_STUDENT, formData);

            if (response.status === 201 && response.data?.estudiante_id) {
                const existingId = response.data.estudiante_id;
                setEstudianteId(existingId);
                sessionStorage.setItem('studentData', JSON.stringify({ id: existingId }));
                sessionStorage.setItem("estudianteId", String(existingId));
                setShowExistingModal(true);
                return;
            }

            if (response.data?.id) {
                sessionStorage.setItem(
                    "studentData",
                    JSON.stringify({
                        id: response.data.id,
                        nombres: response.data.nombres,
                        apellidos: response.data.apellidos,
                        codigo_estudiantil: response.data.codigo_estudiantil,
                    })
                );

                sessionStorage.setItem("estudianteId", String(response.data.id));

                setModalConfig({
                    type: "success",
                    title: "Registro exitoso",
                    message: "Estudiante registrado correctamente. Serás redirigido para continuar.",
                    onAccept: () => {
                        onClose?.();
                        router.push('/dashboard/student-home');
                    },
                });
                setShowUniversityModal(true);
                return;
            }

            setModalConfig({
                type: "error",
                title: "Error de Registro",
                message: "No se pudo procesar la solicitud. Intenta nuevamente.",
                onAccept: null,
            });
            setShowUniversityModal(true);
        } catch (error) {
            console.error("Error al procesar solicitud:", error);

            if (error.response?.data?.message && error.response?.data?.estudiante_id) {
                const existingId = error.response.data.estudiante_id;
                setEstudianteId(existingId);
                sessionStorage.setItem('studentData', JSON.stringify({ id: existingId }));
                sessionStorage.setItem('estudianteId', String(existingId));
                setShowExistingModal(true);
            } else {
                let errorMessage = "Error al procesar la solicitud. Intenta nuevamente.";

                if (error.response?.status === 400) {
                    errorMessage = "Datos inválidos. Verifique la información ingresada.";
                } else if (error.response?.status === 409) {
                    errorMessage = "El código estudiantil ya está registrado.";
                } else if (error.response?.status === 500) {
                    errorMessage = "Error del servidor. Intente nuevamente más tarde.";
                } else if (!error.response) {
                    errorMessage = "Error de conexión. Verifique su conexión a internet.";
                }

                setModalConfig({
                    type: "error",
                    title: "Error de Registro",
                    message: errorMessage,
                    onAccept: null,
                });
                setShowUniversityModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewResults = () => {
        sessionStorage.setItem("estudianteId", String(estudianteId));
        router.push('/dashboard/student-equivalence');
    };

    const handleCloseInternalModal = () => {
        setShowUniversityModal(false);
    };

    const handleViewResultsFromExisting = () => {
        sessionStorage.setItem('studentData', JSON.stringify({ id: estudianteId }));
        sessionStorage.setItem('estudianteId', String(estudianteId));
        setShowExistingModal(false);
        onClose?.();
        router.push('/dashboard/student-equivalence');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-lg mx-auto transform transition-all duration-300 scale-100">
                <div className="bg-[#CE932C] rounded-t-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IoDocumentTextOutline className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Registro de Estudiante</h2>
                    <p className="text-white/90 text-sm">Sistema de Equivalencias Académicas</p>
                </div>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-[#4D626C] text-base leading-relaxed">
                            Complete los datos del estudiante para iniciar el proceso de equivalencia de materias.
                        </p>
                    </div>

                    <div className="w-full flex flex-col items-center gap-4 mb-4">
                        <InputItem
                            labelName="Nombre"
                            placeholder="Ingrese el nombre"
                            type="text"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleInputChange}
                        />
                        <InputItem
                            labelName="Apellido"
                            placeholder="Ingrese el apellido"
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleInputChange}
                        />
                        <InputItem
                            labelName="Código estudiantil"
                            placeholder="Ej: 202122003243"
                            type="text"
                            name="codigo_estudiantil"
                            value={formData.codigo_estudiantil}
                            onChange={handleInputChange}
                        />
                    </div>

                    {error && (
                        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex-1 px-6 py-3 bg-[#CE932C] text-white rounded-xl hover:from-[#7A1018] hover:to-[#B8832A] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading ? "cursor-not-allowed opacity-70" : ""
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-gray-800 rounded-full animate-spin"></div>
                            ) : (
                                "Realizar equivalencia"
                            )}
                        </button>
                    </div>
                </div>

                <UniversityModal
                    isOpen={showUniversityModal}
                    onClose={handleUniversityModalClose}
                    type={modalConfig.type}
                    title={modalConfig.title}
                    message={modalConfig.message}
                />
                {showExistingModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md mx-auto transform transition-all duration-300 scale-100">
                            <div className="bg-[#CE932C] rounded-t-2xl p-6 text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <IoDocumentTextOutline className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-1">Equivalencia Existente</h2>
                                <p className="text-white/90 text-sm">Ya tienes un proceso registrado</p>
                            </div>

                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <p className="text-[#4D626C] text-base leading-relaxed">
                                        El código estudiantil ya tiene una equivalencia registrada en el sistema.
                                        <span className="font-medium text-[#8F141B]"> ¿Desea consultar los resultados?</span>
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setShowExistingModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleViewResultsFromExisting}
                                        className="flex-1 px-6 py-3 bg-[#CE932C] text-white rounded-xl hover:from-[#7A1018] hover:to-[#B8832A] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Ver Resultados
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
