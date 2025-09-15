'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PDFUpload from '@/components/upload/PDFUpload';
import FileUpload from '@/components/upload/FileUpload';
import { 
  Plus, 
  X, 
  User, 
  Mail, 
  Building, 
  ExternalLink,
  FileUp,
  Award,
  BarChart3,
  FileText
} from 'lucide-react';

const ResearchForm = ({ data, onChange, errors = [] }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newCoAuthor, setNewCoAuthor] = useState({
    name: '',
    affiliation: '',
    email: '',
    orcid: '',
    linkedIn: '',
    researchGate: '',
    isCorresponding: false
  });

  // Initialize data with defaults if not provided
  const formData = {
    paperType: 'research',
    abstract: '',
    keywords: [],
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    publishedYear: new Date().getFullYear(),
    coAuthors: [],
    indexedIn: {
      scopus: false,
      wos: false,
      quartile: 'Not Indexed',
      impactFactor: '',
      hIndex: '',
      citations: 0
    },
    researchType: 'experimental',
    fundingSource: '',
    ethicsApproval: {
      required: false,
      approvalNumber: '',
      approvalDate: ''
    },
    pdfFile: null, // For uploaded PDF
    pdfUrl: '', // For external URL (legacy support)
    supplementaryFiles: [],
    externalLinks: {
      pubmedId: '',
      arxivId: '',
      researchGateUrl: '',
      googleScholarUrl: ''
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

  // Handle PDF upload
  const handlePDFUploaded = (pdfData) => {
    const updatedData = { ...formData, pdfFile: pdfData };
    onChange(updatedData);
  };

  // Handle supplementary files upload
  const handleSupplementaryFilesUploaded = (files) => {
    const updatedData = { ...formData, supplementaryFiles: files };
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

  const addCoAuthor = () => {
    if (newCoAuthor.name.trim()) {
      const updatedData = {
        ...formData,
        coAuthors: [...formData.coAuthors, { ...newCoAuthor }]
      };
      onChange(updatedData);
      setNewCoAuthor({
        name: '',
        affiliation: '',
        email: '',
        orcid: '',
        linkedIn: '',
        researchGate: '',
        isCorresponding: false
      });
    }
  };

  const removeCoAuthor = (index) => {
    const updatedData = {
      ...formData,
      coAuthors: formData.coAuthors.filter((_, i) => i !== index)
    };
    onChange(updatedData);
  };

  const updateCoAuthor = (index, field, value) => {
    const updatedCoAuthors = formData.coAuthors.map((author, i) => 
      i === index ? { ...author, [field]: value } : author
    );
    const updatedData = { ...formData, coAuthors: updatedCoAuthors };
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

  return (
    <div className="space-y-8">
      {/* Paper Type and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Paper Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paper Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paper Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paperType"
                  value="research"
                  checked={formData.paperType === 'research'}
                  onChange={(e) => handleInputChange('paperType', e.target.value)}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">Research Paper</div>
                  <div className="text-sm text-gray-500">Original research findings</div>
                </div>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paperType"
                  value="review"
                  checked={formData.paperType === 'review'}
                  onChange={(e) => handleInputChange('paperType', e.target.value)}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">Review Paper</div>
                  <div className="text-sm text-gray-500">Literature review or survey</div>
                </div>
              </label>
            </div>
            {getFieldError('paperType') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('paperType')}</p>
            )}
          </div>

          {/* Research Type */}
          <div>
            <label htmlFor="researchType" className="block text-sm font-medium text-gray-700 mb-2">
              Research Type
            </label>
            <select
              id="researchType"
              value={formData.researchType}
              onChange={(e) => handleInputChange('researchType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="experimental">Experimental</option>
              <option value="theoretical">Theoretical</option>
              <option value="computational">Computational</option>
              <option value="review">Review</option>
              <option value="survey">Survey</option>
              <option value="case-study">Case Study</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Abstract and Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Abstract and Keywords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Abstract */}
          <div>
            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
              Abstract * (100-2000 characters)
            </label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              placeholder="Provide a comprehensive abstract of your research..."
              className="w-full h-32"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              {getFieldError('abstract') && (
                <p className="text-red-600 text-sm">{getFieldError('abstract')}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.abstract.length}/2000 characters
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords * (3-10 keywords)
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Add a keyword"
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
            <p className="text-xs text-gray-500 mt-1">
              {formData.keywords.length}/10 keywords
            </p>
            {getFieldError('keywords') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('keywords')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publication Details */}
      <Card>
        <CardHeader>
          <CardTitle>Publication Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Journal */}
            <div className="md:col-span-2">
              <label htmlFor="journal" className="block text-sm font-medium text-gray-700 mb-2">
                Journal/Conference Name *
              </label>
              <Input
                id="journal"
                value={formData.journal}
                onChange={(e) => handleInputChange('journal', e.target.value)}
                placeholder="e.g., Nature, IEEE Transactions on..."
                className="w-full"
              />
              {getFieldError('journal') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('journal')}</p>
              )}
            </div>

            {/* Volume */}
            <div>
              <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                Volume
              </label>
              <Input
                id="volume"
                value={formData.volume}
                onChange={(e) => handleInputChange('volume', e.target.value)}
                placeholder="e.g., 15"
              />
            </div>

            {/* Issue */}
            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-2">
                Issue
              </label>
              <Input
                id="issue"
                value={formData.issue}
                onChange={(e) => handleInputChange('issue', e.target.value)}
                placeholder="e.g., 3"
              />
            </div>

            {/* Pages */}
            <div>
              <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-2">
                Pages
              </label>
              <Input
                id="pages"
                value={formData.pages}
                onChange={(e) => handleInputChange('pages', e.target.value)}
                placeholder="e.g., 123-145"
              />
            </div>

            {/* Published Year */}
            <div>
              <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 mb-2">
                Published Year *
              </label>
              <Input
                id="publishedYear"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => handleInputChange('publishedYear', parseInt(e.target.value) || '')}
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {getFieldError('publishedYear') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('publishedYear')}</p>
              )}
            </div>

            {/* DOI */}
            <div>
              <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-2">
                DOI
              </label>
              <Input
                id="doi"
                value={formData.doi}
                onChange={(e) => handleInputChange('doi', e.target.value)}
                placeholder="10.1038/nature12373"
              />
              {getFieldError('doi') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('doi')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indexing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Indexing and Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Indexing checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Indexed In
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.indexedIn.scopus}
                  onChange={(e) => handleNestedInputChange('indexedIn', 'scopus', e.target.checked)}
                  className="mr-2"
                />
                Scopus
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.indexedIn.wos}
                  onChange={(e) => handleNestedInputChange('indexedIn', 'wos', e.target.checked)}
                  className="mr-2"
                />
                Web of Science
              </label>
            </div>
          </div>

          {/* Quartile */}
          <div>
            <label htmlFor="quartile" className="block text-sm font-medium text-gray-700 mb-2">
              Journal Quartile
            </label>
            <select
              id="quartile"
              value={formData.indexedIn.quartile}
              onChange={(e) => handleNestedInputChange('indexedIn', 'quartile', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Not Indexed">Not Indexed</option>
              <option value="Q1">Q1 (Top 25%)</option>
              <option value="Q2">Q2 (25-50%)</option>
              <option value="Q3">Q3 (50-75%)</option>
              <option value="Q4">Q4 (Bottom 25%)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Impact Factor */}
            <div>
              <label htmlFor="impactFactor" className="block text-sm font-medium text-gray-700 mb-2">
                Impact Factor
              </label>
              <Input
                id="impactFactor"
                type="number"
                step="0.001"
                value={formData.indexedIn.impactFactor}
                onChange={(e) => handleNestedInputChange('indexedIn', 'impactFactor', parseFloat(e.target.value) || '')}
                placeholder="2.5"
              />
            </div>

            {/* H-Index */}
            <div>
              <label htmlFor="hIndex" className="block text-sm font-medium text-gray-700 mb-2">
                H-Index
              </label>
              <Input
                id="hIndex"
                type="number"
                value={formData.indexedIn.hIndex}
                onChange={(e) => handleNestedInputChange('indexedIn', 'hIndex', parseInt(e.target.value) || '')}
                placeholder="15"
              />
            </div>

            {/* Citations */}
            <div>
              <label htmlFor="citations" className="block text-sm font-medium text-gray-700 mb-2">
                Citations
              </label>
              <Input
                id="citations"
                type="number"
                value={formData.indexedIn.citations}
                onChange={(e) => handleNestedInputChange('indexedIn', 'citations', parseInt(e.target.value) || 0)}
                placeholder="25"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Co-Authors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Co-Authors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Co-Authors */}
          {formData.coAuthors.length > 0 && (
            <div className="space-y-4">
              {formData.coAuthors.map((author, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">Co-Author {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCoAuthor(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        value={author.name}
                        onChange={(e) => updateCoAuthor(index, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Input
                        value={author.affiliation}
                        onChange={(e) => updateCoAuthor(index, 'affiliation', e.target.value)}
                        placeholder="Institution/Affiliation"
                      />
                    </div>
                    <div>
                      <Input
                        value={author.email}
                        onChange={(e) => updateCoAuthor(index, 'email', e.target.value)}
                        placeholder="Email address"
                        type="email"
                      />
                    </div>
                    <div>
                      <Input
                        value={author.orcid}
                        onChange={(e) => updateCoAuthor(index, 'orcid', e.target.value)}
                        placeholder="ORCID ID"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={author.isCorresponding}
                        onChange={(e) => updateCoAuthor(index, 'isCorresponding', e.target.checked)}
                        className="mr-2"
                      />
                      Corresponding Author
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Co-Author */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Add Co-Author</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Input
                  value={newCoAuthor.name}
                  onChange={(e) => setNewCoAuthor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name *"
                />
              </div>
              <div>
                <Input
                  value={newCoAuthor.affiliation}
                  onChange={(e) => setNewCoAuthor(prev => ({ ...prev, affiliation: e.target.value }))}
                  placeholder="Institution/Affiliation"
                />
              </div>
              <div>
                <Input
                  value={newCoAuthor.email}
                  onChange={(e) => setNewCoAuthor(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  type="email"
                />
              </div>
              <div>
                <Input
                  value={newCoAuthor.orcid}
                  onChange={(e) => setNewCoAuthor(prev => ({ ...prev, orcid: e.target.value }))}
                  placeholder="ORCID ID"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCoAuthor.isCorresponding}
                  onChange={(e) => setNewCoAuthor(prev => ({ ...prev, isCorresponding: e.target.checked }))}
                  className="mr-2"
                />
                Corresponding Author
              </label>
              <Button type="button" onClick={addCoAuthor} disabled={!newCoAuthor.name.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Co-Author
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Upload Section - NEW ENHANCED SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Research Paper PDF
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Upload the full research paper PDF or provide a direct link to the paper
          </p>
        </CardHeader>
        <CardContent>
          <PDFUpload
            onPDFUploaded={handlePDFUploaded}
            currentPDF={formData.pdfFile}
            label="Upload Research Paper PDF"
            placeholder="https://arxiv.org/pdf/2023.12345.pdf"
            maxSize={15 * 1024 * 1024} // 15MB for research papers
          />
          {getFieldError('pdfFile') && (
            <p className="text-red-600 text-sm mt-2">{getFieldError('pdfFile')}</p>
          )}
          
          {/* Legacy URL field for backward compatibility
          {!formData.pdfFile && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Or enter PDF URL (Legacy)
              </label>
              <Input
                id="pdfUrl"
                type="url"
                value={formData.pdfUrl}
                onChange={(e) => handleInputChange('pdfUrl', e.target.value)}
                placeholder="https://example.com/paper.pdf"
              />
              {getFieldError('pdfUrl') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('pdfUrl')}</p>
              )}
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Supplementary Files Section - NEW */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileUp className="h-5 w-5 mr-2" />
            Supplementary Materials
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Upload additional files like datasets, code, appendices, or supporting documents
          </p>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileUploaded={handleSupplementaryFilesUploaded}
            currentFiles={formData.supplementaryFiles}
            allowedTypes={['pdf', 'document', 'image']}
            multiple={true}
            maxFiles={5}
            label="Upload Supplementary Files"
          />
          {getFieldError('supplementaryFiles') && (
            <p className="text-red-600 text-sm mt-2">{getFieldError('supplementaryFiles')}</p>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Funding Source */}
          <div>
            <label htmlFor="fundingSource" className="block text-sm font-medium text-gray-700 mb-2">
              Funding Source
            </label>
            <Input
              id="fundingSource"
              value={formData.fundingSource}
              onChange={(e) => handleInputChange('fundingSource', e.target.value)}
              placeholder="e.g., National Science Foundation, DST, etc."
            />
          </div>

          {/* Ethics Approval */}
          <div>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.ethicsApproval.required}
                onChange={(e) => handleNestedInputChange('ethicsApproval', 'required', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Ethics Approval Required</span>
            </label>
            
            {formData.ethicsApproval.required && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <Input
                    value={formData.ethicsApproval.approvalNumber}
                    onChange={(e) => handleNestedInputChange('ethicsApproval', 'approvalNumber', e.target.value)}
                    placeholder="Approval number"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={formData.ethicsApproval.approvalDate}
                    onChange={(e) => handleNestedInputChange('ethicsApproval', 'approvalDate', e.target.value)}
                    placeholder="Approval date"
                  />
                </div>
              </div>
            )}
          </div>

          {/* External Links */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <ExternalLink className="h-4 w-4 mr-1" />
              External Links
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  value={formData.externalLinks.pubmedId}
                  onChange={(e) => handleNestedInputChange('externalLinks', 'pubmedId', e.target.value)}
                  placeholder="PubMed ID"
                />
              </div>
              <div>
                <Input
                  value={formData.externalLinks.arxivId}
                  onChange={(e) => handleNestedInputChange('externalLinks', 'arxivId', e.target.value)}
                  placeholder="arXiv ID"
                />
              </div>
              <div>
                <Input
                  value={formData.externalLinks.researchGateUrl}
                  onChange={(e) => handleNestedInputChange('externalLinks', 'researchGateUrl', e.target.value)}
                  placeholder="ResearchGate URL"
                  type="url"
                />
              </div>
              <div>
                <Input
                  value={formData.externalLinks.googleScholarUrl}
                  onChange={(e) => handleNestedInputChange('externalLinks', 'googleScholarUrl', e.target.value)}
                  placeholder="Google Scholar URL"
                  type="url"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchForm;
