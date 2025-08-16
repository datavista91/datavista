import { Activity, BarChart3, Grid3X3, Layers, PieChart, Target, TrendingUp } from 'lucide-react';
import React from 'react';

export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ReactNode;
  category: 'trends' | 'comparison' | 'distribution' | 'correlation' | 'composition' | 'advanced';
  recommendedFor: string[];
  config: {
    showGrid: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    opacity: number;
    strokeWidth: number;
    smooth: boolean;
    fillOpacity: number;
    showDataLabels: boolean;
  };
}

export const chartTemplates: ChartTemplate[] = [
  // Trend Analysis
  {
    id: 'trend-line',
    name: 'Trend Line Chart',
    description: 'Perfect for showing data changes over time or sequence',
    type: 'line',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'trends',
    recommendedFor: ['Time series data', 'Sequential measurements', 'Performance metrics'],
    config: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      opacity: 1,
      strokeWidth: 3,
      smooth: true,
      fillOpacity: 0.1,
      showDataLabels: false
    }
  },
  {
    id: 'trend-area',
    name: 'Trend Area Chart',
    description: 'Shows trends with filled areas for better visual impact',
    type: 'area',
    icon: <Layers className="w-6 h-6" />,
    category: 'trends',
    recommendedFor: ['Cumulative data', 'Volume trends', 'Market analysis'],
    config: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      opacity: 0.8,
      strokeWidth: 2,
      smooth: true,
      fillOpacity: 0.3,
      showDataLabels: false
    }
  },

  // Comparison Charts
  {
    id: 'comparison-bar',
    name: 'Comparison Bar Chart',
    description: 'Compare values across different categories',
    type: 'bar',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'comparison',
    recommendedFor: ['Category comparisons', 'Performance rankings', 'Survey results'],
    config: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      opacity: 0.9,
      strokeWidth: 2,
      smooth: false,
      fillOpacity: 0.8,
      showDataLabels: true
    }
  },
  {
    id: 'comparison-composed',
    name: 'Composed Chart',
    description: 'Combine bars and lines for multi-metric analysis',
    type: 'composed',
    icon: <Grid3X3 className="w-6 h-6" />,
    category: 'comparison',
    recommendedFor: ['Multi-metric analysis', 'Budget vs actual', 'Target vs achievement'],
    config: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      opacity: 0.9,
      strokeWidth: 2,
      smooth: true,
      fillOpacity: 0.6,
      showDataLabels: false
    }
  },

  // Distribution Charts
  {
    id: 'distribution-pie',
    name: 'Pie Chart',
    description: 'Show proportions and percentages of a whole',
    type: 'pie',
    icon: <PieChart className="w-6 h-6" />,
    category: 'distribution',
    recommendedFor: ['Market share', 'Budget allocation', 'Demographic breakdown'],
    config: {
      showGrid: false,
      showLegend: true,
      showTooltip: true,
      opacity: 0.9,
      strokeWidth: 2,
      smooth: false,
      fillOpacity: 0.8,
      showDataLabels: true
    }
  },
  {
    id: 'distribution-funnel',
    name: 'Funnel Chart',
    description: 'Show process stages and conversion rates',
    type: 'funnel',
    icon: <Target className="w-6 h-6" />,
    category: 'distribution',
    recommendedFor: ['Sales funnel', 'Conversion rates', 'Process stages'],
    config: {
      showGrid: false,
      showLegend: true,
      showTooltip: true,
      opacity: 0.9,
      strokeWidth: 2,
      smooth: false,
      fillOpacity: 0.8,
      showDataLabels: true
    }
  },

  // Correlation Charts
  {
    id: 'correlation-scatter',
    name: 'Scatter Plot',
    description: 'Show relationships between two variables',
    type: 'scatter',
    icon: <Grid3X3 className="w-6 h-6" />,
    category: 'correlation',
    recommendedFor: ['Correlation analysis', 'Outlier detection', 'Regression analysis'],
    config: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      opacity: 0.8,
      strokeWidth: 1,
      smooth: false,
      fillOpacity: 0.6,
      showDataLabels: false
    }
  },
  {
    id: 'correlation-radar',
    name: 'Radar Chart',
    description: 'Compare multiple variables on different scales',
    type: 'radar',
    icon: <Activity className="w-6 h-6" />,
    category: 'correlation',
    recommendedFor: ['Skill assessments', 'Performance reviews', 'Multi-criteria analysis'],
    config: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      opacity: 0.8,
      strokeWidth: 2,
      smooth: false,
      fillOpacity: 0.3,
      showDataLabels: false
    }
  },

  // Advanced Charts
  {
    id: 'advanced-heatmap',
    name: 'Heatmap',
    description: 'Visualize data density and patterns in matrices',
    type: 'heatmap',
    icon: <Grid3X3 className="w-6 h-6" />,
    category: 'advanced',
    recommendedFor: ['Correlation matrices', 'Data density', 'Pattern recognition'],
    config: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      opacity: 0.9,
      strokeWidth: 1,
      smooth: false,
      fillOpacity: 0.8,
      showDataLabels: false
    }
  },

];

export const getTemplatesByCategory = (category: ChartTemplate['category']) => {
  return chartTemplates.filter(template => template.category === category);
};

export const getRecommendedTemplate = (dataType: string, dataSize: number) => {
  if (dataType.includes('time') || dataType.includes('date')) {
    return chartTemplates.find(t => t.id === 'trend-line');
  }
  if (dataType.includes('category') || dataType.includes('name')) {
    return chartTemplates.find(t => t.id === 'comparison-bar');
  }
  if (dataSize < 10) {
    return chartTemplates.find(t => t.id === 'distribution-pie');
  }
  return chartTemplates.find(t => t.id === 'trend-line');
};
