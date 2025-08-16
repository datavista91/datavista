import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';

interface FlowChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: {
    showGrid: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    opacity: number;
  };
}

interface FlowChartProps {
  data: any[];
  onChartUpdate: (charts: FlowChartData[]) => void;
}

const EnhancedFlowChart: React.FC<FlowChartProps> = ({ data, onChartUpdate }) => {
  const [charts, setCharts] = useState<FlowChartData[]>([]);
  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'pie' | 'area' | 'scatter'>('line');
  const [showChartSelector, setShowChartSelector] = useState(false);
  const [draggedChart, setDraggedChart] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ff6b6b', '#4ecdc4'];

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

    const initialCharts: FlowChartData[] = [];

    // Generate line chart for numeric data
    if (numericHeaders.length >= 2) {
      const chartData = data.slice(0, 20).map((row, index) => ({
        index,
        [numericHeaders[0]]: Number(row[numericHeaders[0]]),
        [numericHeaders[1]]: Number(row[numericHeaders[1]])
      }));

      initialCharts.push({
        id: 'chart-1',
        type: 'line',
        title: `${numericHeaders[0]} vs ${numericHeaders[1]}`,
        data: chartData,
        xAxis: 'index',
        yAxis: numericHeaders[0],
        color: defaultColors[0],
        position: { x: 20, y: 20 },
        size: { width: 450, height: 350 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 1
        }
      });
    }

    // Generate bar chart for categorical data
    if (categoricalHeaders.length > 0 && numericHeaders.length > 0) {
      const categories = [...new Set(data.slice(0, 15).map(row => row[categoricalHeaders[0]]))];
      const chartData = categories.map(category => {
        const filteredData = data.filter(row => row[categoricalHeaders[0]] === category);
        const avgValue = filteredData.reduce((sum, row) => sum + Number(row[numericHeaders[0]] || 0), 0) / filteredData.length;
        return { category, value: Math.round(avgValue * 100) / 100 };
      });

      initialCharts.push({
        id: 'chart-2',
        type: 'bar',
        title: `${categoricalHeaders[0]} Distribution`,
        data: chartData,
        xAxis: 'category',
        yAxis: 'value',
        color: defaultColors[1],
        position: { x: 500, y: 20 },
        size: { width: 450, height: 350 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 0.8
        }
      });
    }

    // Generate pie chart
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
        title: `${categoricalHeaders[0]} Proportions`,
        data: chartData,
        xAxis: 'name',
        yAxis: 'value',
        color: defaultColors[2],
        position: { x: 20, y: 400 },
        size: { width: 450, height: 350 },
        config: {
          showGrid: false,
          showLegend: true,
          showTooltip: true,
          opacity: 0.9
        }
      });
    }

    // Generate area chart
    if (numericHeaders.length >= 2) {
      const chartData = data.slice(0, 25).map((row, index) => ({
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
        position: { x: 500, y: 400 },
        size: { width: 450, height: 350 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 0.6
        }
      });
    }

    setCharts(initialCharts);
    onChartUpdate(initialCharts);
  };

  const addNewChart = () => {
    const headers = Object.keys(data[0] || {});
    const newChart: FlowChartData = {
      id: `chart-${Date.now()}`,
      type: selectedChartType,
      title: `New ${selectedChartType} Chart`,
      data: data.slice(0, 20),
      xAxis: headers[0] || '',
      yAxis: headers[1] || '',
      color: defaultColors[charts.length % defaultColors.length],
      position: { x: 20 + (charts.length * 60), y: 20 + (charts.length * 60) },
      size: { width: 450, height: 350 },
      config: {
        showGrid: true,
        showLegend: true,
        showTooltip: true,
        opacity: 0.8
      }
    };

    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    onChartUpdate(updatedCharts);
    setShowChartSelector(false);
  };

  const updateChart = (chartId: string, updates: Partial<FlowChartData>) => {
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
  };

  const handleMouseDown = (e: React.MouseEvent, chartId: string) => {
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
    if (!draggedChart || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    updateChart(draggedChart, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) }
    });
  }, [draggedChart, dragOffset]);

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
  };

  const renderChart = (chart: FlowChartData) => {
    const commonProps = {
      data: chart.data,
      width: chart.size.width,
      height: chart.size.height
    };

    switch (chart.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey={chart.xAxis} />
            <YAxis />
            {chart.config.showTooltip && <Tooltip />}
            {chart.config.showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={chart.color} 
              strokeWidth={2}
              opacity={chart.config.opacity}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey={chart.xAxis} />
            <YAxis />
            {chart.config.showTooltip && <Tooltip />}
            {chart.config.showLegend && <Legend />}
            <Bar 
              dataKey={chart.yAxis} 
              fill={chart.color}
              opacity={chart.config.opacity}
            />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={chart.data}
              cx={chart.size.width / 2}
              cy={chart.size.height / 2}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill={chart.color}
              dataKey={chart.yAxis}
              opacity={chart.config.opacity}
            >
              {chart.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            {chart.config.showTooltip && <Tooltip />}
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey={chart.xAxis} />
            <YAxis />
            {chart.config.showTooltip && <Tooltip />}
            {chart.config.showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={chart.color} 
              fill={chart.color} 
              fillOpacity={chart.config.opacity}
            />
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis dataKey={chart.xAxis} />
            <YAxis />
            {chart.config.showTooltip && <Tooltip />}
            {chart.config.showLegend && <Legend />}
            <Scatter 
              dataKey={chart.yAxis} 
              fill={chart.color}
              opacity={chart.config.opacity}
            />
          </ScatterChart>
        );
      default:
        return null;
    }
  };

  const renderChartEditor = (chart: FlowChartData) => {
    if (editingChart !== chart.id) return null;

    return (
      <div className="absolute top-0 left-0 w-full h-full bg-white border-2 border-blue-500 rounded-lg p-4 z-50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">Edit Chart</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingChart(null)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={chart.title}
              onChange={(e) => updateChart(chart.id, { title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
            <select
              value={chart.type}
              onChange={(e) => updateChart(chart.id, { type: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="area">Area Chart</option>
              <option value="scatter">Scatter Chart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X Axis</label>
            <select
              value={chart.xAxis}
              onChange={(e) => updateChart(chart.id, { xAxis: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Object.keys(data[0] || {}).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y Axis</label>
            <select
              value={chart.yAxis}
              onChange={(e) => updateChart(chart.id, { yAxis: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Object.keys(data[0] || {}).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
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
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={chart.config.showGrid}
                onChange={(e) => updateChart(chart.id, { 
                  config: { ...chart.config, showGrid: e.target.checked }
                })}
                className="mr-2"
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
                className="mr-2"
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
                className="mr-2"
              />
              Show Tooltip
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEditingChart(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save size={16} className="inline mr-2" />
            Save
          </button>
          <button
            onClick={() => deleteChart(chart.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 size={16} className="inline mr-2" />
            Delete
          </button>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available. Please upload a file to generate flow charts.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Interactive Data Flow Charts</h3>
        <div className="flex gap-2">
          {selectedCharts.length > 0 && (
            <button
              onClick={deleteSelectedCharts}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedCharts.length})
            </button>
          )}
          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
            <option value="scatter">Scatter Chart</option>
          </select>
          <button
            onClick={() => setShowChartSelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Chart
          </button>
        </div>
      </div>

      {/* Chart Selector Modal */}
      {showChartSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Chart</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
                <select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="scatter">Scatter Chart</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addNewChart}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Chart
                </button>
                <button
                  onClick={() => setShowChartSelector(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Container */}
      <div 
        ref={containerRef}
        className="relative min-h-[800px] bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300"
        style={{ position: 'relative' }}
      >
        {charts.map((chart) => (
          <div
            key={chart.id}
            className={`absolute bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${
              selectedCharts.includes(chart.id) 
                ? 'border-blue-500 shadow-xl' 
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
            {/* Chart Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h4 className="font-medium text-gray-900 truncate">{chart.title}</h4>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChart(chart.id);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Edit Chart"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChart(chart.id);
                  }}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Delete Chart"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-2">
              {renderChart(chart)}
            </div>

            {/* Chart Editor Overlay */}
            {renderChartEditor(chart)}
          </div>
        ))}

        {charts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No charts yet</p>
            <p className="text-sm">Click "Add Chart" to create your first visualization</p>
            <p className="text-xs mt-2 text-gray-400">Drag charts to reposition them</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 How to use:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Add Chart" to create new visualizations</li>
          <li>• Drag charts to reposition them on the canvas</li>
          <li>• Click the edit icon to customize chart properties</li>
          <li>• Select multiple charts by clicking on them</li>
          <li>• Use the configuration panel to adjust chart appearance</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedFlowChart;
