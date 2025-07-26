import { AIResponse } from '../../context/AIResponseContext';
import { Slide } from './SlideRenderer';

export interface ParsedSlideContent {
  title: string;
  content: string;
  type: 'content' | 'chart' | 'metrics' | 'list';
  metrics?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    change?: string;
  }>;
  chartData?: any[];
  chartType?: 'bar' | 'pie' | 'line';
}

export class EnhancedSlideParser {
  static parseAIResponseToSlides(response: AIResponse, analysisData?: any): Slide[] {
    const slides: Slide[] = [];
    
    // 1. Title Slide
    slides.push({
      id: 'title',
      type: 'title',
      title: response.title,
      subtitle: this.generateSubtitle(response, analysisData),
      content: '',
      layout: 'single'
    });

    // 2. Agenda Slide
    const agenda = this.extractAgenda(response.content);
    if (agenda.length > 0) {
      slides.push({
        id: 'agenda',
        type: 'agenda',
        title: 'Agenda',
        content: agenda.join('\n'),
        layout: 'single'
      });
    }

    // 3. Parse main content into structured slides
    const contentSlides = this.parseContentSections(response.content, analysisData);
    slides.push(...contentSlides);

    // 4. Key Metrics Slide (if available)
    const metricsSlide = this.createMetricsSlide(response, analysisData);
    if (metricsSlide) {
      slides.push(metricsSlide);
    }

    // 5. Charts Slide (if data available)
    const chartSlides = this.createChartSlides(analysisData);
    slides.push(...chartSlides);

    // 6. Recommendations Slide
    const recommendationsSlide = this.createRecommendationsSlide(response);
    if (recommendationsSlide) {
      slides.push(recommendationsSlide);
    }

    // 7. Conclusion Slide
    slides.push({
      id: 'conclusion',
      type: 'conclusion',
      title: 'Thank You',
      content: this.generateConclusionContent(),
      layout: 'single'
    });

    return slides;
  }

  private static generateSubtitle(response: AIResponse, analysisData?: any): string {
    const dataInfo = analysisData?.summary ? 
      `Analysis of ${analysisData.summary.totalRows || 'your'} data points` : 
      'Data Analysis Report';
    
    return `${dataInfo} • Generated ${new Date(response.timestamp).toLocaleDateString()}`;
  }

  private static extractAgenda(content: string): string[] {
    const sections = this.extractSections(content);
    return sections.map((section, index) => `${index + 1}. ${section.title}`);
  }

  private static extractSections(content: string): ParsedSlideContent[] {
    const sections: ParsedSlideContent[] = [];
    
    // Split by headers (# ## ###)
    const parts = content.split(/(?=^#{1,3}\s)/m).filter(part => part.trim());
    
    parts.forEach((part) => {
      const lines = part.split('\n');
      const titleLine = lines[0];
      const contentLines = lines.slice(1);
      
      if (!titleLine.trim()) return;
      
      const title = titleLine.replace(/^#+\s*/, '').trim();
      const sectionContent = contentLines.join('\n').trim();
      
      const section: ParsedSlideContent = {
        title,
        content: sectionContent,
        type: this.detectContentType(sectionContent)
      };

      // Extract metrics if present
      const metrics = this.extractMetrics(sectionContent);
      if (metrics.length > 0) {
        section.metrics = metrics;
        section.type = 'metrics';
      }

      sections.push(section);
    });

    return sections;
  }

  private static parseContentSections(content: string, analysisData?: any): Slide[] {
    const sections = this.extractSections(content);
    const slides: Slide[] = [];

    sections.forEach((section, index) => {
      let slide: Slide;

      switch (section.type) {
        case 'metrics':
          slide = {
            id: `slide-${index + 2}`,
            type: 'metrics',
            title: section.title,
            content: section.content,
            metrics: section.metrics,
            layout: 'metrics-grid'
          };
          break;

        case 'chart':
          slide = {
            id: `slide-${index + 2}`,
            type: 'two-column',
            title: section.title,
            content: section.content,
            chart: this.generateChartFromContent(section.content, analysisData),
            layout: 'two-column'
          };
          break;

        default:
          slide = {
            id: `slide-${index + 2}`,
            type: 'content',
            title: section.title,
            content: section.content,
            layout: 'single'
          };
      }

      slides.push(slide);
    });

    return slides;
  }

  private static detectContentType(content: string): 'content' | 'chart' | 'metrics' | 'list' {
    const lowerContent = content.toLowerCase();
    
    if (this.extractMetrics(content).length > 0) {
      return 'metrics';
    }
    
    if (lowerContent.includes('chart') || lowerContent.includes('graph') || 
        lowerContent.includes('visualization') || lowerContent.includes('data shows')) {
      return 'chart';
    }
    
    if (content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')).length > 2) {
      return 'list';
    }
    
    return 'content';
  }

  private static extractMetrics(content: string): Array<{label: string; value: string | number; trend?: 'up' | 'down' | 'neutral'; change?: string}> {
    const metrics: Array<{label: string; value: string | number; trend?: 'up' | 'down' | 'neutral'; change?: string}> = [];
    
    // Pattern for metrics like "Revenue: $1.2M (↑15%)"
    const metricPatterns = [
      /([A-Za-z\s]+):\s*([^(]+)(?:\s*\(([^)]+)\))?/g,
      /\*\*([^:]+):\*\*\s*([^*\n]+)/g,
      /([A-Z][a-z\s]+):\s*(\d+[%$\w]*)/g
    ];

    metricPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const label = match[1].trim().replace(/\*\*/g, '');
        const value = match[2].trim().replace(/\*\*/g, '');
        const change = match[3]?.trim();
        
        let trend: 'up' | 'down' | 'neutral' | undefined;
        if (change) {
          if (change.includes('↑') || change.includes('+') || change.includes('increase')) {
            trend = 'up';
          } else if (change.includes('↓') || change.includes('-') || change.includes('decrease')) {
            trend = 'down';
          } else {
            trend = 'neutral';
          }
        }

        metrics.push({
          label,
          value,
          trend,
          change: change?.replace(/[↑↓]/g, '').trim()
        });
      }
    });

    return metrics;
  }

