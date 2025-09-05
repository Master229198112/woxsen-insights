'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SlugManagement() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFixSlugs = async () => {
    setIsFixing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/fix-slugs', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to fix slugs');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slug Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Fix any published blogs that don't have proper slugs. This will generate SEO-friendly URLs for all published content.
        </p>

        <Button 
          onClick={handleFixSlugs}
          disabled={isFixing}
          className="w-full"
        >
          {isFixing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isFixing ? 'Fixing Slugs...' : 'Fix Blog Slugs'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Success!</span>
            </div>
            <p className="text-sm text-green-700 mb-2">{result.message}</p>
            {result.fixed.length > 0 && (
              <div className="text-sm text-green-600">
                <p className="font-medium mb-1">Fixed blogs:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.fixed.map((blog, index) => (
                    <li key={index}>
                      "{blog.title}" → /{blog.slug}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">Error: {error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
