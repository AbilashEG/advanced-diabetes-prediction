import html2pdf from 'html2pdf.js';

export const downloadReportAsPDF = async (elementId, filename = 'diabetes-report.pdf') => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error('Report element not found');
    }

    // Check if report has content
    if (!element.innerText.trim()) {
      throw new Error('No report content to export');
    }

    const options = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false // Disable logging in production
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };

    await html2pdf().set(options).from(element).save();
    return { success: true };
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate PDF' 
    };
  }
};
