'use client'
import Icon from '@/components/Icon'
import React, { useState, useEffect } from 'react'
import axiosPublic from '@/apis/axiosPublic'
import Loading from '@/components/Loading';
import UniversityModal from '@/components/UniversityModal';
import PDFGenerator from '@/components/PDFGenerator';
import { useRouter } from 'next/navigation';

const { CiCircleCheck, IoBookOutline, TfiMedall, CiWarning, HiOutlineXMark, FaRepeat } = Icon;

// Datos mock removidos - ahora se obtienen del backend

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

const page = () => {
    const [mallaNueva, setMallaNueva] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [showUniversityModal, setShowUniversityModal] = useState(false)
    const [resumen, setResumen] = useState({})

    const [modalConfig, setModalConfig] = useState({
        type: 'success',
        title: '',
        message: ''
    });

    const router = useRouter()


    const handleUniversityModalClose = () => {
        setShowUniversityModal(false);
        if (modalConfig.onAccept) {
            modalConfig.onAccept();
        }
    };

    // Obtener datos del estudiante desde sessionStorage
    useEffect(() => {
        const data = sessionStorage.getItem('studentData');
        if (data) {
            setStudentData(JSON.parse(data));
        } else {
            setError('No se encontraron datos del estudiante. Por favor, inicia sesión nuevamente.');
            setLoading(false);
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

                const {resumen} = response.data
                setResumen(resumen || {});

                if (Array.isArray(response.data.resultados)) {
                    response.data.resultados.forEach(item => {
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
                } else {
                    console.error("La respuesta no contiene un array de resultados:", response.data.resultados);
                    setError('Datos inesperados en la respuesta del servidor');
                }

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

    const materiasPorSemestre = agruparPorSemestre(mallaNueva);
    const totalMaterias = Object.keys(mallaNueva).length;

    // Loading state
    if (loading) {
        return <Loading message="Cargando equivalencia" />;
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
            <div className='min-h-screen w-full bg-[#f7f7f7] flex items-center justify-center'>
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

    const repeatEquivalence = () => { 
        router.push('/home')
    }

    return (
        <div className='min-h-screen w-full bg-[#f7f7f7] pb-8 flex flex-col'>
            <div className="border-b border-gray-300 py-7 flex justify-between items-center bg-white px-8">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h1 className='text-2xl font-bold text-[#8F141B] '>Malla Curricular</h1>
                    <span className='text-[#8F141B] rounded-full bg-[#F4E7E8] py-1 px-2 text-sm w-25 text-center'>{totalMaterias} materias</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2 items-center md:gap-4">
                    <button onClick={repeatEquivalence} className='flex items-center gap-2 border border-[#8F141B] text-[#8F141B] px-3 py-2 rounded-lg hover:bg-gray-100 transform transition duration-400 w-40 md:w-50 justify-center'><FaRepeat /> Repetir equivalencia</button>
                    <PDFGenerator
                        data={mallaNueva}
                        studentData={studentData}
                        resumen={resumen}
                        buttonText="Exportar PDF"
                        disabled={Object.keys(mallaNueva).length === 0}
                    />
                </div>
            </div>
            <div className="my-10 flex flex-col items-center justify-center text-center gap-3">
                <h1 className='text-3xl font-bold'>PSICOLOGIA - USCO</h1>
                <span className='text-sm text-[#839198]'>ACUERDO CA 010 DE 2025</span>

                {/* Leyenda de colores */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                        <span className="text-xs font-medium text-slate-700">Completo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                        <span className="text-xs font-medium text-slate-700">Incompleto</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                        <span className="text-xs font-medium text-slate-700">No Aplica</span>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-10 pb-8">
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-max">
                        {materiasPorSemestre.map((sem) => (
                            <div key={sem.semestre} className="flex-shrink-0 w-72">
                                {/* Header del semestre */}
                                <div className="mb-4 bg-white border-2 border-[#8F141B]/20 rounded-lg shadow-sm">
                                    <div className="p-4 text-center">
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                                            {sem.label}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Total:{" "}
                                            <span className="font-semibold text-[#8F141B]">
                                                {sem.totalCreditos} créditos
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Materias del semestre */}
                                <div className="space-y-3">
                                    {sem.materias.map((materia) => (
                                        <div
                                            key={materia.id}
                                            className={`p-4 border-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer flex flex-col ${getColorClass(
                                                materia.estado
                                            )}`}
                                        >


                                            <h4 className="font-bold text-base mb-3 text-slate-900 leading-tight">
                                                {materia.nombre}
                                            </h4>

                                            <div className="flex-1 mb-3">
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
            <div className="flex flex-col container mx-auto px-10 my-8 ">
                <div className="flex flex-col gap-2 mb-5">
                    <h1 className='text-2xl text-[#8F141B] font-bold'>Resumen de Equivalencia</h1>
                    <span className='text-sm text-[#839198]'>Análisis detallado del proceso de homologación a la nueva malla curricular</span>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                    <div className="border-2 border-green-400 bg-green-50 px-4 py-3 rounded-lg h-40">
                        <div className="flex justify-between items-center px-1 pt-2">
                            <CiCircleCheck className='text-green-600 rounded-lg bg-green-200 px-2 py-1 ' size={40} />
                            <h1 className='text-2xl text-green-700 font-bold'>{resumen?.homologados ?? resumen?.homologado ?? 0}</h1>
                        </div>
                        <div className="flex flex-col gap-2 mt-5">
                            <h1 className='font-semibold text-xl'>Materias homologadas</h1>
                            <p className='text-[#839198]'>Materias aprobadas exitosamente</p>
                        </div>
                    </div>
                    <div className="border-2 border-yellow-400 bg-yellow-50 px-4 py-3 rounded-lg h-40">
                        <div className="flex justify-between items-center px-1 pt-2">
                            <CiWarning className='text-yellow-600 rounded-lg bg-yellow-200 px-2 py-1 ' size={40} />
                            <h1 className='text-2xl text-yellow-700 font-bold'>{resumen?.incompletos ?? 0}</h1>
                        </div>
                        <div className="flex flex-col gap-2 mt-5">
                            <h1 className='font-semibold text-xl'>Materias Incompletas</h1>
                            <p className='text-[#839198]'>Incompletas por otra materia</p>
                        </div>
                    </div>
                    <div className="border-2 border-red-400 bg-red-50 px-4 py-3 rounded-lg h-40">
                        <div className="flex justify-between items-center px-1 pt-2">
                            <HiOutlineXMark className='text-red-600 rounded-lg bg-red-200 px-2 py-1 ' size={40} />
                            <h1 className='text-2xl text-red-700 font-bold'>{resumen?.noAplica ?? resumen?.no_aplica ?? 0}</h1>
                        </div>
                        <div className="flex flex-col gap-2 mt-5">
                            <h1 className='font-semibold text-xl'>No Aplican</h1>
                            <p className='text-[#839198]'>Materias no aprobadas</p>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <div className="border-2 border-[#c27276] bg-[#F4E7E8] px-4 py-3 rounded-lg h-40">
                        <div className="flex self-start gap-3">
                            <IoBookOutline className='text-[#8F141B] rounded-lg bg-[#e9dadb] px-2 py-1 ' size={40} />
                            <div className="flex flex-col gap-1">
                                <p className='text-sm font-semibold'>Malla Antigua</p>
                                <h1 className='text-2xl text-[#8F141B] font-bold'>{resumen?.creditosCompletadosMallaAntigua ?? resumen?.creditos_completados_malla_antigua ?? 0}<span className='pl-1 text-[#404244] text-sm font-medium'>Creditos completados</span></h1>
                            </div>
                        </div>
                        <div className="h-2 mt-10 bg-[#8F141B] rounded-full"></div>
                    </div>
                    <div className="border-2 border-[#DFD4A6] bg-[#F9F6ED] px-4 py-3 rounded-lg h-40">
                        <div className="flex self-start gap-3">
                            <TfiMedall className='text-[#C7B363] rounded-lg bg-[#EFEAD3] px-2 py-1 ' size={40} />
                            <div className="flex flex-col gap-1">
                                <p className='text-sm font-semibold'>Malla Nueva</p>
                                <h1 className='text-2xl text-[#C7B363] font-bold'>{resumen?.creditosHomologadosMallaNueva ?? resumen?.creditos_homologados_malla_nueva ?? 0}<span className='pl-1 text-[#404244] text-sm font-medium'>de {resumen?.totalCreditosMallaNueva ?? resumen?.total_creditos_malla_nueva ?? 0} creditos</span></h1>
                            </div>
                        </div>
                        {/* Progress bar: muestra el porcentaje de créditos homologados sobre el total de la malla nueva */}
                        {(() => {
                            const homologados = Number(resumen?.creditosHomologadosMallaNueva ?? resumen?.creditos_homologados_malla_nueva ?? 0);
                            const total = Number(resumen?.totalCreditosMallaNueva ?? resumen?.total_creditos_malla_nueva ?? 0) || 0;
                            const raw = total > 0 ? (homologados / total) * 100 : 0;
                            const pct = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 0;
                            return (
                                <div className="w-full mt-4">
                                    <div className="w-full bg-[#e9f0e6] rounded-full h-3 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`Progreso malla nueva ${pct}%`}>
                                        <div className="h-3 bg-[#C7B363] rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="text-xs text-slate-700 mt-2">{pct}% completado</div>
                                </div>
                            )
                        })()}
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
    )
}

export default page