"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import InputItem from "@/components/InputItem";
import axiosPublic from "@/apis/axiosPublic";
import UniversityModal from "@/components/UniversityModal";
import DataTreatmentModal from "@/components/DataTreatmentModal";
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

const { IoDocumentTextOutline } = Icon;

export default function FormModal({ isOpen, onClose }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [estudianteId, setEstudianteId] = useState(null);
    const [showUniversityModal, setShowUniversityModal] = useState(false);
    const [showExistingModal, setShowExistingModal] = useState(false);
    const [showDataTreatmentModal, setShowDataTreatmentModal] = useState(false);
    const [cohortes, setCohortes] = useState([]);
    const [selectedCohorte, setSelectedCohorte] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        type: "success",
        title: "",
        message: "",
        onAccept: null,
    });

    const [fieldErrors, setFieldErrors] = useState({
        nombres: "",
        apellidos: "",
        codigo_estudiantil: "",
        cohorte: "",
    });

    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        codigo_estudiantil: "",
        cohorte: "",
        acepta_tratamiento_datos: false,
        version_politicas: "1.0.0",
    });

    // Reset form and internal state each time the modal is opened
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nombres: "",
                apellidos: "",
                codigo_estudiantil: "",
                cohorte: "",
                acepta_tratamiento_datos: false,
                version_politicas: "1.0.0",
            });
            setError(null);
            setLoading(false);
            setEstudianteId(null);
            setSelectedCohorte(null);
            setShowUniversityModal(false);
            setShowExistingModal(false);
            setShowDataTreatmentModal(false);
            setModalConfig({ type: "success", title: "", message: "", onAccept: null });
            setFieldErrors({ nombres: "", apellidos: "", codigo_estudiantil: "", cohorte: "" });
        }
    }, [isOpen]);

    // Cargar cohortes al abrir el modal
    useEffect(() => {
        if (isOpen) {
            getCohortes();
        }
    }, [isOpen]);

    const getCohortes = async () => {
        try {
            const response = await axiosPublic.get(
                `${process.env.NEXT_PUBLIC_COHORTES}`
            );

            const { data } = response.data;

            const cohortesOptions = data.map(cohorte => ({
                value: cohorte,
                label: cohorte
            }));

            setCohortes(cohortesOptions);
        } catch (error) {
            console.error('No se pudieron traer las cohortes', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let nextValue = value;

        if (name === "codigo_estudiantil") {
            nextValue = value.replace(/\D/g, "").slice(0, 15);
        }

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        setFormData((prev) => ({ ...prev, [name]: nextValue }));
    };

    const handleCheckboxChange = (e) => {
        const { checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            acepta_tratamiento_datos: checked,
        }));
    };

    const handleUniversityModalClose = () => {
        setShowUniversityModal(false);
        if (modalConfig.onAccept) modalConfig.onAccept();
    };

    const resolveStudentId = (payload) => payload?.estudiante_id ?? payload?.id ?? null;

    const handleVerificationFlow = async (payload, trimmedValues) => {
        const studentId = resolveStudentId(payload);

        if (!studentId) {
            setModalConfig({
                type: "error",
                title: "Identificación Estudiante",
                message: "No fue posible determinar el identificador del estudiante. Intenta nuevamente.",
                onAccept: null,
            });
            setShowUniversityModal(true);
            return;
        }

        try {
            const verificationResponse = await axiosPublic.get(`${process.env.NEXT_PUBLIC_VERIFY_EQUIVALENCE}/${studentId}`);
            const { tieneEquivalencias } = verificationResponse.data || {};

            sessionStorage.setItem(
                "studentData",
                JSON.stringify({
                    id: studentId,
                    nombres: payload?.nombres ?? trimmedValues.nombres,
                    apellidos: payload?.apellidos ?? trimmedValues.apellidos,
                    codigo_estudiantil: payload?.codigo_estudiantil ?? trimmedValues.codigo_estudiantil,
                })
            );
            sessionStorage.setItem("estudianteId", String(studentId));

            if (tieneEquivalencias) {
                setEstudianteId(studentId);
                setShowExistingModal(true);
                return;
            }

            setModalConfig({
                type: "success",
                title: "Ingreso exitoso",
                message: "Estudiante registrado correctamente. Serás redirigido para continuar.",
                onAccept: () => {
                    onClose?.();
                    router.push("/dashboard/student-home");
                },
            });
            setShowUniversityModal(true);
        } catch (verificationError) {
            console.error("Error al verificar equivalencias:", verificationError);
            setModalConfig({
                type: "error",
                title: "Error de Verificación",
                message: "No se pudo verificar la información del estudiante. Intenta nuevamente.",
                onAccept: null,
            });
            setShowUniversityModal(true);
        }
    };

    const handleSubmit = async () => {
        setError(null);
        const trimmedData = {
            nombres: formData.nombres.trim(),
            apellidos: formData.apellidos.trim(),
            codigo_estudiantil: formData.codigo_estudiantil.trim(),
            cohorte: formData.cohorte.trim(),
        };

        const newErrors = {
            nombres: trimmedData.nombres ? "" : "Campo obligatorio",
            apellidos: trimmedData.apellidos ? "" : "Campo obligatorio",
            codigo_estudiantil: trimmedData.codigo_estudiantil ? "" : "Campo obligatorio",
            cohorte: trimmedData.cohorte ? "" : "Campo obligatorio",
        };

        if (!trimmedData.nombres || !trimmedData.apellidos || !trimmedData.codigo_estudiantil || !trimmedData.cohorte) {
            setFieldErrors(newErrors);
            return;
        }

        if (!formData.acepta_tratamiento_datos) {
            setModalConfig({
                type: "error",
                title: "Tratamiento de datos",
                message: "Debes aceptar el tratamiento de datos para poder realizar la equivalencia.",
                onAccept: null,
            });
            setShowUniversityModal(true);
            return;
        }

        setLoading(true);

        try {
            const submissionData = {
                ...formData,
                nombres: trimmedData.nombres,
                apellidos: trimmedData.apellidos,
                codigo_estudiantil: trimmedData.codigo_estudiantil,
            };

            const response = await axiosPublic.post(process.env.NEXT_PUBLIC_BACKEND_STUDENT, submissionData);

            await handleVerificationFlow(response.data, trimmedData);
        } catch (error) {
            console.error("Error al procesar solicitud:", error);

            if (error.response?.status === 409) {
                await handleVerificationFlow(error.response?.data ?? {}, trimmedData);
                return;
            }

            let errorMessage = "Error al procesar la solicitud. Intenta nuevamente.";

            if (error.response?.status === 400) {
                errorMessage = "Datos inválidos. Verifique la información ingresada.";
            } else if (error.response?.status === 500) {
                errorMessage = "Error del servidor. Intente nuevamente más tarde.";
            } else if (!error.response) {
                errorMessage = "Error de conexión. Verifique su conexión a internet.";
            }

            setError(errorMessage);
            setModalConfig({
                type: "error",
                title: "Error de Registro",
                message: errorMessage,
                onAccept: null,
            });
            setShowUniversityModal(true);
        } finally {
            setLoading(false);
        }
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-lg mx-auto transform transition-all duration-300 scale-100 relative my-8">
                <div className="bg-[#CE932C] rounded-t-2xl p-4 sm:p-6 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <IoDocumentTextOutline className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Registro de Estudiante</h2>
                    <p className="text-white/90 text-xs sm:text-sm">Sistema de Equivalencias Académicas</p>
                </div>

                <div className="p-4 sm:p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    <div className="text-center mb-4 sm:mb-6">
                        <p className="text-[#4D626C] text-sm sm:text-base leading-relaxed">
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
                            error={fieldErrors.nombres}
                        />
                        <InputItem
                            labelName="Apellido"
                            placeholder="Ingrese el apellido"
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleInputChange}
                            error={fieldErrors.apellidos}
                        />
                        <InputItem
                            labelName="Código estudiantil"
                            placeholder="Ej: 202122003243"
                            type="text"
                            name="codigo_estudiantil"
                            value={formData.codigo_estudiantil}
                            onChange={handleInputChange}
                            error={fieldErrors.codigo_estudiantil}
                        />
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cohorte
                            </label>
                            <Select
                                options={cohortes}
                                value={selectedCohorte}
                                onChange={(option) => {
                                    setSelectedCohorte(option);
                                    setFormData(prev => ({
                                        ...prev,
                                        cohorte: option?.value || ''
                                    }));
                                    if (fieldErrors.cohorte) {
                                        setFieldErrors(prev => ({
                                            ...prev,
                                            cohorte: ''
                                        }));
                                    }
                                }}
                                placeholder="Selecciona el cohorte"
                                isClearable
                                classNamePrefix='react-select'
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        width: '100%',
                                        minHeight: '48px',
                                        borderColor: fieldErrors.cohorte ? '#ef4444' : '#d1d5db',
                                        '&:hover': {
                                            borderColor: fieldErrors.cohorte ? '#ef4444' : '#8F141B'
                                        },
                                        boxShadow: state.isFocused ? (fieldErrors.cohorte ? '0 0 0 1px #ef4444' : '0 0 0 1px #8F141B') : 'none'
                                    })
                                }}
                            />
                            {fieldErrors.cohorte && (
                                <p className="mt-1 text-sm text-red-600">{fieldErrors.cohorte}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                        <input
                            id="acepta_tratamiento_datos"
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[#8F141B]"
                            checked={formData.acepta_tratamiento_datos}
                            onChange={handleCheckboxChange}
                        />
                        <label
                            htmlFor="acepta_tratamiento_datos"
                            className="text-sm text-[#4D626C] leading-5"
                        >
                            Acepto el tratamiento de datos personales conforme a la{' '}
                            <button
                                type="button"
                                onClick={() => setShowDataTreatmentModal(true)}
                                className="text-[#8F141B] underline font-medium"
                            >
                                política de tratamiento de datos
                            </button>.
                        </label>
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
                <DataTreatmentModal
                    isOpen={showDataTreatmentModal}
                    onClose={() => setShowDataTreatmentModal(false)}
                />
                {showExistingModal && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40 p-4 rounded-2xl overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 my-4">
                            <div className="bg-[#CE932C] rounded-t-2xl p-4 sm:p-6 text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                    <IoDocumentTextOutline className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Equivalencia Existente</h2>
                                <p className="text-white/90 text-xs sm:text-sm">Ya tienes un proceso registrado</p>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="text-center mb-4 sm:mb-6">
                                    <p className="text-[#4D626C] text-sm sm:text-base leading-relaxed">
                                        El código estudiantil ya tiene una equivalencia registrada en el sistema.
                                        <span className="font-medium text-[#8F141B]"> ¿Desea consultar los resultados?</span>
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setShowExistingModal(false)}
                                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleViewResultsFromExisting}
                                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#CE932C] text-white rounded-xl hover:from-[#7A1018] hover:to-[#B8832A] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
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
