'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  X, 
  Calendar,
  MapPin,
  User,
  Users,
  Building,
  DollarSign,
  ExternalLink,
  Clock,
  Globe,
  Video,
  FileText
} from 'lucide-react';

const EventForm = ({ data, onChange, errors = [] }) => {
  const [newSpeaker, setNewSpeaker] = useState({
    name: '',
    designation: '',
    affiliation: '',
    bio: '',
    photoUrl: '',
    topicTitle: '',
    topicDescription: '',
    speakerType: 'presenter',
    socialProfiles: {
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  const [newCoOrganizer, setNewCoOrganizer] = useState({
    name: '',
    email: '',
    affiliation: '',
    role: ''
  });

  const [newSponsor, setNewSponsor] = useState({
    name: '',
    type: 'supporting',
    logoUrl: '',
    websiteUrl: ''
  });

  // Initialize data with defaults
  const formData = {
    eventName: '',
    eventType: 'conference',
    eventFormat: 'in-person',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'Asia/Kolkata',
    location: {
      venue: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: ''
      },
      room: '',
      building: '',
      campus: '',
      virtualLink: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    organizer: {
      primaryOrganizer: {
        name: '',
        email: '',
        phone: '',
        affiliation: ''
      },
      coOrganizers: [],
      organizingInstitution: 'Woxsen University',
      sponsors: []
    },
    registration: {
      isRegistrationRequired: true,
      registrationUrl: '',
      registrationDeadline: '',
      registrationFee: {
        amount: '',
        currency: 'INR',
        feeStructure: []
      },
      maxParticipants: '',
      currentRegistrations: 0,
      waitlistAvailable: false
    },
    speakers: [],
    resources: {
      eventPosterUrl: '',
      brochureUrl: '',
      presentationUrls: [],
      recordingUrl: '',
      photoGalleryUrls: [],
      documentsUrls: []
    },
    eventStatus: 'planned',
    attendance: {
      expectedAttendees: '',
      actualAttendees: '',
      attendanceRate: '',
      feedbackCollected: false,
      averageRating: '',
      feedbackCount: 0
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

  const handleDeeplyNestedInputChange = (parentField, childField, field, value) => {
    const updatedData = {
      ...formData,
      [parentField]: {
        ...formData[parentField],
        [childField]: {
          ...formData[parentField][childField],
          [field]: value
        }
      }
    };
    onChange(updatedData);
  };

  const addSpeaker = () => {
    if (newSpeaker.name.trim()) {
      const updatedData = {
        ...formData,
        speakers: [...formData.speakers, { ...newSpeaker }]
      };
      onChange(updatedData);
      setNewSpeaker({
        name: '',
        designation: '',
        affiliation: '',
        bio: '',
        photoUrl: '',
        topicTitle: '',
        topicDescription: '',
        speakerType: 'presenter',
        socialProfiles: {
          linkedin: '',
          twitter: '',
          website: ''
        }
      });
    }
  };

  const removeSpeaker = (index) => {
    const updatedData = {
      ...formData,
      speakers: formData.speakers.filter((_, i) => i !== index)
    };
    onChange(updatedData);
  };

  const updateSpeaker = (index, field, value) => {
    const updatedSpeakers = formData.speakers.map((speaker, i) => 
      i === index ? { ...speaker, [field]: value } : speaker
    );
    const updatedData = { ...formData, speakers: updatedSpeakers };
    onChange(updatedData);
  };

  const addCoOrganizer = () => {
    if (newCoOrganizer.name.trim()) {
      const updatedData = {
        ...formData,
        organizer: {
          ...formData.organizer,
          coOrganizers: [...formData.organizer.coOrganizers, { ...newCoOrganizer }]
        }
      };
      onChange(updatedData);
      setNewCoOrganizer({
        name: '',
        email: '',
        affiliation: '',
        role: ''
      });
    }
  };

  const removeCoOrganizer = (index) => {
    const updatedData = {
      ...formData,
      organizer: {
        ...formData.organizer,
        coOrganizers: formData.organizer.coOrganizers.filter((_, i) => i !== index)
      }
    };
    onChange(updatedData);
  };

  const addSponsor = () => {
    if (newSponsor.name.trim()) {
      const updatedData = {
        ...formData,
        organizer: {
          ...formData.organizer,
          sponsors: [...formData.organizer.sponsors, { ...newSponsor }]
        }
      };
      onChange(updatedData);
      setNewSponsor({
        name: '',
        type: 'supporting',
        logoUrl: '',
        websiteUrl: ''
      });
    }
  };

  const removeSponsor = (index) => {
    const updatedData = {
      ...formData,
      organizer: {
        ...formData.organizer,
        sponsors: formData.organizer.sponsors.filter((_, i) => i !== index)
      }
    };
    onChange(updatedData);
  };

  const getFieldError = (fieldPath) => {
    return errors.find(error => error.path?.includes(fieldPath))?.message;
  };

  return (
    <div className="space-y-8">
      {/* Event Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Event Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Name */}
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <Input
              id="eventName"
              value={formData.eventName}
              onChange={(e) => handleInputChange('eventName', e.target.value)}
              placeholder="e.g., International Conference on AI"
              maxLength={200}
            />
            {getFieldError('eventName') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('eventName')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Type */}
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                id="eventType"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="webinar">Webinar</option>
                <option value="symposium">Symposium</option>
                <option value="lecture">Lecture</option>
                <option value="training">Training</option>
                <option value="networking">Networking</option>
                <option value="competition">Competition</option>
                <option value="ceremony">Ceremony</option>
                <option value="exhibition">Exhibition</option>
                <option value="hackathon">Hackathon</option>
              </select>
            </div>

            {/* Event Format */}
            <div>
              <label htmlFor="eventFormat" className="block text-sm font-medium text-gray-700 mb-2">
                Event Format *
              </label>
              <select
                id="eventFormat"
                value={formData.eventFormat}
                onChange={(e) => handleInputChange('eventFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date and Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Date and Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
              {getFieldError('startDate') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('startDate')}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
              {getFieldError('endDate') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('endDate')}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
              {getFieldError('startTime') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('startTime')}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
              {getFieldError('endTime') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('endTime')}</p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">EST (America/New_York)</option>
              <option value="America/Los_Angeles">PST (America/Los_Angeles)</option>
              <option value="Europe/London">GMT (Europe/London)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Venue (for in-person/hybrid events) */}
          {(formData.eventFormat === 'in-person' || formData.eventFormat === 'hybrid') && (
            <>
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                <Input
                  id="venue"
                  value={formData.location.venue}
                  onChange={(e) => handleNestedInputChange('location', 'venue', e.target.value)}
                  placeholder="e.g., Main Auditorium, Conference Hall"
                />
                {getFieldError('venue') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('venue')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                    Building
                  </label>
                  <Input
                    id="building"
                    value={formData.location.building}
                    onChange={(e) => handleNestedInputChange('location', 'building', e.target.value)}
                    placeholder="Building name"
                  />
                </div>
                <div>
                  <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
                    Room/Hall Number
                  </label>
                  <Input
                    id="room"
                    value={formData.location.room}
                    onChange={(e) => handleNestedInputChange('location', 'room', e.target.value)}
                    placeholder="Room number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-2">
                  Campus
                </label>
                <Input
                  id="campus"
                  value={formData.location.campus}
                  onChange={(e) => handleNestedInputChange('location', 'campus', e.target.value)}
                  placeholder="Campus location"
                />
              </div>

              {/* Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={formData.location.address.street}
                      onChange={(e) => handleDeeplyNestedInputChange('location', 'address', 'street', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Input
                      value={formData.location.address.city}
                      onChange={(e) => handleDeeplyNestedInputChange('location', 'address', 'city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Input
                      value={formData.location.address.state}
                      onChange={(e) => handleDeeplyNestedInputChange('location', 'address', 'state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Input
                      value={formData.location.address.postalCode}
                      onChange={(e) => handleDeeplyNestedInputChange('location', 'address', 'postalCode', e.target.value)}
                      placeholder="Postal Code"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Virtual Link (for virtual/hybrid events) */}
          {(formData.eventFormat === 'virtual' || formData.eventFormat === 'hybrid') && (
            <div>
              <label htmlFor="virtualLink" className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="inline h-4 w-4 mr-1" />
                Virtual Meeting Link *
              </label>
              <Input
                id="virtualLink"
                type="url"
                value={formData.location.virtualLink}
                onChange={(e) => handleNestedInputChange('location', 'virtualLink', e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
              {getFieldError('virtualLink') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('virtualLink')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organizer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Organizer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Organizer */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Primary Organizer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="primaryOrganizerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <Input
                  id="primaryOrganizerName"
                  value={formData.organizer.primaryOrganizer.name}
                  onChange={(e) => handleDeeplyNestedInputChange('organizer', 'primaryOrganizer', 'name', e.target.value)}
                  placeholder="Organizer name"
                />
                {getFieldError('primaryOrganizer.name') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('primaryOrganizer.name')}</p>
                )}
              </div>
              <div>
                <label htmlFor="primaryOrganizerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  id="primaryOrganizerEmail"
                  type="email"
                  value={formData.organizer.primaryOrganizer.email}
                  onChange={(e) => handleDeeplyNestedInputChange('organizer', 'primaryOrganizer', 'email', e.target.value)}
                  placeholder="email@example.com"
                />
                {getFieldError('primaryOrganizer.email') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('primaryOrganizer.email')}</p>
                )}
              </div>
              <div>
                <label htmlFor="primaryOrganizerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  id="primaryOrganizerPhone"
                  value={formData.organizer.primaryOrganizer.phone}
                  onChange={(e) => handleDeeplyNestedInputChange('organizer', 'primaryOrganizer', 'phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label htmlFor="primaryOrganizerAffiliation" className="block text-sm font-medium text-gray-700 mb-2">
                  Affiliation
                </label>
                <Input
                  id="primaryOrganizerAffiliation"
                  value={formData.organizer.primaryOrganizer.affiliation}
                  onChange={(e) => handleDeeplyNestedInputChange('organizer', 'primaryOrganizer', 'affiliation', e.target.value)}
                  placeholder="Department/Organization"
                />
              </div>
            </div>
          </div>

          {/* Organizing Institution */}
          <div>
            <label htmlFor="organizingInstitution" className="block text-sm font-medium text-gray-700 mb-2">
              Organizing Institution *
            </label>
            <Input
              id="organizingInstitution"
              value={formData.organizer.organizingInstitution}
              onChange={(e) => handleNestedInputChange('organizer', 'organizingInstitution', e.target.value)}
              placeholder="Woxsen University"
            />
            {getFieldError('organizingInstitution') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('organizingInstitution')}</p>
            )}
          </div>

          {/* Co-Organizers */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Co-Organizers</h4>
            
            {/* Existing Co-Organizers */}
            {formData.organizer.coOrganizers.length > 0 && (
              <div className="space-y-3 mb-4">
                {formData.organizer.coOrganizers.map((coOrg, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium">{coOrg.name}</span>
                      {coOrg.affiliation && <span className="text-gray-500 ml-2">({coOrg.affiliation})</span>}
                      {coOrg.role && <span className="text-blue-600 text-sm ml-2">- {coOrg.role}</span>}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCoOrganizer(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Co-Organizer */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <Input
                    value={newCoOrganizer.name}
                    onChange={(e) => setNewCoOrganizer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Co-organizer name"
                  />
                </div>
                <div>
                  <Input
                    value={newCoOrganizer.email}
                    onChange={(e) => setNewCoOrganizer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                  />
                </div>
                <div>
                  <Input
                    value={newCoOrganizer.affiliation}
                    onChange={(e) => setNewCoOrganizer(prev => ({ ...prev, affiliation: e.target.value }))}
                    placeholder="Affiliation"
                  />
                </div>
                <div>
                  <Input
                    value={newCoOrganizer.role}
                    onChange={(e) => setNewCoOrganizer(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Role (optional)"
                  />
                </div>
              </div>
              <Button type="button" onClick={addCoOrganizer} disabled={!newCoOrganizer.name.trim()} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Co-Organizer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={formData.registration.isRegistrationRequired}
                onChange={(e) => handleNestedInputChange('registration', 'isRegistrationRequired', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Registration Required</span>
            </label>
          </div>

          {formData.registration.isRegistrationRequired && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="registrationUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Registration URL
                  </label>
                  <Input
                    id="registrationUrl"
                    type="url"
                    value={formData.registration.registrationUrl}
                    onChange={(e) => handleNestedInputChange('registration', 'registrationUrl', e.target.value)}
                    placeholder="https://forms.google.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline
                  </label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={formData.registration.registrationDeadline}
                    onChange={(e) => handleNestedInputChange('registration', 'registrationDeadline', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Fee
                  </label>
                  <Input
                    id="registrationFee"
                    type="number"
                    value={formData.registration.registrationFee.amount}
                    onChange={(e) => handleDeeplyNestedInputChange('registration', 'registrationFee', 'amount', parseFloat(e.target.value) || '')}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.registration.registrationFee.currency}
                    onChange={(e) => handleDeeplyNestedInputChange('registration', 'registrationFee', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.registration.maxParticipants}
                    onChange={(e) => handleNestedInputChange('registration', 'maxParticipants', parseInt(e.target.value) || '')}
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.registration.waitlistAvailable}
                    onChange={(e) => handleNestedInputChange('registration', 'waitlistAvailable', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Waitlist</span>
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Speakers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Speakers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Speakers */}
          {formData.speakers.length > 0 && (
            <div className="space-y-4">
              {formData.speakers.map((speaker, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      {speaker.name}
                      <span className="text-sm text-blue-600 ml-2">({speaker.speakerType})</span>
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpeaker(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {speaker.designation && <span>{speaker.designation}</span>}
                    {speaker.affiliation && <span className="ml-2">at {speaker.affiliation}</span>}
                  </div>
                  {speaker.topicTitle && (
                    <div className="text-sm text-gray-800 mt-2">
                      <strong>Topic:</strong> {speaker.topicTitle}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Speaker */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Add Speaker</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    value={newSpeaker.name}
                    onChange={(e) => setNewSpeaker(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Speaker name *"
                  />
                </div>
                <div>
                  <select
                    value={newSpeaker.speakerType}
                    onChange={(e) => setNewSpeaker(prev => ({ ...prev, speakerType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="keynote">Keynote Speaker</option>
                    <option value="invited">Invited Speaker</option>
                    <option value="panel">Panel Speaker</option>
                    <option value="workshop-leader">Workshop Leader</option>
                    <option value="presenter">Presenter</option>
                  </select>
                </div>
                <div>
                  <Input
                    value={newSpeaker.designation}
                    onChange={(e) => setNewSpeaker(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="Designation/Title"
                  />
                </div>
                <div>
                  <Input
                    value={newSpeaker.affiliation}
                    onChange={(e) => setNewSpeaker(prev => ({ ...prev, affiliation: e.target.value }))}
                    placeholder="Institution/Organization"
                  />
                </div>
              </div>
              
              <div>
                <Input
                  value={newSpeaker.topicTitle}
                  onChange={(e) => setNewSpeaker(prev => ({ ...prev, topicTitle: e.target.value }))}
                  placeholder="Presentation/Topic Title"
                />
              </div>
              
              <div>
                <Textarea
                  value={newSpeaker.topicDescription}
                  onChange={(e) => setNewSpeaker(prev => ({ ...prev, topicDescription: e.target.value }))}
                  placeholder="Brief description of the topic/presentation..."
                  className="h-20"
                />
              </div>
              
              <div>
                <Textarea
                  value={newSpeaker.bio}
                  onChange={(e) => setNewSpeaker(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Speaker bio (optional)..."
                  className="h-24"
                  maxLength={1000}
                />
              </div>

              <Button type="button" onClick={addSpeaker} disabled={!newSpeaker.name.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Speaker
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Event Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="eventPosterUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Event Poster URL
              </label>
              <Input
                id="eventPosterUrl"
                type="url"
                value={formData.resources.eventPosterUrl}
                onChange={(e) => handleNestedInputChange('resources', 'eventPosterUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label htmlFor="brochureUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Brochure URL
              </label>
              <Input
                id="brochureUrl"
                type="url"
                value={formData.resources.brochureUrl}
                onChange={(e) => handleNestedInputChange('resources', 'brochureUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label htmlFor="recordingUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Recording URL (Post-Event)
              </label>
              <Input
                id="recordingUrl"
                type="url"
                value={formData.resources.recordingUrl}
                onChange={(e) => handleNestedInputChange('resources', 'recordingUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Status and Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Event Status and Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="eventStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Event Status
              </label>
              <select
                id="eventStatus"
                value={formData.eventStatus}
                onChange={(e) => handleInputChange('eventStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Planned</option>
                <option value="registration-open">Registration Open</option>
                <option value="registration-closed">Registration Closed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
            <div>
              <label htmlFor="expectedAttendees" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Attendees
              </label>
              <Input
                id="expectedAttendees"
                type="number"
                value={formData.attendance.expectedAttendees}
                onChange={(e) => handleNestedInputChange('attendance', 'expectedAttendees', parseInt(e.target.value) || '')}
                placeholder="100"
                min="0"
              />
            </div>
          </div>

          {/* Post-event fields */}
          {formData.eventStatus === 'completed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="actualAttendees" className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Attendees
                </label>
                <Input
                  id="actualAttendees"
                  type="number"
                  value={formData.attendance.actualAttendees}
                  onChange={(e) => handleNestedInputChange('attendance', 'actualAttendees', parseInt(e.target.value) || '')}
                  placeholder="85"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="averageRating" className="block text-sm font-medium text-gray-700 mb-2">
                  Average Rating (1-5)
                </label>
                <Input
                  id="averageRating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.attendance.averageRating}
                  onChange={(e) => handleNestedInputChange('attendance', 'averageRating', parseFloat(e.target.value) || '')}
                  placeholder="4.5"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;
