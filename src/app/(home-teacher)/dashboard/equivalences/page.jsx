"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FiSearch, FiPlus, FiEye, FiEdit2 } from "react-icons/fi";
import { HiChevronDown } from "react-icons/hi";
import Table from "@/components/shared/Table";
import Paginator from "../components/Paginator";
import FormModal from "../components/FormModal";
import axiosPrivate from "@/apis/axiosPrivate";
import axiosPublic from "@/apis/axiosPublic";
import InputItem from "@/components/InputItem";
import { useAuthStore } from "@/hooks/authStore";

const Page = () => {
    const router = useRouter();
    const decodedToken = useAuthStore((state) => state.decodedToken);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("todos");
    const [filterCohorte, setFilterCohorte] = useState("todas");
    const [cohortes, setCohortes] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Verificar si el usuario es administrador
    const isAdmin = useMemo(() => {
        const userRoles = decodedToken?.roles || [];
        return userRoles.includes('administrador');
    }, [decodedToken]);

    const construirURL = () => {
        const endpoint = process.env.NEXT_PUBLIC_USER_DATA;
        const params = new URLSearchParams();

        // Parámetros fijos
        params.append('limit', itemsPerPage.toString());
        params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
        params.append('estado', 'true');
        params.append('estudiante', 'true');

        // Parámetros dinámicos - código estudiantil
        if (searchTerm.trim() !== '') {
            params.append('codigo_estudiantil', searchTerm.trim());
        }

        // Parámetros dinámicos - cohorte
        if (isAdmin) {
            // Si es administrador, usa el filtro seleccionado
            if (filterCohorte !== 'todas' && filterCohorte.trim() !== '') {
                params.append('cohorte', filterCohorte.trim());
            }
        } else {
            // Si no es administrador, aplica el cohorte del profesor automáticamente
            const teacherCohorte = localStorage.getItem('teacher_cohorte');
            if (teacherCohorte) {
                params.append('cohorte', teacherCohorte);
            }
        }

        // Parámetros dinámicos - tiene equivalencias
        if (filterEstado === 'con-equivalencia') {
            params.append('tiene_equivalencias', 'true');
        }
        // Si filterEstado es 'todos', no se agrega el parámetro tiene_equivalencias

        return `${endpoint}?${params.toString()}`;
    };

    // Función para obtener datos de la API
    const obtenerEstudiantes = async () => {
        try {
            setLoading(true);
            setError(null);

            const url = construirURL();

            const response = await axiosPrivate.get(url);

            // Actualizar información de paginación
            setTotalItems(response.data.total || 0);
            setItemsPerPage(response.data.limit || 10);

            // Mapear los datos del backend a la estructura que espera la tabla
            const estudiantesData = response.data.data.map(estudiante => ({
                id: estudiante.id,
                nombre_completo: `${estudiante.nombres} ${estudiante.apellidos}`,
                codigo_estudiantil: estudiante.codigo_estudiantil,
                // Usar directamente el campo tiene_equivalencia del backend
                equivalencia: estudiante.tiene_equivalencia,
                email: estudiante.email,
                cohorte: estudiante.cohorte ?? 'N/A',
                estado: estudiante.estado,
                created_at: estudiante.created_at,
                updated_at: estudiante.updated_at
            }));

            setEstudiantes(estudiantesData);
        } catch (err) {
            console.error('Error al obtener estudiantes:', err);
            setError(err.response?.data?.message || err.message || 'Error al cargar los datos');
            setEstudiantes([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener cohortes disponibles
    const obtenerCohortes = async () => {
        try {
            const response = await axiosPublic.get(
                `${process.env.NEXT_PUBLIC_COHORTES}`
            );

            const { data } = response.data;
            setCohortes(data || []);
        } catch (error) {
            console.error('No se pudieron traer las cohortes', error);
            setCohortes([]);
        }
    };

    // Efecto para cargar datos iniciales
    useEffect(() => {
        obtenerEstudiantes();
        if (isAdmin) {
            obtenerCohortes();
        }
    }, [isAdmin]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                obtenerEstudiantes();
            }
        }, 500); // Espera 500ms después de que el usuario deje de escribir

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterEstado, filterCohorte]);

    useEffect(() => {
        obtenerEstudiantes();
    }, [currentPage]);

    const handleSearchTermChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 15);
        setSearchTerm(digitsOnly);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleVerResultados = (id) => {
        sessionStorage.setItem('estudianteId', id.toString());

        router.push('/dashboard/student-equivalence');

        console.log(`ID del estudiante guardado en sessionStorage: ${id}`);
    };

    const handleHacerEquivalencia = (id) => {
        // Guardar el ID del estudiante en sessionStorage
        sessionStorage.setItem('estudianteId', id.toString());

        // Redirigir a la vista de selección de materias en el dashboard
        router.push('/dashboard/student-home');

        console.log(`ID del estudiante guardado en sessionStorage: ${id}`);
    };

    const columns = [
        {
            header: "ID",
            accessor: "id",
            className: "w-16",
            cellClassName: "w-16 font-medium text-slate-900",
        },
        {
            header: "Nombre Completo",
            accessor: "nombre_completo",
            className: "w-1/4",
            cellClassName: "w-1/3 text-slate-900 truncate",
        },
        {
            header: "Código Estudiantil",
            accessor: "codigo_estudiantil",
            className: "w-1/4",
            cellClassName: "w-1/4 font-mono text-slate-800",
        },
        {
            header: "Cohorte",
            accessor: "cohorte",
            className: "w-1/6",
            cellClassName: "w-1/6 text-slate-800",
        },
        {
            header: "Opciones",
            className: "w-48 text-center",
            cellClassName: "w-48 text-center",
            cell: (row) => (
                row.equivalencia ? (
                    <button
                        onClick={() => handleVerResultados(row.id)}
                        className="inline-flex items-center gap-2 bg-[#4D626C] hover:bg-[#4D626C]/80 text-white text-sm px-4 py-2 rounded-lg w-[180px] justify-center transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                        <FiEye className="h-4 w-4" />
                        Ver resultados
                    </button>
                ) : (
                    <button
                        onClick={() => handleHacerEquivalencia(row.id)}
                        className="inline-flex items-center gap-2 bg-[#8F141B] hover:bg-[#8F141B]/90 text-white text-sm px-4 py-2 rounded-lg w-[180px] justify-center transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Hacer equivalencia
                    </button>
                )
            ),
        },
    ];

    // state para controlar modal de registro

    return (
        <div className="min-h-screen flex flex-col px-4 gap-5 pb-8">
            {/* Encabezado */}
            <div className="flex flex-col self-start gap-2 mt-2">
                <h1 className="text-3xl text-[#8F141B] font-bold">
                    Gestión de Equivalencias
                </h1>
                <span className="text-sm text-[#4D626C]">
                    Administra las equivalencias realizadas por estudiantes
                </span>
            </div>

            {/* Filtros */}
            <div className="w-full bg-white rounded-lg shadow-md border border-gray-300 px-6 py-6 gap-6 flex flex-col">
                {/* Título de la sección de filtros */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h2 className="text-lg font-semibold text-slate-900">Filtros de búsqueda</h2>
                </div>

                {/* Contenedor de filtros en grid responsive */}
                <div className={`grid gap-4 ${
                    isAdmin 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]'
                }`}>
                    {/* Buscador por código */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-2 text-slate-900">
                            Código estudiantil
                        </label>
                        <InputItem
                            type="text"
                            placeholder="Ej: 202122003243"
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            maxLength={15}
                            inputMode="numeric"
                        />
                    </div>

                    {/* Filtro por estado */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-2 text-slate-900">
                            Estado
                        </label>
                        <div className="relative">
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="w-full appearance-none rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8F141B]/50 hover:border-slate-400 transition-colors"
                            >
                                <option value="todos">Todos</option>
                                <option value="con-equivalencia">Con equivalencia</option>
                            </select>
                            <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        </div>
                    </div>

                    {/* Filtro por Cohorte - Solo visible para administradores */}
                    {isAdmin && (
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2 text-slate-900">
                                Cohorte
                            </label>
                            <div className="relative">
                                <select
                                    value={filterCohorte}
                                    onChange={(e) => setFilterCohorte(e.target.value)}
                                    className="w-full appearance-none rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#8F141B]/50 hover:border-slate-400 transition-colors"
                                >
                                    <option value="todas">Todas</option>
                                    {cohortes.map((cohorte, index) => (
                                        <option key={index} value={cohorte}>
                                            {cohorte}
                                        </option>
                                    ))}
                                </select>
                                <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                    )}

                    {/* Botón de acción */}
                    <div className="flex flex-col justify-end">
                        <button
                            type="button"
                            onClick={() => setShowFormModal(true)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium bg-[#8F141B] hover:bg-[#8F141B]/90 text-white focus:outline-none focus:ring-2 focus:ring-[#8F141B]/50 transition-all shadow-sm hover:shadow-md h-[42px]"
                        >
                            <FiPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Realizar nueva equivalencia</span>
                            <span className="sm:hidden">Nueva equivalencia</span>
                        </button>
                    </div>
                </div>

                {/* Nota informativa */}
                <div className="bg-[#E5DDB8] px-4 py-3 rounded-lg border border-[#C7B363] flex gap-3 items-start">
                    <AiOutlineExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-slate-800">
                        <span className="font-bold">Nota:</span> El botón "Realizar nueva equivalencia" es para estudiantes que no aparecen en la tabla. Si el estudiante ya está registrado, utiliza las opciones de la tabla.
                    </span>
                </div>
            </div>

            {/* Tabla funcional */}
            <div className="flex-1">
                {loading ? (
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8F141B]"></div>
                            <span className="text-slate-600">Cargando estudiantes...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 text-center">
                        <div className="text-red-600 mb-2">Error al cargar los datos</div>
                        <div className="text-slate-500 text-sm mb-4">{error}</div>
                        <button
                            onClick={obtenerEstudiantes}
                            className="px-4 py-2 bg-[#8F141B] text-white rounded-md hover:bg-[#8F141B]/90 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={estudiantes}
                        noDataMessage="No se encontraron estudiantes"
                    />
                )}
            </div>

            {/* Paginador - Mostrar si hay datos y totalItems > 0 */}
            {!loading && !error && totalItems > 0 && (
                <div className="mt-4">
                    <Paginator
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                    {/* Debug info - remover en producción */}
                    <div className="text-xs text-gray-500 mt-2 text-center">
                        Mostrando {estudiantes.length} de {totalItems} estudiantes (Página {currentPage})
                    </div>
                </div>
            )}

            {/* Modal para registrar nuevo estudiante desde el dashboard */}
            <FormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
            />
        </div>
    );
};

export default Page;
