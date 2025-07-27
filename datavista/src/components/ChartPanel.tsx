import {
  AreaChart as AreaIcon,
  BarChart2,
  ChevronDown, ChevronUp,
  Copy,
  Database,
  Download,
  Edit3,
  Eye,
  FileText,
  Grid,
  LineChart as LineIcon,
  Link,
  Move,
  Palette,
  PieChart as PieIcon,
  Plus,
  RotateCcw,
  ScatterChart as ScatterIcon,
  Settings,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { useAnalysis } from "../context/AnalysisContext";
import { useData } from "../context/DataContext";

const COLORS = ['#6d28d9', '#0d9488', '#f97316', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#84cc16'];

const COLOR_PALETTES = {
  default: ['#6d28d9', '#0d9488', '#f97316', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#84cc16'],
  blues: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'],
  greens: ['#166534', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#dcfce7'],
  purples: ['#581c87', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
  warm: ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a'],
  cool: ['#0891b2', '#0284c7', '#2563eb', '#7c3aed', '#9333ea', '#c026d3']
};

interface ChartConfig {
  id: string;
  type: 'bar' | 'pie' | 'line' | 'scatter' | 'area' | 'composed' | 'relationship';
  title: string;
  dataSource: 'single' | 'combined' | 'relationship';
  fileId?: string;
  fileIds?: string[];
  xAxis?: string;
  yAxis?: string | string[];
  filters?: any[];
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  customizations: {
    showGrid: boolean;
    showLegend: boolean;
    stacked: boolean;
    colors: string[];
    colorPalette: string;
    opacity: number;
    strokeWidth: number;
    fontSize: number;
    legendPosition: 'top' | 'bottom' | 'left' | 'right';
    gridStyle: 'solid' | 'dashed' | 'dotted';
    animation: boolean;
    showValues: boolean;
    chartMargin: { top: number; right: number; bottom: number; left: number };
  };
}

// Utility for Legend props mapping
const getLegendProps = (legendPosition: 'top' | 'bottom' | 'left' | 'right') => {
  if (legendPosition === 'top' || legendPosition === 'bottom') {
    return { verticalAlign: legendPosition as 'top' | 'bottom', align: 'center' as const };
  }
  if (legendPosition === 'left' || legendPosition === 'right') {
    return { verticalAlign: 'middle' as const, align: legendPosition as 'left' | 'right' };
  }
  return { verticalAlign: 'bottom' as const, align: 'center' as const };
};

const ChartPanel = () => {
  const { files } = useData();
  const {} = useAnalysis();
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [gridLayout, setGridLayout] = useState<'auto' | '1' | '2' | '3' | '4'>('auto');
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);

  useEffect(() => {
    if (files.length > 0 && charts.length === 0) {
      generateDefaultCharts();
    }
  }, [files]);

  const generateDefaultCharts = () => {
    const defaultCharts: ChartConfig[] = [];
    let position = { row: 0, col: 0 };

    files.forEach((file, fileIndex) => {
      const numericColumns = file.columns.filter(col => {
        return file.data.some(row => !isNaN(parseFloat(row[col])));
      });
      
      const categoricalColumns = file.columns.filter(col => {
        return !numericColumns.includes(col);
      });

      if (numericColumns.length > 0) {
        defaultCharts.push({
          id: `bar-${file.id}`,
          type: 'bar',
          title: `${file.name} - Key Metrics`,
          dataSource: 'single',
          fileId: file.id,
          xAxis: categoricalColumns[0] || 'index',
          yAxis: numericColumns.slice(0, 3),
          size: 'medium',
          position: { row: Math.floor(position.col / 2), col: position.col % 2 },
          customizations: {
            showGrid: true,
            showLegend: true,
            stacked: false,
            colors: COLORS.slice(fileIndex * 2, fileIndex * 2 + 3),
            colorPalette: 'default',
            opacity: 0.8,
            strokeWidth: 2,
            fontSize: 12,
            legendPosition: 'bottom',
            gridStyle: 'solid',
            animation: true,
            showValues: false,
            chartMargin: { top: 20, right: 30, bottom: 20, left: 20 }
          }
        });
        position.col++;

        if (categoricalColumns.length > 0) {
          defaultCharts.push({
            id: `pie-${file.id}`,
            type: 'pie',
            title: `${file.name} - Distribution`,
            dataSource: 'single',
            fileId: file.id,
            yAxis: [numericColumns[0]],
            size: 'medium',
            position: { row: Math.floor(position.col / 2), col: position.col % 2 },
            customizations: {
              showGrid: false,
              showLegend: true,
              stacked: false,
              colors: COLORS,
              colorPalette: 'default',
              opacity: 0.9,
              strokeWidth: 1,
              fontSize: 12,
              legendPosition: 'right',
              gridStyle: 'solid',
              animation: true,
              showValues: true,
              chartMargin: { top: 20, right: 30, bottom: 20, left: 20 }
            }
          });
          position.col++;
        }
      }
    });

    if (files.length > 1) {
      const relationshipCharts = generateRelationshipCharts();
      relationshipCharts.forEach(chart => {
        chart.position = { row: Math.floor(position.col / 2), col: position.col % 2 };
        position.col++;
      });
      defaultCharts.push(...relationshipCharts);
    }

    setCharts(defaultCharts);
  };

  const generateRelationshipCharts = () => {
    const relationshipCharts: ChartConfig[] = [];
    
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const file1 = files[i];
        const file2 = files[j];
        
        const commonColumns = file1.columns.filter(col => file2.columns.includes(col));
        
        if (commonColumns.length > 0) {
          const numericColumns1 = file1.columns.filter(col => 
            file1.data.some(row => !isNaN(parseFloat(row[col])))
          );
          const numericColumns2 = file2.columns.filter(col => 
            file2.data.some(row => !isNaN(parseFloat(row[col])))
          );

          const commonNumericColumns = numericColumns1.filter(col => 
            numericColumns2.includes(col)
          );

          if (commonNumericColumns.length > 0) {
            relationshipCharts.push({
              id: `relationship-${file1.id}-${file2.id}-${Date.now()}`,
              type: 'relationship',
              title: `${file1.name} vs ${file2.name}`,
              dataSource: 'relationship',
              fileIds: [file1.id, file2.id],
              xAxis: commonColumns[0],
              yAxis: commonNumericColumns.slice(0, 3),
              size: 'large',
              position: { row: 0, col: 0 },
              customizations: {
                showGrid: true,
                showLegend: true,
                stacked: false,
                colors: [COLORS[i], COLORS[j]],
                colorPalette: 'default',
                opacity: 0.8,
                strokeWidth: 2,
                fontSize: 12,
                legendPosition: 'bottom',
                gridStyle: 'solid',
                animation: true,
                showValues: false,
                chartMargin: { top: 20, right: 30, bottom: 20, left: 20 }
              }
            });
          }
        }
      }
    }
    
    return relationshipCharts;
  };

  const generateComparisonChart = () => {
    if (files.length < 2) return null;
    
    const commonNumericColumns = files[0].columns.filter(col => 
      files.every(file => 
        file.columns.includes(col) && 
        file.data.some(row => !isNaN(parseFloat(row[col])))
      )
    ).slice(0, 3);

    if (commonNumericColumns.length === 0) return null;

    return {
      id: `comparison-${Date.now()}`,
      type: 'bar' as const,
      title: 'Multi-File Comparison',
      dataSource: 'combined' as const,
      fileIds: files.map(f => f.id),
      xAxis: 'fileName',
      yAxis: commonNumericColumns,
      size: 'large' as const,
      position: { row: 0, col: 0 },
      customizations: {
        showGrid: true,
        showLegend: true,
        stacked: false,
        colors: COLORS,
        colorPalette: 'default',
        opacity: 0.8,
        strokeWidth: 2,
        fontSize: 12,
        legendPosition: 'bottom',
        gridStyle: 'solid',
        animation: true,
        showValues: false,
        chartMargin: { top: 20, right: 30, bottom: 20, left: 20 }
      }
    } satisfies ChartConfig;
  };

  const getChartData = (chart: ChartConfig) => {
    if (!chart.fileId && !chart.fileIds) return [];

    if (chart.dataSource === 'combined' && chart.fileIds) {
      return chart.fileIds.map((fileId) => {
        const file = files.find(f => f.id === fileId);
        if (!file) return null;
        const yAxisArray = Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis];
        const numericValues = yAxisArray
          .filter((col): col is string => !!col)
          .map(col => {
            const values = file.data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
            return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          });
        const result: any = { fileName: file.name };
        yAxisArray.filter((col): col is string => !!col).forEach((col, i) => {
          result[col] = numericValues[i];
        });
        return result;
      }).filter(Boolean);
    }

    if (chart.dataSource === 'relationship' && chart.fileIds && chart.xAxis && chart.yAxis) {
      const [file1Id, file2Id] = chart.fileIds;
      const file1 = files.find(f => f.id === file1Id);
      const file2 = files.find(f => f.id === file2Id);
      
      if (!file1 || !file2) return [];
      
      const xValues = [...new Set([
        ...file1.data.map(row => row[chart.xAxis!]),
        ...file2.data.map(row => row[chart.xAxis!])
      ])].filter(Boolean);
      
      return xValues.map(xValue => {
        const result: any = { [chart.xAxis!]: xValue };
        (Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis])
          .filter((col): col is string => !!col)
          .forEach(col => {
            const file1Values = file1.data
              .filter(row => row[chart.xAxis!] === xValue)
              .map(row => parseFloat(row[col]))
              .filter(v => !isNaN(v));
            const file2Values = file2.data
              .filter(row => row[chart.xAxis!] === xValue)
              .map(row => parseFloat(row[col]))
              .filter(v => !isNaN(v));
            result[`${file1.name}_${col}`] = file1Values.length > 0 ? 
              file1Values.reduce((a, b) => a + b, 0) / file1Values.length : 0;
            result[`${file2.name}_${col}`] = file2Values.length > 0 ? 
              file2Values.reduce((a, b) => a + b, 0) / file2Values.length : 0;
          });
        return result;
      });
    }

    const file = files.find(f => f.id === chart.fileId);
    if (!file) return [];

    const chartData = [...file.data];

    if (chart.type === 'pie') {
      const categoryCol = file.columns.find(col => 
        !file.data.some(row => !isNaN(parseFloat(row[col])))
      ) || file.columns[0];
      
      const valueCol = chart.yAxis?.[0] || file.columns.find(col => 
        file.data.some(row => !isNaN(parseFloat(row[col])))
      );

      if (!valueCol) return [];

      const aggregated = chartData.reduce((acc: any, row: any) => {
        const category = row[categoryCol] || 'Unknown';
        const value = parseFloat(row[valueCol]) || 0;
        
        if (acc[category]) {
          acc[category] += value;
        } else {
          acc[category] = value;
        }
        return acc;
      }, {});

      return Object.entries(aggregated).map(([name, value]) => ({
        name,
        value: Number(value)
      }));
    }

    return chartData.map((row: any, index: number) => {
      const dataPoint: any = {};
      
      if (chart.xAxis) {
        dataPoint[chart.xAxis] = row[chart.xAxis] || `Item ${index + 1}`;
      } else {
        dataPoint.name = `Item ${index + 1}`;
      }

      if (chart.yAxis) {
        if (Array.isArray(chart.yAxis)) {
          chart.yAxis.forEach(col => {
            dataPoint[col] = parseFloat(row[col]) || 0;
          });
        } else {
          dataPoint[chart.yAxis] = parseFloat(row[chart.yAxis]) || 0;
        }
      }

      return dataPoint;
    });
  };

  const addNewChart = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: 'bar',
      title: 'New Chart',
      dataSource: 'single',
      fileId: files[0]?.id,
      size: 'medium',
      position: { row: 0, col: 0 },
      customizations: {
        showGrid: true,
        showLegend: true,
        stacked: false,
        colors: COLORS.slice(0, 3),
        colorPalette: 'default',
        opacity: 0.8,
        strokeWidth: 2,
        fontSize: 12,
        legendPosition: 'bottom',
        gridStyle: 'solid',
        animation: true,
        showValues: false,
        chartMargin: { top: 20, right: 30, bottom: 20, left: 20 }
      }
    };

    setCharts(prev => [...prev, newChart]);
    setEditingChart(newChart.id);
    setShowAdvancedEditor(true);
  };

  const updateChart = (chartId: string, updates: Partial<ChartConfig>) => {
    setCharts(prev => prev.map(chart => 
      chart.id === chartId ? { ...chart, ...updates } : chart
    ));
  };

  const deleteChart = (chartId: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
    if (selectedChart === chartId) setSelectedChart(null);
    if (editingChart === chartId) setEditingChart(null);
  };

  const duplicateChart = (chartId: string) => {
    const chart = charts.find(c => c.id === chartId);
    if (chart) {
      const newChart = {
        ...chart,
        id: `chart-${Date.now()}`,
        title: `${chart.title} (Copy)`,
        position: { row: chart.position.row + 1, col: chart.position.col }
      };
      setCharts(prev => [...prev, newChart]);
    }
  };

  const exportChart = (chartId: string) => {
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;

    const data = getChartData(chart);
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title.replace(/\s+/g, '_')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllCharts = () => {
    charts.forEach(chart => {
      exportChart(chart.id);
    });
    alert('All charts exported successfully!');
  };

  const resetChart = (chartId: string) => {
    const chart = charts.find(c => c.id === chartId);
    if (chart) {
      const resetChart: Partial<ChartConfig> = {
        customizations: {
          showGrid: true,
          showLegend: true,
          stacked: false,
          colors: COLORS.slice(0, 3),
          colorPalette: 'default',
          opacity: 0.8,
          strokeWidth: 2,
          fontSize: 12,
          legendPosition: 'bottom',
          gridStyle: 'solid',
          animation: true,
          showValues: false,
          chartMargin: { top: 20, right: 30, bottom: 20, left: 20 }
        }
      };
      updateChart(chartId, resetChart);
    }
  };

  const AdvancedChartEditor = ({ chart }: { chart: ChartConfig }) => {
    const [editedChart, setEditedChart] = useState<ChartConfig>(chart);

    const saveChanges = () => {
      updateChart(chart.id, editedChart);
      setEditingChart(null);
      setShowAdvancedEditor(false);
    };

    const cancelEdit = () => {
      setEditingChart(null);
      setShowAdvancedEditor(false);
    };

    const updateCustomization = (key: string, value: any) => {
      setEditedChart(prev => ({
        ...prev,
        customizations: { ...prev.customizations, [key]: value }
      }));
    };

    const updateMargin = (side: string, value: number) => {
      setEditedChart(prev => ({
        ...prev,
        customizations: {
          ...prev.customizations,
          chartMargin: { ...prev.customizations.chartMargin, [side]: value }
        }
      }));
    };

    const availableFiles = files.filter(f => 
      editedChart.dataSource === 'relationship' ? true : 
      editedChart.dataSource === 'combined' ? true : 
      f.id === editedChart.fileId
    );

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Chart Editor</h3>
              <button
                onClick={cancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Basic Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                  <input
                    type="text"
                    value={editedChart.title}
                    onChange={(e) => setEditedChart(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                  <select
                    value={editedChart.type}
                    onChange={(e) => setEditedChart(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="area">Area Chart</option>
                    <option value="composed">Composed Chart</option>
                    <option value="relationship">Relationship Chart</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Size</label>
                  <select
                    value={editedChart.size}
                    onChange={(e) => setEditedChart(prev => ({ ...prev, size: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                  <select
                    value={editedChart.dataSource}
                    onChange={(e) => setEditedChart(prev => ({ 
                      ...prev, 
                      dataSource: e.target.value as any,
                      fileId: e.target.value === 'single' ? files[0]?.id : undefined,
                      fileIds: e.target.value === 'relationship' ? [files[0]?.id, files[1]?.id] : undefined
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="single">Single File</option>
                    <option value="combined" disabled={files.length < 2}>Combined Files</option>
                    <option value="relationship" disabled={files.length < 2}>File Relationship</option>
                  </select>
                </div>
              </div>
            </div>

            {editedChart.dataSource === 'single' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  File Selection
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data File</label>
                  <select
                    value={editedChart.fileId || ''}
                    onChange={(e) => setEditedChart(prev => ({ ...prev, fileId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {files.map(file => (
                      <option key={file.id} value={file.id}>{file.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {editedChart.dataSource === 'relationship' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <Link className="w-4 h-4 mr-2" />
                  Relationship Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First File</label>
                    <select
                      value={editedChart.fileIds?.[0] || ''}
                      onChange={(e) => setEditedChart(prev => ({
                        ...prev,
                        fileIds: [e.target.value, prev.fileIds?.[1] || '']
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {files.map(file => (
                        <option key={file.id} value={file.id}>{file.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Second File</label>
                    <select
                      value={editedChart.fileIds?.[1] || ''}
                      onChange={(e) => setEditedChart(prev => ({
                        ...prev,
                        fileIds: [prev.fileIds?.[0] || '', e.target.value]
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {files.map(file => (
                        <option key={file.id} value={file.id}>{file.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {availableFiles.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center">
                  <Grid className="w-4 h-4 mr-2" />
                  Data Configuration
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis Column</label>
                    <select
                      value={editedChart.xAxis || ''}
                      onChange={(e) => setEditedChart(prev => ({ ...prev, xAxis: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select column</option>
                      {availableFiles[0]?.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis Columns</label>
                    <select
                      multiple
                      value={Array.isArray(editedChart.yAxis) ? editedChart.yAxis : []}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setEditedChart(prev => ({ ...prev, yAxis: values }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      size={4}
                    >
                      {availableFiles[0]?.columns
                        .filter(col => availableFiles[0]?.data.some(row => !isNaN(parseFloat(row[col]))))
                        .map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple columns</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Visual Customization
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Palette</label>
                  <select
                    value={editedChart.customizations.colorPalette}
                    onChange={(e) => {
                      updateCustomization('colorPalette', e.target.value);
                      updateCustomization('colors', COLOR_PALETTES[e.target.value as keyof typeof COLOR_PALETTES]);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="default">Default</option>
                    <option value="blues">Blues</option>
                    <option value="greens">Greens</option>
                    <option value="purples">Purples</option>
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                  </select>
                  <div className="flex space-x-1 mt-2">
                    {editedChart.customizations.colors.slice(0, 6).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity: {editedChart.customizations.opacity}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={editedChart.customizations.opacity}
                    onChange={(e) => updateCustomization('opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stroke Width: {editedChart.customizations.strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={editedChart.customizations.strokeWidth}
                    onChange={(e) => updateCustomization('strokeWidth', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size: {editedChart.customizations.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="20"
                    step="1"
                    value={editedChart.customizations.fontSize}
                    onChange={(e) => updateCustomization('fontSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {editedChart.type === 'pie' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Legend Position</label>
                    <input
                      type="text"
                      value="bottom (forced for pie charts)"
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Legend Position</label>
                    <select
                      value={editedChart.customizations.legendPosition}
                      onChange={(e) => updateCustomization('legendPosition', e.target.value as 'top' | 'bottom' | 'left' | 'right')}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grid Style</label>
                  <select
                    value={editedChart.customizations.gridStyle}
                    onChange={(e) => updateCustomization('gridStyle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Move className="w-4 h-4 mr-2" />
                Chart Margins
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top: {editedChart.customizations.chartMargin.top}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editedChart.customizations.chartMargin.top}
                    onChange={(e) => updateMargin('top', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Right: {editedChart.customizations.chartMargin.right}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editedChart.customizations.chartMargin.right}
                    onChange={(e) => updateMargin('right', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bottom: {editedChart.customizations.chartMargin.bottom}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editedChart.customizations.chartMargin.bottom}
                    onChange={(e) => updateMargin('bottom', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Left: {editedChart.customizations.chartMargin.left}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editedChart.customizations.chartMargin.left}
                    onChange={(e) => updateMargin('left', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Display Options
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={editedChart.customizations.showGrid}
                    onChange={(e) => updateCustomization('showGrid', e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Show Grid</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={editedChart.customizations.showLegend}
                    onChange={(e) => updateCustomization('showLegend', e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Show Legend</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={editedChart.customizations.stacked}
                    onChange={(e) => updateCustomization('stacked', e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Stacked</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={editedChart.customizations.showValues}
                    onChange={(e) => updateCustomization('showValues', e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Show Values</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={editedChart.customizations.animation}
                    onChange={(e) => updateCustomization('animation', e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Animation</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={() => resetChart(chart.id)}
                className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Default</span>
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = (chart: ChartConfig) => {
    const data = getChartData(chart);
    
    if (!data || data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No data available</p>
            {chart.dataSource === 'combined' && (
              <p className="text-xs mt-2">No common numeric columns found across files</p>
            )}
            {chart.dataSource === 'relationship' && (
              <p className="text-xs mt-2">No common numeric data found for comparison</p>
            )}
          </div>
        </div>
      );
    }

    const gridProps = chart.customizations.showGrid ? {
      strokeDasharray: chart.customizations.gridStyle === 'dashed' ? '5 5' : 
                      chart.customizations.gridStyle === 'dotted' ? '2 2' : '3 3'
    } : {};

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={chart.customizations.chartMargin}>
              {chart.customizations.showGrid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={chart.xAxis || 'name'} 
                fontSize={chart.customizations.fontSize}
              />
              <YAxis fontSize={chart.customizations.fontSize} />
              <Tooltip />
              {chart.customizations.showLegend && (
                <Legend {...getLegendProps(chart.customizations.legendPosition)} />
              )}
              {(Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis])
                .filter((key): key is string => !!key)
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={chart.customizations.colors[index % chart.customizations.colors.length]}
                    fillOpacity={chart.customizations.opacity}
                    stackId={chart.customizations.stacked ? 'stack' : undefined}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={150}
                dataKey="value"
                label={chart.customizations.showValues ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
                fontSize={chart.customizations.fontSize}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chart.customizations.colors[index % chart.customizations.colors.length]}
                    fillOpacity={chart.customizations.opacity}
                  />
                ))}
              </Pie>
              <Tooltip />
              {/* Always show legend at bottom for pie charts to avoid squishing */}
              {chart.customizations.showLegend && (
                <Legend verticalAlign="bottom" align="center" />
              )}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={chart.customizations.chartMargin}>
              {chart.customizations.showGrid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={chart.xAxis || 'name'} 
                fontSize={chart.customizations.fontSize}
              />
              <YAxis fontSize={chart.customizations.fontSize} />
              <Tooltip />
              {chart.customizations.showLegend && (
                <Legend {...getLegendProps(chart.customizations.legendPosition)} />
              )}
              {(Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis])
                .filter((key): key is string => !!key)
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={chart.customizations.colors[index % chart.customizations.colors.length]}
                    strokeWidth={chart.customizations.strokeWidth}
                    strokeOpacity={chart.customizations.opacity}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        const xKey = chart.xAxis || Object.keys(data[0] || {})[1];
        const yKey = Array.isArray(chart.yAxis) ? chart.yAxis[0] : chart.yAxis || Object.keys(data[0] || {})[2];
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={chart.customizations.chartMargin}>
              {chart.customizations.showGrid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={xKey} 
                name={xKey} 
                fontSize={chart.customizations.fontSize}
              />
              <YAxis 
                dataKey={yKey} 
                name={yKey} 
                fontSize={chart.customizations.fontSize}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Data Points" 
                data={data} 
                fill={chart.customizations.colors[0]}
                fillOpacity={chart.customizations.opacity}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={chart.customizations.chartMargin}>
              {chart.customizations.showGrid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={chart.xAxis || 'name'} 
                fontSize={chart.customizations.fontSize}
              />
              <YAxis fontSize={chart.customizations.fontSize} />
              <Tooltip />
              {chart.customizations.showLegend && (
                <Legend {...getLegendProps(chart.customizations.legendPosition)} />
              )}
              {(Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis])
                .filter((key): key is string => !!key)
                .map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId={chart.customizations.stacked ? '1' : undefined}
                    stroke={chart.customizations.colors[index % chart.customizations.colors.length]}
                    fill={chart.customizations.colors[index % chart.customizations.colors.length]}
                    fillOpacity={chart.customizations.opacity}
                    strokeWidth={chart.customizations.strokeWidth}
                  />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'relationship':
        if (!chart.fileIds || chart.fileIds.length < 2) {
          return (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Incomplete relationship configuration</p>
              </div>
            </div>
          );
        }
        const [file1Id, file2Id] = chart.fileIds;
        const file1 = files.find(f => f.id === file1Id);
        const file2 = files.find(f => f.id === file2Id);
        if (!file1 || !file2) {
          return (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Files not found for relationship</p>
              </div>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={chart.customizations.chartMargin}>
              {chart.customizations.showGrid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={chart.xAxis || 'name'} 
                fontSize={chart.customizations.fontSize}
              />
              <YAxis fontSize={chart.customizations.fontSize} />
              <Tooltip />
              {chart.customizations.showLegend && (
                <Legend {...getLegendProps(chart.customizations.legendPosition)} />
              )}
              {(Array.isArray(chart.yAxis) ? chart.yAxis : [chart.yAxis])
                .filter((col): col is string => !!col)
                .map((col) => [
                  <Bar
                    key={`${file1.name}_${col}`}
                    dataKey={`${file1.name}_${col}`}
                    name={`${file1.name} - ${col}`}
                    fill={chart.customizations.colors[0]}
                    fillOpacity={chart.customizations.opacity}
                  />,
                  <Line
                    key={`${file2.name}_${col}`}
                    type="monotone"
                    dataKey={`${file2.name}_${col}`}
                    name={`${file2.name} - ${col}`}
                    stroke={chart.customizations.colors[1]}
                    strokeWidth={chart.customizations.strokeWidth}
                  />
                ])}
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="h-full flex items-center justify-center">Unsupported chart type</div>;
    }
  };

  const getChartSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-1 lg:col-span-1';
      case 'large': return 'col-span-1 lg:col-span-2';
      case 'full': return 'col-span-full';
      default: return 'col-span-1';
    }
  };

  const getGridClass = () => {
    switch (gridLayout) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-1 lg:grid-cols-2';
      case '3': return 'grid-cols-1 lg:grid-cols-3';
      case '4': return 'grid-cols-1 lg:grid-cols-4';
      default: return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <BarChart2 className="w-16 h-16 text-gray-400 mb-6" />
        <h3 className="text-xl font-medium text-gray-900 mb-3">No Data Available</h3>
        <p className="text-gray-600 max-w-md mb-6">
          Upload your CSV files to start creating beautiful visualizations and charts with full customization options.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <div className="p-4 border border-gray-200 rounded-lg">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-sm">Multiple Files</h4>
            <p className="text-xs text-gray-500">Upload multiple datasets</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <Link className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-sm">Auto-Relationships</h4>
            <p className="text-xs text-gray-500">Detect data connections</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <Palette className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-sm">Full Customization</h4>
            <p className="text-xs text-gray-500">Complete visual control</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Data Visualizations</h2>
          <p className="text-sm text-gray-600 mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} loaded • {charts.length} chart{charts.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Grid:</label>
            <select
              value={gridLayout}
              onChange={(e) => setGridLayout(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="auto">Auto</option>
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
            {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={addNewChart}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chart</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-6">Visualization Settings</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Files Loaded ({files.length})
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.rowCount.toLocaleString()} rows • {file.columns.length} columns</p>
                      </div>
                    </div>
<div className="flex items-center space-x-2">
  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
    {file.columns.filter(col => 
      file.data.some(row => !isNaN(parseFloat(row[col])))
    ).length} numeric
  </span>
</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Link className="w-4 h-4 mr-2" />
                Detected Relationships
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {files.filter(f => f.relationships?.relatedFiles.length).length > 0 ? (
                  files.filter(f => f.relationships?.relatedFiles.length).map(file => (
                    <div key={file.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{file.name}</span>
                      </div>
                      <div className="space-y-1">
                        {file.relationships?.commonColumns.map(col => (
                          <span key={col} className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1">
                            {col}
                          </span>
                        ))}
                      </div>
                      {file.relationships?.possibleJoins.map(join => (
                        <p key={join.file} className="text-xs text-blue-600 mt-1">
                          → {files.find(f => f.id === join.file)?.name}: {join.matchCount} matches on {join.column}
                        </p>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">No relationships detected</p>
                    <p className="text-xs text-gray-400 mt-1">Upload files with common columns to see relationships</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const comparisonChart = generateComparisonChart();
                    if (comparisonChart) {
                      setCharts(prev => [...prev, comparisonChart]);
                      setEditingChart(comparisonChart.id);
                      setShowAdvancedEditor(true);
                    } else {
                      alert('No common numeric columns found across files to compare');
                    }
                  }}
                  className="w-full text-left p-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4 text-purple-600" />
                    <span>Generate comparison charts</span>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    const relationshipCharts = generateRelationshipCharts();
                    if (relationshipCharts.length > 0) {
                      setCharts(prev => [...prev, ...relationshipCharts]);
                      setEditingChart(relationshipCharts[0].id);
                      setShowAdvancedEditor(true);
                    } else {
                      alert('No relationships found between files');
                    }
                  }}
                  className="w-full text-left p-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4 text-blue-600" />
                    <span>Create relationship analysis</span>
                  </div>
                </button>
                <button 
                  onClick={exportAllCharts}
                  className="w-full text-left p-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-green-600" />
                    <span>Export all charts</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedChart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {charts.find(c => c.id === selectedChart)?.title}
              </h3>
              <button 
                onClick={() => setSelectedChart(null)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 h-[70vh]">
              {renderChart(charts.find(c => c.id === selectedChart)!)}
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-8 ${getGridClass()}`}>
        {charts.map(chart => (
          <div 
            key={chart.id} 
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${getChartSizeClass(chart.size)} cursor-pointer`}
            onClick={() => setSelectedChart(chart.id)}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {chart.type === 'bar' && <BarChart2 className="w-5 h-5 text-purple-600" />}
                  {chart.type === 'pie' && <PieIcon className="w-5 h-5 text-green-600" />}
                  {chart.type === 'line' && <LineIcon className="w-5 h-5 text-blue-600" />}
                  {chart.type === 'scatter' && <ScatterIcon className="w-5 h-5 text-orange-600" />}
                  {chart.type === 'area' && <AreaIcon className="w-5 h-5 text-teal-600" />}
                  {chart.type === 'relationship' && <Link className="w-5 h-5 text-indigo-600" />}
                  <div>
                    <h3 className="font-medium text-gray-900">{chart.title}</h3>
                    {chart.fileId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Source: {files.find(f => f.id === chart.fileId)?.name}
                      </p>
                    )}
                    {chart.fileIds && (
                      <p className="text-xs text-gray-500 mt-1">
                        Comparing: {chart.fileIds.map(id => files.find(f => f.id === id)?.name).join(' vs ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChart(chart.id);
                      setShowAdvancedEditor(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Advanced edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateChart(chart.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Duplicate chart"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportChart(chart.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export chart"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChart(chart.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete chart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 h-[400px]">
              {renderChart(chart)}
            </div>
          </div>
        ))}
      </div>

      {files.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Multi-File Analysis Summary</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="text-xs font-medium text-purple-800 mb-2">Total Files</div>
              <div className="text-2xl font-bold text-purple-900">{files.length}</div>
              <div className="text-xs text-purple-600 mt-1">
                {files.reduce((sum, file) => sum + file.columns.length, 0)} total columns
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="text-xs font-medium text-blue-800 mb-2">Total Rows</div>
              <div className="text-2xl font-bold text-blue-900">
                {files.reduce((sum, file) => sum + file.rowCount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Across all datasets
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="text-xs font-medium text-green-800 mb-2">Relationships</div>
              <div className="text-2xl font-bold text-green-900">
                {files.filter(f => f.relationships?.relatedFiles.length).length}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Connected files
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="text-xs font-medium text-orange-800 mb-2">Active Charts</div>
              <div className="text-2xl font-bold text-orange-900">{charts.length}</div>
              <div className="text-xs text-orange-600 mt-1">
                Visualizations created
              </div>
            </div>
          </div>
        </div>
      )}

      {editingChart && showAdvancedEditor && (
        <AdvancedChartEditor chart={charts.find(c => c.id === editingChart)!} />
      )}
    </div>
  );
};

export default ChartPanel;