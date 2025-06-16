import { useAIResponses } from '../context/AIResponseContext';
import { useAnalysis } from '../context/AnalysisContext';
import MarkdownRenderer from './MarkdownRenderer';
import { Presentation, Sparkles, Clock, FileText, Download, Share } from 'lucide-react';

const Presentations = () => {
  const { getResponsesByType } = useAIResponses();
  const { analysisData } = useAnalysis();
  const aiPresentations = getResponsesByType('presentation');

  const hasData = analysisData?.summary !== null;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Presentation className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
        <p className="text-gray-600 mb-4">
          Upload a dataset to start creating presentations from your data.
        </p>
      </div>
    );
  }

  if (aiPresentations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Presentations</h1>
            <p className="text-gray-600">AI-generated presentations and reports</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-lg border border-gray-200">
          <Sparkles className="w-16 h-16 text-purple-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Presentations Yet</h2>
          <p className="text-gray-600 mb-4 max-w-md">
            Ask the AI to create presentations or reports from your data analysis. 
            These will appear here for easy sharing and export.
          </p>
          <div className="flex flex-col space-y-2 text-sm text-gray-500">
            <p>💡 Try asking:</p>
            <p>"Create a presentation of my data"</p>
            <p>"Generate a report summary"</p>
            <p>"Make slides from this analysis"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presentations</h1>
          <p className="text-gray-600">AI-generated presentations and reports</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Sparkles className="w-4 h-4" />
          <span>{aiPresentations.length} presentations</span>
        </div>
      </div>

      <div className="grid gap-6">
        {aiPresentations.map((presentation) => (
          <div key={presentation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100 text-purple-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{presentation.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(presentation.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {presentation.isNew && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    New
                  </span>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Share className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer content={presentation.content} />
            </div>
            
            {/* Presentation Sections */}
            {presentation.data?.sections && presentation.data.sections.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Presentation Sections</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {presentation.data.sections.slice(0, 6).map((section: string, index: number) => (
                    <div key={index} className="bg-white rounded p-2 text-sm text-gray-700 border border-gray-200">
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Key Points */}
            {presentation.data?.keyPoints && presentation.data.keyPoints.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {presentation.data.keyPoints.slice(0, 5).map((point: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Presentations;
