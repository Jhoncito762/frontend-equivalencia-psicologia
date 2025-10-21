import React from 'react';
import Icon from './Icon';

const { HiOutlineXMark } = Icon

const DataTreatmentModal = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-md h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#4D626C]">Tratamiento de Datos Personales</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#8F141B] font-semibold hover:text-[#CE932C] transition-colors"
                    >
                        <HiOutlineXMark size={36} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4 text-sm text-[#4D626C] leading-6 overflow-y-auto">
                    <p>
                        El programa de Psicologia informa que los datos personales suministrados serán tratados de acuerdo con
                        la normativa vigente sobre protección de datos personales y utilizados exclusivamente para la gestión del
                        proceso de homologación y equivalencias académicas.
                    </p>
                    <p>
                        Al aceptar, autorizas la recolección, almacenamiento, uso y consulta de tu información con fines
                        académicos, administrativos y de comunicación institucional. También autorizas la verificación ante otras
                        entidades educativas cuando sea necesario para completar el proceso.
                    </p>
                    <p>
                        Puedes ejercer tus derechos de conocer, actualizar, rectificar y suprimir tus datos personales enviando una
                        solicitud formal a las oficinas de la Facultad de Ciencias Sociales y Humanas o al correo oficial dispuesto
                        para tal fin por la universidad.
                    </p>
                    <p>
                        Si deseas revocar tu autorización o ampliar la información acerca del uso de tus datos, puedes comunicarte
                        con la oficina del programa.
                    </p>
                </div>

                <div className="px-6 pb-6 pt-2 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-[#8F141B] text-white py-3 font-semibold hover:bg-[#CE932C] transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTreatmentModal;
