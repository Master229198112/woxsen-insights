'use client';
import { 
  BookOpen, 
  Users, 
  ExternalLink, 
  Award, 
  Link as LinkIcon,
  FileText,
  Microscope,
  Target,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AuthorLink from '@/components/ui/AuthorLink';

const ResearchDisplay = ({ blog }) => {
  const { researchData } = blog;
  
  if (!researchData) {
    return <div className="text-gray-500 p-8">Research data not available</div>;
  }

  const getPaperTypeLabel = (paperType) => {
    switch (paperType) {
      case 'research': return 'Research Paper';
      case 'review': return 'Review Paper';
      case 'book': return 'Book';
      case 'book-chapter': return 'Book Chapter';
      case 'case-study': return 'Case Study';
      default: return 'Publication';
    }
  };

  const getPaperTypeColor = (paperType) => {
    switch (paperType) {
      case 'research': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-green-100 text-green-800';
      case 'book': return 'bg-purple-100 text-purple-800';
      case 'book-chapter': return 'bg-indigo-100 text-indigo-800';
      case 'case-study': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Paper Type Badge */}
      {researchData.paperType && (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaperTypeColor(researchData.paperType)}`}>
            {getPaperTypeLabel(researchData.paperType)}
          </span>
          {researchData.researchType && researchData.researchType !== 'experimental' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
              {researchData.researchType.replace('-', ' ')}
            </span>
          )}
        </div>
      )}
      
      {/* Abstract */}
      {researchData.abstract && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Abstract
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {researchData.abstract}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publication Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
            Publication Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {researchData.journal && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">
                  {blog.researchData?.paperType === 'book' ? 'Publisher' : 
                   blog.researchData?.paperType === 'book-chapter' ? 'Book Title' :
                   'Journal/Conference'}
                </dt>
                <dd className="text-gray-700">{researchData.journal}</dd>
              </div>
            )}
            
            {researchData.publishedYear && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Publication Year</dt>
                <dd className="text-gray-700">{researchData.publishedYear}</dd>
              </div>
            )}
            
            {researchData.volume && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Volume</dt>
                <dd className="text-gray-700">{researchData.volume}</dd>
              </div>
            )}
            
            {researchData.issue && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Issue</dt>
                <dd className="text-gray-700">{researchData.issue}</dd>
              </div>
            )}
            
            {researchData.pages && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Pages</dt>
                <dd className="text-gray-700">{researchData.pages}</dd>
              </div>
            )}
            
            {researchData.doi && (
              <div className="md:col-span-2">
                <dt className="font-semibold text-gray-900 mb-1">DOI</dt>
                <dd className="text-gray-700">
                  <a 
                    href={`https://doi.org/${researchData.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {researchData.doi}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      {researchData.keywords && researchData.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {researchData.keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Co-Authors */}
      {researchData.coAuthors && researchData.coAuthors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              Co-Authors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchData.coAuthors.map((author, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {author.name}
                    {author.isCorresponding && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Corresponding
                      </span>
                    )}
                  </h4>
                  {author.affiliation && (
                    <p className="text-sm text-gray-600 mb-1">{author.affiliation}</p>
                  )}
                  {author.email && (
                    <p className="text-sm text-gray-600">
                      <a href={`mailto:${author.email}`} className="text-blue-600 hover:text-blue-800">
                        {author.email}
                      </a>
                    </p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    {author.orcid && (
                      <a 
                        href={author.orcid} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        ORCID
                      </a>
                    )}
                    {author.linkedIn && (
                      <a 
                        href={author.linkedIn} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded hover:bg-blue-300"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indexing Information */}
      {researchData.indexedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Indexing & Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  researchData.indexedIn.scopus ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {researchData.indexedIn.scopus ? '✓' : '×'}
                </div>
                <div className="text-sm text-gray-600">Scopus</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  researchData.indexedIn.wos ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {researchData.indexedIn.wos ? '✓' : '×'}
                </div>
                <div className="text-sm text-gray-600">Web of Science</div>
              </div>
              
              {researchData.indexedIn.quartile && researchData.indexedIn.quartile !== 'Not Indexed' && (
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {researchData.indexedIn.quartile}
                  </div>
                  <div className="text-sm text-gray-600">Quartile</div>
                </div>
              )}
              
              {researchData.indexedIn.impactFactor && (
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {researchData.indexedIn.impactFactor}
                  </div>
                  <div className="text-sm text-gray-600">Impact Factor</div>
                </div>
              )}
              
              {researchData.indexedIn.citations !== undefined && (
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {researchData.indexedIn.citations}
                  </div>
                  <div className="text-sm text-gray-600">Citations</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* External Links */}
      {(researchData.pdfUrl || researchData.externalLinks?.pubmedId || researchData.externalLinks?.arxivId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="h-5 w-5 mr-2 text-indigo-600" />
              External Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {researchData.pdfUrl && (
                <a
                  href={researchData.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View PDF
                </a>
              )}
              
              {researchData.externalLinks?.pubmedId && (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${researchData.externalLinks.pubmedId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PubMed
                </a>
              )}
              
              {researchData.externalLinks?.arxivId && (
                <a
                  href={`https://arxiv.org/abs/${researchData.externalLinks.arxivId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  arXiv
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Type and Funding */}
      {(researchData.researchType || researchData.fundingSource) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Microscope className="h-5 w-5 mr-2 text-teal-600" />
              Research Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchData.researchType && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Research Type</dt>
                  <dd className="text-gray-700 capitalize">{researchData.researchType.replace('-', ' ')}</dd>
                </div>
              )}
              
              {researchData.fundingSource && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Funding Source</dt>
                  <dd className="text-gray-700 whitespace-pre-wrap">{researchData.fundingSource}</dd>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResearchDisplay;