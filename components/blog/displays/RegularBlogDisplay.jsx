'use client';
import BlogContent from '../BlogContent';
import { Card } from '@/components/ui/card';

const RegularBlogDisplay = ({ blog }) => {
  if (!blog.content) {
    return <div className="text-gray-500 p-8">Content not available</div>;
  }

  return (
    <div className="space-y-8">
      {/* Blog Content */}
      <Card className="shadow-sm">
        <div className="p-8">
          <BlogContent content={blog.content} />
        </div>
      </Card>
    </div>
  );
};

export default RegularBlogDisplay;