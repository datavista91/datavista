import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { Slide } from './SlideRenderer';

export interface ExportOptions {
  format: 'pdf' | 'pptx';
  quality: 'low' | 'medium' | 'high';
  includeNotes?: boolean;
  orientation?: 'landscape' | 'portrait';
}

export class PresentationExporter {
  static async exportToPDF(
    slides: Slide[], 
    title: string, 
    options: ExportOptions = { format: 'pdf', quality: 'high', orientation: 'landscape' }
  ): Promise<void> {
    try {
      const pdf = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        if (i > 0) {
          pdf.addPage();
        }        // Create a temporary slide element for rendering
        const slideElement = await this.createSlideElement(slide);
        document.body.appendChild(slideElement);

        try {
          // Capture slide as canvas
          const canvas = await html2canvas(slideElement, {
            width: 1920,
            height: 1080,
            scale: options.quality === 'high' ? 2 : options.quality === 'medium' ? 1.5 : 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
          });

          // Calculate dimensions to fit page while maintaining aspect ratio
          const imgWidth = pageWidth - 20; // 10mm margin on each side
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let finalHeight = imgHeight;
          let finalWidth = imgWidth;
          
          if (imgHeight > pageHeight - 20) { // 10mm margin top/bottom
            finalHeight = pageHeight - 20;
            finalWidth = (canvas.width * finalHeight) / canvas.height;
          }

          const x = (pageWidth - finalWidth) / 2;
          const y = (pageHeight - finalHeight) / 2;

          // Add image to PDF
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

          // Add slide number
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`${i + 1} / ${slides.length}`, pageWidth - 20, pageHeight - 5);

        } finally {
          // Clean up
          document.body.removeChild(slideElement);
        }
      }      // Add metadata
      pdf.setProperties({
        title: title,
        subject: 'DataVista AI-Generated Presentation',
        author: 'DataVista Analytics',
        creator: 'DataVista Platform'
      });

