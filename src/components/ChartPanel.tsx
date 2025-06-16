import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartPie as PieChartIcon, ChartBar, Settings, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { useAIResponses } from '../context/AIResponseContext';
import { useAnalysis } from '../context/AnalysisContext';
import MarkdownRenderer from './MarkdownRenderer';

const COLORS = ['#6d28d9', '#0d9488', '#f97316', '#8b5cf6', '#14b8a6'];

type ChartType = 'bar' | 'pie' | 'line';

const ChartPanel = () => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const { getResponsesByType } = useAIResponses();
  const { analysisData } = useAnalysis();
  const aiVisualizations = getResponsesByType('visualization');
  
  const hasData = analysisData?.summary !== null;

  // Generate chart data from actual analysis data
  const generateChartData = () => {
    if (!analysisData?.summary?.statistics) return [];
    
    const stats = analysisData.summary.statistics;
    const numericColumns = Object.entries(stats)
      .filter(([_, stat]: [string, any]) => stat.type === 'numeric')
      .slice(0, 6);
    
    return numericColumns.map(([name, stat]: [string, any]) => ({
      name: name.length > 10 ? name.substring(0, 10) + '...' : name,
      value: Math.round(stat.mean || stat.max || 0)
    }));
  };

  const pieData = () => {
    if (!analysisData?.summary?.statistics) return [];
    
    const stats = analysisData.summary.statistics;
    const categoricalColumns = Object.entries(stats)
      .filter(([_, stat]: [string, any]) => stat.type === 'categorical')
      .slice(0, 5);
    
    if (categoricalColumns.length === 0) {
      // Fallback to numeric data for pie chart
      const numericColumns = Object.entries(stats)
        .filter(([_, stat]: [string, any]) => stat.type === 'numeric')
        .slice(0, 4);
      
      return numericColumns.map(([name, stat]: [string, any]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        value: Math.round(stat.mean || stat.max || 0)
      }));
    }
    
    return categoricalColumns.map(([name, stat]: [string, any]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value: stat.unique || stat.count || 0
    }));
  };
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visualizations</h1>
            <p className="text-gray-600">Data visualizations and charts</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-96 text-center">
          <ChartBar className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">
            Upload a dataset to start creating visualizations and charts from your data.
          </p>
        </div>
      </div>
    );
  }

  // If no AI visualizations requested, show empty state
  if (aiVisualizations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visualizations</h1>
            <p className="text-gray-600">AI-generated charts and visualizations</p>
          </div>
        </div>        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No AI Visualizations Yet</h2>
          <p className="text-gray-600 mb-4 max-w-md">
            Ask the AI questions about your data to generate visualizations that will appear here. 
            Try asking for charts or data analysis to get started.
          </p>
          <div className="flex flex-col space-y-2 text-sm text-gray-500">
            <p>💡 Try asking:</p>
            <p>"Create a bar chart of my data"</p>
            <p>"Show me visualizations"</p>
            <p>"What charts work best for this data?"</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = generateChartData();
  const pieChartData = pieData();
    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visualizations</h1>
          <p className="text-gray-600">AI-powered data visualizations and charts</p>
        </div>
        {aiVisualizations.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4" />
            <span>{aiVisualizations.length} AI suggestions</span>
          </div>
        )}
      </div>

      {/* AI Visualization Suggestions */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-medium text-gray-900">AI Visualization Suggestions</h4>
        </div>
        
        {aiVisualizations.slice(0, 2).map((viz) => (
          <div key={viz.id} className={`bg-white rounded-lg shadow-sm border p-4 ${
            viz.isNew ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-medium text-gray-900 text-sm">{viz.title}</h5>
              {viz.isNew && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  New
                </span>
              )}
            </div>
            
            <div className="text-sm mb-3">
              <MarkdownRenderer content={viz.content} />
            </div>
            
            {/* Suggested chart types */}
            {viz.data?.suggestedCharts && viz.data.suggestedCharts.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {viz.data.suggestedCharts.map((chartSuggestion: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setChartType(chartSuggestion as ChartType)}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                  >
                    {chartSuggestion} chart
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {viz.timestamp.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
              chartType === 'bar'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChartBar size={16} className="mr-1.5" />
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
              chartType === 'pie'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PieChartIcon size={16} className="mr-1.5" />
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
              chartType === 'line'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp size={16} className="mr-1.5" />
            Line Chart
          </button>
        </div>
        <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100">
          <Settings size={18} />
        </button>
      </div>
      
      {/* Only show charts if we have data */}
      {(chartData.length > 0 || pieChartData.length > 0) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {chartType === 'bar' ? `Column Analysis (${chartData.length} columns)` : 
             chartType === 'pie' ? 'Data Distribution' : 
             'Trend Analysis'}
          </h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' && chartData.length > 0 ? (
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#6d28d9" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartType === 'pie' && pieChartData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              ) : chartData.length > 0 ? (
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for this chart type
                </div>
              )}
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">AI Insights:</p>
            <p>
              {aiVisualizations.length > 0 
                ? 'Chart generated based on your actual dataset. The visualization shows data from your uploaded file.'
                : 'Chart shows actual data from your dataset analysis.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartPanel;
