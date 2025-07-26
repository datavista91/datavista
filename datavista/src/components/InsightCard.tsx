import { ReactNode } from 'react';
import { useAIResponses } from '../context/AIResponseContext';
import MarkdownRenderer from './MarkdownRenderer';
import { Sparkles, Clock } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

const colorClasses = {
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
};

const InsightCard = ({ title, description, icon, color }: InsightCardProps) => {
  const { getResponsesByType } = useAIResponses();
  const aiInsights = getResponsesByType('insights');
  
  return (
    <div className="space-y-4">
      {/* Original Insight Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start">
          <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {/* AI-Generated Insights */}
      {aiInsights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-medium text-gray-900">AI-Generated Insights</h4>
          </div>
          
          {aiInsights.slice(0, 3).map((insight) => (
            <div key={insight.id} className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all ${
              insight.isNew ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900 text-sm">{insight.title}</h5>
                {insight.isNew && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    New
                  </span>
                )}
              </div>
              
              <div className="text-sm">
                <MarkdownRenderer content={insight.content} />
              </div>
              
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {insight.timestamp.toLocaleString()}
                </span>
              </div>
              
              {/* Key Metrics from AI */}
              {insight.data?.keyMetrics && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {insight.data.keyMetrics.slice(0, 4).map((metric: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs font-medium text-gray-700">{metric.column}</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {metric.mean ? `Avg: ${metric.mean.toFixed(1)}` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightCard;
