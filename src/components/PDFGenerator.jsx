import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Icon from '@/components/Icon';

const { FaRegFilePdf } = Icon;

const PDFGenerator = ({ 
    data, 
    studentData, 
    className = '',
    buttonText = 'Exportar PDF',
    disabled = false 
}) => {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Función para agrupar materias por semestre (igual que en el componente principal)
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

    const generatePDF = async () => {
        try {
            setIsGeneratingPDF(true);
            
            const materiasPorSemestre = agruparPorSemestre(data);
            
            // Create a temporary container for PDF generation
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            pdfContainer.style.top = '0';
            pdfContainer.style.width = '2000px'; // Ancho más grande para acomodar todos los semestres
            pdfContainer.style.backgroundColor = '#f7f7f7';
            pdfContainer.style.padding = '20px';
            pdfContainer.style.fontFamily = 'Arial, sans-serif';
            
            // Create PDF content with grid layout instead of flex
            pdfContainer.innerHTML = `
                <div style="background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="font-size: 24px; font-weight: bold; color: #8F141B; margin-bottom: 5px;">Malla Curricular - PSICOLOGIA - USCO</h1>
                        <p style="font-size: 14px; color: #839198;">ACUERDO CA 010 DE 2025</p>
                        <p style="font-size: 14px; color: #8F141B; background: #F4E7E8; padding: 5px 10px; border-radius: 15px; display: inline-block; margin-top: 10px;">
                            ${Object.keys(data).length} materias
                        </p>
                        ${studentData ? `
                            <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 6px;">
                                <p style="font-size: 16px; color: #1e293b; margin: 0;">
                                    <strong>Estudiante:</strong> ${studentData.nombre || 'N/A'}
                                </p>
                                ${studentData.codigo ? `
                                    <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">
                                        <strong>Código:</strong> ${studentData.codigo}
                                    </p>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Leyenda -->
                    <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 3px;"></div>
                            <span style="font-size: 12px; font-weight: 500;">Completo</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 3px;"></div>
                            <span style="font-size: 12px; font-weight: 500;">Incompleto</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; background: #fecaca; border: 1px solid #fca5a5; border-radius: 3px;"></div>
                            <span style="font-size: 12px; font-weight: 500;">No Aplica</span>
                        </div>
                    </div>
                </div>
                
                <!-- Layout horizontal para todos los semestres -->
                <div style="display: flex; gap: 15px; justify-content: space-between; min-height: 600px;">
                    ${materiasPorSemestre.map(sem => `
                        <div style="background: white; border-radius: 6px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; min-width: 160px; max-width: 180px;">
                            <div style="text-align: center; margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 4px; border: 1px solid rgba(143, 20, 27, 0.2);">
                                <h3 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 3px;">${sem.label}</h3>
                                <p style="font-size: 11px; color: #64748b;">Total: <span style="color: #8F141B; font-weight: 600;">${sem.totalCreditos} cr.</span></p>
                            </div>
                            
                            ${sem.materias.map(materia => {
                                const bgColor = materia.estado === 'COMPLETO' ? '#dcfce7' : 
                                               materia.estado === 'INCOMPLETO' ? '#fef3c7' : '#fecaca';
                                const borderColor = materia.estado === 'COMPLETO' ? '#bbf7d0' : 
                                                   materia.estado === 'INCOMPLETO' ? '#fde68a' : '#fca5a5';
                                const estado = materia.estado === 'COMPLETO' ? 'HOMOL.' : 
                                              materia.estado === 'INCOMPLETO' ? 'INCOMP.' : 'NO APL.';
                                
                                return `
                                    <div style="margin-bottom: 8px; padding: 8px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 4px;">
                                        <h4 style="font-size: 10px; font-weight: bold; color: #1e293b; margin-bottom: 5px; line-height: 1.2; height: 28px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${materia.nombre}</h4>
                                        
                                        <div style="margin-bottom: 5px;">
                                            <p style="font-size: 8px; color: #4b5563; line-height: 1.2; height: 20px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${materia.observacion}</p>
                                        </div>
                                        
                                        <div style="padding-top: 4px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-size: 8px; font-weight: 500; color: #1e293b;">${materia.num_creditos} cr.</span>
                                            <span style="font-size: 7px; color: #64748b; font-weight: 500;">${estado}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Footer -->
                <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; text-align: center;">
                    <p style="font-size: 12px; color: #64748b; margin: 0;">
                        Documento generado el ${new Date().toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            `;
            
            document.body.appendChild(pdfContainer);
            
            // Generate canvas from the container
            const canvas = await html2canvas(pdfContainer, {
                scale: 1.5, // Reducido para mejor performance con el ancho mayor
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#f7f7f7',
                width: 2000,
                height: pdfContainer.scrollHeight
            });
            
            // Remove temporary container
            document.body.removeChild(pdfContainer);
            
            // Create PDF in landscape orientation
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a3'); // A3 landscape para más espacio
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Si la imagen es muy alta, ajustar para que quepa en una página
            const maxHeight = pdfHeight - 20; // 10mm top and bottom margins
            let finalHeight = imgHeight;
            let finalWidth = imgWidth;
            
            if (imgHeight > maxHeight) {
                finalHeight = maxHeight;
                finalWidth = (canvas.width * maxHeight) / canvas.height;
            }
            
            // Centrar la imagen si es necesario
            const xOffset = (pdfWidth - finalWidth) / 2;
            const yOffset = (pdfHeight - finalHeight) / 2;
            
            // Add single page
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
            
            // Save PDF
            const fileName = `Malla_Curricular_${studentData?.nombre?.replace(/\s+/g, '_') || 'Estudiante'}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            return { success: true };
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            return { 
                success: false, 
                error: 'No se pudo generar el archivo PDF. Por favor, intenta nuevamente.' 
            };
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <button 
            onClick={generatePDF}
            disabled={disabled || isGeneratingPDF}
            className={`bg-[#8F141B] rounded-lg flex items-center gap-2 text-white py-2 px-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#8F141B]/90 ${className}`}
        >
            <FaRegFilePdf />
            {isGeneratingPDF ? 'Generando PDF...' : buttonText}
        </button>
    );
};

export default PDFGenerator;