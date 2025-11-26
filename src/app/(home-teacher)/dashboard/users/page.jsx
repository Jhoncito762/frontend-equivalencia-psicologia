'use client';
import axiosPrivate from '@/apis/axiosPrivate';
import Icon from '@/components/Icon'
import InputItem from '@/components/InputItem'
import Table from '@/components/shared/Table';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Paginator from '../components/Paginator';
import FormModalTeacher from './components/FormModalTeacher';
import ConfirmDeleteTeacher from './components/ConfirmDeleteTeacher';
import axiosPublic from '@/apis/axiosPublic';
import UniversityModal from '@/components/UniversityModal';

const { FiPlus, AiOutlineExclamationCircle, FiTrash2 } = Icon;

const page = () => {

    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [cohortes, setCohortes] = useState([])
    const [selectedCohorte, setSelectedCohorte] = useState(null);
    const [showUniversityModal, setShowUniversityModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        type: 'success',
        title: '',
        message: '',
        onAccept: null
    });

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [formData, setFormData] = useState({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        estado: true,
        acepta_tratamiento_datos: false,
        version_politicas: "1.0.0",
        cohorte: ''
    });

    const [formErrors, setFormErrors] = useState({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
    });

    const getTeachers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosPrivate.get(
                `${process.env.NEXT_PUBLIC_TEACHERS}&limit=-1&offset=0`
            );

            const { data = [], total = 0, limit = 10 } = response.data || {};

            const normalize = (value = "") => value.toLowerCase();
            const searchFilter = normalize(searchTerm.trim());

            const teachersData = data.map((teacher) => {
                const nombres = teacher.nombres?.trim() ?? "";
                const apellidos = teacher.apellidos?.trim() ?? "";
                const nombreCompleto = [nombres, apellidos].filter(Boolean).join(" ") || "Sin nombre";

                const roles = Array.isArray(teacher.roles)
                    ? teacher.roles
                        .map((role) => {
                            if (!role?.nombre_rol) return "";
                            const lower = role.nombre_rol.toLowerCase();
                            return lower.charAt(0).toUpperCase() + lower.slice(1);
                        })
                        .filter(Boolean)
                        .join(", ")
                    : "Sin rol";

                return {
                    id: teacher.id,
                    nombre_completo: nombreCompleto,
                    email: teacher.email ?? "Sin correo",
                    roles,
                    estado_label: teacher.estado ? "Activo" : "Inactivo",
                    cohortes: teacher.cohorte ?? 'N/A'
                };
            }).filter((teacher) => {
                if (!searchFilter) return true;
                return normalize(teacher.nombre_completo).includes(searchFilter);
            });

            setTotalItems(total || teachersData.length);
            setItemsPerPage(limit > 0 ? limit : teachersData.length || 10);

            setTeachers(teachersData)

        } catch (error) {
            console.error('Error al obtener profesores:', error);
            setError(error.response?.data?.message || error.message || 'Error al cargar los datos');
            setTeachers([]);
            setTotalItems(0);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getTeachers();
        getCohortes();
    }, []);

    const getCohortes = async () => {
        try {
            const response = await axiosPublic.get(
                `${process.env.NEXT_PUBLIC_COHORTES}`
            )

            const { data } = response.data

            const cohortesOptions = data.map(cohorte => ({
                value: cohorte,
                label: cohorte
            }));

            setCohortes(cohortesOptions)

        } catch (error) {
            console.error('No se pudieron traer las cohortes', error)
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                getTeachers();
            }
        }, 500); // Espera 500ms después de que el usuario deje de escribir

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        getTeachers();
    }, [currentPage]);

    const handleSearchTermChange = (e) => {
        const lettersOnly = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '').slice(0, 15);
        setSearchTerm(lettersOnly);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const resetFormData = () => {
        setFormData({
            nombres: "",
            apellidos: "",
            email: "",
            password: "",
            estado: true,
            acepta_tratamiento_datos: false,
            version_politicas: "1.0.0",
        });
        setFormErrors({ nombres: "", apellidos: "", email: "", password: "" });
        setModalError("");
    };

    const handleOpenModal = () => {
        resetFormData();
        setShowFormModal(true);
    };

    const handleCloseModal = () => {
        setShowFormModal(false);
        resetFormData();
    };

    const handleFormChange = (field, value) => {
        let nextValue = value;

        if (field === "nombres" || field === "apellidos") {
            nextValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [field]: nextValue,
        }));

        if (formErrors[field]) {
            setFormErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleOpenDeleteModal = (teacher) => {
        setTeacherToDelete(teacher);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setTeacherToDelete(null);
        setDeleteError("");
    };

    const handleDeleteTeacher = async () => {
        if (!teacherToDelete?.id) return;

        try {
            setDeleteLoading(true);
            setDeleteError("");

            await axiosPrivate.delete(`${process.env.NEXT_PUBLIC_USER_DATA}/${teacherToDelete.id}`);

            handleCloseDeleteModal();
            await getTeachers();
        } catch (deleteErr) {
            console.error('Error al eliminar docente:', deleteErr);
            setDeleteError(deleteErr.response?.data?.message || deleteErr.message || 'No se pudo eliminar el docente');
        } finally {
            setDeleteLoading(false);
        }
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
            className: "min-w-[220px] w-[220px]",
            cellClassName: "min-w-[220px] w-[220px] text-slate-900 break-words",
        },
        {
            header: "Correo electrónico",
            accessor: "email",
            className: "min-w-[240px] w-[240px]",
            cellClassName: "min-w-[240px] w-[240px] font-mono text-slate-800 break-all",
        },
        {
            header: "Roles",
            accessor: "roles",
            className: "min-w-[120px]",
            cellClassName: "min-w-[120px] text-slate-800",
        },
        {
            header: "Cohorte",
            accessor: "cohortes",
            className: "min-w-[100px]",
            cellClassName: "min-w-[100px] text-slate-800",
        },
        {
            header: "Estado",
            accessor: "estado_label",
            className: "w-32 text-center",
            cellClassName: "w-32 text-center",
        },
        {
            header: "Opciones",
            className: "w-48 text-center",
            cellClassName: "w-48 text-center",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(row)}
                        className="inline-flex items-center gap-2 bg-[#8F141B] hover:bg-[#91171d] text-white text-sm px-4 py-2 rounded-lg justify-center transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                        <FiTrash2 className="h-4 w-4" />
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    const handleCreateTeacher = async () => {
        const trimmed = {
            nombres: formData.nombres.trim(),
            apellidos: formData.apellidos.trim(),
            email: formData.email.trim(),
            password: formData.password,
        };

        const newErrors = {
            nombres: trimmed.nombres ? "" : "Campo obligatorio",
            apellidos: trimmed.apellidos ? "" : "Campo obligatorio",
            email: trimmed.email ? "" : "Campo obligatorio",
            password: trimmed.password ? "" : "Campo obligatorio",
        };

        setFormErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) {
            return;
        }

        if (!formData.acepta_tratamiento_datos) {
            setModalError("Debe aceptar el tratamiento de datos para continuar.");
            return;
        }

        try {
            setFormLoading(true);
            setModalError("");

            const payload = {
                nombres: trimmed.nombres,
                apellidos: trimmed.apellidos,
                email: trimmed.email,
                password: trimmed.password,
                estado: formData.estado,
                cohorte: formData.cohorte,
                "roles": [
                    2
                ],
                acepta_tratamiento_datos: formData.acepta_tratamiento_datos,
                version_politicas: formData.version_politicas,
            };

            await axiosPrivate.post(`${process.env.NEXT_PUBLIC_USER_DATA}`, payload);

            handleCloseModal();
            
            setModalConfig({
                type: 'success',
                title: 'Docente Registrado',
                message: 'El docente ha sido registrado exitosamente en el sistema.',
                onAccept: () => setShowUniversityModal(false)
            });
            setShowUniversityModal(true);
            
            await getTeachers();
        } catch (createError) {
            console.error('Error al crear docente:', createError);
            handleCloseModal();
            
            const errorMsg = createError.response?.data?.message || createError.message || 'No se pudo registrar el docente';
            setModalConfig({
                type: 'error',
                title: 'Error al Registrar',
                message: errorMsg,
                onAccept: () => {
                    setShowUniversityModal(false);
                    setShowFormModal(true);
                }
            });
            setShowUniversityModal(true);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex flex-col px-4 gap-5 pb-8'>
            <div className="flex flex-col self-start gap-2 mt-2">
                <h1 className="text-3xl text-[#8F141B] font-bold">
                    Gestión de Docentes
                </h1>
                <span className="text-sm text-[#4D626C]">
                    Administra los docentes creados en el sistema.
                </span>
            </div>
            <div className="w-full bg-white rounded-lg shadow-md border border-gray-300 px-6 py-6 gap-6 flex flex-col">
                {/* Título de la sección de filtros */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h2 className="text-lg font-semibold text-slate-900">Filtros de búsqueda</h2>
                </div>

                {/* Contenedor de filtros en grid responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                    {/* Buscador por nombre */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-2 text-slate-900">
                            Nombre del docente
                        </label>
                        <InputItem
                            type="text"
                            placeholder="Ej: Juan Perdomo"
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            maxLength={15}
                            inputMode="text"
                        />
                    </div>

                    {/* Botón de acción */}
                    <div className="flex flex-col justify-end">
                        <button
                            type="button"
                            onClick={handleOpenModal}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium bg-[#8F141B] hover:bg-[#8F141B]/90 text-white focus:outline-none focus:ring-2 focus:ring-[#8F141B]/50 transition-all shadow-sm hover:shadow-md h-[42px]"
                        >
                            <FiPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Registrar nuevo docente</span>
                            <span className="sm:hidden">Nuevo docente</span>
                        </button>
                    </div>
                </div>

                {/* Nota informativa */}
                <div className="bg-[#E5DDB8] px-4 py-3 rounded-lg border border-[#C7B363] flex gap-3 items-start">
                    <AiOutlineExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-slate-800">
                        <span className="font-bold">Nota:</span> El botón "Registrar nuevo docente" es para crear únicamente docentes en el sistema.
                    </span>
                </div>
            </div>
            <div className="flex-1">
                {loading ? (
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8F141B]"></div>
                            <span className="text-slate-600">Cargando docentes...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-8 text-center">
                        <div className="text-red-600 mb-2">Error al cargar los datos</div>
                        <div className="text-slate-500 text-sm mb-4">{error}</div>
                        <button
                            onClick={getTeachers}
                            className="px-4 py-2 bg-[#8F141B] text-white rounded-md hover:bg-[#8F141B]/90 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={teachers}
                        noDataMessage="No se encontraron docentes"
                    />
                )}
            </div>
            {!loading && !error && totalItems > 0 && (
                <div className="">
                    <Paginator
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                    {/* Debug info - remover en producción */}
                    <div className="text-xs text-gray-500 mt-2 text-center">
                        Mostrando {teachers.length} de {totalItems} docentes (Página {currentPage})
                    </div>
                </div>
            )}

            <FormModalTeacher
                isOpen={showFormModal}
                onClose={handleCloseModal}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleCreateTeacher}
                loading={formLoading}
                errors={formErrors}
                errorMessage={modalError}
                cohorteData={cohortes}
            />

            <ConfirmDeleteTeacher
                isOpen={showDeleteModal}
                teacherName={teacherToDelete?.nombre_completo ?? "este docente"}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteTeacher}
                loading={deleteLoading}
                errorMessage={deleteError}
            />

            <UniversityModal
                isOpen={showUniversityModal}
                onClose={() => {
                    setShowUniversityModal(false);
                    if (modalConfig.onAccept) {
                        modalConfig.onAccept();
                    }
                }}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div>

    )
}

export default page