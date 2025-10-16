'use client'
import Icon from '@/components/Icon'
import React, { useState, useEffect } from 'react'
import axiosPublic from '@/apis/axiosPublic'
import Loading from '@/components/Loading';
import UniversityModal from '../UniversityModal';
import PDFGenerator from '@/components/PDFGenerator';

const { FaRegFilePdf } = Icon;

// Función para agrupar materias por semestre
const agruparPorSemestre = (data) => {
    const semestres = {};

    Object.values(data).forEach(materia => {
        const semestre = materia.cursoNuevo.semestre;
        if (!semestres[semestre]) {
            semestres[semestre] = {
                semestre: semestre,
                label: semestre,
                materias: [],
                totalCreditos: 0
            };
        }
        semestres[semestre].materias.push({
            id: materia.cursoNuevo.id,
            nombre: materia.cursoNuevo.nombre,
            num_creditos: materia.cursoNuevo.creditos,
            estado: materia.estado,
            observacion: materia.observacion
        });
        semestres[semestre].totalCreditos += materia.cursoNuevo.creditos;
    });

    return Object.values(semestres);
};

// Función para obtener clase de color basada en el estado
const getColorClass = (estado) => {
    switch (estado) {
        case 'COMPLETO':
            return 'bg-green-100 border-green-200';
        case 'INCOMPLETO':
            return 'bg-yellow-100 border-yellow-200';
        case 'NO_APLICA':
            return 'bg-red-100 border-red-200';
        default:
            return 'bg-white border-gray-200';
    }
};

