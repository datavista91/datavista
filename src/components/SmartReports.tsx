import { useAIResponses } from '../context/AIResponseContext';
import { useAnalysis } from '../context/AnalysisContext';
import InsightCard from './InsightCard';
import MarkdownRenderer from './MarkdownRenderer';
import { FileText, Sparkles, Clock, TrendingUp, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

const SmartReports = () => {
  const { getResponsesByType } = useAIResponses();
  const { analysisData } = useAnalysis();
  const aiInsights = getResponsesByType('insights');
  const generalResponses = getResponsesByType('general');

  const hasData = analysisData?.summary !== null;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
        <p className="text-gray-600 mb-4">
          Upload a dataset to start generating smart reports and insights.
        </p>
      </div>
    );
  }

  if (aiInsights.length === 0 && generalResponses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Reports</h1>
            <p className="text-gray-600">AI-powered insights and analysis</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-lg border border-gray-200">
          <Sparkles className="w-16 h-16 text-purple-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No AI Insights Yet</h2>
          <p className="text-gray-600 mb-4 max-w-md">
            Ask the AI questions about your data to generate insights that will appear here. 
            Try asking for summaries, trends, or analysis of your dataset.
          </p>
          <div className="flex flex-col space-y-2 text-sm text-gray-500">
            <p>💡 Try asking:</p>
            <p>"Summarize my data"</p>
            <p>"What insights do you see?"</p>
            <p>"Analyze trends in this dataset"</p>
          </div>
        </div>

        {/* Default insight cards when no AI content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InsightCard
            title="Data Overview"
            description="Basic statistics and data quality metrics from your uploaded dataset."
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          <InsightCard
            title="Pattern Detection" 
            description="Ask AI to identify patterns and relationships in your data."
            icon={<AlertTriangle className="w-5 h-5" />}
            color="amber"
          />
          <InsightCard
            title="Recommendations"
            description="Get AI-powered recommendations based on your data analysis."
            icon={<CheckCircle className="w-5 h-5" />}
            color="emerald"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Reports</h1>
          <p className="text-gray-600">AI-powered insights and analysis</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Sparkles className="w-4 h-4" />
          <span>{aiInsights.length + generalResponses.length} AI responses</span>
        </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Data Insights</h2>
          </div>
          
          <div className="grid gap-6">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100 text-purple-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(insight.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {insight.isNew && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      New
                    </span>
                  )}
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={insight.content} />
                </div>
                
                {/* Key Metrics Display */}
                {insight.data?.keyMetrics && insight.data.keyMetrics.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Key Metrics
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {insight.data.keyMetrics.slice(0, 6).map((metric: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            {typeof metric === 'object' ? metric.column || 'Metric' : 'Finding'}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {typeof metric === 'string' ? metric : 
                             metric.text || 
                             (metric.mean ? `Avg: ${metric.mean.toFixed(2)}` : 'N/A')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recommendations Display */}
                {insight.data?.recommendations && insight.data.recommendations.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {insight.data.recommendations.slice(0, 3).map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General AI Responses that might contain insights */}
      {generalResponses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Responses</h2>
          </div>
          
          <div className="grid gap-4">
            {generalResponses.slice(0, 3).map((response) => (
              <div key={response.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{response.title}</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(response.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={response.content} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartReports;
