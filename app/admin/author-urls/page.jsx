'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  ExternalLink, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Eye 
} from 'lucide-react';

export default function AuthorURLManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
    
    fetchAuthors();
  }, [session, status, router]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        // Filter for staff and admin users
        const authorUsers = data.users.filter(user => 
          ['staff', 'admin'].includes(user.role) && user.isApproved
        );
        setAuthors(authorUsers);
      } else {
        setError('Failed to fetch authors');
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Error fetching authors');
    } finally {
      setLoading(false);
    }
  };

  const generateUsernames = async (userId = null) => {
    try {
      setGenerating(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/admin/generate-usernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userId ? { userId } : {}),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        fetchAuthors(); // Refresh the list
      } else {
        setError(data.error || 'Failed to generate usernames');
      }
    } catch (error) {
      console.error('Error generating usernames:', error);
      setError('Error generating usernames');
    } finally {
      setGenerating(false);
    }
  };

  const generateSlug = (author) => {
    if (author.username) {
      return author.username;
    }
    // Generate slug from name
    return author.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30)
      .replace(/^-+|-+$/g, '');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('URL copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Author URL Management
          </h1>
          <p className="text-gray-600 mb-6">
            Manage author profile URLs and generate usernames for the new slug-based system.
          </p>

          {message && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => generateUsernames()}
              disabled={generating}
              className="flex items-center"
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Generate All Usernames
            </Button>
            
            <Button
              onClick={fetchAuthors}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Authors ({authors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authors.map((author) => {
                  const hasUsername = author.username;
                  const oldUrl = `/author/${author._id}`;
                  const newUrl = `/author/${generateSlug(author)}`;
                  
                  return (
                    <div key={author._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {author.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {author.department} • {author.email}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">Username:</span>
                              {hasUsername ? (
                                <span className="text-sm font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {author.username}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">Not set</span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Old URL (ID-based)
                                </label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                                    {oldUrl}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(`${window.location.origin}${oldUrl}`)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Link href={oldUrl} target="_blank">
                                    <Button size="sm" variant="ghost">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  New URL (Slug-based)
                                </label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <code className="text-xs bg-blue-50 px-2 py-1 rounded flex-1 truncate">
                                    {newUrl}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(`${window.location.origin}${newUrl}`)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Link href={newUrl} target="_blank">
                                    <Button size="sm" variant="ghost">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          {hasUsername ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Ready</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center text-yellow-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span className="text-sm">No Username</span>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => generateUsernames(author._id)}
                                disabled={generating}
                              >
                                Generate
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
