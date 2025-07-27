import {
    ArrowRight,
    BarChart2,
    BarChart3,
    BarChart as ChartBar,
    Check,
    UploadCloud as CloudUpload,
    Database,
    Eye,
    FileText,
    Link,
    MessageSquare,
    PieChart as PieChartIcon,
    ScatterChart,
    Sparkles,
    Squircle,
    TrendingUp,
    X,
    Zap
} from 'lucide-react';
import Papa, { ParseResult } from 'papaparse';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAnalysis } from '../context/AnalysisContext';
import { useData } from '../context/DataContext';

interface FileUploaderProps {
  compact?: boolean;
}

type AnalysisType = 'quick' | 'full' | 'visualization' | 'chat-only' | 'none';

interface FileStatus {
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  file?: File;
  id?: string;
  data?: any[];
  columns?: string[];
}

const FileUploader = ({ compact = false }: FileUploaderProps) => {
  const { addFile, findRelationships } = useData();
  const { analysisData, analyzeData } = useAnalysis();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'selection'>('idle');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType>('none');
  const [filesStatus, setFilesStatus] = useState<FileStatus[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['bar', 'pie']);
  const [showChartSelection, setShowChartSelection] = useState(false);
  const [detectedRelationships, setDetectedRelationships] = useState<any[]>([]);

  const chartOptions = [
    { id: 'bar', label: 'Bar Chart', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'pie', label: 'Pie Chart', icon: <PieChartIcon className="w-4 h-4" /> },
    { id: 'line', label: 'Line Chart', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'scatter', label: 'Scatter Plot', icon: <ScatterChart className="w-4 h-4" /> },
    { id: 'histogram', label: 'Histogram', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const analysisOptions = [
    {
      type: 'quick' as AnalysisType,
      title: 'Quick Overview',
      description: 'Basic statistics and data summary',
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-blue-500',
      features: ['Row/column count', 'Data types', 'Basic statistics', 'Missing values']
    },
    {
      type: 'full' as AnalysisType,
      title: 'Full Analysis',
      description: 'Complete data analysis with insights',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-purple-500',
      features: ['Detailed statistics', 'Data quality report', 'Correlations', 'Outlier detection']
    },
    {
      type: 'visualization' as AnalysisType,
      title: 'Visualization Focus',
      description: 'Optimized for charts and graphs',
      icon: <ChartBar className="w-5 h-5" />,
      color: 'bg-green-500',
      features: ['Chart recommendations', 'Data visualization', 'Graph-ready analysis', 'Visual insights'],
      onClick: () => setShowChartSelection(true)
    },
    {
      type: 'chat-only' as AnalysisType,
      title: 'Chat with AI',
      description: 'Just load data for AI conversations',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-orange-500',
      features: ['AI chat ready', 'Raw data access', 'Interactive analysis', 'Custom queries']
    }
  ];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const newFilesStatus: FileStatus[] = acceptedFiles.map(file => ({
        name: file.name,
        size: file.size,
        status: 'pending',
        file: file,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }));

      setFilesStatus(newFilesStatus);
      setTotalSize(acceptedFiles.reduce((sum, file) => sum + file.size, 0));
      setUploadStatus('loading');

      const processedFiles: FileStatus[] = [];
      let hasError = false;

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const fileStatus = newFilesStatus[i];
        
        try {
          setFilesStatus(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'processing' } : f
          ));

          const result = await new Promise<ParseResult<any>>((resolve, reject) => {
            Papa.parse(file, {
              header: true,
              complete: resolve,
              error: (error) => reject(error)
            });
          });

          if (result.data && result.data.length > 0) {
            const processedFile = {
              ...fileStatus,
              status: 'success' as const,
              data: result.data,
              columns: Object.keys(result.data[0] || {})
            };
            
            processedFiles.push(processedFile);
            
            // Add to data context
            addFile({
              id: fileStatus.id!,
              name: file.name,
              size: file.size,
              uploadDate: new Date().toISOString(),
              data: result.data,
              columns: Object.keys(result.data[0] || {}),
              rowCount: result.data.length
            });
          }
          
          setFilesStatus(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'success' } : f
          ));
        } catch (error) {
          hasError = true;
          setFilesStatus(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Failed to parse file'
            } : f
          ));
        }
      }

      // Detect relationships if multiple files
      if (processedFiles.length > 1) {
        setTimeout(() => {
          findRelationships();
          detectFileRelationships(processedFiles);
        }, 500);
      }

      if (hasError && processedFiles.length === 0) {
        setUploadStatus('error');
        return;
      }

      setUploadStatus(processedFiles.length > 0 ? 'selection' : 'error');
    },
    [addFile, findRelationships]
  );

  const detectFileRelationships = (processedFiles: FileStatus[]) => {
    const relationships = [];
    
    for (let i = 0; i < processedFiles.length; i++) {
      for (let j = i + 1; j < processedFiles.length; j++) {
        const file1 = processedFiles[i];
        const file2 = processedFiles[j];
        
        if (!file1.columns || !file2.columns) continue;
        
        const commonColumns = file1.columns.filter(col => 
          file2.columns!.includes(col)
        );
        
        if (commonColumns.length > 0) {
          relationships.push({
            file1: file1.name,
            file2: file2.name,
            commonColumns,
            type: 'potential-join'
          });
        }
      }
    }
    
    setDetectedRelationships(relationships);
  };

  const handleAnalysisSelection = async (analysisType: AnalysisType) => {
    if (analysisType === 'none') {
      setUploadStatus('success');
      return;
    }

    setSelectedAnalysisType(analysisType);
    setUploadStatus('analyzing');

    if (analysisType === 'visualization') {
      // analysisData.selectedCharts = selectedCharts;
    }

    if (analysisType === 'chat-only') {
      setUploadStatus('success');
      return;
    }

    try {
      // For multi-file analysis, we'll analyze the combined data
      const allData = filesStatus
        .filter(f => f.status === 'success' && f.data)
        .reduce<any[]>((acc, f) => [...acc, ...f.data!], []);
      // Adjust this call to match the actual signature of analyzeData
      await analyzeData(
        allData, 
        filesStatus.map(f => f.name).join(', '), 
        totalSize, 
        analysisType
      );
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: true
  });

  const removeFile = (index: number) => {
    const newFilesStatus = [...filesStatus];
    newFilesStatus.splice(index, 1);
    setFilesStatus(newFilesStatus);
    
    if (newFilesStatus.length === 0) {
      setUploadStatus('idle');
      setDetectedRelationships([]);
    } else {
      const hasErrors = newFilesStatus.some(f => f.status === 'error');
      if (!hasErrors && uploadStatus === 'error') {
        setUploadStatus('selection');
      }
    }
  };

  const retryFile = async (index: number) => {
    const fileStatus = filesStatus[index];
    if (!fileStatus.file) return;

    const newFilesStatus = [...filesStatus];
    newFilesStatus[index] = { ...fileStatus, status: 'processing', error: undefined };
    setFilesStatus(newFilesStatus);
    
    try {
      const result = await new Promise<ParseResult<any>>((resolve, reject) => {
        Papa.parse(fileStatus.file!, {
          header: true,
          complete: resolve,
          error: (error) => reject(error)
        });
      });

      if (result.data && result.data.length > 0) {
        // Add to data context
        addFile({
          id: fileStatus.id!,
          name: fileStatus.name,
          size: fileStatus.size,
          uploadDate: new Date().toISOString(),
          data: result.data,
          columns: Object.keys(result.data[0] || {}),
          rowCount: result.data.length
        });
      }
      
      setFilesStatus(prev => prev.map((f, idx) => 
        idx === index ? { ...f, status: 'success' } : f
      ));
      
      if (uploadStatus === 'error' && newFilesStatus.every(f => f.status === 'success')) {
        setUploadStatus('selection');
      }
    } catch (error) {
      setFilesStatus(prev => prev.map((f, idx) => 
        idx === index ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Failed to parse file'
        } : f
      ));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const ChartSelectionModal = () => {
    const toggleChart = (chartId: string) => {
      setSelectedCharts(prev => 
        prev.includes(chartId) 
          ? prev.filter(id => id !== chartId) 
          : [...prev, chartId]
      );
    };

    const confirmSelection = () => {
      if (selectedCharts.length > 0) {
        handleAnalysisSelection('visualization');
      }
      setShowChartSelection(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Select Charts to Display</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose which charts you want to see in your visualization analysis
          </p>
          
          <div className="space-y-2 mb-6">
            {chartOptions.map(option => (
              <div 
                key={option.id}
                onClick={() => toggleChart(option.id)}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCharts.includes(option.id) 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`mr-3 p-1.5 rounded ${
                  selectedCharts.includes(option.id) 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.icon}
                </div>
                <span className="font-medium">{option.label}</span>
                {selectedCharts.includes(option.id) && (
                  <Check className="ml-auto h-5 w-5 text-purple-600" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowChartSelection(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmSelection}
              disabled={selectedCharts.length === 0}
              className={`px-4 py-2 rounded-lg text-white ${
                selectedCharts.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className='w-full max-w-md'>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
        >
          <input {...getInputProps()} />
          <CloudUpload className='mx-auto h-8 w-8 text-gray-400' />
          <p className='mt-2 text-sm text-gray-600'>
            Drag & drop files, or <span className='text-purple-600 font-medium'>browse</span>
          </p>
          <p className='mt-1 text-xs text-gray-500'>Supports CSV, XLS, XLSX (max 50MB each)</p>
        </div>

        {uploadStatus === 'loading' && (
          <div className='mt-4 space-y-3'>
            {filesStatus.map((file, index) => (
              <div key={index} className='flex items-center justify-between p-2 border rounded-lg'>
                <div className='flex items-center min-w-0'>
                  <FileText className='flex-shrink-0 h-4 w-4 text-gray-500 mr-2' />
                  <span className='text-sm truncate'>{file.name}</span>
                  <span className='text-xs text-gray-500 ml-2'>{formatFileSize(file.size)}</span>
                </div>
                <div className='flex items-center ml-2'>
                  {file.status === 'processing' && (
                    <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2' />
                  )}
                  {file.status === 'error' && (
                    <div className='flex space-x-1'>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          retryFile(index)
                        }}
                        className='text-blue-500 hover:text-blue-700'
                      >
                        <Zap className='h-3 w-3' />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className='text-red-500 hover:text-red-700'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <Check className='h-4 w-4 text-green-500' />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadStatus === 'selection' && (
          <div className='mt-4 space-y-3'>
            <h4 className='text-sm font-medium text-gray-900'>Uploaded Files</h4>
            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {filesStatus.map((file, index) => (
                <div key={index} className='flex items-center justify-between p-2 border rounded-lg'>
                  <div className='flex items-center min-w-0'>
                    <FileText className='flex-shrink-0 h-4 w-4 text-gray-500 mr-2' />
                    <span className='text-sm truncate'>{file.name}</span>
                    <span className='text-xs text-gray-500 ml-2'>{formatFileSize(file.size)}</span>
                  </div>
                  <div className='flex items-center'>
                    <Check className='h-4 w-4 text-green-500' />
                  </div>
                </div>
              ))}
            </div>

            {/* Relationship Detection */}
            {detectedRelationships.length > 0 && (
              <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <Link className='h-4 w-4 text-blue-600 mr-2' />
                  <span className='text-sm font-medium text-blue-900'>Relationships Detected</span>
                </div>
                {detectedRelationships.map((rel, index) => (
                  <div key={index} className='text-xs text-blue-700'>
                    {rel.file1} ↔ {rel.file2}: {rel.commonColumns.join(', ')}
                  </div>
                ))}
              </div>
            )}

            <h4 className='text-sm font-medium text-gray-900 mt-4'>Choose Analysis Type</h4>
            <div className='space-y-2'>
              {analysisOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={option.onClick || (() => handleAnalysisSelection(option.type))}
                  className='w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors'
                >
                  <div className='flex items-center space-x-3'>
                    <div className={`${option.color} text-white p-1.5 rounded`}>
                      {option.icon}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>{option.title}</p>
                      <p className='text-xs text-gray-600'>{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => handleAnalysisSelection('none')}
                className='w-full p-2 text-center border border-gray-200 rounded-lg hover:border-gray-300 text-sm text-gray-600 hover:bg-gray-50'
              >
                Skip analysis (just load data)
              </button>
            </div>
          </div>
        )}

        {uploadStatus === 'analyzing' && (
          <div className='mt-4'>
            <div className='flex items-center justify-center mb-2'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2'></div>
              <span className='text-sm text-gray-600'>
                {selectedAnalysisType === 'quick' ? 'Quick analysis...' :
                 selectedAnalysisType === 'full' ? 'Full analysis...' :
                 selectedAnalysisType === 'visualization' ? 'Preparing charts...' :
                 'Processing...'}
              </span>
            </div>
            {analysisData.progress > 0 && (
              <div className='w-full bg-gray-200 rounded-full h-1.5'>
                <div
                  className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                  style={{ width: `${analysisData.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className='mt-4 text-center py-4'>
            <div className='mx-auto h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mb-2'>
              <Check className='h-5 w-5 text-green-600' />
            </div>
            <p className='text-sm text-gray-600'>Files processed successfully</p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className='mt-4 text-center py-4'>
            <div className='mx-auto h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mb-2'>
              <X className='h-5 w-5 text-red-600' />
            </div>
            <p className='text-sm text-gray-600'>Error processing files</p>
            <button
              onClick={() => setUploadStatus('idle')}
              className='mt-2 px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700'
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='max-w-3xl w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200'>
      <h2 className='text-2xl font-bold text-center mb-2' style={{ fontFamily: 'Poppins, sans-serif' }}>
        Upload Your Data Files
      </h2>
      <p className='text-gray-600 text-center mb-8'>
        Upload one or multiple CSV files and choose what type of analysis you need
      </p>

      {uploadStatus === 'idle' && (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors 
            ${
              isDragActive
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <input {...getInputProps()} />
            <CloudUpload className='mx-auto h-12 w-12 text-gray-400' />
            <p className='mt-4 text-gray-600'>
              Drag & drop your CSV files here, or <span className='text-purple-600 font-medium'>browse</span>
            </p>
            <p className='mt-2 text-sm text-gray-500'>Supports CSV, XLS, XLSX (max 50MB each)</p>
          </div>

          <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='border border-gray-200 rounded-lg p-4 text-center'>
              <FileText className='mx-auto h-8 w-8 text-purple-600 mb-2' />
              <h3 className='font-medium'>Multiple Files</h3>
              <p className='text-sm text-gray-500'>Combine data from different sources</p>
            </div>
            <div className='border border-gray-200 rounded-lg p-4 text-center'>
              <Database className='mx-auto h-8 w-8 text-teal-600 mb-2' />
              <h3 className='font-medium'>Auto-Relationships</h3>
              <p className='text-sm text-gray-500'>Detect and visualize data connections</p>
            </div>
            <div className='border border-gray-200 rounded-lg p-4 text-center'>
              <MessageSquare className='mx-auto h-8 w-8 text-orange-600 mb-2' />
              <h3 className='font-medium'>AI Insights</h3>
              <p className='text-sm text-gray-500'>Get intelligent analysis across all files</p>
            </div>
          </div>
        </>
      )}

      {uploadStatus === 'loading' && (
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-gray-900'>Processing Files</h3>
          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {filesStatus.map((file, index) => (
              <div key={index} className='flex items-center justify-between p-3 border rounded-lg'>
                <div className='flex items-center min-w-0'>
                  <FileText className='flex-shrink-0 h-5 w-5 text-gray-500 mr-3' />
                  <div className='min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{file.name}</p>
                    <p className='text-xs text-gray-500'>{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className='flex items-center ml-4 space-x-2'>
                  {file.status === 'pending' && (
                    <div className='h-2 w-2 bg-gray-400 rounded-full animate-pulse' />
                  )}
                  {file.status === 'processing' && (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600' />
                  )}
                  {file.status === 'success' && (
                    <Check className='h-5 w-5 text-green-500' />
                  )}
                  {file.status === 'error' && (
                    <>
                      <button 
                        onClick={() => retryFile(index)}
                        className='text-blue-500 hover:text-blue-700'
                        title="Retry"
                      >
                        <Zap className='h-4 w-4' />
                      </button>
                      <button 
                        onClick={() => removeFile(index)}
                        className='text-red-500 hover:text-red-700'
                        title="Remove"
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className='pt-2'>
            <p className='text-sm text-gray-500 text-right'>
              Total: {filesStatus.length} files • {formatFileSize(totalSize)}
            </p>
          </div>
        </div>
      )}

      {uploadStatus === 'selection' && (
        <div className='space-y-6'>
          <div className='text-center'>
            <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
              <Check className='h-6 w-6 text-green-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900'>Files Uploaded Successfully!</h3>
            <p className='text-gray-600'>
              {filesStatus.filter(f => f.status === 'success').length} of {filesStatus.length} files processed
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              Multiple datasets ready for cross-analysis
            </p>
          </div>

          {/* Relationship Detection */}
          {detectedRelationships.length > 0 && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-center mb-3'>
                <Link className='h-5 w-5 text-blue-600 mr-2' />
                <h4 className='font-medium text-blue-900'>Data Relationships Detected</h4>
              </div>
              <div className='space-y-2'>
                {detectedRelationships.map((rel, index) => (
                  <div key={index} className='flex items-center justify-between p-2 bg-white rounded border'>
                    <span className='text-sm text-gray-700'>
                      <span className='font-medium'>{rel.file1}</span> ↔ <span className='font-medium'>{rel.file2}</span>
                    </span>
                    <span className='text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded'>
                      {rel.commonColumns.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
              <p className='text-xs text-blue-700 mt-2'>
                These files can be joined for cross-analysis and relationship visualization
              </p>
            </div>
          )}

          <div className='border-t pt-6'>
            <h4 className='text-lg font-medium text-gray-900 mb-4 text-center'>Choose Your Analysis Type</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {analysisOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={option.onClick || (() => handleAnalysisSelection(option.type))}
                  className='p-5 text-left border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group'
                >
                  <div className='flex items-start space-x-4'>
                    <div className={`${option.color} text-white p-3 rounded-lg group-hover:scale-105 transition-transform`}>
                      {option.icon}
                    </div>
                    <div className='flex-1'>
                      <h5 className='font-semibold text-gray-900 mb-1'>{option.title}</h5>
                      <p className='text-sm text-gray-600 mb-3'>{option.description}</p>
                      <div className='space-y-1'>
                        {option.features.map((feature, idx) => (
                          <div key={idx} className='flex items-center text-xs text-gray-500'>
                            <div className='w-1 h-1 bg-gray-400 rounded-full mr-2'></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className='flex items-center mt-3 text-purple-600 text-sm font-medium'>
                        <span>Select this option</span>
                        <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className='mt-4 text-center'>
              <button
                onClick={() => handleAnalysisSelection('none')}
                className='px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm'
              >
                Skip analysis - just load the data
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'analyzing' && (
        <div className='text-center py-10'>
          <div className='mx-auto h-12 w-12 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600'></div>
          </div>
          <p className='mt-4 text-gray-600'>
            {selectedAnalysisType === 'quick' ? 'Running quick analysis...' :
             selectedAnalysisType === 'full' ? 'Performing comprehensive analysis...' :
             selectedAnalysisType === 'visualization' ? 'Preparing visualizations...' :
             'Processing your data...'}
          </p>
          <p className='mt-2 text-sm text-gray-500'>
            Analyzing {filesStatus.length} file{filesStatus.length !== 1 ? 's' : ''} and detecting relationships
          </p>
          {analysisData.progress > 0 && (
            <div className='mt-3 w-48 mx-auto bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${analysisData.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className='text-center py-10'>
          <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
            <Check className='h-6 w-6 text-green-600' />
          </div>
          <p className='mt-4 text-gray-600'>
            {filesStatus.length} file{filesStatus.length !== 1 ? 's' : ''} successfully processed!
          </p>
          <div className='mt-4 flex items-center justify-center space-x-2'>
            <Sparkles className='w-4 h-4 text-purple-500' />
            <span className='text-sm font-medium text-purple-600'>Analysis Type: {
              selectedAnalysisType === 'quick' ? 'Quick Overview' :
              selectedAnalysisType === 'full' ? 'Full Analysis' :
              selectedAnalysisType === 'visualization' ? 'Visualization Focus' :
              selectedAnalysisType === 'chat-only' ? 'Chat Ready' :
              'Data Only'
            }</span>
          </div>
          {detectedRelationships.length > 0 && (
            <div className='mt-2 flex items-center justify-center space-x-2'>
              <Link className='w-4 h-4 text-blue-500' />
              <span className='text-sm text-blue-600'>{detectedRelationships.length} relationship{detectedRelationships.length !== 1 ? 's' : ''} detected</span>
            </div>
          )}
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className='text-center py-10'>
          <div className='mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center'>
            <Squircle className='h-6 w-6 text-red-600' />
          </div>
          <p className='mt-4 text-gray-600'>There was an error processing your files</p>
          <div className='mt-2 max-h-40 overflow-y-auto mx-auto max-w-md'>
            {filesStatus.filter(f => f.status === 'error').map((file, index) => (
              <div key={index} className='flex items-center justify-between p-2'>
                <div className='flex items-center'>
                  <FileText className='h-4 w-4 text-gray-500 mr-2' />
                  <span className='text-sm text-gray-600 truncate max-w-xs'>{file.name}</span>
                </div>
                <div className='text-red-500 text-xs'>{file.error}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setUploadStatus('idle')}
            className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
          >
            Try Again
          </button>
        </div>
      )}

      {showChartSelection && <ChartSelectionModal />}
    </div>
  );
};

export default FileUploader;