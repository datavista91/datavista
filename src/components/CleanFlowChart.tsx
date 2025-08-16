import { Database, Download, Maximize2, Plus, RefreshCw, Settings, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis, YAxis
} from 'recharts';

interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'composed' | 'radar' | 'funnel' | 'heatmap';
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
    smooth: boolean;
    fillOpacity: number;
    showDataLabels: boolean;
  };
  realTime: {
    enabled: boolean;
    interval: number;
    maxDataPoints: number;
  };
  fileSource?: string; // Track which file this chart is from
  // New editing properties
  customColors?: { [key: string]: string };
  customSizes?: { [key: string]: number };
  customOpacities?: { [key: string]: number };
  customStrokes?: { [key: string]: number };
  annotations?: Array<{
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
  }>;
}

interface CleanFlowChartProps {
  data: any[];
  onChartUpdate: (charts: ChartData[]) => void;
}

  const CleanFlowChart: React.FC<CleanFlowChartProps> = ({ data, onChartUpdate }) => {
    const [charts, setCharts] = useState<ChartData[]>([]);
    const [editingChart, setEditingChart] = useState<string | null>(null);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);
    const isUpdatingRef = useRef(false);
    const [isGeneratingCharts, setIsGeneratingCharts] = useState(false);
    const [selectedChartType, setSelectedChartType] = useState<ChartData['type']>('line');
    const [showChartSelector, setShowChartSelector] = useState(false);
    const [draggedChart, setDraggedChart] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
    const [fullscreenChart, setFullscreenChart] = useState<string | null>(null);
    const [realTimeData, setRealTimeData] = useState<{ [key: string]: any[] }>({});
    const containerRef = useRef<HTMLDivElement>(null);

    // New editing states
    const [editingDataPoint, setEditingDataPoint] = useState<{ chartId: string; index: number; field: string } | null>(null);
    const [showDataEditor, setShowDataEditor] = useState(false);
    const [showChartEditor, setShowChartEditor] = useState<string | null>(null);
    const [showAnnotations, setShowAnnotations] = useState(false);
    const [editingAnnotation, setEditingAnnotation] = useState<{ chartId: string; annotationId: string } | null>(null);

    // Simple update function to prevent infinite loops
    const debouncedUpdate = useCallback((updatedCharts: ChartData[]) => {
      console.log('debouncedUpdate called with:', updatedCharts);
      
      // If already updating, skip this call
      if (isUpdatingRef.current) {
        console.log('Update already in progress, skipping...');
        return;
      }
      
      // Set updating flag
      isUpdatingRef.current = true;
      console.log('Setting update flag, calling onChartUpdate immediately');
      
      // Call onChartUpdate immediately
      onChartUpdate(updatedCharts);
      console.log('onChartUpdate called successfully');
      
      // Reset flag after a short delay to allow future updates
      setTimeout(() => {
        isUpdatingRef.current = false;
        console.log('Update flag reset, future updates can proceed');
      }, 100);
    }, [onChartUpdate]);

  // Download functions
  const downloadChartAsImage = useCallback((chartId: string) => {
    const chartElement = document.getElementById(`chart-${chartId}`);
    if (!chartElement) return;

    // Use html2canvas to capture the chart
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `chart-${chartId}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  }, []);

  const downloadChartAsCSV = useCallback((chartId: string) => {
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;

    const csvContent = [
      [chart.xAxis, chart.yAxis, ...(chart.secondaryYAxis ? [chart.secondaryYAxis] : [])],
      ...chart.data.map(row => [
        row[chart.xAxis] || '',
        row[chart.yAxis] || '',
        ...(chart.secondaryYAxis ? [row[chart.secondaryYAxis] || ''] : [])
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-${chartId}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [charts]);

  const downloadAllChartsAsZip = useCallback(async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add CSV files for each chart
      charts.forEach(chart => {
        const csvContent = [
          [chart.xAxis, chart.yAxis, ...(chart.secondaryYAxis ? [chart.secondaryYAxis] : [])],
          ...chart.data.map(row => [
            row[chart.xAxis] || '',
            row[chart.yAxis] || '',
            ...(chart.secondaryYAxis ? [row[chart.secondaryYAxis] || ''] : [])
          ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        zip.file(`chart-${chart.id}.csv`, csvContent);
      });

      // Add a summary file
      const summary = {
        totalCharts: charts.length,
        charts: charts.map(chart => ({
          id: chart.id,
          type: chart.type,
          title: chart.title,
          dataPoints: chart.data.length,
          xAxis: chart.xAxis,
          yAxis: chart.yAxis
        }))
      };

      zip.file('charts-summary.json', JSON.stringify(summary, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `flowcharts-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      alert('Error creating ZIP file. Please try again.');
    }
  }, [charts]);

  const defaultColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  const generateRealTimePoint = useCallback((chart: ChartData, currentData: any[]) => {
    if (currentData.length === 0) return {};
    
    const lastPoint = currentData[currentData.length - 1];
    const baseValue = typeof lastPoint[chart.yAxis] === 'number' ? lastPoint[chart.yAxis] : 0;
    
    const variation = (Math.random() - 0.5) * 0.1 * baseValue;
    const newValue = Math.max(0, baseValue + variation);
    
    return {
      [chart.xAxis]: currentData.length,
      [chart.yAxis]: Math.round(newValue * 100) / 100,
      timestamp: new Date().toISOString()
    };
  }, []);

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
  }, [charts, generateRealTimePoint]);

  const generateInitialCharts = useCallback(() => {
    if (data.length === 0 || isGeneratingCharts) return;
    setIsGeneratingCharts(true);

    const headers = Object.keys(data[0]);
    const numericHeaders = headers.filter(header => 
      typeof data[0][header] === 'number' || !isNaN(Number(data[0][header]))
    );
    const categoricalHeaders = headers.filter(header => 
      typeof data[0][header] === 'string' && !numericHeaders.includes(header)
    );

    const initialCharts: ChartData[] = [];

    // Line Chart
    if (numericHeaders.length >= 2) {
      const chartData = data.slice(0, 50).map((row, index) => ({
        index,
        [numericHeaders[0]]: Number(row[numericHeaders[0]]),
        [numericHeaders[1]]: Number(row[numericHeaders[1]])
      }));

      initialCharts.push({
        id: 'chart-1',
        type: 'line',
        title: `${numericHeaders[0]} Trend Analysis`,
        data: chartData,
        xAxis: 'index',
        yAxis: numericHeaders[0],
        color: defaultColors[0],
        size: { width: 600, height: 450 },
        position: { x: 20, y: 20 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 1,
          strokeWidth: 3,
          smooth: true,
          fillOpacity: 0.3,
          showDataLabels: false
        },
        realTime: {
          enabled: false,
          interval: 1000,
          maxDataPoints: 100
        },
        customColors: {},
        customSizes: {},
        customOpacities: {},
        customStrokes: {},
        annotations: []
      });
    }

    // Bar Chart
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
        title: `${categoricalHeaders[0]} Distribution`,
        data: chartData,
        xAxis: 'category',
        yAxis: 'value',
        color: defaultColors[1],
        size: { width: 600, height: 450 },
        position: { x: 650, y: 20 },
        config: {
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          opacity: 0.9,
          strokeWidth: 2,
          smooth: false,
          fillOpacity: 0.3,
          showDataLabels: false
        },
        realTime: {
          enabled: false,
          interval: 1000,
          maxDataPoints: 50
        },
        customColors: {},
        customSizes: {},
        customOpacities: {},
        customStrokes: {},
        annotations: []
      });
    }

    // Pie Chart
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
        size: { width: 500, height: 500 },
        position: { x: 20, y: 500 },
        config: {
          showGrid: false,
          showLegend: true,
          showTooltip: true,
          opacity: 0.9,
          strokeWidth: 2,
          smooth: false,
          fillOpacity: 0.3,
          showDataLabels: false
        },
        realTime: {
          enabled: false,
          interval: 1000,
          maxDataPoints: 20
        },
        customColors: {},
        customSizes: {},
        customOpacities: {},
        customStrokes: {},
        annotations: []
      });
    }

    setCharts(initialCharts);
    // Use debounced update to prevent infinite loops
    debouncedUpdate(initialCharts);
    // Reset loading state after a short delay
    setTimeout(() => setIsGeneratingCharts(false), 100);
  }, [data, defaultColors, debouncedUpdate]);

  useEffect(() => {
    if (data.length > 0) {
      generateInitialCharts();
    }
  }, [data, generateInitialCharts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, clearing timeout');
      isMountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);



  const addNewChart = useCallback(() => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0] || {});
    const newChart: ChartData = {
      id: `chart-${Date.now()}`,
      type: selectedChartType,
      title: `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart ${charts.length + 1}`,
      data: data.slice(0, 10), // Use first 10 rows
      xAxis: headers[0] || '',
      yAxis: headers[1] || '',
      color: defaultColors[charts.length % defaultColors.length],
      size: { width: 400, height: 300 },
      position: { x: 50 + (charts.length * 50), y: 50 + (charts.length * 50) },
      config: {
        showGrid: true,
        showLegend: true,
        showTooltip: true,
        opacity: 0.8,
        strokeWidth: 2,
        smooth: true,
        fillOpacity: 0.3,
        showDataLabels: false
      },
      realTime: {
        enabled: false,
        interval: 2000,
        maxDataPoints: 50
      },
      customColors: {},
      customSizes: {},
      customOpacities: {},
      customStrokes: {},
      annotations: []
    };
    
    setCharts(prev => [...prev, newChart]);
    setShowChartSelector(false);
    // Use debounced update to prevent infinite loops
    debouncedUpdate([...charts, newChart]);
  }, [data, selectedChartType, charts, debouncedUpdate, defaultColors]);

  const updateChart = useCallback((chartId: string, updates: Partial<ChartData>) => {
    const updatedCharts = charts.map(chart => 
      chart.id === chartId ? { ...chart, ...updates } : chart
    );
    setCharts(updatedCharts);
    // Use debounced update to prevent infinite loops
    debouncedUpdate(updatedCharts);
  }, [charts, debouncedUpdate]);

  const deleteChart = useCallback((chartId: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== chartId);
    setCharts(updatedCharts);
    // Use debounced update to prevent infinite loops
    debouncedUpdate(updatedCharts);
    setShowChartEditor(null);
    setSelectedCharts(selectedCharts.filter(id => id !== chartId));
    setFullscreenChart(null);
  }, [charts, selectedCharts, debouncedUpdate]);

  const toggleRealTime = useCallback((chartId: string) => {
    updateChart(chartId, {
      realTime: {
        ...charts.find(c => c.id === chartId)!.realTime,
        enabled: !charts.find(c => c.id === chartId)!.realTime.enabled
      }
    });
  }, [charts, updateChart]);

  const toggleFullscreen = useCallback((chartId: string) => {
    setFullscreenChart(fullscreenChart === chartId ? null : chartId);
  }, [fullscreenChart]);

  const handleMouseDown = useCallback((e: React.MouseEvent, chartId: string) => {
    if (fullscreenChart) return;
    
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;

    setDraggedChart(chartId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [fullscreenChart, charts]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedChart || !containerRef.current || fullscreenChart) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    updateChart(draggedChart, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) }
    });
  }, [draggedChart, dragOffset, fullscreenChart, updateChart]);

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

  const toggleChartSelection = useCallback((chartId: string) => {
    if (fullscreenChart) return;
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
  }, [fullscreenChart]);

  const deleteSelectedCharts = useCallback(() => {
    const updatedCharts = charts.filter(chart => !selectedCharts.includes(chart.id));
    setCharts(updatedCharts);
    // Use debounced update to prevent infinite loops
    debouncedUpdate(updatedCharts);
    setSelectedCharts([]);
    setFullscreenChart(null);
  }, [charts, selectedCharts, debouncedUpdate]);

  // Data editing functions
  const editDataPoint = useCallback((chartId: string, index: number, field: string, value: any) => {
    console.log('editDataPoint called:', { chartId, index, field, value });
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const newData = [...chart.data];
          newData[index] = { ...newData[index], [field]: value };
          console.log('Updated data point:', newData[index]);
          return { ...chart, data: newData };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const addDataPoint = useCallback((chartId: string) => {
    console.log('addDataPoint function called for chart:', chartId);
    
    // Prevent multiple executions
    if (updateTimeoutRef.current) {
      console.log('Update already in progress, skipping...');
      return;
    }
    
    setCharts(prev => {
      console.log('Previous charts state:', prev);
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          console.log('Found chart to update:', chart);
          const newPoint: any = {};
          if (chart.data.length > 0) {
            Object.keys(chart.data[0]).forEach(key => {
              if (typeof chart.data[0][key] === 'number') {
                newPoint[key] = Math.floor(Math.random() * 100);
              } else {
                newPoint[key] = `New ${key}`;
              }
            });
          }
          console.log('New data point to add:', newPoint);
          const updatedChart = { ...chart, data: [...chart.data, newPoint] };
          console.log('Updated chart:', updatedChart);
          return updatedChart;
        }
        return chart;
      });
      console.log('Updated charts array:', updatedCharts);
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const removeDataPoint = useCallback((chartId: string, index: number) => {
    console.log('removeDataPoint function called with:', { chartId, index });
    
    // Prevent multiple executions
    if (updateTimeoutRef.current) {
      console.log('Update already in progress, skipping...');
      return;
    }
    
    setCharts(prev => {
      console.log('Previous charts state:', prev);
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          console.log('Found chart to update:', chart);
          const newData = chart.data.filter((_, i) => i !== index);
          console.log('New data after removal:', newData);
          return { ...chart, data: newData };
        }
        return chart;
      });
      console.log('Updated charts array:', updatedCharts);
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);



  const duplicateDataPoint = useCallback((chartId: string, index: number) => {
    console.log('duplicateDataPoint function called with:', { chartId, index });
    
    // Prevent multiple executions
    if (updateTimeoutRef.current) {
      console.log('Update already in progress, skipping...');
      return;
    }
    
    setCharts(prev => {
      console.log('Previous charts state:', prev);
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          console.log('Found chart to update:', chart);
          const duplicatedPoint = { ...chart.data[index] };
          console.log('Duplicated point:', duplicatedPoint);
          const updatedChart = { ...chart, data: [...chart.data, duplicatedPoint] };
          console.log('Updated chart:', updatedChart);
          return updatedChart;
        }
        return chart;
      });
      console.log('Updated charts array:', updatedCharts);
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  // Chart customization functions
  const updateChartProperty = useCallback((chartId: string, property: string, value: any) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          return { ...chart, [property]: value };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const updateChartConfig = useCallback((chartId: string, configKey: string, value: any) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          return {
            ...chart,
            config: { ...chart.config, [configKey]: value }
          };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const updateCustomColor = useCallback((chartId: string, elementKey: string, color: string) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const customColors = { ...chart.customColors, [elementKey]: color };
          return { ...chart, customColors };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const updateCustomSize = useCallback((chartId: string, elementKey: string, size: number) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const customSizes = { ...chart.customSizes, [elementKey]: size };
          return { ...chart, customSizes };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const updateCustomOpacity = useCallback((chartId: string, elementKey: string, opacity: number) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const customOpacities = { ...chart.customOpacities, [elementKey]: opacity };
          return { ...chart, customOpacities };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const updateCustomStroke = useCallback((chartId: string, elementKey: string, stroke: number) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const customStrokes = { ...chart.customStrokes, [elementKey]: stroke };
          return { ...chart, customStrokes };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  // Annotation functions
  const addAnnotation = useCallback((chartId: string, x: number, y: number, text: string) => {
    const newAnnotation = {
      id: `annotation-${Date.now()}`,
      x,
      y,
      text,
      color: '#3B82F6',
      fontSize: 12
    };

    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const annotations = [...(chart.annotations || []), newAnnotation];
          return { ...chart, annotations };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const updateAnnotation = useCallback((chartId: string, annotationId: string, updates: Partial<NonNullable<ChartData['annotations']>[0]>) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const annotations = chart.annotations?.map(ann => 
            ann.id === annotationId ? { ...ann, ...updates } : ann
          ) || [];
          return { ...chart, annotations };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);

  const removeAnnotation = useCallback((chartId: string, annotationId: string) => {
    setCharts(prev => {
      const updatedCharts = prev.map(chart => {
        if (chart.id === chartId) {
          const annotations = chart.annotations?.filter(ann => ann.id !== annotationId) || [];
          return { ...chart, annotations };
        }
        return chart;
      });
      // Use debounced update to prevent infinite loops
      debouncedUpdate(updatedCharts);
      return updatedCharts;
    });
  }, [debouncedUpdate]);





  const renderChartEditor = useCallback((chart: ChartData) => {
    // This function is referenced but not implemented - using modal instead
    return null;
  }, []);

  const renderChart = (chart: ChartData) => {
    const chartData = realTimeData[chart.id] || chart.data;

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%" className="!w-full !h-full">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              {chart.config.showTooltip && <Tooltip />}
              {chart.config.showLegend && <Legend />}
              <Line 
                type={chart.config.smooth ? "monotone" : "linear"}
                dataKey={chart.yAxis} 
                stroke={chart.color} 
                strokeWidth={chart.config.strokeWidth}
                opacity={chart.config.opacity}
                dot={{ fill: chart.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chart.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%" className="!w-full !h-full">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              {chart.config.showTooltip && <Tooltip />}
              {chart.config.showLegend && <Legend />}
              <Bar 
                dataKey={chart.yAxis} 
                fill={chart.color}
                opacity={chart.config.opacity}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%" className="!w-full !h-full">
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius="80%"
                fill={chart.color}
                dataKey={chart.yAxis}
                opacity={chart.config.opacity}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={defaultColors[index % defaultColors.length]}
                  />
                ))}
              </Pie>
              {chart.config.showTooltip && <Tooltip />}
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%" className="!w-full !h-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              {chart.config.showTooltip && <Tooltip />}
              {chart.config.showLegend && <Legend />}
              <Area 
                type={chart.config.smooth ? "monotone" : "linear"}
                dataKey={chart.yAxis} 
                stroke={chart.color} 
                fill={chart.color} 
                fillOpacity={chart.config.fillOpacity}
                strokeWidth={chart.config.strokeWidth}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData}>
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
              {chart.config.showTooltip && <Tooltip />}
              {chart.config.showLegend && <Legend />}
              <Scatter 
                dataKey={chart.yAxis} 
                fill={chart.color}
                opacity={chart.config.opacity}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
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
              {chart.config.showTooltip && <Tooltip />}
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
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey={chart.xAxis} />
              <PolarRadiusAxis />
              {chart.config.showTooltip && <Tooltip />}
              {chart.config.showLegend && <Legend />}
              <Radar
                dataKey={chart.yAxis}
                stroke={chart.color}
                fill={chart.color}
                fillOpacity={chart.config.fillOpacity}
              />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart data={chartData}>
              {chart.config.showTooltip && <Tooltip />}
              {chart.config.showLegend && <Legend />}
              <Funnel
                dataKey={chart.yAxis}
                data={chartData}
                nameKey={chart.xAxis}
                fill={chart.color}
                stroke={chart.color}
              />
            </FunnelChart>
          </ResponsiveContainer>
        );
      case 'heatmap':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              {chart.config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis type="number" />
              <YAxis dataKey={chart.xAxis} type="category" />
              {chart.config.showTooltip && <Tooltip />}
              {chart.config.showLegend && <Legend />}
              <Bar 
                dataKey={chart.yAxis} 
                fill={chart.color}
                opacity={chart.config.opacity}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
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
              <X size={20} />
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
             <option value="radar">Radar Chart</option>
             <option value="funnel">Funnel Chart</option>
             <option value="heatmap">Heatmap</option>
           </select>
          <div className="flex gap-2">
                          <button
                onClick={() => {
                  console.log('Opening data editor, current charts:', charts);
                  console.log('Current editingDataPoint state:', editingDataPoint);
                  setShowDataEditor(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Database size={16} />
                Edit Data ({charts.length} charts)
              </button>
            <button
              onClick={() => setShowChartSelector(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Chart
            </button>

          </div>
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
                  <option value="radar">Radar Chart</option>
                  <option value="funnel">Funnel Chart</option>
                  <option value="heatmap">Heatmap</option>
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

      {/* Data Editor Modal */}
      {showDataEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Data Editor - Charts: {charts.length}</h3>
              <button
                onClick={() => setShowDataEditor(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Debug Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Debug Info:</strong> 
                Charts: {charts.length}, 
                Total Rows: {charts.reduce((total, chart) => total + chart.data.length, 0)},
                Editing State: {editingDataPoint ? `${editingDataPoint.chartId}-${editingDataPoint.index}-${editingDataPoint.field}` : 'None'}
              </p>
            </div>
            
            <div className="space-y-6">
              {charts.map(chart => (
                <div key={chart.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium">{chart.title}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadChartAsImage(chart.id)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1"
                        title="Download as Image"
                      >
                        <Download size={14} />
                        PNG
                      </button>
                      <button
                        onClick={() => downloadChartAsCSV(chart.id)}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        title="Download as CSV"
                      >
                        <Download size={14} />
                        CSV
                      </button>
                      <button
                        onClick={() => {
                          console.log('Add Row clicked for chart:', chart.id);
                          addDataPoint(chart.id);
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Add Row
                      </button>
                      <button
                        onClick={() => setShowChartEditor(chart.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Chart Settings
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          {chart.data.length > 0 && Object.keys(chart.data[0]).map(key => (
                            <th key={key} className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">
                              {key}
                            </th>
                          ))}
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {chart.data.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {Object.keys(row).map(field => (
                              <td key={field} className="border border-gray-300 px-3 py-2">
                                {editingDataPoint?.chartId === chart.id && 
                                 editingDataPoint?.index === index && 
                                 editingDataPoint?.field === field ? (
                                  <input
                                    type={typeof row[field] === 'number' ? 'number' : 'text'}
                                    value={row[field]}
                                    onChange={(e) => editDataPoint(chart.id, index, field, e.target.value)}
                                    onBlur={() => setEditingDataPoint(null)}
                                    onKeyPress={(e) => e.key === 'Enter' && setEditingDataPoint(null)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                  />
                                ) : (
                                  <div
                                    onClick={() => {
                                      console.log('Cell clicked:', { chartId: chart.id, index, field, value: row[field] });
                                      setEditingDataPoint({ chartId: chart.id, index, field });
                                    }}
                                    className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                  >
                                    {row[field]}
                                  </div>
                                )}
                              </td>
                            ))}
                            <td className="border border-gray-300 px-3 py-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => {
                                    console.log('Duplicate clicked:', { chartId: chart.id, index });
                                    duplicateDataPoint(chart.id, index);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Duplicate"
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    console.log('Delete clicked:', { chartId: chart.id, index });
                                    removeDataPoint(chart.id, index);
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart Editor Modal */}
      {showChartEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Chart Editor</h3>
              <button
                onClick={() => setShowChartEditor(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {charts.find(c => c.id === showChartEditor) && (
              <div className="space-y-6">
                {(() => {
                  const chart = charts.find(c => c.id === showChartEditor)!;
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                          <input
                            type="text"
                            value={chart.title}
                            onChange={(e) => updateChartProperty(chart.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                          <input
                            type="color"
                            value={chart.color}
                            onChange={(e) => updateChartProperty(chart.id, 'color', e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis Field</label>
                          <select
                            value={chart.xAxis}
                            onChange={(e) => updateChartProperty(chart.id, 'xAxis', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {chart.data.length > 0 && Object.keys(chart.data[0]).map(key => (
                              <option key={key} value={key}>{key}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis Field</label>
                          <select
                            value={chart.yAxis}
                            onChange={(e) => updateChartProperty(chart.id, 'yAxis', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {chart.data.length > 0 && Object.keys(chart.data[0]).map(key => (
                              <option key={key} value={key}>{key}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Chart Configuration</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={chart.config.showGrid}
                              onChange={(e) => updateChartConfig(chart.id, 'showGrid', e.target.checked)}
                              className="mr-2"
                            />
                            Show Grid
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={chart.config.showLegend}
                              onChange={(e) => updateChartConfig(chart.id, 'showLegend', e.target.checked)}
                              className="mr-2"
                            />
                            Show Legend
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={chart.config.showTooltip}
                              onChange={(e) => updateChartConfig(chart.id, 'showTooltip', e.target.checked)}
                              className="mr-2"
                            />
                            Show Tooltip
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={chart.config.smooth}
                              onChange={(e) => updateChartConfig(chart.id, 'smooth', e.target.checked)}
                              className="mr-2"
                            />
                            Smooth Lines
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Opacity</label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={chart.config.opacity}
                              onChange={(e) => updateChartConfig(chart.id, 'opacity', parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-sm text-gray-500">{chart.config.opacity}</span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Width</label>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              step="1"
                              value={chart.config.strokeWidth}
                              onChange={(e) => updateChartConfig(chart.id, 'strokeWidth', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-sm text-gray-500">{chart.config.strokeWidth}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fill Opacity</label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={chart.config.fillOpacity}
                              onChange={(e) => updateChartConfig(chart.id, 'fillOpacity', parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-sm text-gray-500">{chart.config.fillOpacity}</span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Labels</label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={chart.config.showDataLabels}
                                onChange={(e) => updateChartConfig(chart.id, 'showDataLabels', e.target.checked)}
                                className="mr-2"
                              />
                              Show Labels
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professional Charts Canvas */}
      <div 
        ref={containerRef}
        className="relative min-h-[1200px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300"
        style={{ position: 'relative' }}
      >
        {charts.map((chart) => (
          <div
            key={chart.id}
            id={`chart-${chart.id}`}
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
                    downloadChartAsImage(chart.id);
                  }}
                  className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Download as PNG"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadChartAsCSV(chart.id);
                  }}
                  className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                  title="Download as CSV"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDataEditor(true);
                  }}
                  className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit Data"
                >
                  <Database size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChartEditor(chart.id);
                  }}
                  className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Chart Settings"
                >
                  <Settings size={16} />
                </button>
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
            <div className="p-4 h-[calc(100%-80px)] overflow-hidden">
              <div className="w-full h-full" style={{ minHeight: '300px' }}>
                {renderChart(chart)}
              </div>
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
        <h4 className="font-semibold text-blue-900 mb-3">🎯 Professional Chart Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-2">Chart Management</h5>
            <ul className="space-y-1">
              <li>• Drag & drop charts for precise positioning</li>
              <li>• Multi-select charts for batch operations</li>
              <li>• Fullscreen mode for detailed analysis</li>
              <li>• Real-time data updates with live indicators</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Configuration</h5>
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

export default CleanFlowChart;
