'use client';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  ExternalLink,
  DollarSign,
  Mic,
  Building,
  Globe,
  FileText,
  Image as ImageIcon,
  Star,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const EventDisplay = ({ blog }) => {
  const { eventData } = blog;
  
  if (!eventData) {
    return <div className="text-gray-500 p-8">Event data not available</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      'planned': 'bg-blue-100 text-blue-800',
      'registration-open': 'bg-green-100 text-green-800',
      'registration-closed': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'postponed': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getFormatIcon = (format) => {
    const icons = {
      'in-person': MapPin,
      'virtual': Globe,
      'hybrid': Users
    };
    return icons[format] || Calendar;
  };

  const FormatIcon = getFormatIcon(eventData.eventFormat);

  return (
    <div className="space-y-8">
      {/* Event Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Event Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <dt className="font-semibold text-gray-900 mb-1">Event Name</dt>
              <dd className="text-lg text-gray-700 font-medium">{eventData.eventName}</dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Status</dt>
              <dd>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  getStatusColor(eventData.eventStatus)
                }`}>
                  {eventData.eventStatus.replace('-', ' ')}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Event Type</dt>
              <dd className="text-gray-700 capitalize">{eventData.eventType}</dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Format</dt>
              <dd className="flex items-center text-gray-700">
                <FormatIcon className="h-4 w-4 mr-2" />
                <span className="capitalize">{eventData.eventFormat.replace('-', ' ')}</span>
              </dd>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Timezone</dt>
              <dd className="text-gray-700">{eventData.timezone}</dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-600" />
            Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Start</div>
              <div className="font-semibold text-gray-900">
                {formatDate(eventData.startDate)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {eventData.startTime}
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">End</div>
              <div className="font-semibold text-gray-900">
                {formatDate(eventData.endDate)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {eventData.endTime}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-red-600" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventData.location?.venue && (
            <div className="mb-4">
              <dt className="font-semibold text-gray-900 mb-1">Venue</dt>
              <dd className="text-gray-700 text-lg">{eventData.location.venue}</dd>
            </div>
          )}
          
          {eventData.location?.address && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {eventData.location.address.street && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Address</dt>
                  <dd className="text-gray-700">{eventData.location.address.street}</dd>
                </div>
              )}
              
              {eventData.location.address.city && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">City</dt>
                  <dd className="text-gray-700">{eventData.location.address.city}</dd>
                </div>
              )}
              
              {eventData.location.address.state && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">State</dt>
                  <dd className="text-gray-700">{eventData.location.address.state}</dd>
                </div>
              )}
              
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Country</dt>
                <dd className="text-gray-700">{eventData.location.address?.country || 'India'}</dd>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eventData.location?.room && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Room</dt>
                <dd className="text-gray-700">{eventData.location.room}</dd>
              </div>
            )}
            
            {eventData.location?.building && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Building</dt>
                <dd className="text-gray-700">{eventData.location.building}</dd>
              </div>
            )}
            
            {eventData.location?.campus && (
              <div>
                <dt className="font-semibold text-gray-900 mb-1">Campus</dt>
                <dd className="text-gray-700">{eventData.location.campus}</dd>
              </div>
            )}
          </div>
          
          {eventData.location?.virtualLink && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <dt className="font-semibold text-gray-900 mb-2">Virtual Meeting Link</dt>
              <dd>
                <a
                  href={eventData.location.virtualLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Join Virtual Event
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organizer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-purple-600" />
            Organizer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Primary Organizer */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Primary Organizer</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Name</dt>
                  <dd className="text-gray-700">{eventData.organizer.primaryOrganizer.name}</dd>
                </div>
                
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Email</dt>
                  <dd className="text-gray-700">
                    <a href={`mailto:${eventData.organizer.primaryOrganizer.email}`} className="text-blue-600 hover:text-blue-800">
                      {eventData.organizer.primaryOrganizer.email}
                    </a>
                  </dd>
                </div>
                
                {eventData.organizer.primaryOrganizer.phone && (
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Phone</dt>
                    <dd className="text-gray-700">{eventData.organizer.primaryOrganizer.phone}</dd>
                  </div>
                )}
                
                {eventData.organizer.primaryOrganizer.affiliation && (
                  <div className="md:col-span-3">
                    <dt className="font-semibold text-gray-900 mb-1">Affiliation</dt>
                    <dd className="text-gray-700">{eventData.organizer.primaryOrganizer.affiliation}</dd>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <dt className="font-semibold text-gray-900 mb-1">Organizing Institution</dt>
              <dd className="text-gray-700">{eventData.organizer.organizingInstitution}</dd>
            </div>
            
            {/* Co-organizers */}
            {eventData.organizer.coOrganizers && eventData.organizer.coOrganizers.length > 0 && (
              <div>
                <dt className="font-semibold text-gray-900 mb-3">Co-organizers</dt>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eventData.organizer.coOrganizers.map((coOrganizer, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">{coOrganizer.name}</div>
                      {coOrganizer.role && (
                        <div className="text-sm text-gray-600">{coOrganizer.role}</div>
                      )}
                      {coOrganizer.affiliation && (
                        <div className="text-sm text-gray-600">{coOrganizer.affiliation}</div>
                      )}
                      {coOrganizer.email && (
                        <div className="text-sm">
                          <a href={`mailto:${coOrganizer.email}`} className="text-blue-600 hover:text-blue-800">
                            {coOrganizer.email}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Sponsors */}
            {eventData.organizer.sponsors && eventData.organizer.sponsors.length > 0 && (
              <div>
                <dt className="font-semibold text-gray-900 mb-3">Sponsors</dt>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {eventData.organizer.sponsors.map((sponsor, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white">
                      <div className="font-medium text-gray-900">{sponsor.name}</div>
                      {sponsor.type && (
                        <div className="text-sm text-gray-600 capitalize mt-1">{sponsor.type} Sponsor</div>
                      )}
                      {sponsor.websiteUrl && (
                        <div className="mt-2">
                          <a
                            href={sponsor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3 inline ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Information */}
      {eventData.registration?.isRegistrationRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-orange-600" />
              Registration Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventData.registration.registrationUrl && (
                <div className="md:col-span-2">
                  <dt className="font-semibold text-gray-900 mb-2">Registration Link</dt>
                  <dd>
                    <a
                      href={eventData.registration.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Register Now
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </dd>
                </div>
              )}
              
              {eventData.registration.registrationDeadline && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Deadline</dt>
                  <dd className="text-gray-700">
                    {formatDate(eventData.registration.registrationDeadline)}
                  </dd>
                </div>
              )}
              
              {eventData.registration.maxParticipants && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-1">Max Participants</dt>
                  <dd className="text-gray-700">
                    {eventData.registration.maxParticipants.toLocaleString()}
                  </dd>
                </div>
              )}
            </div>
            
            {eventData.registration.registrationFee?.amount && (
              <div className="mt-6">
                <dt className="font-semibold text-gray-900 mb-3">Registration Fee</dt>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {eventData.registration.registrationFee.currency} {eventData.registration.registrationFee.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Standard Fee</div>
                  </div>
                  
                  {eventData.registration.registrationFee.feeStructure && eventData.registration.registrationFee.feeStructure.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        {eventData.registration.registrationFee.feeStructure.map((fee, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{fee.category}</span>
                            <span className="font-semibold">
                              {eventData.registration.registrationFee.currency} {fee.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Speakers */}
      {eventData.speakers && eventData.speakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="h-5 w-5 mr-2 text-indigo-600" />
              Speakers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventData.speakers.map((speaker, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start space-x-4">
                    {speaker.photoUrl ? (
                      <img 
                        src={speaker.photoUrl} 
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-500">
                          {speaker.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {speaker.name}
                        <span className={`ml-2 text-xs px-2 py-1 rounded capitalize ${
                          speaker.speakerType === 'keynote' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {speaker.speakerType.replace('-', ' ')}
                        </span>
                      </h4>
                      
                      {speaker.designation && (
                        <p className="text-sm text-gray-600 mb-1">{speaker.designation}</p>
                      )}
                      
                      {speaker.affiliation && (
                        <p className="text-sm text-gray-600 mb-2">{speaker.affiliation}</p>
                      )}
                      
                      {speaker.topicTitle && (
                        <div className="mb-2">
                          <dt className="font-semibold text-gray-900 text-sm">Topic:</dt>
                          <dd className="text-sm text-gray-700">{speaker.topicTitle}</dd>
                        </div>
                      )}
                      
                      {speaker.bio && (
                        <p className="text-sm text-gray-600 mb-2">{speaker.bio}</p>
                      )}
                      
                      {speaker.socialProfiles && Object.values(speaker.socialProfiles).some(url => url) && (
                        <div className="flex space-x-2">
                          {speaker.socialProfiles.linkedin && (
                            <a href={speaker.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              <span className="text-xs">LinkedIn</span>
                            </a>
                          )}
                          {speaker.socialProfiles.twitter && (
                            <a href={speaker.socialProfiles.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              <span className="text-xs">Twitter</span>
                            </a>
                          )}
                          {speaker.socialProfiles.website && (
                            <a href={speaker.socialProfiles.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              <span className="text-xs">Website</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Information */}
      {eventData.attendance && Object.keys(eventData.attendance).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-teal-600" />
              Attendance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {eventData.attendance.expectedAttendees && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {eventData.attendance.expectedAttendees.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Expected</div>
                </div>
              )}
              
              {eventData.attendance.actualAttendees && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {eventData.attendance.actualAttendees.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Actual</div>
                </div>
              )}
              
              {eventData.attendance.attendanceRate && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {eventData.attendance.attendanceRate}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Attendance Rate</div>
                </div>
              )}
              
              {eventData.attendance.averageRating && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 flex items-center justify-center">
                    <Star className="h-5 w-5 mr-1" />
                    {eventData.attendance.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                  {eventData.attendance.feedbackCount && (
                    <div className="text-xs text-gray-500 mt-1">
                      {eventData.attendance.feedbackCount} reviews
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources & Media */}
      {eventData.resources && Object.values(eventData.resources).some(resource => 
        Array.isArray(resource) ? resource.length > 0 : resource
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              Resources & Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Resource Links */}
              <div className="flex flex-wrap gap-3">
                {eventData.resources.eventPosterUrl && (
                  <a
                    href={eventData.resources.eventPosterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Event Poster
                  </a>
                )}
                
                {eventData.resources.brochureUrl && (
                  <a
                    href={eventData.resources.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Brochure
                  </a>
                )}
                
                {eventData.resources.recordingUrl && (
                  <a
                    href={eventData.resources.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Event Recording
                  </a>
                )}
              </div>
              
              {/* Presentations */}
              {eventData.resources.presentationUrls && eventData.resources.presentationUrls.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">Presentations</dt>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eventData.resources.presentationUrls.map((presentation, index) => (
                      <a
                        key={index}
                        href={presentation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900">{presentation.title}</div>
                          {presentation.speaker && (
                            <div className="text-sm text-gray-500">by {presentation.speaker}</div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Documents */}
              {eventData.resources.documentsUrls && eventData.resources.documentsUrls.length > 0 && (
                <div>
                  <dt className="font-semibold text-gray-900 mb-3">Documents</dt>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eventData.resources.documentsUrls.map((document, index) => (
                      <a
                        key={index}
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900">{document.title}</div>
                          {document.description && (
                            <div className="text-sm text-gray-500">{document.description}</div>
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

export default EventDisplay;