const EquivalenceView = ({
    showExportButton = true, // Opción para mostrar/ocultar botón de exportar
    title = "Malla Curricular" // Título personalizable
}) => {
    const [mallaNueva, setMallaNueva] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);

    const [showUniversityModal, setShowUniversityModal] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        type: 'success',
        title: '',
        message: ''
    });


    const handleUniversityModalClose = () => {
        setShowUniversityModal(false);
        if (modalConfig.onAccept) {
            modalConfig.onAccept();
        }
    };

    // Obtener datos del estudiante desde sessionStorage
    useEffect(() => {
        // Primero intentar obtener desde studentData
        const data = sessionStorage.getItem('studentData');
        if (data) {
            setStudentData(JSON.parse(data));
        } else {
            // Si no hay datos, intentar con estudianteId
            const estudianteId = sessionStorage.getItem('estudianteId');
            if (estudianteId) {
                // Crear un objeto temporal con el ID
                setStudentData({ id: parseInt(estudianteId) });
            } else {
                setError('No se encontraron datos del estudiante. Por favor, selecciona un estudiante primero.');
                setLoading(false);
            }
        }
    }, []);

    // Obtener equivalencias del backend
    useEffect(() => {
        const fetchEquivalencias = async () => {
            if (!studentData?.id) return;

            try {
                setLoading(true);
                setError(null);

                const response = await axiosPublic.get(
                    `${process.env.NEXT_PUBLIC_GET_EQUIVALENCE}/${studentData.id}/1/2`
                );

                // Transformar datos del backend al formato esperado
                const equivalenciasTransformadas = {};

                response.data.forEach(item => {
                    equivalenciasTransformadas[item.cursoNuevoId] = {
                        estado: item.estado === 'HOMOLOGADO' ? 'COMPLETO' : item.estado,
                        observacion: item.observacion,
                        cursoNuevo: {
                            id: item.cursoNuevo.id,
                            nombre: item.cursoNuevo.nombre,
                            creditos: item.cursoNuevo.creditos,
                            semestre: item.cursoNuevo.semestre
                        },
                        grupoId: item.grupoId,
                        cursosAntiguosPresentes: item.cursosAntiguosPresentes,
                        cursosAntiguosFaltantes: item.cursosAntiguosFaltantes
                    };
                });

                setMallaNueva(equivalenciasTransformadas);
            } catch (error) {
                console.error('Error al obtener equivalencias:', error);
                setError('Error al cargar las equivalencias. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchEquivalencias();
    }, [studentData]);

    const handleExportPDF = () => {
        // Lógica por defecto para exportar PDF
        console.log('Exportando PDF para:', { mallaNueva, studentData });
        alert('Funcionalidad de exportar PDF en desarrollo');
    };

    const materiasPorSemestre = agruparPorSemestre(mallaNueva);
    const totalMaterias = Object.keys(mallaNueva).length;

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loading message="Cargando equivalencia" />
            </div>
        );
    }

    // Error state
    if (error) {
        setModalConfig({
            type: 'error',
            title: 'Error al cargar datos',
            message: error,
            onAccept: null
        });
        setShowUniversityModal(true);
    }

    // No data state
    if (Object.keys(mallaNueva).length === 0) {
        return (
            <div className='w-full flex items-center justify-center py-12'>
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No hay equivalencias</h2>
                        <p className="text-gray-600">No se encontraron equivalencias para este estudiante.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-full flex flex-col overflow-hidden'>
            {/* Header fijo */}
            <div className="border-b border-gray-300 py-3 flex justify-between items-center bg-white px-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <h1 className='text-xl font-bold text-[#8F141B]'>{title}</h1>
                    <span className='text-[#8F141B] rounded-full bg-[#F4E7E8] py-1 px-2 text-xs'>{totalMaterias} materias</span>
                </div>
                {showExportButton && (
                    <div className="flex items-center gap-2">
                        <PDFGenerator
                            data={mallaNueva}
                            studentData={studentData}
                            buttonText="Exportar PDF"
                            disabled={Object.keys(mallaNueva).length === 0}
                        />
                    </div>
                )}
            </div>

            {/* Título y leyenda fijos */}
            <div className="py-3 flex flex-col items-center justify-center text-center gap-2 bg-[#f7f7f7] flex-shrink-0">
                <h1 className='text-lg font-bold'>PSICOLOGIA - USCO</h1>
                <span className='text-xs text-[#839198]'>ACUERDO CA 010 DE 2025</span>

                {/* Leyenda de colores */}
                <div className="flex flex-wrap justify-center gap-3 mt-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                        <span className="text-xs font-medium text-slate-700">Completo</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                        <span className="text-xs font-medium text-slate-700">Incompleto</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                        <span className="text-xs font-medium text-slate-700">No Aplica</span>
                    </div>
                </div>
            </div>

            {/* Área de semestres con scroll horizontal y vertical cuando sea necesario */}
            <div className="flex-1 bg-[#f7f7f7] p-4 overflow-hidden">
                <div className="h-full overflow-x-auto">
                    <div className="inline-flex gap-4 pr-4 scroll-smooth snap-x snap-mandatory min-h-full">
                        {materiasPorSemestre.map((sem) => (
                            <div key={sem.semestre} className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex-shrink-0">
                                {/* Header del semestre */}
                                <div className="mb-4 border-b border-[#8F141B]/20 pb-3">
                                    <h3 className="font-bold text-lg text-slate-900 mb-1 text-center">
                                        {sem.label}
                                    </h3>
                                    <p className="text-sm text-slate-500 text-center">
                                        Total:{" "}
                                        <span className="font-semibold text-[#8F141B]">
                                            {sem.totalCreditos} créditos
                                        </span>
                                    </p>
                                </div>

                                {/* Materias del semestre SIN scroll vertical */}
                                <div className="space-y-3">
                                    {sem.materias.map((materia) => (
                                        <div
                                            key={materia.id}
                                            className={`p-3 border-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer flex flex-col ${getColorClass(
                                                materia.estado
                                            )}`}
                                        >
                                            <h4 className="font-bold text-sm mb-2 text-slate-900 leading-tight">
                                                {materia.nombre}
                                            </h4>

                                            <div className="flex-1 mb-2">
                                                <h5 className="text-xs font-semibold text-slate-700 mb-1">Observaciones:</h5>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    {materia.observacion}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-2 border-t border-slate-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-slate-900">
                                                        Créditos: {materia.num_creditos}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {materia.estado === 'COMPLETO' ? 'HOMOLOGADO' : materia.estado === 'INCOMPLETO' ? 'INCOMPLETO' : 'NO APLICA'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <UniversityModal
                isOpen={showUniversityModal}
                onClose={handleUniversityModalClose}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div>
    );
};

export default EquivalenceView;