import { BookOpen, Trophy, Lightbulb, Calendar, Eye, Users, FileText, Search, PenTool, Handshake } from 'lucide-react';

const iconMap = {
  research: BookOpen,
  achievements: Trophy,
  publications: Lightbulb,
  events: Calendar,
  patents: Lightbulb,
  'case-studies': Search,
  blogs: PenTool,
  'industry-collaborations': Handshake,
};

const colorMap = {
  blue: 'from-blue-600 to-blue-800',
  yellow: 'from-yellow-600 to-yellow-800',
  green: 'from-green-600 to-green-800',
  purple: 'from-purple-600 to-purple-800',
  pink: 'from-pink-600 to-pink-800',
  indigo: 'from-indigo-600 to-indigo-800',
  emerald: 'from-emerald-600 to-emerald-800',
  cyan: 'from-cyan-600 to-cyan-800',
};

export default function CategoryHeader({ info, stats }) {
  const IconComponent = iconMap[info.title.toLowerCase()] || BookOpen;
  const gradientColor = colorMap[info.color] || colorMap.blue;

  return (
    <section className={`relative bg-gradient-to-r ${gradientColor} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm">
              <IconComponent className="h-10 w-10" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{info.title}</h1>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            {info.longDescription}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <FileText className="h-6 w-6 text-white/80" />
              </div>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <div className="text-sm text-white/80">Posts</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Eye className="h-6 w-6 text-white/80" />
              </div>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-white/80">Views</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 text-white/80" />
              </div>
              <div className="text-2xl font-bold">{stats.totalAuthors}</div>
              <div className="text-sm text-white/80">Authors</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
