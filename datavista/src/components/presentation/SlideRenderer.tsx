import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'chart' | 'metrics' | 'two-column' | 'conclusion' | 'agenda';
  title: string;
  subtitle?: string;
  content: string;
  chart?: {
    type: 'bar' | 'pie' | 'line';
    data: any[];
    title?: string;
  };
  chartData?: any[];
  chartType?: 'bar' | 'pie' | 'line';
  metrics?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    change?: string;
  }>;
  layout: 'single' | 'two-column' | 'metrics-grid' | 'chart-focus' | 'full-chart' | 'chart-single' | 'chart-grid';
  animation?: 'fade' | 'slide' | 'zoom';
  theme?: string;
}

interface SlideRendererProps {
  slide: Slide;
  theme: string;
  isActive: boolean;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, theme, isActive }) => {
  const renderChart = (chart: Slide['chart']) => {
    if (!chart || !chart.data.length) return null;

    const commonProps = {
      width: "100%",
      height: 300
    };

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const renderMetrics = (metrics: Slide['metrics']) => {
    if (!metrics?.length) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">{metric.value}</div>
            <div className="text-lg opacity-80 mb-2">{metric.label}</div>
            {metric.trend && (
              <div className={`flex items-center justify-center text-sm ${
                metric.trend === 'up' ? 'text-green-400' : 
                metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> :
                 metric.trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> :
                 <Minus className="w-4 h-4 mr-1" />}
                {metric.change}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  switch (slide.type) {
    case 'title':
      return (
        <div className={`slide-container slide-title theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 slide-title-main">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-2xl md:text-3xl opacity-80 max-w-4xl slide-subtitle">
                {slide.subtitle}
              </p>
            )}
            <div className="absolute bottom-12 right-12 opacity-60">
              <div className="text-right">
                <div className="text-lg font-semibold">DataVista</div>
                <div className="text-sm">AI-Powered Analytics</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'agenda':
      return (
        <div className={`slide-container slide-content theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold mb-12 slide-title">{slide.title}</h2>
            <div className="flex-1 flex items-center">
              <div className="space-y-6 w-full">
                {slide.content.split('\n').filter(line => line.trim()).map((item, index) => (
                  <div key={index} className="flex items-center text-2xl slide-item" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-6 text-lg font-bold">
                      {index + 1}
                    </div>
                    <span>{item.replace(/^[•\-\*]\s*/, '').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'content':
      return (
        <div className={`slide-container slide-content theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold mb-12 slide-title">{slide.title}</h2>
            <div className="flex-1 slide-content-body">
              <div className="prose prose-xl prose-invert max-w-none">
                <MarkdownRenderer content={slide.content} />
              </div>
            </div>
          </div>
        </div>
      );

    case 'two-column':
      return (
        <div className={`slide-container slide-two-column theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold mb-12 slide-title">{slide.title}</h2>
            <div className="flex-1 grid grid-cols-2 gap-12">
              <div className="slide-content-left">
                <div className="prose prose-xl prose-invert max-w-none">
                  <MarkdownRenderer content={slide.content} />
                </div>
              </div>
              <div className="slide-content-right">
                {slide.chart && (
                  <div className="chart-container bg-white/5 rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4">{slide.chart.title || 'Data Visualization'}</h3>
                    {renderChart(slide.chart)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className={`slide-container slide-chart theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold mb-12 slide-title">{slide.title}</h2>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-6xl">
                {slide.chart && renderChart(slide.chart)}
              </div>
            </div>
          </div>
        </div>
      );

    case 'metrics':
      return (
        <div className={`slide-container slide-metrics theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col h-full p-12">
            <h2 className="text-5xl font-bold mb-12 slide-title">{slide.title}</h2>
            <div className="flex-1 flex items-center justify-center">
              {renderMetrics(slide.metrics)}
            </div>
          </div>
        </div>
      );

    case 'conclusion':
      return (
        <div className={`slide-container slide-conclusion theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <h2 className="text-6xl font-bold mb-8 slide-title">Thank You</h2>
            <div className="text-2xl opacity-80 max-w-4xl mb-12">
              <MarkdownRenderer content={slide.content} />
            </div>
            <div className="space-y-4 text-lg opacity-60">
              <p>Questions & Discussion</p>
              <p>Generated by DataVista AI Analytics</p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={`slide-container slide-default theme-${theme} ${isActive ? 'slide-active' : ''}`}>
          <div className="flex flex-col h-full p-12">
            <h2 className="text-4xl font-bold mb-8">{slide.title}</h2>
            <div className="flex-1">
              <MarkdownRenderer content={slide.content} />
            </div>
          </div>
        </div>
      );
  }
};

export default SlideRenderer;
