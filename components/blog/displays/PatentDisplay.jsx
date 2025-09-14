'use client';
import { 
  Lightbulb, 
  Users, 
  FileText,
  Calendar,
  Building,
  ExternalLink,
  Shield,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const PatentDisplay = ({ blog }) => {
  const { patentData } = blog;
  
  if (!patentData) {
    return <div className="text-gray-500 p-8">Patent data not available</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      'granted': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'filed': 'bg-blue-100 text-blue-800',
      'under-examination': 'bg-orange-100 text-orange-800',
      'expired': 'bg-gray-100 text-gray-800',
      'abandoned': 'bg-red-100 text-red-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Patent Status & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Patent Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Patent Number</dt>
              <dd className="text-gray-700 font-mono">{patentData.patentNumber}</dd>
            </div>
            
            {patentData.applicationNumber && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Application Number</dt>
                <dd className="text-gray-700 font-mono">{patentData.applicationNumber}</dd>
              </div>
            )}
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Status</dt>
              <dd>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  getStatusColor(patentData.status)
                }`}>
                  {patentData.status.replace('-', ' ')}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Patent Type</dt>
              <dd className="text-gray-700 capitalize">{patentData.patentType}</dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Patent Office</dt>
              <dd className="text-gray-700">{patentData.patentOffice}</dd>
            </div>
            
            {patentData.jurisdiction && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Jurisdiction</dt>
                <dd className="text-gray-700">{patentData.jurisdiction}</dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Filing Date</div>
              <div className="font-semibold text-gray-900">
                {formatDate(patentData.filingDate)}
              </div>
            </div>
            
            {patentData.grantDate && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Grant Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(patentData.grantDate)}
                </div>
              </div>
            )}
            
            {patentData.publicationDate && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Publication Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(patentData.publicationDate)}
                </div>
              </div>
            )}
            
            {patentData.expiryDate && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Expiry Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(patentData.expiryDate)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventors */}
      {patentData.inventors && patentData.inventors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Inventors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patentData.inventors.map((inventor, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {inventor.name}
                    {inventor.isPrimary && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </h4>
                  {inventor.affiliation && (
                    <p className="text-sm text-gray-600 mb-1">{inventor.affiliation}</p>
                  )}
                  {inventor.email && (
                    <p className="text-sm text-gray-600 mb-2">
                      <a href={`mailto:${inventor.email}`} className="text-blue-600 hover:text-blue-800">
                        {inventor.email}
                      </a>
                    </p>
                  )}
                  {inventor.contributionPercentage && (
                    <div className="text-xs text-gray-500">
                      Contribution: {inventor.contributionPercentage}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignee Information */}
      {patentData.assignee?.name && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-indigo-600" />
              Assignee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Name</dt>
                <dd className="text-gray-700">{patentData.assignee.name}</dd>
              </div>
              
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Type</dt>
                <dd className="text-gray-700 capitalize">{patentData.assignee.type}</dd>
              </div>
              
              {patentData.assignee.address && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Address</dt>
                  <dd className="text-gray-700">{patentData.assignee.address}</dd>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {patentData.technicalField && (
            <div>
              <dt className="font-semibold text-gray-900 mb-2">Technical Field</dt>
              <dd className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{patentData.technicalField}</dd>
            </div>
          )}
          
          {patentData.background && (
            <div>
              <dt className="font-semibold text-gray-900 mb-2">Background</dt>
              <dd className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{patentData.background}</dd>
            </div>
          )}
          
          {patentData.summary && (
            <div>
              <dt className="font-semibold text-gray-900 mb-2">Summary</dt>
              <dd className="text-gray-700 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">{patentData.summary}</dd>
            </div>
          )}
          
          {patentData.detailedDescription && (
            <div>
              <dt className="font-semibold text-gray-900 mb-2">Detailed Description</dt>
              <dd className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {patentData.detailedDescription}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claims */}
      {patentData.claims && patentData.claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-600" />
              Patent Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patentData.claims.map((claim, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-900">
                      Claim {claim.claimNumber}
                    </span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      claim.claimType === 'independent' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {claim.claimType}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{claim.claimText}</p>
                  {claim.dependsOn && claim.dependsOn.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Depends on claims: {claim.dependsOn.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classifications */}
      {((patentData.ipcClassification && patentData.ipcClassification.length > 0) || 
        (patentData.cpcClassification && patentData.cpcClassification.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-orange-600" />
              Classifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patentData.ipcClassification && patentData.ipcClassification.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">IPC Classification</dt>
                  <div className="flex flex-wrap gap-2">
                    {patentData.ipcClassification.map((classification, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-mono">
                        {classification}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {patentData.cpcClassification && patentData.cpcClassification.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">CPC Classification</dt>
                  <div className="flex flex-wrap gap-2">
                    {patentData.cpcClassification.map((classification, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mono">
                        {classification}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commercial Status */}
      {patentData.commercialStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-green-600" />
              Commercial Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  patentData.commercialStatus.isCommercialized ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-700">
                  {patentData.commercialStatus.isCommercialized ? 'Commercialized' : 'Not Commercialized'}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  patentData.commercialStatus.licensingAvailable ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-700">
                  {patentData.commercialStatus.licensingAvailable ? 'Licensing Available' : 'No Licensing'}
                </span>
              </div>
            </div>
            
            {patentData.commercialStatus.commercialPartners && patentData.commercialStatus.commercialPartners.length > 0 && (
              <div className="mt-6">
                <dt className="font-semibold text-gray-900 mb-3">Commercial Partners</dt>
                <div className="space-y-2">
                  {patentData.commercialStatus.commercialPartners.map((partner, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{partner.name}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                        {partner.relationship.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* External Links */}
      {(patentData.pdfUrl || patentData.patentUrl || patentData.drawingsUrls?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Documents & Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {patentData.pdfUrl && (
                <a
                  href={patentData.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View PDF
                </a>
              )}
              
              {patentData.patentUrl && (
                <a
                  href={patentData.patentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Patent Office Link
                </a>
              )}
            </div>
            
            {patentData.drawingsUrls && patentData.drawingsUrls.length > 0 && (
              <div className="mt-4">
                <dt className="font-semibold text-gray-900 mb-3">Technical Drawings</dt>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {patentData.drawingsUrls.map((drawing, index) => (
                    <a
                      key={index}
                      href={drawing.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">{drawing.fileName}</div>
                        {drawing.description && (
                          <div className="text-sm text-gray-500">{drawing.description}</div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatentDisplay;