'use client';
import axiosPublic from '@/apis/axiosPublic';
import Icon from '@/components/Icon'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import UniversityModal from '../UniversityModal';

const { PiStudentFill, LuUserRound, MdNumbers, IoBookOutline, HiChevronDown, HiChevronRight, LuGraduationCap } = Icon;

const StudentHome = ({
    redirectTo = '/home/equivalence', // Ruta de redirección por defecto
    showUserInfo = true // Opción para mostrar/ocultar información del usuario
}) => {
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState(new Set())
    const [semestresAbiertos, setSemestresAbiertos] = useState(new Set([1]))
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [userData, setUserData] = useState(null)
    const [studentData, setStudentData] = useState(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [showUniversityModal, setShowUniversityModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        type: 'success',
        title: '',
        message: ''
    });

    const [formData, setFormData] = useState({
        estudianteId: null,
        mallaAntiguaId: 1,
        mallaNuevaId: 2,
        cursosAntiguosMarcados: []
    })

    const router = useRouter()

    useEffect(() => {
        // Primero intentar obtener desde sessionStorage
        const data = sessionStorage.getItem('studentData');
        if (data) {
            setStudentData(JSON.parse(data));
        } else {
            // Si no hay datos en sessionStorage, intentar con estudianteId
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

    useEffect(() => {
        if (studentData?.id) {
            setFormData(prev => ({
                ...prev,
                estudianteId: studentData.id
            }));
        }
    }, [studentData]);

    // Actualizar cursosAntiguosMarcados cuando cambien las materias seleccionadas
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            cursosAntiguosMarcados: Array.from(materiasSeleccionadas)
        }));
    }, [materiasSeleccionadas]);

    const handleUniversityModalClose = () => {
        setShowUniversityModal(false);
        if (modalConfig.onAccept) {
            modalConfig.onAccept();
        }
    };


    const getUserData = async (studentId) => {
        try {
            const response = await axiosPublic.get(
                `${process.env.NEXT_PUBLIC_USER_DATA}/${studentId}`
            )
            setUserData(response.data)
        } catch (error) {
            console.error('No se pudieron traer los datos', error)
            setError('Error al cargar los datos del usuario')
        }
    }

    const getOldCourses = async () => {
        try {
            const response = await axiosPublic.get(
                `${process.env.NEXT_PUBLIC_COURSES}?mallaId=1`
            )

            if (response.data && Array.isArray(response.data)) {
                setCourses(response.data)
            } else {
                console.warn('La respuesta no contiene un array válido:', response.data)
                setCourses([])
            }
        } catch (error) {
            console.error('No se pudieron obtener los cursos', error)
            setCourses([])
            setError('Error al cargar los cursos')
        }
    }

    const handleSubmitEquivalence = async () => {
        setLoadingSubmit(true);
        try {
            const response = await axiosPublic.post(
                process.env.NEXT_PUBLIC_EQUIVALENCE,
                formData
            );

            setModalConfig({
                type: 'success',
                title: 'Euivalencia exitosa',
                message: 'La equivalencia se ha realizado exitosamente. Seras redirigido a la nueva malla curricular.',
                onAccept: () => router.push(redirectTo)
            });
            setShowUniversityModal(true);

        } catch (error) {
            console.error('Error al procesar equivalencia:', error);
            setError('Error al procesar la equivalencia. Intenta nuevamente.');
        } finally {
            setLoadingSubmit(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (studentData?.id) {
                setLoading(true);
                try {
                    await Promise.all([
                        showUserInfo ? getUserData(studentData.id) : Promise.resolve(),
                        getOldCourses()
                    ]);
                } catch (error) {
                    console.error('Error al cargar datos:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [studentData, showUserInfo]);

    const toggleMateria = (materiaId) => {
        const nuevasSeleccionadas = new Set(materiasSeleccionadas)
        if (nuevasSeleccionadas.has(materiaId)) {
            nuevasSeleccionadas.delete(materiaId)
        } else {
            nuevasSeleccionadas.add(materiaId)
        }
        setMateriasSeleccionadas(nuevasSeleccionadas)
    }

    const toggleSemestre = (numeroSemestre) => {
        const materiasDelSemestre = courses.filter(materia => materia.semestre === numeroSemestre)
        const idsDelSemestre = materiasDelSemestre.map(m => m.id)
        const todasSeleccionadas = idsDelSemestre.every(id => materiasSeleccionadas.has(id))

        const nuevasSeleccionadas = new Set(materiasSeleccionadas)
        if (todasSeleccionadas) {
            idsDelSemestre.forEach(id => nuevasSeleccionadas.delete(id))
        } else {
            idsDelSemestre.forEach(id => nuevasSeleccionadas.add(id))
        }
        setMateriasSeleccionadas(nuevasSeleccionadas)
    }

    const todasSeleccionadasEnSemestre = (numeroSemestre) => {
        const materiasDelSemestre = courses.filter(materia => materia.semestre === numeroSemestre)
        return materiasDelSemestre.every(m => materiasSeleccionadas.has(m.id))
    }

    const toggleSemestreAbierto = (numeroSemestre) => {
        const nuevosAbiertos = new Set(semestresAbiertos)
        if (nuevosAbiertos.has(numeroSemestre)) {
            nuevosAbiertos.delete(numeroSemestre)
        } else {
            nuevosAbiertos.add(numeroSemestre)
        }
        setSemestresAbiertos(nuevosAbiertos)
    }

    const obtenerMateriasPorSemestre = (numeroSemestre) => {
        return courses.filter(materia => materia.semestre === numeroSemestre)
    }

    const capitalizarPrimeraLetra = (texto) => {
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
    }

    // Mostrar loading mientras carga
    if (loading) {
        return <Loading message="Cargando" />
    }

    if (error) {
        setModalConfig({
            type: 'error',
            title: 'Error en el sistema',
            message: error,
            onAccept: null
        });
        setShowUniversityModal(true);
    }

    return (
        <div className='min-h-screen w-full flex flex-col items-center gap-8'>
            {/* Información del estudiante - Condicional */}
            {showUserInfo && userData && (
                <div className="bg-white rounded-lg shadow-md flex flex-col w-[95%]">
                    <div className="h-2 w-full bg-gradient-to-r from-[#8F141B] via-[#CE932C] to-[#4D626C] my-10"></div>
                    <div className="bg-[#F4E7E8] w-full flex items-center py-3 gap-4 px-4">
                        <PiStudentFill className='text-white bg-[#8F141B] px-3 py-3 rounded-full' size={50} />
                        <div className="flex flex-col">
                            <p className='text-2xl text-[#8F141B] font-semibold'>Información del Estudiante</p>
                            <span className='text-[3DBE0E2] font-light'>Datos académicos y personales</span>
                        </div>
                    </div>
                    <div className="my-10 w-full px-4 flex flex-col md:flex-row items-center gap-5">
                        <div className="w-full border border-gray-300 shadow-sm rounded-md flex items-center px-5 py-4 gap-5">
                            <LuUserRound className='text-[#8F141B] bg-[#F4E7E8] px-3 py-3 rounded-lg' size={48} />
                            <div className="flex flex-col">
                                <span className='text-[#4D626C] font-light text-xs'>NOMBRE COMPLETO</span>
                                <p className='text-md text-black font-semibold'>
                                    {userData?.nombres} {userData?.apellidos}
                                </p>
                            </div>
                        </div>
                        <div className="w-full border border-gray-300 shadow-sm rounded-md flex items-center px-5 py-4 gap-5">
                            <MdNumbers className='text-[#CE932C] bg-[#F7EEDF] px-3 py-3 rounded-lg' size={48} />
                            <div className="flex flex-col">
                                <span className='text-[#4D626C] font-light text-xs'>CÓDIGO ESTUDIANTIL</span>
                                <p className='text-md text-black font-semibold'>
                                    {userData?.codigo_estudiantil}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Selección de materias */}
            <div className="bg-white rounded-lg flex flex-col w-[95%] border border-gray-300 shadow-md">
                <div className="bg-[#EDEFF0] w-full flex items-center py-3 gap-4 px-4">
                    <IoBookOutline className='text-white bg-[#4D626C] px-3 py-3 rounded-full' size={50} />
                    <div className="flex flex-col">
                        <p className='text-2xl text-[#4D626C] font-semibold'>Selección de Materias</p>
                        <span className='text-[3DBE0E2] font-light'>Selecciona las materias para las que deseas hacer equivalencia</span>
                    </div>
                </div>

                <div className="pt-6 space-y-4 px-4 pb-6">
                    {[...new Set(courses.map(m => m.semestre))].map((numeroSemestre) => {
                        const abierto = semestresAbiertos.has(numeroSemestre);
                        const allSelected = todasSeleccionadasEnSemestre(numeroSemestre);
                        const materiasDelSemestre = obtenerMateriasPorSemestre(numeroSemestre);

                        return (
                            <div
                                key={numeroSemestre}
                                className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Trigger/Header */}
                                <div className="flex w-full items-center justify-between p-5 hover:bg-slate-100/50 transition-colors rounded-t-lg">
                                    <button
                                        type="button"
                                        onClick={() => toggleSemestreAbierto(numeroSemestre)}
                                        className="flex items-center gap-4 flex-1"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8F141B]/10 text-[#8F141B]">
                                            {abierto ? (
                                                <HiChevronDown className="w-5 h-5" />
                                            ) : (
                                                <HiChevronRight className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-lg text-slate-900">
                                                Semestre {capitalizarPrimeraLetra(numeroSemestre)}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {materiasDelSemestre.length}{" "}
                                                {materiasDelSemestre.length === 1 ? "materia" : "materias"}
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => toggleSemestre(numeroSemestre)}
                                        className={
                                            allSelected
                                                ? "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-[#8F141B] text-white hover:bg-[#8F141B]/80 border border-transparent"
                                                : "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100"
                                        }
                                    >
                                        {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
                                    </button>
                                </div>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${abierto ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="border-t border-slate-200 p-4 space-y-2 bg-slate-100/20">
                                        {materiasDelSemestre.map((materia) => {
                                            const isChecked = materiasSeleccionadas.has(materia.id);
                                            return (
                                                <div
                                                    key={materia.id}
                                                    className={
                                                        "flex items-center gap-4 rounded-lg p-4 border transition-all duration-200 " +
                                                        (isChecked
                                                            ? "bg-[#8F141B]/5 border-[#8F141B]/30 shadow-sm"
                                                            : "bg-white border-slate-200 hover:border-[#8F141B]/20 hover:bg-slate-100/30")
                                                    }
                                                >
                                                    <input
                                                        id={`materia-${materia.id}`}
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleMateria(materia.id)}
                                                        className="h-5 w-5 rounded border-slate-300 accent-[#CE932C]"
                                                        style={{
                                                            filter: isChecked ? 'invert(1) hue-rotate(180deg) brightness(1.2)' : 'none'
                                                        }}
                                                    />

                                                    <label
                                                        htmlFor={`materia-${materia.id}`}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                            <span className="font-medium text-slate-900">
                                                                {materia.nombre}
                                                            </span>
                                                            <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded w-fit">
                                                                {materia.creditos} créditos
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {materiasSeleccionadas.size > 0 && (
                        <div className="rounded-lg bg-gradient-to-r from-[#8F141B]/10 via-[#CE932C]/10 to-[#4D626C]/10 border-2 border-[#8F141B]/30 p-5 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8F141B] text-white font-bold">
                                    {materiasSeleccionadas.size}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {materiasSeleccionadas.size}{" "}
                                        {materiasSeleccionadas.size === 1
                                            ? "materia seleccionada"
                                            : "materias seleccionadas"}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Listas para procesar equivalencia
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            disabled={materiasSeleccionadas.size === 0 || loadingSubmit}
                            onClick={handleSubmitEquivalence}
                            className={`
                                min-w-[240px] h-12 text-base font-semibold shadow-lg transition-all duration-200 
                                flex items-center justify-center gap-2 rounded-lg px-6
                                ${materiasSeleccionadas.size > 0 && !loadingSubmit
                                    ? 'bg-[#8F141B] text-white hover:bg-[#8F141B]/90 cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {loadingSubmit ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-gray-400 rounded-full animate-spin"></div>
                                    Haciendo equivalencia...
                                </>
                            ) : (
                                <>
                                    <LuGraduationCap className="h-5 w-5" />
                                    Hacer Equivalencia
                                </>
                            )}
                        </button>
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

export default StudentHome;