'use client';
import ResearchDisplay from './ResearchDisplay';
import PatentDisplay from './PatentDisplay';
import AchievementDisplay from './AchievementDisplay';
import EventDisplay from './EventDisplay';
import RegularBlogDisplay from './RegularBlogDisplay';

const CategoryBasedDisplay = ({ blog }) => {
  const { category } = blog;
  
  // Route to appropriate display component based on category
  switch (category) {
    case 'research':
      return <ResearchDisplay blog={blog} />;
      
    case 'patents':
      return <PatentDisplay blog={blog} />;
      
    case 'achievements':
      return <AchievementDisplay blog={blog} />;
      
    case 'events':
      return <EventDisplay blog={blog} />;
      
    case 'blogs':
    case 'case-studies':
    case 'industry-collaborations':
    default:
      return <RegularBlogDisplay blog={blog} />;
  }
};

export default CategoryBasedDisplay;