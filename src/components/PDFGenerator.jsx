import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Icon from '@/components/Icon';

const { FaRegFilePdf } = Icon;

const PDFGenerator = ({ 
    data, 
    studentData, 
    resumen = {}, 
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
            const resumenData = resumen || {};
            const homologadas = Number(resumenData.homologados ?? resumenData.homologado ?? 0);
            const incompletas = Number(resumenData.incompletos ?? 0);
            const noAplica = Number(resumenData.noAplica ?? resumenData.no_aplica ?? 0);
            const creditosAntigua = Number(resumenData.creditosCompletadosMallaAntigua ?? resumenData.creditos_completados_malla_antigua ?? 0);
            const creditosHomologadosNueva = Number(resumenData.creditosHomologadosMallaNueva ?? resumenData.creditos_homologados_malla_nueva ?? 0);
            const totalCreditosNueva = Number(resumenData.totalCreditosMallaNueva ?? resumenData.total_creditos_malla_nueva ?? 0);
            const progresoNuevaRaw = totalCreditosNueva > 0 ? (creditosHomologadosNueva / totalCreditosNueva) * 100 : 0;
            const progresoNueva = Number.isFinite(progresoNuevaRaw) ? Math.max(0, Math.min(100, Math.round(progresoNuevaRaw))) : 0;

            const createTempContainer = (width, bg = '#f7f7f7') => {
                const container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.top = '0';
                container.style.width = `${width}px`;
                container.style.backgroundColor = bg;
                container.style.padding = '20px';
                container.style.fontFamily = 'Arial, sans-serif';
                return container;
            };

            // Contenedor horizontal para la malla
            const mallaContainer = createTempContainer(2000);
            mallaContainer.innerHTML = `
                <div style="background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="font-size: 24px; font-weight: bold; color: #8F141B; margin-bottom: 5px;">Malla Curricular - PSICOLOGIA - USCO</h1>
                        <p style="font-size: 14px; color: #839198;">ACUERDO CA 010 DE 2025</p>
                        ${studentData ? `
                            <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
                                <p style="font-size: 15px; color: #1e293b; margin: 0;">
                                    <span style="font-weight: 600;">Estudiante:</span> ${studentData.nombres || ''} ${studentData.apellidos || ''}
                                </p>
                                <p style="font-size: 13px; color: #64748b; margin: 5px 0 0 0;">
                                    <span style="font-weight: 500;">Código:</span> ${studentData.codigo_estudiantil || ''}
                                </p>
                            </div>
                        ` : ''}
                        <p style="font-size: 14px; color: #8F141B; background: #F4E7E8; padding: 5px 10px; border-radius: 15px; display: inline-block; margin-top: 10px;">
                            ${Object.keys(data).length} materias
                        </p>
                    </div>
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
                <div style="display: flex; gap: 15px; justify-content: space-between; min-height: 600px;">
                    ${materiasPorSemestre.map(sem => `
                        <div style="background: white; border-radius: 6px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; min-width: 160px; max-width: 180px;">
                            <div style="text-align: center; margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 4px; border: 1px solid rgba(143, 20, 27, 0.2);">
                                <h3 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 3px;">${sem.label}</h3>
                                <p style="font-size: 11px; color: #64748b;">Total: <span style="color: #8F141B; font-weight: 600;">${sem.totalCreditos} cr.</span></p>
                            </div>
                            ${sem.materias.map(materia => {
                                const bgColor = materia.estado === 'COMPLETO' ? '#dcfce7' : materia.estado === 'INCOMPLETO' ? '#fef3c7' : '#fecaca';
                                const borderColor = materia.estado === 'COMPLETO' ? '#bbf7d0' : materia.estado === 'INCOMPLETO' ? '#fde68a' : '#fca5a5';
                                const estado = materia.estado === 'COMPLETO' ? 'HOMOL.' : materia.estado === 'INCOMPLETO' ? 'INCOMP.' : 'NO APL.';
                                return `
                                    <div style="margin-bottom: 8px; padding: 8px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 4px;">
                                        <h4 style="font-size: 10px; font-weight: bold; color: #1e293b; margin-bottom: 5px; line-height: 1.2; height: 28px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${materia.nombre}</h4>
                                        <div style="margin-bottom: 5px;">
                                            <p style="font-size: 8px; color: #4b5563; line-height: 1.2; min-height: 45px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">${materia.observacion}</p>
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
            `;

            document.body.appendChild(mallaContainer);
            const mallaCanvas = await html2canvas(mallaContainer, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#f7f7f7',
                width: 2000,
                height: mallaContainer.scrollHeight
            });
            document.body.removeChild(mallaContainer);

            // Contenedor vertical para el resumen
            const resumenContainer = createTempContainer(1200, '#ffffff');
            resumenContainer.innerHTML = `
                <div style="max-width: 1100px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px;">
                    <h2 style="font-size: 26px; color: #8F141B; font-weight: bold; text-align: center; margin-bottom: 12px;">Resumen de Equivalencia</h2>
                    <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 30px;">Análisis consolidado del proceso de homologación hacia la nueva malla curricular</p>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
                        <div style="border: 2px solid #22c55e; background: #f0fdf4; padding: 18px; border-radius: 12px; min-height: 150px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px;">
                                <span style="font-size: 40px; color: #22c55e;">&#10003;</span>
                                <span style="font-size: 32px; font-weight: bold; color: #15803d;">${homologadas}</span>
                            </div>
                            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 6px;">Materias homologadas</h3>
                            <p style="font-size: 13px; color: #4b5563;">Materias aprobadas exitosamente</p>
                        </div>

                        <div style="border: 2px solid #f59e0b; background: #fef3c7; padding: 18px; border-radius: 12px; min-height: 150px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px;">
                                <span style="font-size: 40px; color: #d97706;">&#9888;</span>
                                <span style="font-size: 32px; font-weight: bold; color: #b45309;">${incompletas}</span>
                            </div>
                            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 6px;">Materias incompletas</h3>
                            <p style="font-size: 13px; color: #4b5563;">Requieren atención adicional</p>
                        </div>

                        <div style="border: 2px solid #f87171; background: #fee2e2; padding: 18px; border-radius: 12px; min-height: 150px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px;">
                                <span style="font-size: 40px; color: #dc2626;">&#10005;</span>
                                <span style="font-size: 32px; font-weight: bold; color: #b91c1c;">${noAplica}</span>
                            </div>
                            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 6px;">No aplican</h3>
                            <p style="font-size: 13px; color: #4b5563;">Materias sin homologación</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 32px;">
                        <div style="border: 2px solid #e87e84; background: #fce7e7; padding: 20px; border-radius: 12px; min-height: 160px;">
                            <h3 style="font-size: 18px; font-weight: 600; color: #8F141B; margin-bottom: 14px;">Malla antigua</h3>
                            <p style="font-size: 26px; font-weight: bold; color: #8F141B; margin: 0;">${creditosAntigua}<span style="font-size: 14px; color: #4b5563; font-weight: 500;"> créditos completados</span></p>
                            <div style="height: 10px; background: #8F141B; border-radius: 999px; margin-top: 36px;"></div>
                        </div>

                        <div style="border: 2px solid #e0d9ae; background: #f9f6ed; padding: 20px; border-radius: 12px; min-height: 160px;">
                            <h3 style="font-size: 18px; font-weight: 600; color: #9a8742; margin-bottom: 14px;">Malla nueva</h3>
                            <p style="font-size: 26px; font-weight: bold; color: #9a8742; margin: 0;">${creditosHomologadosNueva}<span style="font-size: 14px; color: #4b5563; font-weight: 500;"> de ${totalCreditosNueva} créditos</span></p>
                            <div style="width: 100%; height: 14px; background: #e9f0e6; border-radius: 999px; margin-top: 32px; overflow: hidden;">
                                <div style="width: ${progresoNueva}%; height: 100%; background: #c7b363; border-radius: 999px;"></div>
                            </div>
                            <p style="font-size: 13px; color: #4b5563; margin-top: 10px;">${progresoNueva}% completado</p>
                        </div>
                    </div>

                    <div style="margin-top: 36px; text-align: center; font-size: 12px; color: #64748b;">
                        Documento generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `;

            document.body.appendChild(resumenContainer);
            const resumenCanvas = await html2canvas(resumenContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 1200,
                height: resumenContainer.scrollHeight
            });
            document.body.removeChild(resumenContainer);

            // Create PDF and agregar páginas
            const pdf = new jsPDF('l', 'mm', 'a3');

            const addCanvasToPdf = (doc, canvas, margin = 10) => {
                const imgData = canvas.toDataURL('image/png');
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const availableWidth = pageWidth - margin * 2;
                const availableHeight = pageHeight - margin * 2;
                const imgHeight = (canvas.height * availableWidth) / canvas.width;
                let drawWidth = availableWidth;
                let drawHeight = imgHeight;

                if (imgHeight > availableHeight) {
                    drawHeight = availableHeight;
                    drawWidth = (canvas.width * availableHeight) / canvas.height;
                }

                const xOffset = (pageWidth - drawWidth) / 2;
                const yOffset = (pageHeight - drawHeight) / 2;
                doc.addImage(imgData, 'PNG', xOffset, yOffset, drawWidth, drawHeight);
            };

            addCanvasToPdf(pdf, mallaCanvas);
            pdf.addPage('a4', 'p');
            addCanvasToPdf(pdf, resumenCanvas, 15);

            const nombreCompleto = studentData?.nombres && studentData?.apellidos 
                ? `${studentData.nombres}_${studentData.apellidos}`.replace(/\s+/g, '_')
                : 'Estudiante';
            const fileName = `Malla_Curricular_${nombreCompleto}_${new Date().toISOString().split('T')[0]}.pdf`;
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
            className={`bg-[#8F141B] rounded-lg w-40 flex items-center justify-center gap-2 text-white py-2 px-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#8F141B]/90 ${className}`}
        >
            <FaRegFilePdf />
            {isGeneratingPDF ? 'Generando PDF...' : buttonText}
        </button>
    );
};

export default PDFGenerator;