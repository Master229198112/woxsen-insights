// ========================================
// 📁 components/ComprehensiveRichTextEditor.jsx - Feature-Complete Rich Text Editor
// ========================================
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Strike } from '@tiptap/extension-strike';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Focus } from '@tiptap/extension-focus';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List, 
  ListOrdered, 
  ListChecks,
  Quote, 
  Undo, 
  Redo,
  ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Type,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Minus,
  Upload,
  X,
  Globe,
  ExternalLink,
  Plus,
  Columns,
  Rows,
  MoreHorizontal,
  Search,
  Replace,
  Maximize,
  Minimize,
  Copy,
  Eye,
  Download,
  FileText,
  Settings,
  Info,
  Keyboard,
  Save
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useAIImageDetector, AIImageDetectionResults } from './AiImageDetector';

const ComprehensiveRichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  maxCharacters = 50000,
  showCharacterCount = true,
  showWordCount = true,
  autoSave = false,
  onAutoSave = null,
  className = "",
  readOnly = false 
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  
  // Dialog states
  const [imageUploadMethod, setImageUploadMethod] = useState('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  // Loading and error states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [qualityAnalysis, setQualityAnalysis] = useState(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);
  const [analyzingQuality, setAnalyzingQuality] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [lastInsertedImage, setLastInsertedImage] = useState(null);
  
  // Editor refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // AI Detection Hook
  const { analysis, analyze } = useAIImageDetector();
  
  // Color palettes
  const textColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0099FF', '#9900FF',
    '#FF3366', '#FF9933', '#FFFF33', '#33FF33', '#3366FF', '#9933FF',
    '#8B4513', '#2E8B57', '#4682B4', '#9370DB', '#20B2AA', '#F4A460'
  ];
  
  const highlightColors = [
    '#FFFF00', '#00FFFF', '#FF00FF', '#00FF00', '#FF0000', '#0000FF',
    '#FFA500', '#800080', '#008000', '#FF1493', '#00CED1', '#FFB6C1'
  ];
  
  // Font families
  const fontFamilies = [
    { label: 'Default', value: 'inherit' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, sans-serif' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { label: 'Impact', value: 'Impact, sans-serif' }
  ];
  
  // Trusted domains for external images
  const trustedDomains = [
    'res.cloudinary.com', 'lh3.googleusercontent.com', 'drive.google.com', 
    'docs.google.com', 'onedrive.live.com', '1drv.ms', 'dl.dropboxusercontent.com',
    'imgur.com', 'i.imgur.com', 'images.unsplash.com', 'images.pexels.com',
    'raw.githubusercontent.com', 'woxsen.edu.in', 'amazonaws.com', 'blob.core.windows.net'
  ];
  
  // Quality analyzer
  const qualityAnalyzer = {
    analyzeImageQuality: async (file) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const fileSize = file.size;
          
          const resolutionScore = width >= 1200 && height >= 800 ? 90 : 
                                width >= 800 && height >= 600 ? 70 : 
                                width >= 600 && height >= 400 ? 50 : 
                                width >= 400 && height >= 300 ? 30 : 10;
          
          const sizeScore = fileSize > 2 * 1024 * 1024 ? 90 : 
                           fileSize > 1 * 1024 * 1024 ? 70 : 
                           fileSize > 500 * 1024 ? 50 : 
                           fileSize > 200 * 1024 ? 30 : 10;
          
          const overallScore = (resolutionScore + sizeScore) / 2;
          
          let overall = 'excellent';
          if (overallScore < 30) overall = 'very poor';
          else if (overallScore < 50) overall = 'poor';
          else if (overallScore < 70) overall = 'fair';
          else if (overallScore < 85) overall = 'good';
          
          const recommendations = [];
          if (width < 800 || height < 600) {
            recommendations.push('Consider using an image with at least 800x600 resolution');
          }
          if (fileSize < 200 * 1024) {
            recommendations.push('Image file size is small, may indicate heavy compression');
          }
          if (overallScore < 50) {
            recommendations.push('This image may not display well on larger screens');
          }
          if (recommendations.length === 0) {
            recommendations.push('Image quality looks good for web use');
          }
          
          resolve({
            width, height, fileSize, overall, score: overallScore,
            resolution: { score: resolutionScore, quality: resolutionScore >= 70 ? 'good' : resolutionScore >= 50 ? 'fair' : 'poor' },
            blur: { isBlurry: false, quality: 'sharp' },
            recommendations
          });
        };
        img.onerror = () => resolve({ overall: 'unknown', score: 0, recommendations: ['Could not analyze image'], error: true });
        img.src = URL.createObjectURL(file);
      });
    },
    
    meetsMinimumQuality: (analysis) => analysis.score >= 60
  };
  
  // Fix SSR hydration issue
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      
      // Enhanced text formatting
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Underline,
      Subscript,
      Superscript,
      Strike,
      
      // Text alignment
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      
      // Lists
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      
      // Tables
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: { class: 'border-b border-gray-200' },
      }),
      TableHeader.configure({
        HTMLAttributes: { class: 'border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left' },
      }),
      TableCell.configure({
        HTMLAttributes: { class: 'border border-gray-300 px-4 py-2' },
      }),
      
      // Media
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-md my-2' },
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700 cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      
      // Utilities
      HorizontalRule.configure({
        HTMLAttributes: { class: 'my-4 border-t-2 border-gray-200' },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      CharacterCount.configure({
        limit: maxCharacters,
      }),
      Typography,
      Gapcursor,
      HardBreak,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
    ],
    
    content: content || '',
    immediatelyRender: false,
    editable: !readOnly,
    
    onUpdate: ({ editor }) => {
      if (onChange && !readOnly) {
        onChange(editor.getHTML());
      }
    },
    
    editorProps: {
      attributes: {
        class: `prose prose-slate max-w-none focus:outline-none ${isFullscreen ? 'min-h-[calc(100vh-200px)]' : 'min-h-[300px]'}`,
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleFileUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Auto-save functionality (moved after editor creation)
  useEffect(() => {
    if (autoSave && onAutoSave && editor && !editor.isDestroyed) {
      const interval = setInterval(() => {
        onAutoSave(editor.getHTML());
      }, 30000); // Auto-save every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoSave, onAutoSave, editor]);

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [editor, content]);
  
  // Keyboard shortcuts handler
  useEffect(() => {
    if (!editor) return;
    
    const handleKeyDown = (event) => {
      // Custom keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'f':
            event.preventDefault();
            setShowFindReplace(true);
            break;
          case 'F11':
            event.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, isFullscreen]);

  // Image upload functions
  const validateImageUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const isDomainTrusted = trustedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain) || urlObj.hostname.includes(domain)
      );
      
      if (!isDomainTrusted) {
        return { valid: false, error: 'Domain not in trusted list. Please contact admin to add this domain.' };
      }
      
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => urlObj.pathname.toLowerCase().includes(ext));
      const isKnownImageService = ['drive.google.com', 'onedrive.live.com', 'dropbox.com', 'imgur.com']
        .some(service => urlObj.hostname.includes(service));
      
      if (!hasImageExtension && !isKnownImageService) {
        return { valid: false, error: 'URL does not appear to be an image. Please ensure it\'s a direct image link.' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  };

  const handleFileUpload = async (file, forceUpload = false) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }
    
    if (!forceUpload) {
      setAnalyzingQuality(true);
      setUploadError('');
      setPendingFile(file);
      
      try {
        const analysis = await qualityAnalyzer.analyzeImageQuality(file);
        setQualityAnalysis(analysis);
        
        if (!qualityAnalyzer.meetsMinimumQuality(analysis)) {
          setShowQualityWarning(true);
          setAnalyzingQuality(false);
          return;
        }
      } catch (error) {
        console.error('Quality analysis error:', error);
      }
      
      setAnalyzingQuality(false);
    }
    
    setUploading(true);
    setUploadError('');
    setShowQualityWarning(false);

    try {
      const analysisPromise = analyze(file);
      const formData = new FormData();
      formData.append('file', file);

      const [response, analysisResult] = await Promise.all([
        fetch('/api/upload/image', { method: 'POST', body: formData }),
        analysisPromise
      ]);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (editor) {
        editor.chain().focus().setImage({ src: data.url }).run();
        
        setLastInsertedImage({
          url: data.url,
          analysis: analysisResult
        });
        
        setShowImageDialog(false);
        setImageUrl('');
        setQualityAnalysis(null);
        setPendingFile(null);
      }
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      setUploadError('Please enter an image URL');
      return;
    }

    const validation = validateImageUrl(imageUrl.trim());
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const img = new window.Image();
      img.onload = async () => {
        try {
          const fakeFile = new File([], imageUrl.trim(), { type: 'image/jpeg' });
          const analysisResult = await analyze(fakeFile);
          
          if (editor) {
            editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
            
            setLastInsertedImage({
              url: imageUrl.trim(),
              analysis: analysisResult
            });
            
            setShowImageDialog(false);
            setImageUrl('');
          }
          setUploading(false);
        } catch (error) {
          if (editor) {
            editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
            setLastInsertedImage({ url: imageUrl.trim(), analysis: null });
            setShowImageDialog(false);
            setImageUrl('');
          }
          setUploading(false);
        }
      };
      img.onerror = () => {
        setUploadError('Failed to load image from URL. Please check the URL and try again.');
        setUploading(false);
      };
      img.src = imageUrl.trim();
    } catch (error) {
      setUploadError('Error validating image URL');
      setUploading(false);
    }
  };

  // Table functions
  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
      setShowTableDialog(false);
      setTableRows(3);
      setTableCols(3);
    }
  };

  // Link functions
  const setLink = () => {
    if (!linkUrl.trim()) {
      setUploadError('Please enter a URL');
      return;
    }
    
    if (editor) {
      if (linkText.trim()) {
        // If custom text is provided, insert it with the link
        editor.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkText.trim()}</a>`).run();
      } else {
        // Use selected text or URL as link text
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        
        if (selectedText) {
          editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
        } else {
          editor.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkUrl.trim()}</a>`).run();
        }
      }
      
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const unsetLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  // Find and replace functions
  const findNext = () => {
    if (!findText.trim() || !editor) return;
    
    const { doc } = editor.state;
    const text = doc.textContent;
    const currentPos = editor.state.selection.from;
    const index = text.toLowerCase().indexOf(findText.toLowerCase(), currentPos);
    
    if (index !== -1) {
      editor.commands.setTextSelection({ from: index, to: index + findText.length });
    } else {
      // Search from beginning
      const indexFromStart = text.toLowerCase().indexOf(findText.toLowerCase());
      if (indexFromStart !== -1) {
        editor.commands.setTextSelection({ from: indexFromStart, to: indexFromStart + findText.length });
      }
    }
  };

  const replaceNext = () => {
    if (!findText.trim() || !editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    if (selectedText.toLowerCase() === findText.toLowerCase()) {
      editor.chain().focus().deleteSelection().insertContent(replaceText).run();
    }
    
    findNext();
  };

  const replaceAll = () => {
    if (!findText.trim() || !editor) return;
    
    const { doc } = editor.state;
    const text = doc.textContent;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = [...text.matchAll(regex)];
    
    if (matches.length > 0) {
      const content = editor.getHTML().replace(regex, replaceText);
      editor.commands.setContent(content);
    }
  };

  // Export functions
  const exportAsHTML = () => {
    const html = editor.getHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const text = editor.getText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const html = editor.getHTML();
    navigator.clipboard.writeText(html).then(() => {
      console.log('Content copied to clipboard');
    });
  };

  // Utility functions
  const getQualityIcon = (quality) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return '✅';
      case 'fair':
        return '⚠️';
      case 'poor':
      case 'very poor':
        return '❌';
      default:
        return '🔍';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'fair':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'poor':
      case 'very poor':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Don't render until mounted
  if (!isMounted) {
    return (
      <div className="border rounded-md min-h-[300px] p-4 bg-gray-50">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading comprehensive editor...</div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="border rounded-md min-h-[300px] p-4 bg-gray-50">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Initializing editor...</div>
        </div>
      </div>
    );
  }

  const isTableActive = editor.isActive('table');
  const characterCount = editor.storage.characterCount;
  const wordCount = editor.getText().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className={`rich-text-editor relative ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="border rounded-md bg-white">
        {/* Main Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 overflow-x-auto">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('underline') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('strike') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('code') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <select
              value={
                editor.isActive('heading', { level: 1 }) ? 'h1' :
                editor.isActive('heading', { level: 2 }) ? 'h2' :
                editor.isActive('heading', { level: 3 }) ? 'h3' :
                editor.isActive('heading', { level: 4 }) ? 'h4' :
                editor.isActive('heading', { level: 5 }) ? 'h5' :
                editor.isActive('heading', { level: 6 }) ? 'h6' :
                'p'
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'p') {
                  editor.chain().focus().setParagraph().run();
                } else {
                  const level = parseInt(value.slice(1));
                  editor.chain().focus().toggleHeading({ level }).run();
                }
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('taskList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              title="Task List"
            >
              <ListChecks className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Quote and Horizontal Rule */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Color and Highlight */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Text Color"
              >
                <Palette className="h-4 w-4" />
              </Button>
              
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border rounded-lg shadow-lg z-10">
                  <div className="grid grid-cols-6 gap-1 mb-2">
                    {textColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          editor.chain().focus().setColor(color).run();
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setShowColorPicker(false);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>

            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                title="Highlight"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border rounded-lg shadow-lg z-10">
                  <div className="grid grid-cols-6 gap-1 mb-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          editor.chain().focus().setHighlight({ color }).run();
                          setShowHighlightPicker(false);
                        }}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setShowHighlightPicker(false);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Script */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={editor.isActive('subscript') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              title="Subscript"
            >
              <SubscriptIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('superscript') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              title="Superscript"
            >
              <SuperscriptIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Font Family */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFontPicker(!showFontPicker)}
              title="Font Family"
            >
              <Type className="h-4 w-4" />
            </Button>
            
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-white border rounded-lg shadow-lg z-10 w-48">
                <div className="space-y-1">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => {
                        editor.chain().focus().setFontFamily(font.value).run();
                        setShowFontPicker(false);
                      }}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetFontFamily().run();
                      setShowFontPicker(false);
                    }}
                    className="w-full"
                  >
                    Reset Font
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Media */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageDialog(true)}
              title="Insert Image"
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkDialog(true)}
              title="Insert Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTableDialog(true)}
              title="Insert Table"
              className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Table Controls (when in table) */}
          {isTableActive && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  title="Add Column Before"
                >
                  <Plus className="h-3 w-3" />
                  <Columns className="h-3 w-3" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  title="Add Row Before"
                >
                  <Plus className="h-3 w-3" />
                  <Rows className="h-3 w-3" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  title="Delete Column"
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-3 w-3" />
                  <Columns className="h-3 w-3" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title="Delete Row"
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-3 w-3" />
                  <Rows className="h-3 w-3" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  title="Delete Table"
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Utilities */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFindReplace(!showFindReplace)}
              title="Find & Replace (Ctrl+F)"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen (F11)"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* History */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Export Options */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              title="Copy to Clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <div className="relative group">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Export Options"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                <div className="p-2 space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={exportAsHTML}
                    className="w-full justify-start"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    HTML
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={exportAsText}
                    className="w-full justify-start"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Text
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Word and Character Count */}
          {(showWordCount || showCharacterCount) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {showWordCount && (
                <span>
                  {wordCount} word{wordCount !== 1 ? 's' : ''}
                </span>
              )}
              {showWordCount && showCharacterCount && <span>•</span>}
              {showCharacterCount && (
                <span className={characterCount.characters() > maxCharacters ? 'text-red-600' : ''}>
                  {characterCount.characters()}/{maxCharacters} chars
                </span>
              )}
            </div>
          )}
        </div>

        {/* Find & Replace Bar */}
        {showFindReplace && (
          <div className="border-b bg-yellow-50 p-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Find..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-40"
                onKeyDown={(e) => e.key === 'Enter' && findNext()}
              />
              <Input
                placeholder="Replace..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-40"
                onKeyDown={(e) => e.key === 'Enter' && replaceNext()}
              />
              <Button size="sm" onClick={findNext}>
                Find
              </Button>
              <Button size="sm" onClick={replaceNext}>
                Replace
              </Button>
              <Button size="sm" onClick={replaceAll}>
                Replace All
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowFindReplace(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className="relative">
          {/* FloatingMenu and BubbleMenu temporarily disabled for TipTap v3 compatibility */}
          
          <EditorContent 
            editor={editor} 
            className={isFullscreen ? 'min-h-[calc(100vh-200px)]' : ''}
          />
        </div>

        {/* Status Bar */}
        <div className="border-t bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Ready</span>
            {autoSave && (
              <span className="flex items-center gap-1">
                <Save className="h-3 w-3" />
                Auto-save enabled
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFindReplace(!showFindReplace)}
              className="hover:text-gray-700"
              title="Find & Replace"
            >
              <Search className="h-3 w-3" />
            </button>
            <button
              className="hover:text-gray-700"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="h-3 w-3" />
            </button>
            <button
              className="hover:text-gray-700"
              title="Editor Info"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Dialog Modals */}
      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Insert Image
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {showQualityWarning && qualityAnalysis ? (
                <div className={`border-2 rounded-lg p-4 mb-6 ${getQualityColor(qualityAnalysis.overall)}`}>
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="text-2xl">{getQualityIcon(qualityAnalysis.overall)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        Image Quality: {qualityAnalysis.overall.charAt(0).toUpperCase() + qualityAnalysis.overall.slice(1)}
                      </h3>
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-medium">Resolution:</span> {qualityAnalysis.width}×{qualityAnalysis.height}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      {qualityAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowQualityWarning(false);
                        setQualityAnalysis(null);
                        setPendingFile(null);
                      }}
                      className="flex-1"
                    >
                      Choose Different Image
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleFileUpload(pendingFile, true)}
                      disabled={uploading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {uploading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </div>
                      ) : (
                        'Insert Anyway'
                      )}
                    </Button>
                  </div>
                </div>
              ) : analyzingQuality ? (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center mb-6">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Analyzing Image Quality...</p>
                      <p className="text-sm text-gray-600">Checking resolution and compression</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex space-x-2 mb-6">
                    <Button
                      type="button"
                      variant={imageUploadMethod === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadMethod('upload')}
                      className="flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <Button
                      type="button"
                      variant={imageUploadMethod === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadMethod('url')}
                      className="flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Use URL
                    </Button>
                  </div>

                  {imageUploadMethod === 'upload' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">Upload Image</p>
                          <p className="text-sm text-gray-600">Drag and drop an image here, or click to select</p>
                        </div>
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Uploading...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Upload className="h-4 w-4 mr-2" />
                                Choose Image
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">Use Image from URL</p>
                        <p className="text-sm text-gray-600">Enter a direct link to an image from trusted sources</p>
                      </div>
                      <div className="space-y-3">
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full"
                          disabled={uploading}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleUrlSubmit();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleUrlSubmit}
                          disabled={uploading || !imageUrl.trim()}
                          className="w-full"
                        >
                          {uploading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Validating...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Insert Image
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                      <p className="text-red-600 text-sm">{uploadError}</p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                    <p className="text-blue-800 text-sm font-medium mb-2">Tips:</p>
                    <div className="text-blue-700 text-xs space-y-1">
                      <p>• Drag & drop images directly into the editor</p>
                      <p>• Automatic quality check and AI detection</p>
                      <p>• Supported formats: JPG, PNG, WEBP (max 10MB)</p>
                      <p>• Recommended: 800×600px minimum resolution</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Insert Link
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLinkDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setLink();
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Text (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Leave empty to use selected text or URL"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setLink();
                    }
                  }}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
                {editor.isActive('link') && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      unsetLink();
                      setShowLinkDialog(false);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Remove Link
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={setLink}
                  disabled={!linkUrl.trim()}
                >
                  Insert Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TableIcon className="h-5 w-5" />
                  Insert Table
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTableDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rows
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Columns
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Preview:</strong> {tableRows} rows × {tableCols} columns
                    <br />
                    <small>First row will be formatted as headers</small>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTableDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={insertTable}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Insert Table
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Detection Results */}
      {lastInsertedImage && lastInsertedImage.analysis && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Last Inserted Image Analysis
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLastInsertedImage(null)}
              className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <AIImageDetectionResults analysis={lastInsertedImage.analysis} />
        </div>
      )}
    </div>
  );
};

export default ComprehensiveRichTextEditor;