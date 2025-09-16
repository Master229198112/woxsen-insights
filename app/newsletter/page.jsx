'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { NewsletterSubscription } from '@/components/Newsletter';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Lightbulb,
  Mail,
  Eye,
  ArrowRight,
  PenTool,
  FileText,
  Search,
  Handshake
} from 'lucide-react';

const NewsletterLandingPage = () => {
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    weeklyContent: 0,
    recentNewsletters: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch real newsletter stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/newsletter?action=stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalSubscribers: data.stats.active || 0,
            weeklyContent: Object.values(data.weeklyContent || {}).reduce((a, b) => a + b, 0) || 0,
            recentNewsletters: data.stats.total || 0
          });
        } else {
          // For new website, show real zero stats
          setStats({
            totalSubscribers: 0,
            weeklyContent: 0,
            recentNewsletters: 0
          });
        }
      } catch (error) {
        console.error('Error fetching newsletter stats:', error);
        // For new website, show real zero stats
        setStats({
          totalSubscribers: 0,
          weeklyContent: 0,
          recentNewsletters: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Research & Publications",
      description: "Latest research papers, academic studies, and scholarly insights from our faculty and students.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Award,
      title: "Achievements & Recognition",
      description: "Celebrate success stories, awards, grants, and milestones achieved by our community.",
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      icon: Calendar,
      title: "Upcoming Events",
      description: "Never miss conferences, seminars, workshops, and academic events at Woxsen University.",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: Lightbulb,
      title: "Patents & Innovation",
      description: "Discover breakthrough innovations, patents, and technological advances from our labs.",
      color: "bg-pink-50 text-pink-600"
    },
    {
      icon: PenTool,
      title: "Thought Leadership",
      description: "Expert insights, opinion pieces, and industry analysis from our academic leaders.",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: Handshake,
      title: "Industry Collaborations",
      description: "Strategic partnerships, joint initiatives, and industry connections that drive innovation.",
      color: "bg-cyan-50 text-cyan-600"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Professor, Computer Science",
      department: "School of Technology",
      quote: "The weekly digest keeps me connected with all the amazing work happening across our university. It's my go-to source for staying updated!"
    },
    {
      name: "Prof. Michael Chen",
      role: "Head of Research",
      department: "School of Business",
      quote: "I love how the newsletter highlights our community's achievements. It's inspiring to see the impact we're making together."
    },
    {
      name: "Dr. Priya Sharma",
      role: "Associate Professor",
      department: "School of Liberal Arts",
      quote: "The event notifications have helped me discover valuable conferences and workshops. The content is always relevant and well-curated."
    }
  ];

  const displayStats = [
    { 
      number: loading ? "..." : stats.totalSubscribers, 
      label: "Active Subscribers",
      icon: Users,
      color: "text-blue-600"
    },
    { 
      number: loading ? "..." : stats.weeklyContent, 
      label: "Content Items",
      icon: FileText,
      color: "text-green-600"
    },
    { 
      number: loading ? "..." : stats.recentNewsletters, 
      label: "Newsletters Sent",
      icon: Mail,
      color: "text-purple-600"
    },
    { 
      number: "100%", 
      label: "Free Forever",
      icon: CheckCircle,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Woxsen University
              <span className="block text-2xl md:text-3xl font-normal mt-2 text-blue-100">
                Insights Newsletter
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Your weekly connection to innovation, research, and academic excellence. 
              Stay informed with the pulse of knowledge and discovery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#subscribe">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Mail className="h-5 w-5 mr-2" />
                  Subscribe Now - Free!
                </Button>
              </a>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => window.open('/api/newsletter/preview', '_blank')}
              >
                <Eye className="h-5 w-5 mr-2" />
                View Sample Newsletter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {displayStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
          {stats.totalSubscribers === 0 && !loading && (
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">We're just getting started! Be among the first to subscribe.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscription Section */}
      <section id="subscribe" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join Our Community of Innovators
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get curated content delivered to your inbox every Monday morning. 
              Be the first to know about research breakthroughs, achievements, and academic excellence.
            </p>
          </div>

          {/* Newsletter Subscription Component */}
          <div className="max-w-md mx-auto">
            <NewsletterSubscription 
              source="newsletter-landing"
              showPreferences={true}
              title=""
              description=""
              className="shadow-xl border-2 border-blue-100 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You'll Get Every Week
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our newsletter is carefully curated to bring you the most relevant and 
              impactful content from across Woxsen University.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${feature.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 ml-4">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Preview */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Design, Packed with Value
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Mobile-friendly design with easy-to-read content that respects your time.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">📰 WOXSEN INSIGHTS</h3>
              <p className="text-blue-100">Weekly Digest • Coming Soon</p>
            </div>
            
            <div className="p-8">
              {/* Sample Article */}
              <div className="mb-8">
                <div className="bg-gray-200 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Featured Content Preview</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Weekly Highlights from Woxsen University
                </h4>
                <p className="text-gray-600 mb-4">
                  Stay updated with the latest research, achievements, events, and innovations 
                  from our vibrant academic community. Each newsletter brings you curated content...
                </p>
                <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
                  READ FULL ARTICLE
                </div>
              </div>

              {/* Sample Stats */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">This Week's Highlights</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{loading ? "..." : stats.weeklyContent || "Soon"}</div>
                    <div className="text-sm text-gray-600">New Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">Coming</div>
                    <div className="text-sm text-gray-600">Research Papers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">Soon</div>
                    <div className="text-sm text-gray-600">Achievements</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">Weekly</div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={() => window.open('/api/newsletter/preview', '_blank')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Eye className="h-5 w-5 mr-2" />
              View Full Sample Newsletter
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-gray-600">
              Join the community that never misses an update from Woxsen University.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
                      <span className="text-blue-600 font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.department}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How often will I receive the newsletter?",
                answer: "Our newsletter is sent every Monday morning with a comprehensive digest of the week's most important updates, research, and events from Woxsen University."
              },
              {
                question: "Can I customize what content I receive?",
                answer: "Yes! When you subscribe, you can choose your preferences for different types of content including research papers, achievements, events, patents, and more."
              },
              {
                question: "Is the newsletter free?",
                answer: "Absolutely! Our newsletter is completely free and will always remain so. We believe in making knowledge accessible to everyone in our community."
              },
              {
                question: "How can I unsubscribe?",
                answer: "You can unsubscribe at any time by clicking the unsubscribe link in any email you receive from us. No questions asked!"
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Stay Informed?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be among the first to receive insights from Woxsen University. 
            Join our community and never miss important updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#subscribe">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Mail className="h-5 w-5 mr-2" />
                Subscribe Now - It's Free!
              </Button>
            </a>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <ArrowRight className="h-5 w-5 mr-2" />
                Join Our Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsletterLandingPage;