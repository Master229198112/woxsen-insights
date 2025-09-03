'use client';

const BlogContent = ({ content }) => {
  return (
    <div 
      className="prose prose-lg max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
        prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800 hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-ul:mb-4 prose-ol:mb-4
        prose-li:text-gray-700 prose-li:mb-1
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
        prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4
        prose-blockquote:not-italic prose-blockquote:text-gray-700
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default BlogContent;
