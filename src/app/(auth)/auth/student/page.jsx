'use client'
import Icon from '@/components/Icon'
import InputItem from '@/components/InputItem';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton';
import axiosPublic from '@/apis/axiosPublic';
import UniversityModal from '@/components/UniversityModal';
import DataTreatmentModal from '@/components/DataTreatmentModal';
import Image from 'next/image';

const { PiStudentFill, CiLogin, IoDocumentTextOutline } = Icon;

const page = () => {

    const router = useRouter();

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [estudianteId, setEstudianteId] = useState(null);
    const [showUniversityModal, setShowUniversityModal] = useState(false);
    const [showDataTreatmentModal, setShowDataTreatmentModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        nombres: '',
        apellidos: '',
        codigo_estudiantil: ''
    });
    const [modalConfig, setModalConfig] = useState({
        type: 'success',
        title: '',
        message: '',
        onAccept: null
    });

    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        codigo_estudiantil: "",
        acepta_tratamiento_datos: false,
        version_politicas: "1.0.0"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let nextValue = value;

        if (name === 'codigo_estudiantil') {
            nextValue = value.replace(/\D/g, '').slice(0, 15);
        }

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        setFormData(prev => ({
            ...prev,
            [name]: nextValue
        }));
    };

    const handleUniversityModalClose = () => {
        setShowUniversityModal(false);
        if (modalConfig.onAccept) {
            modalConfig.onAccept();
        }
    };

    const handleCheckboxChange = (e) => {
        const { checked } = e.target;
        setFormData(prev => ({
            ...prev,
            acepta_tratamiento_datos: checked
        }));
    };

    const resolveStudentId = (payload) => payload?.estudiante_id ?? payload?.id ?? null;

    const handleVerificationFlow = async (payload, trimmedValues) => {
        const studentId = resolveStudentId(payload);

        if (!studentId) {
            setModalConfig({
                type: 'error',
                title: 'Identificación Estudiante',
                message: 'No fue posible determinar el identificador del estudiante. Intenta nuevamente.',
                onAccept: null
            });
            setShowUniversityModal(true);
            return;
        }

        try {
            const verificationResponse = await axiosPublic.get(`/equivalencias/verificar/${studentId}`);
            const { tieneEquivalencias } = verificationResponse.data || {};

            if (tieneEquivalencias) {
                setEstudianteId(studentId);
                setShowModal(true);
                return;
            }

            sessionStorage.setItem('studentData', JSON.stringify({
                id: studentId,
                nombres: payload?.nombres ?? trimmedValues.nombres,
                apellidos: payload?.apellidos ?? trimmedValues.apellidos,
                codigo_estudiantil: payload?.codigo_estudiantil ?? trimmedValues.codigo_estudiantil,
            }));

            setModalConfig({
                type: 'success',
                title: 'Ingreso Exitoso',
                message: 'Ha ingresado correctamente. Presione "Aceptar" para continuar.',
                onAccept: () => router.push('/home')
            });
            setShowUniversityModal(true);
        } catch (verificationError) {
            console.error('Error al verificar equivalencias:', verificationError);
            setModalConfig({
                type: 'error',
                title: 'Error de Verificación',
                message: 'No se pudo verificar la información del estudiante. Intenta nuevamente.',
                onAccept: null
            });
            setShowUniversityModal(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault?.(); 
        setError(null);

        const trimmedData = {
            nombres: formData.nombres.trim(),
            apellidos: formData.apellidos.trim(),
            codigo_estudiantil: formData.codigo_estudiantil.trim()
        };

        const newErrors = {
            nombres: trimmedData.nombres ? '' : 'Campo obligatorio',
            apellidos: trimmedData.apellidos ? '' : 'Campo obligatorio',
            codigo_estudiantil: trimmedData.codigo_estudiantil ? '' : 'Campo obligatorio'
        };

        if (!trimmedData.nombres || !trimmedData.apellidos || !trimmedData.codigo_estudiantil) {
            setFieldErrors(newErrors);
            return;
        }

        if (!formData.acepta_tratamiento_datos) {
            setModalConfig({
                type: 'error',
                title: 'Tratamiento de datos',
                message: 'Debes aceptar el tratamiento de datos para poder realizar tu equivalencia.',
                onAccept: null
            });
            setShowUniversityModal(true);
            return;
        }

        setLoading(true);

        try {
            const response = await axiosPublic.post(
                process.env.NEXT_PUBLIC_BACKEND_STUDENT,
                formData
            );

            await handleVerificationFlow(response.data, trimmedData);
            return;
        } catch (error) {
            console.error('Error al procesar solicitud:', error);

            if (error.response?.status === 409) {
                await handleVerificationFlow(error.response?.data ?? {}, trimmedData);
                return;
            }

            let errorMessage = 'Error al procesar la solicitud. Intenta nuevamente.';

            if (error.response?.status === 400) {
                errorMessage = 'Datos inválidos. Verifique la información ingresada.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Error del servidor. Intente nuevamente más tarde.';
            } else if (!error.response) {
                errorMessage = 'Error de conexión. Verifique su conexión a internet.';
            }

            setModalConfig({
                type: 'error',
                title: 'Error de Registro',
                message: errorMessage,
                onAccept: null
            });
            setShowUniversityModal(true);
        } finally {
            setLoading(false);
        }
    };


    const handleViewResults = () => {
        sessionStorage.setItem('studentData', JSON.stringify({
            id: estudianteId
        }));
        setShowModal(false);
        router.push('/home/equivalence');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEstudianteId(null);
    };

    return (
        <>
            <div className='min-h-screen w-full bg-[#EDEFF0] flex items-center justify-center py-10'>
                <div className="bg-white w-[90%] md:w-[40%] rounded-lg shadow-md flex flex-col items-center justify-center px-5 py-10">
                    <div className=" self-start ml-5">
                        <BackButton to={'/auth'} />
                    </div>
                    <div>
                        <Image
                            src="https://www.usco.edu.co/imagen-institucional/facultades/ciencias-sociales-y-humanas.png"
                            width={340}
                            height={150}
                            alt='Logo Ciencias Sociales y Humanas'
                        />
                        {/* <img src="https://www.usco.edu.co/imagen-institucional/facultades/ciencias-sociales-y-humanas.png" alt="Logo Ciencias Sociales y Humanas" /> */}
                    </div>
                    <div className="flex flex-col items-center my-10 gap-3">
                        <PiStudentFill className='bg-[#F4E7E8] rounded-full text-[#8F141B] p-4' size={80} />
                        <div className="flex flex-col text-center gap-4">
                            <h1 className='text-3xl text-[#4D626C] font-bold'>Acceso Estudiante</h1>
                            <p className='text-sm text-[#839198]'>Ingresa tus datos personales y código estudiantil</p>
                        </div>
                    </div>

                    {error && (
                        <div className="w-[80%] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div className="w-[80%] flex flex-col items-center gap-4 mb-8">
                        <InputItem
                            labelName="Nombre"
                            placeholder="Juan"
                            type="text"
                            name="nombres"
                            maxLength={15}
                            value={formData.nombres}
                            onChange={handleInputChange}
                            error={fieldErrors.nombres}
                        />
                        <InputItem
                            labelName="Apellido"
                            placeholder="Pulido"
                            type="text"
                            name="apellidos"
                            maxLength={15}
                            value={formData.apellidos}
                            onChange={handleInputChange}
                            error={fieldErrors.apellidos}
                        />
                        <InputItem
                            labelName="Código estudiantil"
                            placeholder="Ej: 202122003243"
                            type="number"
                            name="codigo_estudiantil"
                            maxLength={15}
                            value={formData.codigo_estudiantil}
                            onChange={handleInputChange}
                            error={fieldErrors.codigo_estudiantil}
                        />
                    </div>

                    <div className="w-[80%] flex items-start gap-3 mb-6">
                        <input
                            id="acepta_tratamiento_datos"
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[#8F141B]"
                            checked={formData.acepta_tratamiento_datos}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="acepta_tratamiento_datos" className="text-sm text-[#4D626C] leading-5">
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


                    <button
                        type='submit'
                        disabled={loading}
                        onClick={handleSubmit}
                        className={`bg-[#8F141B] text-white hover:bg-[#CE932C] shadow-xl rounded-lg w-[80%] py-3 transform transition duration-400 flex items-center justify-center ${loading
                            ? `cursor-not-allowed bg-[#A57623]` : ``}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-gray-800 rounded-full animate-spin"></div>
                        ) : (
                            <div className="flex gap-3 items-center justify-center font-semibold">
                                <CiLogin size={25} />
                                Acceder
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md mx-auto transform transition-all duration-300 scale-100">
                        <div className="bg-[#CE932C] rounded-t-2xl p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <IoDocumentTextOutline className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">
                                Equivalencia Existente
                            </h2>
                            <p className="text-white/90 text-sm">
                                Ya tienes un proceso registrado
                            </p>
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
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleViewResults}
                                    className="flex-1 px-6 py-3 bg-[#CE932C] text-white rounded-xl hover:from-[#7A1018] hover:to-[#B8832A] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Ver Resultados
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

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
        </>
    )
}

export default page