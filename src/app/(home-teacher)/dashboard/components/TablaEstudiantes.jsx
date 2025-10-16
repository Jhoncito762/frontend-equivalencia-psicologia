import React from "react";
import { FiEye, FiEdit2 } from "react-icons/fi";

export default function TablaEstudiantes({
    estudiantes,
    onVerResultados,
    onHacerEquivalencia,
}) {
    return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm min-w-max table-fixed">
                <thead>
                    <tr className="bg-slate-100 text-left">
                        <th className="w-16 px-4 py-3 font-bold text-slate-800">ID</th>
                        <th className="w-1/3 px-4 py-3 font-bold text-slate-800">Nombre Completo</th>
                        <th className="w-1/3 px-4 py-3 font-bold text-slate-800">Código Estudiantil</th>
                        <th className="w-48 px-4 py-3 font-bold text-center text-slate-800">
                            Opciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {estudiantes.length === 0 ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="text-center py-8 text-slate-500"
                            >
                                No se encontraron estudiantes
                            </td>
                        </tr>
                    ) : (
                        estudiantes.map((estudiante) => (
                            <tr
                                key={estudiante.id}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                <td className="w-16 px-4 py-3 font-medium text-slate-900">
                                    {estudiante.id}
                                </td>
                                <td className="w-1/3 px-4 py-3 text-slate-900 truncate">
                                    {estudiante.nombre_completo}
                                </td>
                                <td className="w-1/3 px-4 py-3 font-mono text-slate-800">
                                    {estudiante.codigo_estudiantil}
                                </td>
                                <td className="w-48 px-4 py-3 text-center">
                                    {estudiante.equivalencia ? (
                                        <button
                                            onClick={() => onVerResultados(estudiante.id)}
                                            className="inline-flex items-center gap-2 bg-[#4D626C] hover:bg-[#4D626C]/80 text-white text-sm px-4 py-2 rounded-lg w-[180px] justify-center transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                        >
                                            <FiEye className="h-4 w-4" />
                                            Ver resultados
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onHacerEquivalencia(estudiante.id)}
                                            className="inline-flex items-center gap-2 bg-[#8F141B] hover:bg-[#8F141B]/90 text-white text-sm px-4 py-2 rounded-lg w-[180px] justify-center transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                        >
                                            <FiEdit2 className="h-4 w-4" />
                                            Hacer equivalencia
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
