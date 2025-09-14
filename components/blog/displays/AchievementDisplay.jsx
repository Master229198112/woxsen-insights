'use client';
import { 
  Award, 
  Users, 
  Calendar,
  Building,
  ExternalLink,
  DollarSign,
  Medal,
  Target,
  FileText,
  Star,
  Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const AchievementDisplay = ({ blog }) => {
  const { achievementData } = blog;
  
  if (!achievementData) {
    return <div className="text-gray-500 p-8">Achievement data not available</div>;
  }

  const getLevelColor = (level) => {
    const colors = {
      'international': 'bg-purple-100 text-purple-800',
      'national': 'bg-blue-100 text-blue-800',
      'regional': 'bg-green-100 text-green-800',
      'state': 'bg-yellow-100 text-yellow-800',
      'institutional': 'bg-orange-100 text-orange-800',
      'departmental': 'bg-gray-100 text-gray-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'award': Award,
      'grant': DollarSign,
      'fellowship': Star,
      'recognition': Medal,
      'competition': Target,
      'certification': FileText,
      'membership': Users,
      'honor': Award,
      'scholarship': Star,
      'publication-milestone': FileText
    };
    return icons[type] || Award;
  };

  const TypeIcon = getTypeIcon(achievementData.achievementType);

  return (
    <div className="space-y-8">
      {/* Achievement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TypeIcon className="h-5 w-5 mr-2 text-yellow-600" />
            Achievement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <dt className="font-semibold text-gray-900 mb-1">Achievement Name</dt>
              <dd className="text-lg text-gray-700 font-medium">{achievementData.achievementName}</dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Level</dt>
              <dd>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  getLevelColor(achievementData.level)
                }`}>
                  <Globe className="h-3 w-3 mr-1" />
                  {achievementData.level}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Type</dt>
              <dd className="text-gray-700 capitalize">
                {achievementData.achievementType.replace('-', ' ')}
              </dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Awarding Organization</dt>
              <dd className="text-gray-700">{achievementData.awardingOrganization}</dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Organization Type</dt>
              <dd className="text-gray-700 capitalize">
                {achievementData.organizationType.replace('-', ' ')}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Received Date</div>
              <div className="font-semibold text-gray-900">
                {formatDate(achievementData.receivedDate)}
              </div>
            </div>
            
            {achievementData.announcementDate && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Announcement Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(achievementData.announcementDate)}
                </div>
              </div>
            )}
            
            {achievementData.validFrom && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Valid From</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(achievementData.validFrom)}
                </div>
              </div>
            )}
            
            {achievementData.validUntil && !achievementData.isLifetime && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Valid Until</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(achievementData.validUntil)}
                </div>
              </div>
            )}
            
            {achievementData.isLifetime && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Duration</div>
                <div className="font-semibold text-purple-700">
                  <Star className="h-4 w-4 inline mr-1" />
                  Lifetime
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Description */}
      {achievementData.achievementDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {achievementData.achievementDescription}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Recognized */}
      {achievementData.workRecognized?.title && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Work Recognized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Title</dt>
                <dd className="text-gray-700">{achievementData.workRecognized.title}</dd>
              </div>
              
              {achievementData.workRecognized.category && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Category</dt>
                  <dd className="text-gray-700">{achievementData.workRecognized.category}</dd>
                </div>
              )}
              
              {achievementData.workRecognized.description && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Description</dt>
                  <dd className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {achievementData.workRecognized.description}
                  </dd>
                </div>
              )}
              
              {achievementData.workRecognized.collaborators && achievementData.workRecognized.collaborators.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">Collaborators</dt>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {achievementData.workRecognized.collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{collaborator.name}</div>
                          {collaborator.role && (
                            <div className="text-sm text-gray-600">{collaborator.role}</div>
                          )}
                          {collaborator.affiliation && (
                            <div className="text-sm text-gray-500">{collaborator.affiliation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Process */}
      {achievementData.selectionProcess && Object.keys(achievementData.selectionProcess).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-600" />
              Selection Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  achievementData.selectionProcess.applicationRequired ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {achievementData.selectionProcess.applicationRequired ? '✓' : '×'}
                </div>
                <div className="text-sm text-gray-600">Application Required</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  achievementData.selectionProcess.nominationRequired ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {achievementData.selectionProcess.nominationRequired ? '✓' : '×'}
                </div>
                <div className="text-sm text-gray-600">Nomination Required</div>
              </div>
              
              {achievementData.selectionProcess.totalApplicants && (
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {achievementData.selectionProcess.totalApplicants.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Applicants</div>
                </div>
              )}
              
              {achievementData.selectionProcess.totalWinners && (
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {achievementData.selectionProcess.totalWinners.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Winners</div>
                </div>
              )}
            </div>
            
            {achievementData.selectionProcess.selectionCriteria && achievementData.selectionProcess.selectionCriteria.length > 0 && (
              <div className="mt-6">
                <dt className="font-semibold text-gray-900 mb-3">Selection Criteria</dt>
                <div className="flex flex-wrap gap-2">
                  {achievementData.selectionProcess.selectionCriteria.map((criteria, index) => (
                    <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {criteria}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Financial Information */}
      {achievementData.monetaryValue?.amount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {achievementData.monetaryValue.currency} {achievementData.monetaryValue.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">Award Amount</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {achievementData.monetaryValue.isOneTime ? 'One-time' : 'Recurring'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Payment Type</div>
              </div>
              
              {achievementData.monetaryValue.disbursementSchedule && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600 capitalize">
                    {achievementData.monetaryValue.disbursementSchedule.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Schedule</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members (for team achievements) */}
      {achievementData.teamMembers && achievementData.teamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementData.teamMembers.map((member, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {member.name}
                    {member.isMainContributor && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Main Contributor
                      </span>
                    )}
                  </h4>
                  {member.role && (
                    <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                  )}
                  {member.affiliation && (
                    <p className="text-sm text-gray-600 mb-1">{member.affiliation}</p>
                  )}
                  {member.email && (
                    <p className="text-sm text-gray-600 mb-2">
                      <a href={`mailto:${member.email}`} className="text-blue-600 hover:text-blue-800">
                        {member.email}
                      </a>
                    </p>
                  )}
                  {member.contribution && (
                    <p className="text-sm text-gray-500 italic whitespace-pre-wrap">{member.contribution}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords and Research Areas */}
      {((achievementData.keywords && achievementData.keywords.length > 0) || 
        (achievementData.researchArea && achievementData.researchArea.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-indigo-600" />
              Categories & Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {achievementData.researchArea && achievementData.researchArea.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">Research Areas</dt>
                  <div className="flex flex-wrap gap-2">
                    {achievementData.researchArea.map((area, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {achievementData.keywords && achievementData.keywords.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">Keywords</dt>
                  <div className="flex flex-wrap gap-2">
                    {achievementData.keywords.map((keyword, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation & Links */}
      {(achievementData.documentation?.certificateUrl || 
        achievementData.documentation?.officialAnnouncementUrl ||
        achievementData.documentation?.pressReleaseUrl ||
        (achievementData.documentation?.mediaUrls && achievementData.documentation.mediaUrls.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-teal-600" />
              Documentation & Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {achievementData.documentation?.certificateUrl && (
                  <a
                    href={achievementData.documentation.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Certificate
                  </a>
                )}
                
                {achievementData.documentation?.officialAnnouncementUrl && (
                  <a
                    href={achievementData.documentation.officialAnnouncementUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Official Announcement
                  </a>
                )}
                
                {achievementData.documentation?.pressReleaseUrl && (
                  <a
                    href={achievementData.documentation.pressReleaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Press Release
                  </a>
                )}
              </div>
              
              {achievementData.documentation?.mediaUrls && achievementData.documentation.mediaUrls.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">Media Coverage</dt>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {achievementData.documentation.mediaUrls.map((media, index) => (
                      <a
                        key={index}
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {media.mediaType} Coverage
                          </div>
                          {media.description && (
                            <div className="text-sm text-gray-500">{media.description}</div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AchievementDisplay;