      // Save the PDF
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pdf`);

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export presentation to PDF');
    }
  }  static async exportToPPTX(
    slides: Slide[], 
    title: string
  ): Promise<void> {
    try {
      // Create new PowerPoint presentation
      const pres = new PptxGenJS();
      
      // Set presentation properties and layout
      pres.defineLayout({ name: 'DATAVISTA_16x9', width: 13.33, height: 7.5 });
      pres.layout = 'DATAVISTA_16x9';
        // Set presentation metadata
      pres.author = 'DataVista Analytics';
      pres.company = 'DataVista';
      pres.title = title;
      pres.subject = 'AI-Generated Data Analysis Presentation';
      
      // Add slides with enhanced formatting
      slides.forEach((slide, index) => {
        const pptSlide = pres.addSlide({ masterName: 'DATAVISTA_16x9' });
          // Professional gradient background
        pptSlide.background = { color: index === 0 ? '1e3a8a' : '1e40af' }; // Darker blue for title slide
        
        switch (slide.type) {
          case 'title':
            // Enhanced title slide with company branding
            pptSlide.addText(slide.title, {
              x: 0.5,
              y: 2.5,
              w: 12.33,
              h: 1.5,
              fontSize: 48,
              bold: true,
              color: 'FFFFFF',
              align: 'center',
              fontFace: 'Calibri',
              shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '000000', opacity: 0.5 }
            });
            
            if (slide.subtitle) {
              pptSlide.addText(slide.subtitle, {
                x: 0.5,
                y: 4.2,
                w: 12.33,
                h: 0.8,
                fontSize: 24,
                color: 'E5E7EB',
                align: 'center',
                fontFace: 'Calibri Light'
              });
            }
            
            // Company branding footer
            pptSlide.addText('DataVista AI Analytics Platform', {
              x: 0.5,
              y: 6.8,
              w: 12.33,
              h: 0.4,
              fontSize: 16,
              color: 'CBD5E1',
              align: 'center',
              fontFace: 'Calibri',
              italic: true
            });
            
            // Decorative line
            pptSlide.addShape('line', {
              x: 4.5,
              y: 5.2,
              w: 4.33,
              h: 0,
              line: { color: 'FFFFFF', width: 2 }
            });
            break;
            
          case 'content':
          case 'agenda':
            // Professional content slide
            pptSlide.addText(slide.title, {
              x: 0.8,
              y: 0.8,
              w: 11.73,
              h: 0.8,
              fontSize: 36,
              bold: true,
              color: 'FFFFFF',
              fontFace: 'Calibri'
            });
            
            // Decorative underline
            pptSlide.addShape('line', {
              x: 0.8,
              y: 1.7,
              w: 3,
              h: 0,
              line: { color: '60A5FA', width: 3 }
            });
            
            // Parse and format content
            const contentLines = slide.content
              .split('\n')
              .filter(line => line.trim())
              .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
              .slice(0, 8);
            
            if (contentLines.length > 0) {
              const bulletPoints = contentLines.map(line => ({
                text: line,
                options: { bullet: true, indentLevel: 0 }
              }));
              
              pptSlide.addText(bulletPoints, {
                x: 0.8,
                y: 2.3,
                w: 11.73,
                h: 4.5,
                fontSize: 20,
                color: 'FFFFFF',
                fontFace: 'Calibri',
                bullet: { type: 'bullet', style: '•', startAt: 1 },
                lineSpacing: 32
              });
            }
            break;
            
          case 'metrics':
            // Enhanced metrics slide
            pptSlide.addText(slide.title, {
              x: 0.8,
              y: 0.8,
              w: 11.73,
              h: 0.8,
              fontSize: 36,
              bold: true,
              color: 'FFFFFF',
              fontFace: 'Calibri'
            });
            
            // Decorative underline
            pptSlide.addShape('line', {
              x: 0.8,
              y: 1.7,
              w: 3,
              h: 0,
              line: { color: '34D399', width: 3 }
            });
            
            // Professional metrics grid
            if (slide.metrics && slide.metrics.length > 0) {
              slide.metrics.slice(0, 6).forEach((metric, metricIndex) => {
                const col = metricIndex % 3;
                const row = Math.floor(metricIndex / 3);
                const x = 0.8 + (col * 4);
                const y = 2.8 + (row * 2.2);                // Metric card background with rounded corners
                pptSlide.addShape('roundRect', {
                  x: x,
                  y: y,
                  w: 3.5,
                  h: 1.8,
                  fill: { color: 'FFFFFF', transparency: 85 },
                  line: { color: '60A5FA', width: 2 }
                });
                
                // Metric value with emphasis
                pptSlide.addText(String(metric.value), {
                  x: x + 0.2,
                  y: y + 0.2,
                  w: 3.1,
                  h: 0.8,
                  fontSize: 32,
                  bold: true,
                  color: '1e40af',
                  align: 'center',
                  fontFace: 'Calibri'
                });
                
                // Metric label
                pptSlide.addText(metric.label, {
                  x: x + 0.2,
                  y: y + 1.1,
                  w: 3.1,
                  h: 0.5,
                  fontSize: 16,
                  color: '475569',
                  align: 'center',
                  fontFace: 'Calibri'
                });
              });
            }
            break;
            
          case 'chart':
            // Chart slide placeholder with better formatting
            pptSlide.addText(slide.title, {
              x: 0.8,
              y: 0.8,
              w: 11.73,
              h: 0.8,
              fontSize: 36,
              bold: true,
              color: 'FFFFFF',
              fontFace: 'Calibri'
            });
            
            // Chart placeholder
            pptSlide.addShape('rect', {
              x: 1.5,
              y: 2.5,
              w: 10.33,
              h: 4,
              fill: { color: 'FFFFFF', transparency: 90 },
              line: { color: '94A3B8', width: 1, dashType: 'dash' }
            });
            
            pptSlide.addText('📊 Chart will be embedded here\n(Interactive charts available in web version)', {
              x: 1.5,
              y: 4,
              w: 10.33,
              h: 1,
              fontSize: 18,
              color: '64748B',
              align: 'center',
              fontFace: 'Calibri'
            });
            break;
            
          case 'conclusion':
            // Professional conclusion slide
            pptSlide.addText('Thank You', {
              x: 0.5,
              y: 2,
              w: 12.33,
              h: 1.5,
              fontSize: 52,
              bold: true,
              color: 'FFFFFF',
              align: 'center',
              fontFace: 'Calibri',
              shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '000000', opacity: 0.5 }
            });
            
            pptSlide.addText('Questions & Discussion', {
              x: 0.5,
              y: 4,
              w: 12.33,
              h: 0.8,
              fontSize: 28,
              color: 'E5E7EB',
              align: 'center',
              fontFace: 'Calibri Light'
            });
            
            // Professional footer
            pptSlide.addText('Generated by DataVista AI Analytics Platform', {
              x: 0.5,
              y: 6.5,
              w: 12.33,
              h: 0.4,
              fontSize: 14,
              color: 'CBD5E1',
              align: 'center',
              fontFace: 'Calibri',
              italic: true
            });
            
            // Contact decoration
            pptSlide.addShape('line', {
              x: 5,
              y: 5.2,
              w: 3.33,
              h: 0,
              line: { color: 'FFFFFF', width: 2 }
            });
            break;
            
          default:
            // Enhanced default slide
            pptSlide.addText(slide.title, {
              x: 0.8,
              y: 0.8,
              w: 11.73,
              h: 0.8,
              fontSize: 36,
              bold: true,
              color: 'FFFFFF',
              fontFace: 'Calibri'
            });
            
            // Format content with better readability
            const formattedContent = slide.content.substring(0, 800)
              .split('\n')
              .filter(line => line.trim())
              .join('\n');
            
            pptSlide.addText(formattedContent, {
              x: 0.8,
              y: 2.3,
              w: 11.73,
              h: 4.5,
              fontSize: 18,
              color: 'FFFFFF',
              fontFace: 'Calibri',
              lineSpacing: 24,
              valign: 'top'
            });
        }
        
        // Add slide number footer to all slides except title
        if (slide.type !== 'title') {
          pptSlide.addText(`${index + 1}`, {
            x: 12.2,
            y: 7,
            w: 0.6,
            h: 0.3,
            fontSize: 12,
            color: 'CBD5E1',
            align: 'center',
            fontFace: 'Calibri'
          });
        }
      });
      
      // Generate and download the enhanced PPTX file
      const fileName = `${title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase()}_presentation.pptx`;
      await pres.writeFile({ fileName });
      
    } catch (error) {
      console.error('Error exporting to PPTX:', error);
      throw new Error('Failed to export presentation to PPTX');
    }
  }

  private static async createSlideElement(slide: Slide): Promise<HTMLElement> {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide-container theme-modern slide-export';
    slideDiv.style.cssText = `
      width: 1920px;
      height: 1080px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      padding: 60px;
      box-sizing: border-box;
      position: fixed;
      top: -10000px;
      left: -10000px;
      z-index: -1;
    `;

    switch (slide.type) {
      case 'title':
        slideDiv.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
            <h1 style="font-size: 72px; font-weight: 800; margin-bottom: 30px; text-shadow: 0 4px 8px rgba(0,0,0,0.3);">
              ${slide.title}
            </h1>
            ${slide.subtitle ? `
              <p style="font-size: 36px; font-weight: 300; opacity: 0.9; max-width: 80%;">
                ${slide.subtitle}
              </p>
            ` : ''}
            <div style="position: absolute; bottom: 60px; right: 60px; opacity: 0.6;">
              <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 600;">DataVista</div>
                <div style="font-size: 18px;">AI-Powered Analytics</div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'content':
        slideDiv.innerHTML = `
          <h2 style="font-size: 54px; font-weight: 700; margin-bottom: 60px;">${slide.title}</h2>
          <div style="flex: 1; font-size: 24px; line-height: 1.6;">
            ${this.convertMarkdownToHTML(slide.content)}
          </div>
        `;
        break;

      case 'metrics':
        const metricsHTML = slide.metrics?.map(metric => `
          <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 12px; padding: 30px; text-align: center;">
            <div style="font-size: 48px; font-weight: 700; margin-bottom: 10px;">${metric.value}</div>
            <div style="font-size: 20px; opacity: 0.8;">${metric.label}</div>
          </div>
        `).join('') || '';

        slideDiv.innerHTML = `
          <h2 style="font-size: 54px; font-weight: 700; margin-bottom: 60px;">${slide.title}</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; flex: 1; align-items: center;">
            ${metricsHTML}
          </div>
        `;
        break;

      default:
        slideDiv.innerHTML = `
          <h2 style="font-size: 54px; font-weight: 700; margin-bottom: 60px;">${slide.title}</h2>
          <div style="flex: 1; font-size: 24px; line-height: 1.6;">
            ${this.convertMarkdownToHTML(slide.content)}
          </div>
        `;
    }

    return slideDiv;
  }

  private static convertMarkdownToHTML(markdown: string): string {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 32px; margin: 20px 0;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 40px; margin: 30px 0;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 48px; margin: 40px 0;">$1</h1>')      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^[-\*\+] (.*)$/gim, '<li style="margin: 10px 0; list-style: none; position: relative; padding-left: 30px;">• $1</li>')
      .replace(/\n\n/gim, '</p><p style="margin: 20px 0;">')
      .replace(/\n/gim, '<br>')
      .replace(/^(?!<[h|l|p])(.*)$/gim, '<p style="margin: 20px 0;">$1</p>');  }

  static async sharePresentation(_slides: Slide[], title: string): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - DataVista Presentation`,
          text: `Check out this AI-generated presentation: ${title}. Created with DataVista Analytics.`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        this.fallbackShare(title);
      }
    } else {
      this.fallbackShare(title);
    }
  }

  private static fallbackShare(title: string): void {
    const shareText = `Check out this AI-generated presentation: ${title}. Created with DataVista Analytics. ${window.location.href}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        this.showShareModal(shareText);
      });
    } else {
      this.showShareModal(shareText);
    }
  }

  private static showShareModal(shareText: string): void {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
        <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; margin: 1rem;">
          <h3 style="margin: 0 0 1rem 0; color: #1f2937;">Share Presentation</h3>
          <textarea readonly style="width: 100%; height: 100px; margin-bottom: 1rem; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.875rem;">${shareText}</textarea>
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button onclick="navigator.clipboard.writeText('${shareText}').then(() => alert('Copied!')).catch(() => {})" style="background: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Copy</button>
            <button onclick="this.closest('div').remove()" style="background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

export default PresentationExporter;
