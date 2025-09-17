'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  X, 
  Award, 
  Calendar,
  DollarSign,
  FileText,
  Users,
  ExternalLink,
  Shield,
  Globe,
  Building
} from 'lucide-react';

const AchievementForm = ({ data, onChange, errors = [] }) => {
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    affiliation: '',
    email: '',
    contribution: '',
    isMainContributor: false
  });

  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    role: '',
    affiliation: ''
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newResearchArea, setNewResearchArea] = useState('');

  // Initialize data with defaults
  const formData = {
    achievementType: 'award',
    achievementName: '',
    awardingOrganization: '',
    organizationType: 'university',
    level: 'institutional',
    competitionLevel: 'individual',
    receivedDate: '',
    announcementDate: '',
    validFrom: '',
    validUntil: '',
    isLifetime: false,
    selectionProcess: {
      applicationRequired: false,
      nominationRequired: false,
      totalApplicants: '',
      totalWinners: '',
      selectionCriteria: []
    },
    monetaryValue: {
      amount: '',
      currency: 'USD',
      isOneTime: true,
      disbursementSchedule: 'lump-sum'
    },
    achievementDescription: '',
    workRecognized: {
      title: '',
      description: '',
      category: '',
      collaborators: []
    },
    documentation: {
      certificateUrl: '',
      officialAnnouncementUrl: '',
      mediaUrls: [],
      pressReleaseUrl: ''
    },
    verification: {
      isVerified: false,
      verificationSource: '',
      verificationUrl: '',
      verificationNotes: ''
    },
    teamMembers: [],
    researchArea: [],
    keywords: [],
    ...data
  };

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    onChange(updatedData);
  };

  const handleNestedInputChange = (parentField, field, value) => {
    const updatedData = {
      ...formData,
      [parentField]: {
        ...formData[parentField],
        [field]: value
      }
    };
    onChange(updatedData);
  };

  const handleArrayInputChange = (parentField, field, value) => {
    const updatedData = {
      ...formData,
      [parentField]: {
        ...formData[parentField],
        [field]: value
      }
    };
    onChange(updatedData);
  };

  const addTeamMember = () => {
    if (newTeamMember.name.trim()) {
      const updatedData = {
        ...formData,
        teamMembers: [...formData.teamMembers, { ...newTeamMember }]
      };
      onChange(updatedData);
      setNewTeamMember({
        name: '',
        role: '',
        affiliation: '',
        email: '',
        contribution: '',
        isMainContributor: false
      });
    }
  };

  const removeTeamMember = (index) => {
    const updatedData = {
      ...formData,
      teamMembers: formData.teamMembers.filter((_, i) => i !== index)
    };
    onChange(updatedData);
  };

  const updateTeamMember = (index, field, value) => {
    const updatedTeamMembers = formData.teamMembers.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    const updatedData = { ...formData, teamMembers: updatedTeamMembers };
    onChange(updatedData);
  };

  const addCollaborator = () => {
    if (newCollaborator.name.trim()) {
      const updatedCollaborators = [...formData.workRecognized.collaborators, { ...newCollaborator }];
      const updatedData = {
        ...formData,
        workRecognized: {
          ...formData.workRecognized,
          collaborators: updatedCollaborators
        }
      };
      onChange(updatedData);
      setNewCollaborator({
        name: '',
        role: '',
        affiliation: ''
      });
    }
  };

  const removeCollaborator = (index) => {
    const updatedCollaborators = formData.workRecognized.collaborators.filter((_, i) => i !== index);
    const updatedData = {
      ...formData,
      workRecognized: {
        ...formData.workRecognized,
        collaborators: updatedCollaborators
      }
    };
    onChange(updatedData);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      const updatedData = {
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      };
      onChange(updatedData);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    const updatedData = {
      ...formData,
      keywords: formData.keywords.filter(keyword => keyword !== keywordToRemove)
    };
    onChange(updatedData);
  };

  const addResearchArea = () => {
    if (newResearchArea.trim() && !formData.researchArea.includes(newResearchArea.trim())) {
      const updatedData = {
        ...formData,
        researchArea: [...formData.researchArea, newResearchArea.trim()]
      };
      onChange(updatedData);
      setNewResearchArea('');
    }
  };

  const removeResearchArea = (areaToRemove) => {
    const updatedData = {
      ...formData,
      researchArea: formData.researchArea.filter(area => area !== areaToRemove)
    };
    onChange(updatedData);
  };

  const getFieldError = (fieldPath) => {
    return errors.find(error => error.path?.includes(fieldPath))?.message;
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleResearchAreaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResearchArea();
    }
  };

  return (
    <div className="space-y-8">
      {/* Achievement Type and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Achievement Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Achievement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Achievement Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'award', label: 'Award' },
                { value: 'grant', label: 'Grant' },
                { value: 'fellowship', label: 'Fellowship' },
                { value: 'recognition', label: 'Recognition' },
                { value: 'competition', label: 'Competition' },
                { value: 'certification', label: 'Certification' },
                { value: 'membership', label: 'Membership' },
                { value: 'honor', label: 'Honor' },
                { value: 'scholarship', label: 'Scholarship' }
              ].map(type => (
                <label key={type.value} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="achievementType"
                    value={type.value}
                    checked={formData.achievementType === type.value}
                    onChange={(e) => handleInputChange('achievementType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
            {getFieldError('achievementType') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('achievementType')}</p>
            )}
          </div>

          {/* Achievement Name */}
          <div>
            <label htmlFor="achievementName" className="block text-sm font-medium text-gray-700 mb-2">
              Achievement Name *
            </label>
            <Input
              id="achievementName"
              value={formData.achievementName}
              onChange={(e) => handleInputChange('achievementName', e.target.value)}
              placeholder="e.g., Best Research Paper Award"
              maxLength={200}
            />
            {getFieldError('achievementName') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('achievementName')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Awarding Organization */}
            <div>
              <label htmlFor="awardingOrganization" className="block text-sm font-medium text-gray-700 mb-2">
                Awarding Organization *
              </label>
              <Input
                id="awardingOrganization"
                value={formData.awardingOrganization}
                onChange={(e) => handleInputChange('awardingOrganization', e.target.value)}
                placeholder="e.g., IEEE, Nature, Government of India"
              />
              {getFieldError('awardingOrganization') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('awardingOrganization')}</p>
              )}
            </div>

            {/* Organization Type */}
            <div>
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type *
              </label>
              <select
                id="organizationType"
                value={formData.organizationType}
                onChange={(e) => handleInputChange('organizationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="government">Government</option>
                <option value="university">University</option>
                <option value="professional-body">Professional Body</option>
                <option value="industry">Industry</option>
                <option value="non-profit">Non-Profit</option>
                <option value="international-org">International Organization</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level *
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="international">International</option>
                <option value="national">National</option>
                <option value="regional">Regional</option>
                <option value="state">State</option>
                <option value="institutional">Institutional</option>
                <option value="departmental">Departmental</option>
              </select>
              {getFieldError('level') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('level')}</p>
              )}
            </div>

            {/* Competition Level */}
            <div>
              <label htmlFor="competitionLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Competition Level
              </label>
              <select
                id="competitionLevel"
                value={formData.competitionLevel}
                onChange={(e) => handleInputChange('competitionLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="individual">Individual</option>
                <option value="team">Team</option>
                <option value="collaborative">Collaborative</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Received Date */}
            <div>
              <label htmlFor="receivedDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date Received *
              </label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={(e) => handleInputChange('receivedDate', e.target.value)}
              />
              {getFieldError('receivedDate') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('receivedDate')}</p>
              )}
            </div>

            {/* Announcement Date */}
            <div>
              <label htmlFor="announcementDate" className="block text-sm font-medium text-gray-700 mb-2">
                Announcement Date
              </label>
              <Input
                id="announcementDate"
                type="date"
                value={formData.announcementDate}
                onChange={(e) => handleInputChange('announcementDate', e.target.value)}
              />
            </div>

            {/* Valid From */}
            <div>
              <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-2">
                Valid From
              </label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
              />
            </div>

            {/* Valid Until */}
            <div>
              <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                disabled={formData.isLifetime}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isLifetime}
                onChange={(e) => handleInputChange('isLifetime', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Lifetime Achievement</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Selection Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Selection Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.selectionProcess.applicationRequired}
                onChange={(e) => handleNestedInputChange('selectionProcess', 'applicationRequired', e.target.checked)}
                className="mr-2"
              />
              Application Required
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.selectionProcess.nominationRequired}
                onChange={(e) => handleNestedInputChange('selectionProcess', 'nominationRequired', e.target.checked)}
                className="mr-2"
              />
              Nomination Required
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Applicants */}
            <div>
              <label htmlFor="totalApplicants" className="block text-sm font-medium text-gray-700 mb-2">
                Total Applicants
              </label>
              <Input
                id="totalApplicants"
                type="number"
                value={formData.selectionProcess.totalApplicants}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  handleNestedInputChange('selectionProcess', 'totalApplicants', value);
                }}
                placeholder="100"
                min="0"
              />
            </div>

            {/* Total Winners */}
            <div>
              <label htmlFor="totalWinners" className="block text-sm font-medium text-gray-700 mb-2">
                Total Winners
              </label>
              <Input
                id="totalWinners"
                type="number"
                value={formData.selectionProcess.totalWinners}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  handleNestedInputChange('selectionProcess', 'totalWinners', value);
                }}
                placeholder="5"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Monetary Value
              </label>
              <Input
                id="amount"
                type="number"
                value={formData.monetaryValue.amount}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  handleNestedInputChange('monetaryValue', 'amount', value);
                }}
                placeholder="10000"
                min="0"
              />
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="currency"
                value={formData.monetaryValue.currency}
                onChange={(e) => handleNestedInputChange('monetaryValue', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            {/* Disbursement Schedule */}
            <div>
              <label htmlFor="disbursementSchedule" className="block text-sm font-medium text-gray-700 mb-2">
                Disbursement
              </label>
              <select
                id="disbursementSchedule"
                value={formData.monetaryValue.disbursementSchedule}
                onChange={(e) => handleNestedInputChange('monetaryValue', 'disbursementSchedule', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lump-sum">Lump Sum</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="milestone-based">Milestone Based</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.monetaryValue.isOneTime}
                onChange={(e) => handleNestedInputChange('monetaryValue', 'isOneTime', e.target.checked)}
                className="mr-2"
              />
              One-time payment
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Description and Work Recognized
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Achievement Description */}
          <div>
            <label htmlFor="achievementDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Achievement Description
            </label>
            <Textarea
              id="achievementDescription"
              value={formData.achievementDescription}
              onChange={(e) => handleInputChange('achievementDescription', e.target.value)}
              placeholder="Describe the significance and context of this achievement..."
              className="h-32"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.achievementDescription.length}/1000 characters
            </p>
          </div>

          {/* Work Recognized */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Work Recognized</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="workTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Title
                </label>
                <Input
                  id="workTitle"
                  value={formData.workRecognized.title}
                  onChange={(e) => handleArrayInputChange('workRecognized', 'title', e.target.value)}
                  placeholder="Title of the work being recognized"
                />
              </div>
              <div>
                <label htmlFor="workCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Category
                </label>
                <Input
                  id="workCategory"
                  value={formData.workRecognized.category}
                  onChange={(e) => handleArrayInputChange('workRecognized', 'category', e.target.value)}
                  placeholder="e.g., Research, Innovation, Teaching"
                />
              </div>
            </div>

            <div>
              <label htmlFor="workDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Work Description
              </label>
              <Textarea
                id="workDescription"
                value={formData.workRecognized.description}
                onChange={(e) => handleArrayInputChange('workRecognized', 'description', e.target.value)}
                placeholder="Describe the work that was recognized..."
                className="h-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members (for team achievements) */}
      {formData.competitionLevel === 'team' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Team Members */}
            {formData.teamMembers.length > 0 && (
              <div className="space-y-4">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Team Member {index + 1}
                        {member.isMainContributor && <span className="text-blue-600 text-sm ml-1">(Lead)</span>}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Input
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                          placeholder="Role/Position"
                        />
                      </div>
                      <div>
                        <Input
                          value={member.affiliation}
                          onChange={(e) => updateTeamMember(index, 'affiliation', e.target.value)}
                          placeholder="Institution/Organization"
                        />
                      </div>
                      <div>
                        <Input
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                          placeholder="Email address"
                          type="email"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Textarea
                        value={member.contribution}
                        onChange={(e) => updateTeamMember(index, 'contribution', e.target.value)}
                        placeholder="Describe their contribution..."
                        className="h-20"
                      />
                    </div>
                    
                    <div className="mt-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={member.isMainContributor}
                          onChange={(e) => updateTeamMember(index, 'isMainContributor', e.target.checked)}
                          className="mr-2"
                        />
                        Main Contributor/Lead
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Team Member */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Add Team Member</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name *"
                  />
                </div>
                <div>
                  <Input
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Role/Position"
                  />
                </div>
                <div>
                  <Input
                    value={newTeamMember.affiliation}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, affiliation: e.target.value }))}
                    placeholder="Institution/Organization"
                  />
                </div>
                <div>
                  <Input
                    value={newTeamMember.email}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                    type="email"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Textarea
                  value={newTeamMember.contribution}
                  onChange={(e) => setNewTeamMember(prev => ({ ...prev, contribution: e.target.value }))}
                  placeholder="Describe their contribution..."
                  className="h-20"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTeamMember.isMainContributor}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, isMainContributor: e.target.checked }))}
                    className="mr-2"
                  />
                  Main Contributor/Lead
                </label>
                <Button type="button" onClick={addTeamMember} disabled={!newTeamMember.name.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Team Member
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation and Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            Documentation and Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certificate URL */}
            <div>
              <label htmlFor="certificateUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate URL
              </label>
              <Input
                id="certificateUrl"
                type="url"
                value={formData.documentation.certificateUrl}
                onChange={(e) => handleNestedInputChange('documentation', 'certificateUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Official Announcement URL */}
            <div>
              <label htmlFor="officialAnnouncementUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Official Announcement URL
              </label>
              <Input
                id="officialAnnouncementUrl"
                type="url"
                value={formData.documentation.officialAnnouncementUrl}
                onChange={(e) => handleNestedInputChange('documentation', 'officialAnnouncementUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Press Release URL */}
            <div>
              <label htmlFor="pressReleaseUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Press Release URL
              </label>
              <Input
                id="pressReleaseUrl"
                type="url"
                value={formData.documentation.pressReleaseUrl}
                onChange={(e) => handleNestedInputChange('documentation', 'pressReleaseUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Verification URL */}
            <div>
              <label htmlFor="verificationUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Verification URL
              </label>
              <Input
                id="verificationUrl"
                type="url"
                value={formData.verification.verificationUrl}
                onChange={(e) => handleNestedInputChange('verification', 'verificationUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Verification */}
          <div>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.verification.isVerified}
                onChange={(e) => handleNestedInputChange('verification', 'isVerified', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Achievement is verified</span>
            </label>
            
            {formData.verification.isVerified && (
              <div className="grid grid-cols-1 gap-4 ml-6">
                <div>
                  <Input
                    value={formData.verification.verificationSource}
                    onChange={(e) => handleNestedInputChange('verification', 'verificationSource', e.target.value)}
                    placeholder="Verification source (e.g., Official website, Email confirmation)"
                  />
                </div>
                <div>
                  <Textarea
                    value={formData.verification.verificationNotes}
                    onChange={(e) => handleNestedInputChange('verification', 'verificationNotes', e.target.value)}
                    placeholder="Additional verification notes..."
                    className="h-20"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Research Areas and Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Research Areas and Keywords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Research Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Research Areas
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newResearchArea}
                onChange={(e) => setNewResearchArea(e.target.value)}
                onKeyPress={handleResearchAreaKeyPress}
                placeholder="Add research area"
                className="flex-1"
              />
              <Button type="button" onClick={addResearchArea} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {formData.researchArea.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.researchArea.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => removeResearchArea(area)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Add keyword"
                className="flex-1"
              />
              <Button type="button" onClick={addKeyword} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementForm;
