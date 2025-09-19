'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Building, 
  Save, 
  Plus, 
  X, 
  Linkedin, 
  ExternalLink,
  BookOpen,
  GraduationCap,
  Award,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

const EnhancedProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: user?.name || '',
    department: user?.department || '',
    bio: user?.bio || '',
    
    // Academic Information
    academicInfo: {
      designation: user?.academicInfo?.designation || '',
      qualifications: user?.academicInfo?.qualifications || [],
      researchInterests: user?.academicInfo?.researchInterests || [],
      expertise: user?.academicInfo?.expertise || [],
      teachingAreas: user?.academicInfo?.teachingAreas || []
    },
    
    // Social Profiles
    socialProfiles: {
      linkedin: user?.socialProfiles?.linkedin || '',
      orcid: user?.socialProfiles?.orcid || '',
      googleScholar: user?.socialProfiles?.googleScholar || '',
      researchGate: user?.socialProfiles?.researchGate || '',
      website: user?.socialProfiles?.website || '',
      twitter: user?.socialProfiles?.twitter || ''
    },
    
    // Privacy Settings
    privacySettings: {
      isPublic: user?.privacySettings?.isPublic ?? true,
      showEmail: user?.privacySettings?.showEmail ?? false,
      showSocialProfiles: user?.privacySettings?.showSocialProfiles ?? true,
      showStats: user?.privacySettings?.showStats ?? true,
      showFollowers: user?.privacySettings?.showFollowers ?? true,
      allowDirectMessages: user?.privacySettings?.allowDirectMessages ?? true,
      showOnlineStatus: user?.privacySettings?.showOnlineStatus ?? false
    },
    
    // Affiliations
    affiliations: user?.affiliations || []
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Temporary states for adding new items
  const [newQualification, setNewQualification] = useState({
    degree: '', field: '', institution: '', year: '', isHighestDegree: false
  });
  const [newResearchInterest, setNewResearchInterest] = useState('');
  const [newExpertise, setNewExpertise] = useState({
    area: '', level: 'intermediate', yearsOfExperience: ''
  });
  const [newTeachingArea, setNewTeachingArea] = useState({
    subject: '', level: 'undergraduate', yearsTeaching: ''
  });
  const [newAffiliation, setNewAffiliation] = useState({
    organization: '', position: '', startDate: '', endDate: '', isCurrent: false, description: ''
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'affiliations', label: 'Affiliations', icon: Building }
  ];

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayAdd = (arrayField, newItem) => {
    setFormData(prev => ({
      ...prev,
      academicInfo: {
        ...prev.academicInfo,
        [arrayField]: [...prev.academicInfo[arrayField], newItem]
      }
    }));
  };

  const handleArrayRemove = (arrayField, index) => {
    setFormData(prev => ({
      ...prev,
      academicInfo: {
        ...prev.academicInfo,
        [arrayField]: prev.academicInfo[arrayField].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (updateType) => {
    setLoading(prev => ({ ...prev, [updateType]: true }));
    setMessage({ type: '', text: '' });

    try {
      let submitData;
      
      switch (updateType) {
        case 'basic':
          submitData = {
            updateType: 'basic',
            name: formData.name,
            department: formData.department,
            bio: formData.bio
          };
          break;
        case 'academic':
          submitData = {
            updateType: 'academic',
            designation: formData.academicInfo.designation,
            qualifications: formData.academicInfo.qualifications,
            researchInterests: formData.academicInfo.researchInterests,
            expertise: formData.academicInfo.expertise,
            teachingAreas: formData.academicInfo.teachingAreas
          };
          break;
        case 'social':
          submitData = {
            updateType: 'social',
            ...formData.socialProfiles
          };
          break;
        case 'privacy':
          submitData = {
            updateType: 'privacy',
            ...formData.privacySettings
          };
          break;
        case 'affiliations':
          submitData = {
            updateType: 'affiliations',
            affiliations: formData.affiliations
          };
          break;
        default:
          throw new Error('Invalid update type');
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `${updateType} information updated successfully!` });
        if (onUpdate) onUpdate(data.user);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Update failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
    } finally {
      setLoading(prev => ({ ...prev, [updateType]: false }));
    }
  };

  const addQualification = () => {
    if (newQualification.degree && newQualification.field && newQualification.institution) {
      handleArrayAdd('qualifications', { ...newQualification, year: parseInt(newQualification.year) || null });
      setNewQualification({ degree: '', field: '', institution: '', year: '', isHighestDegree: false });
    }
  };

  const addResearchInterest = () => {
    if (newResearchInterest.trim() && !formData.academicInfo.researchInterests.includes(newResearchInterest.trim())) {
      handleArrayAdd('researchInterests', newResearchInterest.trim());
      setNewResearchInterest('');
    }
  };

  const addExpertise = () => {
    if (newExpertise.area.trim()) {
      handleArrayAdd('expertise', {
        ...newExpertise,
        yearsOfExperience: parseInt(newExpertise.yearsOfExperience) || 0
      });
      setNewExpertise({ area: '', level: 'intermediate', yearsOfExperience: '' });
    }
  };

  const addTeachingArea = () => {
    if (newTeachingArea.subject.trim()) {
      handleArrayAdd('teachingAreas', {
        ...newTeachingArea,
        yearsTeaching: parseInt(newTeachingArea.yearsTeaching) || 0
      });
      setNewTeachingArea({ subject: '', level: 'undergraduate', yearsTeaching: '' });
    }
  };

  const addAffiliation = () => {
    if (newAffiliation.organization.trim()) {
      setFormData(prev => ({
        ...prev,
        affiliations: [...prev.affiliations, {
          ...newAffiliation,
          _id: Date.now().toString() // Temporary ID for UI purposes
        }]
      }));
      setNewAffiliation({
        organization: '', position: '', startDate: '', endDate: '', isCurrent: false, description: ''
      });
    }
  };

  const removeAffiliation = (index) => {
    setFormData(prev => ({
      ...prev,
      affiliations: prev.affiliations.filter((_, i) => i !== index)
    }));
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange(null, 'name', e.target.value)}
          placeholder="Your full name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
        <Input
          value={formData.department}
          onChange={(e) => handleInputChange(null, 'department', e.target.value)}
          placeholder="e.g., School of Business"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
          placeholder="Tell us about yourself, your research interests, or your role..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
      </div>
      
      <Button 
        onClick={() => handleSubmit('basic')}
        disabled={loading.basic}
        className="w-full"
      >
        {loading.basic ? 'Saving...' : 'Save Basic Information'}
      </Button>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="space-y-8">
      {/* Designation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Designation</label>
        <Input
          value={formData.academicInfo.designation}
          onChange={(e) => handleInputChange('academicInfo', 'designation', e.target.value)}
          placeholder="e.g., Associate Professor, Dean, HOD"
        />
      </div>

      {/* Qualifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Qualifications</label>
        
        {/* Existing Qualifications */}
        {formData.academicInfo.qualifications.map((qual, index) => (
          <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{qual.degree} in {qual.field}</h4>
                <p className="text-sm text-gray-600">{qual.institution} ({qual.year})</p>
                {qual.isHighestDegree && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Highest Degree</span>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleArrayRemove('qualifications', index)}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Add New Qualification */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="Degree (e.g., PhD, M.Tech)"
              value={newQualification.degree}
              onChange={(e) => setNewQualification(prev => ({ ...prev, degree: e.target.value }))}
            />
            <Input
              placeholder="Field of Study"
              value={newQualification.field}
              onChange={(e) => setNewQualification(prev => ({ ...prev, field: e.target.value }))}
            />
            <Input
              placeholder="Institution"
              value={newQualification.institution}
              onChange={(e) => setNewQualification(prev => ({ ...prev, institution: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Year"
              value={newQualification.year}
              onChange={(e) => setNewQualification(prev => ({ ...prev, year: e.target.value }))}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newQualification.isHighestDegree}
                onChange={(e) => setNewQualification(prev => ({ ...prev, isHighestDegree: e.target.checked }))}
                className="mr-2"
              />
              This is my highest degree
            </label>
            <Button onClick={addQualification} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Qualification
            </Button>
          </div>
        </div>
      </div>

      {/* Research Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Research Interests</label>
        
        {formData.academicInfo.researchInterests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.academicInfo.researchInterests.map((interest, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {interest}
                <button
                  onClick={() => handleArrayRemove('researchInterests', index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder="Add research interest"
            value={newResearchInterest}
            onChange={(e) => setNewResearchInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResearchInterest())}
          />
          <Button onClick={addResearchInterest} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button 
        onClick={() => handleSubmit('academic')}
        disabled={loading.academic}
        className="w-full"
      >
        {loading.academic ? 'Saving...' : 'Save Academic Information'}
      </Button>
    </div>
  );

  const renderSocialProfiles = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
        <div className="relative">
          <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={formData.socialProfiles.linkedin}
            onChange={(e) => handleInputChange('socialProfiles', 'linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ORCID</label>
        <div className="relative">
          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={formData.socialProfiles.orcid}
            onChange={(e) => handleInputChange('socialProfiles', 'orcid', e.target.value)}
            placeholder="https://orcid.org/0000-0000-0000-0000"
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Google Scholar</label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={formData.socialProfiles.googleScholar}
            onChange={(e) => handleInputChange('socialProfiles', 'googleScholar', e.target.value)}
            placeholder="https://scholar.google.com/citations?user=..."
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ResearchGate</label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={formData.socialProfiles.researchGate}
            onChange={(e) => handleInputChange('socialProfiles', 'researchGate', e.target.value)}
            placeholder="https://researchgate.net/profile/..."
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Personal Website</label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={formData.socialProfiles.website}
            onChange={(e) => handleInputChange('socialProfiles', 'website', e.target.value)}
            placeholder="https://yourwebsite.com"
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X</label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={formData.socialProfiles.twitter}
            onChange={(e) => handleInputChange('socialProfiles', 'twitter', e.target.value)}
            placeholder="https://twitter.com/yourusername"
            className="pl-10"
          />
        </div>
      </div>

      <Button 
        onClick={() => handleSubmit('social')}
        disabled={loading.social}
        className="w-full"
      >
        {loading.social ? 'Saving...' : 'Save Social Profiles'}
      </Button>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Public Profile</h3>
            <p className="text-sm text-gray-600">Make your profile visible to other users</p>
          </div>
          <input
            type="checkbox"
            checked={formData.privacySettings.isPublic}
            onChange={(e) => handleInputChange('privacySettings', 'isPublic', e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Show Email</h3>
            <p className="text-sm text-gray-600">Display your email on your public profile</p>
          </div>
          <input
            type="checkbox"
            checked={formData.privacySettings.showEmail}
            onChange={(e) => handleInputChange('privacySettings', 'showEmail', e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Show Social Profiles</h3>
            <p className="text-sm text-gray-600">Display your social media links</p>
          </div>
          <input
            type="checkbox"
            checked={formData.privacySettings.showSocialProfiles}
            onChange={(e) => handleInputChange('privacySettings', 'showSocialProfiles', e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Show Statistics</h3>
            <p className="text-sm text-gray-600">Display your post counts and metrics</p>
          </div>
          <input
            type="checkbox"
            checked={formData.privacySettings.showStats}
            onChange={(e) => handleInputChange('privacySettings', 'showStats', e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Show Followers</h3>
            <p className="text-sm text-gray-600">Allow others to see your followers and following</p>
          </div>
          <input
            type="checkbox"
            checked={formData.privacySettings.showFollowers}
            onChange={(e) => handleInputChange('privacySettings', 'showFollowers', e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Allow Direct Messages</h3>
            <p className="text-sm text-gray-600">Let other users send you messages</p>
          </div>
          <input
            type="checkbox"
            checked={formData.privacySettings.allowDirectMessages}
            onChange={(e) => handleInputChange('privacySettings', 'allowDirectMessages', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
      </div>

      <Button 
        onClick={() => handleSubmit('privacy')}
        disabled={loading.privacy}
        className="w-full"
      >
        {loading.privacy ? 'Saving...' : 'Save Privacy Settings'}
      </Button>
    </div>
  );

  // NEW: Render Affiliations function that was missing
  const renderAffiliations = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange(null, 'name', e.target.value)}
          placeholder="Your full name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
        <Input
          value={formData.department}
          onChange={(e) => handleInputChange(null, 'department', e.target.value)}
          placeholder="e.g., AI Research Centre"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
          placeholder="Tell us about yourself, your research interests, or your role..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
      </div>

      {/* Additional Affiliations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Additional Affiliations</label>
        
        {/* Existing Affiliations */}
        {formData.affiliations.length > 0 && (
          <div className="space-y-3 mb-4">
            {formData.affiliations.map((affiliation, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{affiliation.organization}</h4>
                    {affiliation.position && (
                      <p className="text-sm text-gray-600">{affiliation.position}</p>
                    )}
                    {affiliation.startDate && (
                      <p className="text-xs text-gray-500">
                        {affiliation.startDate} - {affiliation.isCurrent ? 'Present' : affiliation.endDate}
                      </p>
                    )}
                    {affiliation.description && (
                      <p className="text-sm text-gray-700 mt-2">{affiliation.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAffiliation(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add New Affiliation */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-3 mb-3">
            <Input
              placeholder="Organization/Institution"
              value={newAffiliation.organization}
              onChange={(e) => setNewAffiliation(prev => ({ ...prev, organization: e.target.value }))}
            />
            <Input
              placeholder="Position/Role"
              value={newAffiliation.position}
              onChange={(e) => setNewAffiliation(prev => ({ ...prev, position: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                placeholder="Start Date"
                value={newAffiliation.startDate}
                onChange={(e) => setNewAffiliation(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={newAffiliation.endDate}
                onChange={(e) => setNewAffiliation(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={newAffiliation.isCurrent}
              />
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={newAffiliation.description}
              onChange={(e) => setNewAffiliation(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newAffiliation.isCurrent}
                onChange={(e) => setNewAffiliation(prev => ({ 
                  ...prev, 
                  isCurrent: e.target.checked,
                  endDate: e.target.checked ? '' : prev.endDate
                }))}
                className="mr-2"
              />
              Current position
            </label>
            <Button onClick={addAffiliation} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Affiliation
            </Button>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => handleSubmit('affiliations')}
        disabled={loading.affiliations}
        className="w-full"
      >
        {loading.affiliations ? 'Saving...' : 'Save Basic Information'}
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'basic': return renderBasicInfo();
      case 'academic': return renderAcademicInfo();
      case 'social': return renderSocialProfiles();
      case 'privacy': return renderPrivacySettings();
      case 'affiliations': return renderAffiliations(); // FIXED: Added missing case
      default: return renderBasicInfo();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tabs.find(tab => tab.id === activeTab)?.label} Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* Status Message */}
      {message.text && (
        <div className={`mt-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default EnhancedProfileForm;
