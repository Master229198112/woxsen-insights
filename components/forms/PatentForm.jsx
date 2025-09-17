'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  X, 
  User, 
  Building, 
  FileText,
  Lightbulb,
  Shield,
  Calendar,
  ExternalLink,
  DollarSign
} from 'lucide-react';

const PatentForm = ({ data, onChange, errors = [] }) => {
  const [newInventor, setNewInventor] = useState({
    name: '',
    affiliation: '',
    email: '',
    orcid: '',
    isPrimary: false,
    contributionPercentage: ''
  });

  const [newClaim, setNewClaim] = useState({
    claimNumber: 1,
    claimText: '',
    claimType: 'independent',
    dependsOn: []
  });

  // Initialize data with defaults
  const formData = {
    patentNumber: '',
    applicationNumber: '',
    patentType: 'utility',
    status: 'filed',
    filingDate: '',
    grantDate: '',
    publicationDate: '',
    expiryDate: '',
    inventors: [],
    assignee: {
      name: '',
      type: 'university',
      address: ''
    },
    patentOffice: '',
    jurisdiction: '',
    technicalField: '',
    background: '',
    summary: '',
    detailedDescription: '',
    claims: [],
    ipcClassification: [],
    cpcClassification: [],
    pdfUrl: '',
    drawingsUrls: [],
    patentUrl: '',
    commercialStatus: {
      isCommercialized: false,
      licensingAvailable: false,
      commercialPartners: []
    },
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

  const addInventor = () => {
    if (newInventor.name.trim()) {
      const updatedData = {
        ...formData,
        inventors: [...formData.inventors, { ...newInventor }]
      };
      onChange(updatedData);
      setNewInventor({
        name: '',
        affiliation: '',
        email: '',
        orcid: '',
        isPrimary: false,
        contributionPercentage: ''
      });
    }
  };

  // Function to fix existing data types
  const fixDataTypes = () => {
    const updatedInventors = formData.inventors.map(inventor => ({
      ...inventor,
      contributionPercentage: typeof inventor.contributionPercentage === 'string' && inventor.contributionPercentage !== '' 
        ? Number(inventor.contributionPercentage) 
        : inventor.contributionPercentage
    }));
    
    if (JSON.stringify(updatedInventors) !== JSON.stringify(formData.inventors)) {
      const updatedData = { ...formData, inventors: updatedInventors };
      onChange(updatedData);
    }
  };

  // Fix data types on component mount and when data changes
  React.useEffect(() => {
    fixDataTypes();
  }, []);

  const removeInventor = (index) => {
    const updatedData = {
      ...formData,
      inventors: formData.inventors.filter((_, i) => i !== index)
    };
    onChange(updatedData);
  };

  const updateInventor = (index, field, value) => {
    const updatedInventors = formData.inventors.map((inventor, i) => 
      i === index ? { ...inventor, [field]: value } : inventor
    );
    const updatedData = { ...formData, inventors: updatedInventors };
    onChange(updatedData);
  };

  const addClaim = () => {
    if (newClaim.claimText.trim()) {
      const updatedData = {
        ...formData,
        claims: [...formData.claims, { ...newClaim }]
      };
      onChange(updatedData);
      setNewClaim({
        claimNumber: formData.claims.length + 2,
        claimText: '',
        claimType: 'independent',
        dependsOn: []
      });
    }
  };

  const removeClaim = (index) => {
    const updatedData = {
      ...formData,
      claims: formData.claims.filter((_, i) => i !== index)
    };
    onChange(updatedData);
  };

  const updateClaim = (index, field, value) => {
    const updatedClaims = formData.claims.map((claim, i) => 
      i === index ? { ...claim, [field]: value } : claim
    );
    const updatedData = { ...formData, claims: updatedClaims };
    onChange(updatedData);
  };

  const getFieldError = (fieldPath) => {
    return errors.find(error => error.path?.includes(fieldPath))?.message;
  };

  return (
    <div className="space-y-8">
      {/* Patent Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Patent Identification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patent Number */}
            <div>
              <label htmlFor="patentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Patent Number *
              </label>
              <Input
                id="patentNumber"
                value={formData.patentNumber}
                onChange={(e) => handleInputChange('patentNumber', e.target.value.toUpperCase())}
                placeholder="US10123456B2"
                className="font-mono"
              />
              {getFieldError('patentNumber') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('patentNumber')}</p>
              )}
            </div>

            {/* Application Number */}
            <div>
              <label htmlFor="applicationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Application Number
              </label>
              <Input
                id="applicationNumber"
                value={formData.applicationNumber}
                onChange={(e) => handleInputChange('applicationNumber', e.target.value.toUpperCase())}
                placeholder="16/123456"
                className="font-mono"
              />
            </div>

            {/* Patent Type */}
            <div>
              <label htmlFor="patentType" className="block text-sm font-medium text-gray-700 mb-2">
                Patent Type
              </label>
              <select
                id="patentType"
                value={formData.patentType}
                onChange={(e) => handleInputChange('patentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="utility">Utility Patent</option>
                <option value="design">Design Patent</option>
                <option value="plant">Plant Patent</option>
                <option value="provisional">Provisional Application</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="filed">Filed</option>
                <option value="pending">Pending</option>
                <option value="under-examination">Under Examination</option>
                <option value="granted">Granted</option>
                <option value="expired">Expired</option>
                <option value="abandoned">Abandoned</option>
                <option value="rejected">Rejected</option>
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
            {/* Filing Date */}
            <div>
              <label htmlFor="filingDate" className="block text-sm font-medium text-gray-700 mb-2">
                Filing Date *
              </label>
              <Input
                id="filingDate"
                type="date"
                value={formData.filingDate}
                onChange={(e) => handleInputChange('filingDate', e.target.value)}
              />
              {getFieldError('filingDate') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('filingDate')}</p>
              )}
            </div>

            {/* Grant Date */}
            <div>
              <label htmlFor="grantDate" className="block text-sm font-medium text-gray-700 mb-2">
                Grant Date
              </label>
              <Input
                id="grantDate"
                type="date"
                value={formData.grantDate}
                onChange={(e) => handleInputChange('grantDate', e.target.value)}
              />
            </div>

            {/* Publication Date */}
            <div>
              <label htmlFor="publicationDate" className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <Input
                id="publicationDate"
                type="date"
                value={formData.publicationDate}
                onChange={(e) => handleInputChange('publicationDate', e.target.value)}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patent Office */}
            <div>
              <label htmlFor="patentOffice" className="block text-sm font-medium text-gray-700 mb-2">
                Patent Office *
              </label>
              <select
                id="patentOffice"
                value={formData.patentOffice}
                onChange={(e) => handleInputChange('patentOffice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Patent Office</option>
                <option value="USPTO">USPTO (United States)</option>
                <option value="EPO">EPO (European Patent Office)</option>
                <option value="IPO">IPO (Indian Patent Office)</option>
                <option value="JPO">JPO (Japan Patent Office)</option>
                <option value="KIPO">KIPO (Korean Intellectual Property Office)</option>
                <option value="CNIPA">CNIPA (China National IP Administration)</option>
                <option value="Other">Other</option>
              </select>
              {getFieldError('patentOffice') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('patentOffice')}</p>
              )}
            </div>

            {/* Jurisdiction */}
            <div>
              <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction
              </label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                placeholder="e.g., United States, European Union"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Assignee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignee Name */}
            <div>
              <label htmlFor="assigneeName" className="block text-sm font-medium text-gray-700 mb-2">
                Assignee Name
              </label>
              <Input
                id="assigneeName"
                value={formData.assignee.name}
                onChange={(e) => handleNestedInputChange('assignee', 'name', e.target.value)}
                placeholder="Woxsen University"
              />
            </div>

            {/* Assignee Type */}
            <div>
              <label htmlFor="assigneeType" className="block text-sm font-medium text-gray-700 mb-2">
                Assignee Type
              </label>
              <select
                id="assigneeType"
                value={formData.assignee.type}
                onChange={(e) => handleNestedInputChange('assignee', 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="university">University</option>
                <option value="company">Company</option>
                <option value="individual">Individual</option>
                <option value="government">Government</option>
              </select>
            </div>
          </div>

          {/* Assignee Address */}
          <div>
            <label htmlFor="assigneeAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <Textarea
              id="assigneeAddress"
              value={formData.assignee.address}
              onChange={(e) => handleNestedInputChange('assignee', 'address', e.target.value)}
              placeholder="Full address of the assignee"
              className="h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Inventors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Inventors */}
          {formData.inventors.length > 0 && (
            <div className="space-y-4">
              {formData.inventors.map((inventor, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      Inventor {index + 1} 
                      {inventor.isPrimary && <span className="text-blue-600 text-sm ml-1">(Primary)</span>}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInventor(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        value={inventor.name}
                        onChange={(e) => updateInventor(index, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Input
                        value={inventor.affiliation}
                        onChange={(e) => updateInventor(index, 'affiliation', e.target.value)}
                        placeholder="Institution/Company"
                      />
                    </div>
                    <div>
                      <Input
                        value={inventor.email}
                        onChange={(e) => updateInventor(index, 'email', e.target.value)}
                        placeholder="Email address"
                        type="email"
                      />
                    </div>
                    <div>
                      <Input
                        value={inventor.contributionPercentage}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : Number(e.target.value);
                          updateInventor(index, 'contributionPercentage', value);
                        }}
                        placeholder="Contribution %"
                        type="number"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={inventor.isPrimary}
                        onChange={(e) => updateInventor(index, 'isPrimary', e.target.checked)}
                        className="mr-2"
                      />
                      Primary Inventor
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Inventor */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Add Inventor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Input
                  value={newInventor.name}
                  onChange={(e) => setNewInventor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name *"
                />
              </div>
              <div>
                <Input
                  value={newInventor.affiliation}
                  onChange={(e) => setNewInventor(prev => ({ ...prev, affiliation: e.target.value }))}
                  placeholder="Institution/Company"
                />
              </div>
              <div>
                <Input
                  value={newInventor.email}
                  onChange={(e) => setNewInventor(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  type="email"
                />
              </div>
              <div>
                <Input
                  value={newInventor.contributionPercentage}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : Number(e.target.value);
                    setNewInventor(prev => ({ ...prev, contributionPercentage: value }));
                  }}
                  placeholder="Contribution %"
                  type="number"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newInventor.isPrimary}
                  onChange={(e) => setNewInventor(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="mr-2"
                />
                Primary Inventor
              </label>
              <Button 
                type="button" 
                onClick={addInventor} 
                disabled={!newInventor.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Inventor
              </Button>
            </div>
          </div>
          
          {getFieldError('inventors') && (
            <p className="text-red-600 text-sm">{getFieldError('inventors')}</p>
          )}
        </CardContent>
      </Card>

      {/* Technical Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Technical Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Technical Field */}
          <div>
            <label htmlFor="technicalField" className="block text-sm font-medium text-gray-700 mb-2">
              Technical Field
            </label>
            <Textarea
              id="technicalField"
              value={formData.technicalField}
              onChange={(e) => handleInputChange('technicalField', e.target.value)}
              placeholder="Describe the technical field of the invention..."
              className="h-24"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.technicalField.length}/500 characters
            </p>
          </div>

          {/* Background */}
          <div>
            <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-2">
              Background
            </label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => handleInputChange('background', e.target.value)}
              placeholder="Describe the background and existing problems..."
              className="h-32"
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.background.length}/2000 characters
            </p>
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Summary of Invention
            </label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Provide a summary of the invention..."
              className="h-32"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.summary.length}/1000 characters
            </p>
          </div>

          {/* Detailed Description */}
          <div>
            <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description
            </label>
            <Textarea
              id="detailedDescription"
              value={formData.detailedDescription}
              onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
              placeholder="Provide detailed description of the invention..."
              className="h-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Commercial Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Commercial Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.commercialStatus.isCommercialized}
                onChange={(e) => handleNestedInputChange('commercialStatus', 'isCommercialized', e.target.checked)}
                className="mr-2"
              />
              Patent is commercialized
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.commercialStatus.licensingAvailable}
                onChange={(e) => handleNestedInputChange('commercialStatus', 'licensingAvailable', e.target.checked)}
                className="mr-2"
              />
              Available for licensing
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Links and Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            Links and Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF URL */}
            <div>
              <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Patent PDF URL
              </label>
              <Input
                id="pdfUrl"
                type="url"
                value={formData.pdfUrl}
                onChange={(e) => handleInputChange('pdfUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Patent URL */}
            <div>
              <label htmlFor="patentUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Official Patent URL
              </label>
              <Input
                id="patentUrl"
                type="url"
                value={formData.patentUrl}
                onChange={(e) => handleInputChange('patentUrl', e.target.value)}
                placeholder="https://patents.uspto.gov/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatentForm;