  private static createMetricsSlide(response: AIResponse, analysisData?: any): Slide | null {
    const metrics: Array<{label: string; value: string | number; trend?: 'up' | 'down' | 'neutral'; change?: string}> = [];
    
    // Extract from response data
    if (response.data?.keyMetrics) {
      response.data.keyMetrics.forEach((metric: any) => {
        if (typeof metric === 'string') {
          const parsed = this.extractMetrics(metric);
          metrics.push(...parsed);
        } else if (metric.label && metric.value) {
          metrics.push(metric);
        }
      });
    }

    // Generate from analysis data
    if (analysisData?.summary?.statistics) {
      const stats = analysisData.summary.statistics;
      Object.entries(stats).forEach(([key, stat]: [string, any]) => {
        if (stat.type === 'numeric' && stat.mean) {
          metrics.push({
            label: key,
            value: `Avg: ${stat.mean.toFixed(2)}`,
            trend: 'neutral'
          });
        }
      });
    }

    if (metrics.length === 0) return null;

    return {
      id: 'metrics',
      type: 'metrics',
      title: 'Key Metrics',
      content: '',
      metrics: metrics.slice(0, 8), // Limit to 8 metrics for visual appeal
      layout: 'metrics-grid'
    };
  }

  private static createChartSlides(analysisData?: any): Slide[] {
    const slides: Slide[] = [];
    
    if (!analysisData?.summary?.statistics) return slides;

    const stats = analysisData.summary.statistics;
    const numericColumns = Object.entries(stats)
      .filter(([_, stat]: [string, any]) => stat.type === 'numeric')
      .slice(0, 6);

    if (numericColumns.length > 0) {
      // Bar chart slide
      const barData = numericColumns.map(([name, stat]: [string, any]) => ({
        name: name.substring(0, 15) + (name.length > 15 ? '...' : ''),
        value: Number(stat.mean?.toFixed(2)) || 0
      }));

      slides.push({
        id: 'chart-bar',
        type: 'chart',
        title: 'Data Overview',
        content: '',
        chart: {
          type: 'bar',
          data: barData,
          title: 'Average Values by Column'
        },
        layout: 'full-chart'
      });

      // Pie chart slide for distribution
      if (numericColumns.length >= 3) {
        const pieData = numericColumns.slice(0, 5).map(([name, stat]: [string, any]) => ({
          name: name.substring(0, 12) + (name.length > 12 ? '...' : ''),
          value: Math.abs(Number(stat.mean?.toFixed(2))) || 0
        }));

        slides.push({
          id: 'chart-pie',
          type: 'chart',
          title: 'Data Distribution',
          content: '',
          chart: {
            type: 'pie',
            data: pieData,
            title: 'Relative Distribution'
          },
          layout: 'full-chart'
        });
      }
    }

    return slides;
  }

  private static generateChartFromContent(content: string, analysisData?: any): Slide['chart'] | undefined {
    if (!analysisData?.summary?.statistics) return undefined;

    const lowerContent = content.toLowerCase();
    const stats = analysisData.summary.statistics;
    
    if (lowerContent.includes('bar') || lowerContent.includes('column')) {
      const numericData = Object.entries(stats)
        .filter(([_, stat]: [string, any]) => stat.type === 'numeric')
        .slice(0, 5)
        .map(([name, stat]: [string, any]) => ({
          name: name.substring(0, 10),
          value: Number(stat.mean?.toFixed(2)) || 0
        }));

      return {
        type: 'bar',
        data: numericData,
        title: 'Data Analysis'
      };
    }

    return undefined;
  }

  private static createRecommendationsSlide(response: AIResponse): Slide | null {
    let recommendations: string[] = [];

    // Extract from response data
    if (response.data?.recommendations) {
      recommendations = response.data.recommendations.slice(0, 5);
    } else {
      // Extract from content
      const recommendationSection = response.content.match(/(?:recommendations?|suggestions?|next steps?)[:\n](.*?)(?=\n\n|\n#|$)/is);
      if (recommendationSection) {
        recommendations = recommendationSection[1]
          .split('\n')
          .filter(line => line.trim().match(/^[-*•]/))
          .map(line => line.replace(/^[-*•]\s*/, '').trim())
          .slice(0, 5);
      }
    }

    if (recommendations.length === 0) return null;

    const content = recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n\n');

    return {
      id: 'recommendations',
      type: 'content',
      title: 'Recommendations',
      content,
      layout: 'single'
    };
  }

  private static generateConclusionContent(): string {
    return `
### Summary

This presentation provided insights from your data analysis, highlighting key patterns and trends discovered through AI-powered analytics.

### Key Takeaways

- Data-driven insights to support decision making
- Actionable recommendations for next steps
- Comprehensive analysis of your dataset

### Next Steps

Continue exploring your data with DataVista's AI analytics platform for deeper insights and interactive visualizations.
    `.trim();
  }
}

export default EnhancedSlideParser;
