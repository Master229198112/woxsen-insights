'use client';
import Link from 'next/link';

const AuthorLink = ({ 
  author, 
  className = '',
  showDepartment = false,
  children 
}) => {
  // Handle both populated author objects and simple references
  const authorId = author._id || author;
  const authorName = author.name || author;
  const authorDepartment = author.department;
  const authorUsername = author.username;
  
  // Determine the URL slug to use
  let authorSlug;
  if (typeof author === 'object' && author.getUrlSlug) {
    // If we have the full user object with methods
    authorSlug = author.getUrlSlug();
  } else if (authorUsername) {
    // If we have username, use it
    authorSlug = authorUsername;
  } else if (typeof authorName === 'string') {
    // Generate slug from name as fallback
    authorSlug = authorName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30)
      .replace(/^-+|-+$/g, '');
  } else {
    // Ultimate fallback to ID
    authorSlug = authorId;
  }

  return (
    <Link 
      href={`/author/${authorSlug}`}
      className={`hover:text-blue-600 transition-colors cursor-pointer ${className}`}
    >
      {children || (
        <>
          <span className="font-medium">{authorName}</span>
          {showDepartment && authorDepartment && (
            <span className="text-gray-500"> • {authorDepartment}</span>
          )}
        </>
      )}
    </Link>
  );
};

export default AuthorLink;
