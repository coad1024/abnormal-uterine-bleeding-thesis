/**
 * PDF export functionality for the AUB Thesis Dashboard
 * Uses pdfmake library to generate downloadable PDF reports
 */

/**
 * Initialize PDF export functionality
 */
function initPdfExport() {
    const pdfExportButton = document.getElementById('pdf-export');
    
    if (!pdfExportButton) return;
    
    pdfExportButton.addEventListener('click', () => {
        // Show loading indicator
        const originalContent = pdfExportButton.innerHTML;
        pdfExportButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        pdfExportButton.disabled = true;
        
        // Generate PDF in next tick to allow UI update
        setTimeout(() => {
            generatePdf(() => {
                // Restore button state
                pdfExportButton.innerHTML = originalContent;
                pdfExportButton.disabled = false;
            });
        }, 100);
    });
}

/**
 * Generate and download PDF report
 * @param {Function} callback - Function to call when complete
 */
function generatePdf(callback) {
    try {
        // Define document content
        const docDefinition = {
            info: {
                title: 'AUB Thesis Dashboard Report',
                author: 'AUB Thesis Dashboard',
                subject: 'Histopathological Patterns in Abnormal Uterine Bleeding',
                keywords: 'AUB, histopathology, research, thesis'
            },
            pageMargins: [40, 60, 40, 60],
            header: {
                text: 'AUB Histopathological Dashboard Report',
                alignment: 'center',
                margin: [0, 20, 0, 0],
                fontSize: 10,
                color: '#666666'
            },
            footer: function(currentPage, pageCount) {
                return {
                    text: `Page ${currentPage} of ${pageCount}`,
                    alignment: 'center',
                    fontSize: 8,
                    color: '#666666',
                    margin: [0, 0, 0, 20]
                };
            },
            content: [
                {
                    text: 'Histopathological Patterns in Abnormal Uterine Bleeding (AUB)',
                    style: 'header',
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: new Date().toLocaleDateString(),
                    alignment: 'center',
                    fontSize: 10,
                    margin: [0, 0, 0, 30],
                    color: '#666666'
                },
                // Introduction section
                {
                    text: 'Introduction',
                    style: 'sectionHeader'
                },
                {
                    text: getTextContent('overview') || 'This interactive dashboard presents the key findings from a thesis on AUB, exploring the spectrum of endometrial changes and their correlation with patient data to provide a comprehensive diagnostic overview.',
                    style: 'paragraph'
                },
                
                // Demographics section
                {
                    text: 'Demographics',
                    style: 'sectionHeader',
                    pageBreak: 'before'
                },
                {
                    text: getTextContent('demographics') || 'Analysis of patient demographics including age distribution, parity, presenting complaints, and drug history.',
                    style: 'paragraph'
                },
                
                // Findings section
                {
                    text: 'Histopathological Findings',
                    style: 'sectionHeader',
                    pageBreak: 'before'
                },
                {
                    text: getTextContent('findings') || 'Analysis of histopathological patterns observed in the study, including their distribution and characteristics.',
                    style: 'paragraph'
                },
                
                // Correlations section
                {
                    text: 'Statistical Correlations',
                    style: 'sectionHeader',
                    pageBreak: 'before'
                },
                {
                    text: getTextContent('correlations') || 'Examination of relationships between histopathological findings and patient parameters.',
                    style: 'paragraph'
                },
                
                // Discussion section
                {
                    text: 'Discussion',
                    style: 'sectionHeader',
                    pageBreak: 'before'
                },
                {
                    text: getTextContent('discussion') || 'Discussion of the findings and their implications for clinical practice and research.',
                    style: 'paragraph'
                },
                
                // Conclusion section
                {
                    text: 'Conclusion',
                    style: 'sectionHeader',
                    pageBreak: 'before'
                },
                {
                    text: getTextContent('conclusion') || 'Summary of key findings and recommendations based on the research.',
                    style: 'paragraph'
                }
            ],
            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    color: '#0d9488'
                },
                sectionHeader: {
                    fontSize: 16,
                    bold: true,
                    color: '#0d9488',
                    margin: [0, 20, 0, 10]
                },
                paragraph: {
                    fontSize: 12,
                    margin: [0, 0, 0, 15],
                    lineHeight: 1.5
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };
        
        // Generate and download the PDF
        pdfMake.createPdf(docDefinition).download('AUB_Dashboard_Report.pdf');
        
        // Call callback function when done
        if (typeof callback === 'function') {
            callback();
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
        
        if (typeof callback === 'function') {
            callback();
        }
    }
}

/**
 * Get text content from a section
 * @param {string} sectionId - The ID of the section to extract text from
 * @returns {string} - Extracted text content
 */
function getTextContent(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return '';
    
    // Get all paragraphs in the section
    const paragraphs = section.querySelectorAll('p');
    let content = '';
    
    paragraphs.forEach(p => {
        // Skip paragraphs that might be UI elements
        if (p.closest('.card') || p.closest('.chart-container') || p.closest('.gallery-item')) {
            return;
        }
        
        content += p.textContent + '\n\n';
    });
    
    return content.trim();
}