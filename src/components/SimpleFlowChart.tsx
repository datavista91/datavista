import { Edit3, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';

interface SimpleChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  color: string;
}

interface SimpleFlowChartProps {
  data: any[];
  onChartUpdate: (charts: SimpleChartData[]) => void;
}

const SimpleFlowChart: React.FC<SimpleFlowChartProps> = ({ data, onChartUpdate }) => {
  const [charts, setCharts] = useState<SimpleChartData[]>([]);
  const [editingChart, setEditingChart] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'pie' | 'area'>('line');
  const [showChartSelector, setShowChartSelector] = useState(false);

  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

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

    const initialCharts: SimpleChartData[] = [];

    // Generate line chart for numeric data
    if (numericHeaders.length >= 2) {
      const chartData = data.slice(0, 15).map((row, index) => ({
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
        color: defaultColors[0]
      });
    }

    // Generate bar chart for categorical data
    if (categoricalHeaders.length > 0 && numericHeaders.length > 0) {
      const categories = [...new Set(data.slice(0, 10).map(row => row[categoricalHeaders[0]]))];
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
        color: defaultColors[1]
      });
    }

    // Generate pie chart
    if (categoricalHeaders.length > 0 && numericHeaders.length > 0) {
      const categories = [...new Set(data.slice(0, 6).map(row => row[categoricalHeaders[0]]))];
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
        color: defaultColors[2]
      });
    }

    setCharts(initialCharts);
    onChartUpdate(initialCharts);
  };

  const addNewChart = () => {
    const headers = Object.keys(data[0] || {});
    const newChart: SimpleChartData = {
      id: `chart-${Date.now()}`,
      type: selectedChartType,
      title: `New ${selectedChartType} Chart`,
      data: data.slice(0, 15),
      xAxis: headers[0] || '',
      yAxis: headers[1] || '',
      color: defaultColors[charts.length % defaultColors.length]
    };

    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    onChartUpdate(updatedCharts);
    setShowChartSelector(false);
  };

  const updateChart = (chartId: string, updates: Partial<SimpleChartData>) => {
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
  };

  const renderChart = (chart: SimpleChartData) => {
    const commonProps = {
      data: chart.data,
      width: 400,
      height: 300
    };

    switch (chart.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={chart.yAxis} stroke={chart.color} strokeWidth={2} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={chart.yAxis} fill={chart.color} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={chart.data}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill={chart.color}
              dataKey={chart.yAxis}
            >
              {chart.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chart.xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={chart.yAxis} stroke={chart.color} fill={chart.color} fillOpacity={0.6} />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  const renderChartEditor = (chart: SimpleChartData) => {
    if (editingChart !== chart.id) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Edit Chart</h4>
            <button
              onClick={() => setEditingChart(null)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
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

          <div className="flex gap-2">
            <button
              onClick={() => setEditingChart(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => deleteChart(chart.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
      <div className="text-center py-8 text-gray-500">
        No data available. Please upload a file to generate flow charts.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Data Flow Charts</h3>
        <div className="flex gap-2">
          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <div
            key={chart.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Chart Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-900 truncate">{chart.title}</h4>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingChart(chart.id)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Edit Chart"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => deleteChart(chart.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Delete Chart"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-4 flex justify-center">
              {renderChart(chart)}
            </div>
          </div>
        ))}
      </div>

      {charts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">No charts yet</p>
          <p className="text-sm">Click "Add Chart" to create your first visualization</p>
        </div>
      )}

      {/* Chart Editor Modal */}
      {editingChart && charts.find(c => c.id === editingChart) && renderChartEditor(charts.find(c => c.id === editingChart)!)}
    </div>
  );
};

export default SimpleFlowChart;
