'use client';
import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Linkedin, 
  Copy,
  Check
} from 'lucide-react';

const ShareButtons = ({ url, title, description }) => {
  const [copied, setCopied] = useState(false);
  const [actualUrl, setActualUrl] = useState(url);

  useEffect(() => {
    // Fix URL construction issues on client side
    if (typeof window !== 'undefined') {
      // If URL looks wrong (contains vercel.app or double slashes), fix it
      if (url.includes('vercel.app') || url.includes('//blog/')) {
        const currentOrigin = window.location.origin;
        const pathMatch = url.match(/\/blog\/(.+)$/);
        
        if (pathMatch) {
          const correctedUrl = `${currentOrigin}/blog/${pathMatch[1]}`;
          console.log('ShareButtons: Fixed URL from', url, 'to', correctedUrl);
          setActualUrl(correctedUrl);
        }
      } else {
        setActualUrl(url);
      }
    }
  }, [url]);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description}\n\n${actualUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(actualUrl)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(actualUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">Share:</span>
      
      <a 
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
      >
        <MessageCircle className="h-4 w-4" />
        <span>WhatsApp</span>
      </a>
      
      <a 
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        onClick={() => console.log('LinkedIn share URL:', shareLinks.linkedin)}
      >
        <Linkedin className="h-4 w-4" />
        <span>LinkedIn</span>
      </a>
      
      <button
        onClick={copyToClipboard}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
};

export default ShareButtons;
