'use client';

import { useState } from 'react';
import Image from 'next/image';
import { NewsletterSubscription } from '@/components/Newsletter';
import { CheckCircle, Calendar, Users, TrendingUp, Award, BookOpen, Lightbulb } from 'lucide-react';

const NewsletterLandingPage = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Latest Research & Publications",
      description: "Stay updated with cutting-edge research papers, academic publications, and scholarly insights from our community."
    },
    {
      icon: Award,
      title: "Community Achievements",
      description: "Celebrate success stories, awards, recognitions, and milestones achieved by faculty and students."
    },
    {
      icon: Calendar,
      title: "Upcoming Events",
      description: "Never miss important conferences, seminars, workshops, and academic events happening at Woxsen."
    },
    {
      icon: Lightbulb,
      title: "Innovation Updates",
      description: "Discover new patents, breakthrough innovations, and technological advances from our research labs."
    },
    {
      icon: Users,
      title: "Expert Insights",
      description: "Read thought leadership articles and expert opinions from industry leaders and academic professionals."
    },
    {
      icon: TrendingUp,
      title: "Industry Trends",
      description: "Stay ahead with the latest trends, market analysis, and industry developments across various sectors."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Professor, Computer Science",
      image: "/images/testimonial-1.jpg",
      quote: "The weekly digest keeps me connected with the latest research and developments across the university. It's an essential read!"
    },
    {
      name: "Prof. Michael Chen",
      role: "Head of Research",
      image: "/images/testimonial-2.jpg",
      quote: "I love how the newsletter highlights our community's achievements. It's inspiring to see the impact we're making together."
    },
    {
      name: "Dr. Priya Sharma",
      role: "Associate Professor",
      image: "/images/testimonial-3.jpg",
      quote: "The event notifications have helped me discover so many valuable conferences and workshops. Highly recommend subscribing!"
    }
  ];

  const stats = [
    { number: "5,000+", label: "Active Subscribers" },
    { number: "200+", label: "Weekly Articles" },
    { number: "50+", label: "Research Papers" },
    { number: "95%", label: "Reader Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              📰 Woxsen Insights
              <span className="block text-2xl md:text-3xl font-normal mt-2 text-blue-100">
                Weekly Newsletter
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Your weekly dose of innovation, research, and academic excellence. 
              Stay connected with the pulse of knowledge and discovery.
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section with Subscription */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join Our Community of Innovators
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get curated content delivered to your inbox every Monday morning. 
              Join thousands of researchers, faculty, and students staying ahead of the curve.
            </p>
          </div>

          {/* Newsletter Subscription Component */}
          <div className="max-w-md mx-auto">
            <NewsletterSubscription 
              source="newsletter-landing"
              showPreferences={true}
              title=""
              description=""
              className="shadow-xl border-2 border-blue-100"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You'll Get Every Week
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our newsletter is carefully curated to bring you the most relevant and 
              impactful content from the world of academics and research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sample Newsletter Preview */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See What Our Newsletter Looks Like
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional design, mobile-friendly, and packed with valuable content.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">📰 WOXSEN INSIGHTS</h3>
              <p className="text-blue-100">Weekly Digest • Nov 4 - Nov 10</p>
            </div>
            
            <div className="p-8">
              {/* Sample Article */}
              <div className="mb-8">
                <div className="bg-gray-200 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Featured Article Image</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Revolutionary AI Research Breakthrough at Woxsen Labs
                </h4>
                <p className="text-gray-600 mb-4">
                  Our research team has developed a groundbreaking machine learning algorithm 
                  that could transform how we approach data analysis in healthcare...
                </p>
                <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
                  READ MORE
                </div>
              </div>

              {/* Sample Stats */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4">This Week's Highlights</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <div className="text-sm text-gray-600">New Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">Research Papers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Achievements</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => window.open('/api/newsletter/preview', '_blank')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              View Full Sample Newsletter
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Subscribers Say
            </h2>
            <p className="text-lg text-gray-600">
              Join the community of satisfied readers who never miss an update.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-gray-600 font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                How often will I receive the newsletter?
              </h3>
              <p className="text-gray-600">
                Our newsletter is sent every Monday morning with a comprehensive digest 
                of the week's most important updates, research, and events.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can I customize what content I receive?
              </h3>
              <p className="text-gray-600">
                Yes! When you subscribe, you can choose your preferences for different 
                types of content including research papers, achievements, events, and more.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Is the newsletter free?
              </h3>
              <p className="text-gray-600">
                Absolutely! Our newsletter is completely free and will always remain so. 
                We believe in making knowledge accessible to everyone.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                How can I unsubscribe?
              </h3>
              <p className="text-gray-600">
                You can unsubscribe at any time by clicking the unsubscribe link in any 
                email you receive from us. No questions asked!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Stay Informed?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of academics, researchers, and innovators who trust 
            Woxsen Insights to keep them updated.
          </p>
          <a 
            href="#subscribe" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-block"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('.email-container').scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Subscribe Now - It's Free! 🚀
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Woxsen Insights</h3>
              <p className="text-gray-400">
                Driving innovation through knowledge sharing and community building.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/" className="text-gray-400 hover:text-white block">Home</a>
                <a href="/blog" className="text-gray-400 hover:text-white block">Blog</a>
                <a href="/research" className="text-gray-400 hover:text-white block">Research</a>
                <a href="/events" className="text-gray-400 hover:text-white block">Events</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <div className="text-gray-400 space-y-2">
                <p>insights@woxsen.edu.in</p>
                <p>Woxsen University</p>
                <p>Hyderabad, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Woxsen University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsletterLandingPage;
