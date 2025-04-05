import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types/interfaces';
import '../styles/components/BlogPreview.css';

interface BlogPreviewProps {
  post: BlogPost;
  backgroundColor: string;
  containerClassName?: string;
  onClose?: () => void;
  showControls?: boolean;
}

// Get contrasting text color for background
const getContrastingTextColor = (hexColor: string) => {
  // Remove the # if it exists
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const BlogPreview: React.FC<BlogPreviewProps> = ({
  post,
  backgroundColor,
  containerClassName = 'preview-container',
  onClose,
  showControls = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const textColor = getContrastingTextColor(backgroundColor);
  const linkColor = textColor === '#ffffff' ? '#4a9eff' : '#0066cc';

  // Animation effect when component mounts
  useEffect(() => {
    // Small delay to trigger the animation after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Delay the actual closing to allow for animation
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleExportHTML = () => {
    // Create an HTML document with the blog content
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metadata?.title || 'Untitled Blog Post'}</title>
  <meta property="og:title" content="${post.metadata?.title || 'Untitled'}">
  <meta property="og:description" content="${post.content.sections[0]?.content || ''}">
  ${post.content.featuredImage?.url ? `<meta property="og:image" content="${post.content.featuredImage.url}">` : ''}
  <meta property="og:type" content="article">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      line-height: 1.6;
      color: ${textColor};
      background-color: ${backgroundColor};
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    a { color: ${linkColor}; }
    img { max-width: 100%; height: auto; }
    pre { background: #2a2a2a; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    blockquote { 
      border-left: 4px solid #4a9eff; 
      padding-left: 1rem; 
      margin: 1.5rem 0; 
      font-style: italic; 
    }
    .hero-image { 
      width: 100%; 
      max-height: 400px; 
      object-fit: cover; 
      border-radius: 8px; 
      margin-bottom: 2rem; 
    }
    .blog-title { 
      font-size: 2.5rem; 
      margin-bottom: 0.5rem; 
    }
    .blog-meta { 
      margin-bottom: 2rem; 
      opacity: 0.8; 
      font-size: 0.9rem; 
    }
  </style>
</head>
<body>
  ${post.content.featuredImage?.url ? 
    `<img src="${post.content.featuredImage.url}" alt="${post.content.featuredImage.alt || ''}" class="hero-image">` : ''}
  
  <h1 class="blog-title">${post.metadata?.title || 'Untitled'}</h1>
  
  <div class="blog-meta">
    ${post.metadata?.category ? `<span>${post.metadata.category}</span> | ` : ''}
    <span>${post.metadata?.author || 'Anonymous'}</span> | 
    <span>${post.metadata?.readTime || '5 min read'}</span> | 
    <span>${new Date(post.metadata?.date || new Date()).toLocaleDateString()}</span>
  </div>

  <div class="blog-content">
    ${post.content.sections.map(section => {
      if (section.type === 'text') {
        return section.content;
      } else if (section.type === 'code') {
        return `<pre><code>${section.content}</code></pre>`;
      } else if (section.type === 'quote') {
        return `<blockquote>${section.content}</blockquote>`;
      } else if (section.type === 'image' && section.metadata?.image) {
        return `
          <figure>
            <img src="${section.metadata.image.url}" alt="${section.metadata.image.alt || ''}">
            ${section.metadata.image.caption ? `<figcaption>${section.metadata.image.caption}</figcaption>` : ''}
          </figure>
        `;
      }
      return '';
    }).join('\n')}
  </div>
</body>
</html>`;

    // Create a blob and download link
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.metadata?.title || 'blog-post'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmbedCode = () => {
    // Create iframe embed code
    const embedCode = `<iframe src="${window.location.origin}/embed/${post.id}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  const isFullscreen = containerClassName === 'blog-preview-fullscreen';

  return (
    <div className={`${containerClassName} ${isVisible ? 'preview-visible' : 'preview-hidden'}`}>
      <div className="preview-mode" style={{ backgroundColor }}>
        {/* Preview Controls */}
        {showControls && (
          <div className="preview-header">
            <div className="preview-controls">
              <button 
                className="preview-control-button" 
                onClick={handleExportHTML}
                title="Export as HTML"
                style={{ color: textColor }}
              >
                <span className="button-icon">💾</span> Export
              </button>
              <button 
                className="preview-control-button" 
                onClick={handleCopyEmbedCode}
                title="Copy embed code"
                style={{ color: textColor }}
              >
                <span className="button-icon">📋</span> Embed
              </button>
              {onClose && (
                <button 
                  className="preview-close-button"
                  onClick={handleClose}
                  aria-label="Exit preview"
                  style={{ color: textColor }}
                >
                  {isFullscreen ? 'Back to Editor' : '✕'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Blog Preview Content */}
        <article className="blog-preview" style={{ color: textColor }}>
          <meta property="og:title" content={post.metadata?.title || 'Untitled'} />
          <meta property="og:description" content={post.content.sections[0]?.content || ''} />
          {post.content.featuredImage?.url && (
            <meta property="og:image" content={post.content.featuredImage.url} />
          )}
          <meta property="og:type" content="article" />
          
          <div className="hero-image-container">
            {post.content.featuredImage?.url ? (
              <div className="hero-image-wrapper">
                <img 
                  src={post.content.featuredImage.url} 
                  alt={post.content.featuredImage.alt} 
                  className="hero-image"
                  style={{
                    objectPosition: `${post.content.featuredImage.position?.x || 50}% ${post.content.featuredImage.position?.y || 50}%`
                  }}
                />
              </div>
            ) : (
              <div className="hero-image-placeholder" />
            )}
          </div>

          <div className="blog-preview-header">
            <h1 className="blog-preview-title">{post.metadata?.title || 'Untitled'}</h1>
            <div className="blog-preview-meta">
              <span className="blog-preview-category">{post.metadata?.category || 'Uncategorized'}</span>
              <span className="separator">|</span>
              <span className="blog-preview-author">{post.metadata?.author || 'Anonymous'}</span>
              <span className="separator">|</span>
              <span className="blog-preview-read-time">{post.metadata?.readTime || '5 min read'}</span>
              <span className="separator">|</span>
              <span className="blog-preview-date">{new Date(post.metadata?.date || new Date()).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="blog-preview-content">
            {post.content.sections.map(section => (
              <div key={section.id} className="preview-section">
                {section.type === 'text' && (
                  <div 
                    className="preview-text-content rich-text-preview"
                    dangerouslySetInnerHTML={{ __html: section.content }} 
                  />
                )}
                {section.type === 'code' && (
                  <pre className="preview-code-block">
                    <code>{section.content}</code>
                  </pre>
                )}
                {section.type === 'quote' && (
                  <blockquote className="preview-quote">
                    {section.content}
                  </blockquote>
                )}
                {section.type === 'image' && section.metadata?.image && (
                  <figure className="preview-image-container">
                    <img 
                      src={section.metadata.image.url} 
                      alt={section.metadata.image.alt} 
                      className="preview-image"
                    />
                    {section.metadata.image.caption && (
                      <figcaption className="preview-image-caption">
                        {section.metadata.image.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </div>
          
          {/* Add the link color for the rich-text-preview links */}
          <style>{`
            .rich-text-preview a { color: ${linkColor}; }
          `}</style>
        </article>
      </div>
    </div>
  );
};

export default BlogPreview; 