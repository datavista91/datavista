import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
   content: string
   className?: string
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
   return (
      <div className={`prose prose-sm max-w-none ${className}`}>
         <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
               // Custom styling for markdown elements
               h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-gray-900 mb-3 mt-4 first:mt-0">
                     {children}
                  </h1>
               ),
               h2: ({ children }) => (
                  <h2 className="text-base font-semibold text-gray-800 mb-2 mt-3 first:mt-0">
                     {children}
                  </h2>
               ),
               h3: ({ children }) => (
                  <h3 className="text-sm font-medium text-gray-700 mb-2 mt-3 first:mt-0">
                     {children}
                  </h3>
               ),
               p: ({ children }) => (
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                     {children}
                  </p>
               ),
               ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1">
                     {children}
                  </ul>
               ),
               ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1">
                     {children}
                  </ol>
               ),
               li: ({ children }) => (
                  <li className="text-sm text-gray-700 ml-2">
                     {children}
                  </li>
               ),
               strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                     {children}
                  </strong>
               ),
               em: ({ children }) => (
                  <em className="italic text-gray-600">
                     {children}
                  </em>
               ),
               code: ({ children }) => (
                  <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                     {children}
                  </code>
               ),
               pre: ({ children }) => (
                  <pre className="bg-gray-100 text-gray-800 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-3">
                     {children}
                  </pre>
               ),
               blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-300 pl-4 py-2 bg-blue-50 mb-3 italic text-sm text-gray-700">
                     {children}
                  </blockquote>
               ),
               table: ({ children }) => (
                  <div className="overflow-x-auto mb-3">
                     <table className="min-w-full border border-gray-200 rounded-lg">
                        {children}
                     </table>
                  </div>
               ),
               thead: ({ children }) => (
                  <thead className="bg-gray-50">
                     {children}
                  </thead>
               ),
               tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-200">
                     {children}
                  </tbody>
               ),
               th: ({ children }) => (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                     {children}
                  </th>
               ),
               td: ({ children }) => (
                  <td className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">
                     {children}
                  </td>
               ),
               a: ({ href, children }) => (
                  <a 
                     href={href}
                     className="text-blue-600 hover:text-blue-800 underline"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     {children}
                  </a>
               )
            }}
         >
            {content}
         </ReactMarkdown>
      </div>
   )
}

export default MarkdownRenderer
