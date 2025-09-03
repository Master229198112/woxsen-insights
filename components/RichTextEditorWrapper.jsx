'use client';
import dynamic from 'next/dynamic';

// Dynamically import the editor without SSR
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md min-h-[200px] p-4 bg-gray-50">
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500">Loading editor...</span>
        </div>
      </div>
    </div>
  )
});

export default RichTextEditor;
