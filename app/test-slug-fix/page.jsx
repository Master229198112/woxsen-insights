import SlugManagement from '@/components/admin/SlugManagement';

export default function TestSlugFix() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Slug Fix</h1>
          <p className="text-gray-600">Use this page to fix blog slugs via the admin API</p>
        </div>
        
        <SlugManagement />
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Click the "Fix Blog Slugs" button above</li>
            <li>Wait for the process to complete</li>
            <li>Check the results to see which blogs were updated</li>
            <li>After fixing, you can delete this test page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
