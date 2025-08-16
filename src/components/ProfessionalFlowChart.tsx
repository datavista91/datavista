import {
    Maximize2, Minimize2,
    Palette,
    Plus,
    RefreshCw,
    Settings,
    Trash2, X
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
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
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'composed';
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  secondaryYAxis?: string;
  color: string;
  secondaryColor?: string;
  size: { width: number; height: number };
  position: { x: number; y: number };
  config: {
    showGrid: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    opacity: number;
    strokeWidth: number;
    fillOpacity: number;
    animation: boolean;
    smooth: boolean;
  };
  realTime: {
    enabled: boolean;
    interval: number;
    maxDataPoints: number;
  };
}

interface ProfessionalFlowChartProps {
  data: any[];
  onChartUpdate: (charts: ChartData[]) => void;
}

const ProfessionalFlowChart: React.FC<ProfessionalFlowChartProps> = ({ data, onChartUpdate }) => {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<ChartData['type']>('line');
  const [showChartSelector, setShowChartSelector] = useState(false);
  const [draggedChart, setDraggedChart] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<{ [key: string]: any[] }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  // Real-time data simulation
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    charts.forEach(chart => {
      if (chart.realTime.enabled) {
        const interval = setInterval(() => {
          setRealTimeData(prev => {
            const currentData = prev[chart.id] || chart.data;
            const newPoint = generateRealTimePoint(chart, currentData);
            const updatedData = [...currentData, newPoint].slice(-chart.realTime.maxDataPoints);
            
            return {
              ...prev,
              [chart.id]: updatedData
            };
          });
        }, chart.realTime.interval);
        
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(clearInterval);
  }, [charts]);

  const generateRealTimePoint = (chart: ChartData, currentData: any[]) => {
    if (currentData.length === 0) return {};
    
    const lastPoint = currentData[currentData.length - 1];
    const baseValue = typeof lastPoint[chart.yAxis] === 'number' ? lastPoint[chart.yAxis] : 0;
    
    // Generate realistic real-time data
    const variation = (Math.random() - 0.5) * 0.1 * baseValue;
    const newValue = Math.max(0, baseValue + variation);
    
    return {
      [chart.xAxis]: currentData.length,
      [chart.yAxis]: Math.round(newValue * 100) / 100,
      timestamp: new Date().toISOString()
    };
  };

  useEffect(() => {
    if (data.length > 0) {
      generateInitialCharts();
    }
  }, [data]);

  const generateInitialCharts = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const numericHeaders = headers.filter(header => 
      typeof data[0][header] === 'number' || !isNaN(Number(data[0][header]))
    );
    const categoricalHeaders = headers.filter(header => 
      typeof data[0][header] === 'string' && !numericHeaders.includes(header)
    );

    const initialCharts: ChartData[] = [];

    // Professional Line Chart
    if (numericHeaders.length >= 2) {
      const chartData = data.slice(0, 50).map((row, index) => ({
        index,
        [numericHeaders[0]]: Number(row[numericHeaders[0]]),
        [numericHeaders[1]]: Number(row[numericHeaders[1]])
      }));

      initialCharts.push({
        id: 'chart-1',
        type: 'line',
        title: `${numericHeaders[0]} vs ${numericHeaders[1]} Trend`,
        data: chartData,
        xAxis: 'index',
        yAxis: numericHeaders[0],
        color: defaultColors[0],
        size: { width: 500, height: 400 },
        position: { x: 20, y: 20 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 1,
          strokeWidth: 3,
          fillOpacity: 0.1,
          animation: true,
          smooth: true
        },
        realTime: {
          enabled: false,
          interval: 1000,
          maxDataPoints: 100
        }
      });
    }

    // Professional Bar Chart
    if (categoricalHeaders.length > 0 && numericHeaders.length > 0) {
      const categories = [...new Set(data.slice(0, 20).map(row => row[categoricalHeaders[0]]))];
      const chartData = categories.map(category => {
        const filteredData = data.filter(row => row[categoricalHeaders[0]] === category);
        const avgValue = filteredData.reduce((sum, row) => sum + Number(row[numericHeaders[0]] || 0), 0) / filteredData.length;
        return { category, value: Math.round(avgValue * 100) / 100 };
      });

      initialCharts.push({
        id: 'chart-2',
        type: 'bar',
        title: `${categoricalHeaders[0]} Distribution Analysis`,
        data: chartData,
        xAxis: 'category',
        yAxis: 'value',
        color: defaultColors[1],
        size: { width: 500, height: 400 },
        position: { x: 550, y: 20 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 0.9,
          strokeWidth: 2,
          fillOpacity: 0.8,
          animation: true,
          smooth: false
        },
        realTime: {
          enabled: false,
          interval: 1000,
          maxDataPoints: 50
        }
      });
    }

    // Professional Pie Chart
    if (categoricalHeaders.length > 0 && numericHeaders.length > 0) {
      const categories = [...new Set(data.slice(0, 8).map(row => row[categoricalHeaders[0]]))];
      const chartData = categories.map(category => {
        const filteredData = data.filter(row => row[categoricalHeaders[0]] === category);
        const totalValue = filteredData.reduce((sum, row) => sum + Number(row[numericHeaders[0]] || 0), 0);
        return { name: category, value: Math.round(totalValue * 100) / 100 };
      });

      initialCharts.push({
        id: 'chart-3',
        type: 'pie',
        title: `${categoricalHeaders[0]} Composition`,
        data: chartData,
        xAxis: 'name',
        yAxis: 'value',
        color: defaultColors[2],
        size: { width: 400, height: 400 },
        position: { x: 20, y: 450 },
        config: {
          showGrid: false,
          showLegend: true,
          showTooltip: true,
          opacity: 0.9,
          strokeWidth: 2,
          fillOpacity: 0.8,
          animation: true,
          smooth: false
        },
        realTime: {
          enabled: false,
          interval: 1000,
          maxDataPoints: 20
        }
      });
    }

    // Professional Area Chart
    if (numericHeaders.length >= 2) {
      const chartData = data.slice(0, 100).map((row, index) => ({
        index,
        [numericHeaders[0]]: Number(row[numericHeaders[0]]),
        [numericHeaders[1]]: Number(row[numericHeaders[1]])
      }));

      initialCharts.push({
        id: 'chart-4',
        type: 'area',
        title: `${numericHeaders[0]} Trend Analysis`,
        data: chartData,
        xAxis: 'index',
        yAxis: numericHeaders[0],
        color: defaultColors[3],
        size: { width: 500, height: 400 },
        position: { x: 450, y: 450 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 0.7,
          strokeWidth: 2,
          fillOpacity: 0.3,
          animation: true,
          smooth: true
        },
        realTime: {
          enabled: false,
          interval: 1000,
          maxDataPoints: 100
        }
      });
    }

    setCharts(initialCharts);
    onChartUpdate(initialCharts);
  };

  const addNewChart = () => {
    const headers = Object.keys(data[0] || {});
    const newChart: ChartData = {
      id: `chart-${Date.now()}`,
      type: selectedChartType,
      title: `New ${selectedChartType} Chart`,
      data: data.slice(0, 50),
      xAxis: headers[0] || '',
      yAxis: headers[1] || '',
      color: defaultColors[charts.length % defaultColors.length],
      size: { width: 500, height: 400 },
      position: { x: 20 + (charts.length * 60), y: 20 + (charts.length * 60) },
      config: {
        showGrid: true,
        showLegend: true,
        showTooltip: true,
        opacity: 0.9,
        strokeWidth: 2,
        fillOpacity: 0.6,
        animation: true,
        smooth: true
      },
      realTime: {
        enabled: false,
        interval: 1000,
        maxDataPoints: 100
      }
    };

    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    onChartUpdate(updatedCharts);
    setShowChartSelector(false);
  };

  const updateChart = (chartId: string, updates: Partial<ChartData>) => {
    const updatedCharts = charts.map(chart => 
      chart.id === chartId ? { ...chart, ...updates } : chart
    );
    setCharts(updatedCharts);
    onChartUpdate(updatedCharts);
  };

  const deleteChart = (chartId: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== chartId);
    setCharts(updatedCharts);
    onChartUpdate(updatedCharts);
    setEditingChart(null);
    setSelectedCharts(selectedCharts.filter(id => id !== chartId));
    setFullscreenChart(null);
  };

  const toggleRealTime = (chartId: string) => {
    updateChart(chartId, {
      realTime: {
        ...charts.find(c => c.id === chartId)!.realTime,
        enabled: !charts.find(c => c.id === chartId)!.realTime.enabled
      }
    });
  };

  const toggleFullscreen = (chartId: string) => {
    setFullscreenChart(fullscreenChart === chartId ? null : chartId);
  };

  const handleMouseDown = (e: React.MouseEvent, chartId: string) => {
    if (fullscreenChart) return; // Disable drag in fullscreen mode
    
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;

    setDraggedChart(chartId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedChart || !containerRef.current || fullscreenChart) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    updateChart(draggedChart, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) }
    });
  }, [draggedChart, dragOffset, fullscreenChart]);

  const handleMouseUp = useCallback(() => {
    setDraggedChart(null);
  }, []);

  useEffect(() => {
    if (draggedChart) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedChart, handleMouseMove, handleMouseUp]);

  const toggleChartSelection = (chartId: string) => {
    if (fullscreenChart) return;
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
  };

  const deleteSelectedCharts = () => {
    const updatedCharts = charts.filter(chart => !selectedCharts.includes(chart.id));
    setCharts(updatedCharts);
    onChartUpdate(updatedCharts);
    setSelectedCharts([]);
    setFullscreenChart(null);
  };

  const renderChart = (chart: ChartData) => {
    const chartData = realTimeData[chart.id] || chart.data;
    const commonProps = {
      data: chartData,
      width: chart.size.width,
      height: chart.size.height
    };

    const renderTooltip = (props: any) => (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{props.label}</p>
        {props.payload && props.payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );

    switch (chart.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={chart.xAxis} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            {chart.config.showTooltip && <Tooltip content={renderTooltip} />}
            {chart.config.showLegend && <Legend />}
            <Line 
              type={chart.config.smooth ? "monotone" : "linear"}
              dataKey={chart.yAxis} 
              stroke={chart.color} 
              strokeWidth={chart.config.strokeWidth}
              opacity={chart.config.opacity}
              dot={{ fill: chart.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chart.color, strokeWidth: 2 }}
              animationDuration={chart.config.animation ? 1000 : 0}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={chart.xAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            {chart.config.showTooltip && <Tooltip content={renderTooltip} />}
            {chart.config.showLegend && <Legend />}
            <Bar 
              dataKey={chart.yAxis} 
              fill={chart.color}
              opacity={chart.config.opacity}
              radius={[4, 4, 0, 0]}
              animationDuration={chart.config.animation ? 1000 : 0}
            />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={chartData}
              cx={chart.size.width / 2}
              cy={chart.size.height / 2}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={chart.size.width * 0.35}
              fill={chart.color}
              dataKey={chart.yAxis}
              opacity={chart.config.opacity}
              animationDuration={chart.config.animation ? 1000 : 0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={defaultColors[index % defaultColors.length]}
                  opacity={chart.config.fillOpacity}
                />
              ))}
            </Pie>
            {chart.config.showTooltip && <Tooltip content={renderTooltip} />}
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={chart.xAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            {chart.config.showTooltip && <Tooltip content={renderTooltip} />}
            {chart.config.showLegend && <Legend />}
            <Area 
              type={chart.config.smooth ? "monotone" : "linear"}
              dataKey={chart.yAxis} 
              stroke={chart.color} 
              fill={chart.color} 
              fillOpacity={chart.config.fillOpacity}
              strokeWidth={chart.config.strokeWidth}
              animationDuration={chart.config.animation ? 1000 : 0}
            />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={chart.xAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            {chart.config.showTooltip && <Tooltip content={renderTooltip} />}
            {chart.config.showLegend && <Legend />}
            <Scatter 
              dataKey={chart.yAxis} 
              fill={chart.color}
              opacity={chart.config.opacity}
              animationDuration={chart.config.animation ? 1000 : 0}
            />
          </ScatterChart>
        );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={chart.xAxis}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            {chart.config.showTooltip && <Tooltip content={renderTooltip} />}
            {chart.config.showLegend && <Legend />}
            <Bar 
              dataKey={chart.yAxis} 
              fill={chart.color}
              opacity={chart.config.opacity * 0.6}
              radius={[4, 4, 0, 0]}
            />
            <Line 
              type="monotone"
              dataKey={chart.secondaryYAxis || chart.yAxis} 
              stroke={chart.secondaryColor || defaultColors[1]}
              strokeWidth={chart.config.strokeWidth}
              opacity={chart.config.opacity}
            />
          </ComposedChart>
        );
      default:
        return null;
    }
  };

  const renderChartEditor = (chart: ChartData) => {
    if (editingChart !== chart.id) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-semibold text-gray-900">Chart Configuration</h4>
            <button
              onClick={() => setEditingChart(null)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
              <input
                type="text"
                value={chart.title}
                onChange={(e) => updateChart(chart.id, { title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <select
                value={chart.type}
                onChange={(e) => updateChart(chart.id, { type: e.target.value as ChartData['type'] })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="area">Area Chart</option>
                <option value="scatter">Scatter Chart</option>
                <option value="composed">Composed Chart</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">X Axis</label>
              <select
                value={chart.xAxis}
                onChange={(e) => updateChart(chart.id, { xAxis: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.keys(data[0] || {}).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Y Axis</label>
              <select
                value={chart.yAxis}
                onChange={(e) => updateChart(chart.id, { yAxis: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.keys(data[0] || {}).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opacity</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={chart.config.opacity}
                onChange={(e) => updateChart(chart.id, { 
                  config: { ...chart.config, opacity: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{chart.config.opacity}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Width</label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={chart.config.strokeWidth}
                onChange={(e) => updateChart(chart.id, { 
                  config: { ...chart.config, strokeWidth: parseInt(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{chart.config.strokeWidth}px</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chart.config.showGrid}
                  onChange={(e) => updateChart(chart.id, { 
                    config: { ...chart.config, showGrid: e.target.checked }
                  })}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Show Grid
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chart.config.showLegend}
                  onChange={(e) => updateChart(chart.id, { 
                    config: { ...chart.config, showLegend: e.target.checked }
                  })}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Show Legend
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chart.config.showTooltip}
                  onChange={(e) => updateChart(chart.id, { 
                    config: { ...chart.config, showTooltip: e.target.checked }
                  })}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Show Tooltip
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chart.config.animation}
                  onChange={(e) => updateChart(chart.id, { 
                    config: { ...chart.config, animation: e.target.checked }
                  })}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Enable Animation
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chart.config.smooth}
                  onChange={(e) => updateChart(chart.id, { 
                    config: { ...chart.config, smooth: e.target.checked }
                  })}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Smooth Lines
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={chart.realTime.enabled}
                  onChange={() => toggleRealTime(chart.id)}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Real-time Updates
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditingChart(null)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Configuration
            </button>
            <button
              onClick={() => deleteChart(chart.id)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Chart
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg font-medium mb-2">No data available</p>
        <p className="text-sm">Please upload a CSV file to generate professional flow charts</p>
      </div>
    );
  }

  if (fullscreenChart) {
    const chart = charts.find(c => c.id === fullscreenChart);
    if (!chart) return null;

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900">{chart.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => toggleRealTime(chart.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                chart.realTime.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {chart.realTime.enabled ? 'Real-time ON' : 'Real-time OFF'}
            </button>
            <button
              onClick={() => toggleFullscreen(chart.id)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Minimize2 size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full h-full max-w-6xl max-h-[80vh]">
            {renderChart(chart)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Chart Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Professional Data Flow Charts</h3>
          <p className="text-gray-600 mt-1">Create, customize, and analyze your data with precision</p>
        </div>
        <div className="flex gap-3">
          {selectedCharts.length > 0 && (
            <button
              onClick={deleteSelectedCharts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedCharts.length})
            </button>
          )}
          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value as ChartData['type'])}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
            <option value="scatter">Scatter Chart</option>
            <option value="composed">Composed Chart</option>
          </select>
          <button
            onClick={() => setShowChartSelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Chart
          </button>
        </div>
      </div>

      {/* Chart Selector Modal */}
      {showChartSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Chart</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value as ChartData['type'])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="scatter">Scatter Chart</option>
                  <option value="composed">Composed Chart</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addNewChart}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Chart
                </button>
                <button
                  onClick={() => setShowChartSelector(false)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Charts Canvas */}
      <div 
        ref={containerRef}
        className="relative min-h-[900px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300"
        style={{ position: 'relative' }}
      >
        {charts.map((chart) => (
          <div
            key={chart.id}
            className={`absolute bg-white rounded-xl shadow-xl border-2 transition-all duration-200 ${
              selectedCharts.includes(chart.id) 
                ? 'border-blue-500 shadow-2xl' 
                : 'border-gray-200 hover:border-gray-300'
            } ${draggedChart === chart.id ? 'z-50' : 'z-10'}`}
            style={{
              left: chart.position.x,
              top: chart.position.y,
              width: chart.size.width,
              height: chart.size.height,
              cursor: draggedChart === chart.id ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handleMouseDown(e, chart.id)}
            onClick={() => toggleChartSelection(chart.id)}
          >
            {/* Professional Chart Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-900 truncate">{chart.title}</h4>
                {chart.realTime.enabled && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRealTime(chart.id);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    chart.realTime.enabled 
                      ? 'text-green-600 hover:bg-green-100' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title="Toggle Real-time"
                >
                  <RefreshCw size={16} className={chart.realTime.enabled ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen(chart.id);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChart(chart.id);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Configure Chart"
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChart(chart.id);
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete Chart"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Professional Chart Content */}
            <div className="p-4">
              {renderChart(chart)}
            </div>

            {/* Chart Editor Overlay */}
            {renderChartEditor(chart)}
          </div>
        ))}

        {charts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl font-medium mb-2">No charts yet</p>
            <p className="text-sm text-gray-400">Click "Add Chart" to create your first professional visualization</p>
            <p className="text-xs mt-2 text-gray-300">Drag charts to reposition • Click to select • Use settings for customization</p>
          </div>
        )}
      </div>

      {/* Professional Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Palette size={20} />
          Professional Chart Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-2">🎯 Chart Management</h5>
            <ul className="space-y-1">
              <li>• Drag & drop charts for precise positioning</li>
              <li>• Multi-select charts for batch operations</li>
              <li>• Fullscreen mode for detailed analysis</li>
              <li>• Real-time data updates with live indicators</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">⚙️ Advanced Configuration</h5>
            <ul className="space-y-1">
              <li>• Customize opacity, stroke width, and colors</li>
              <li>• Toggle grid, legend, and tooltip visibility</li>
              <li>• Enable smooth animations and transitions</li>
              <li>• Professional chart types with optimal defaults</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalFlowChart;
