import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types/interfaces';
import styles from '../styles/components/BlogPreview.module.css';

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

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const handleExportHTML = () => {
    const htmlContent = generateStandaloneHTML(post, backgroundColor, textColor, linkColor);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.metadata?.title || 'blog-post'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${post.id}" width="100%" height="100%" frameborder="0" style="border: none; width: 100%; height: 100vh;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  const handleOpenInNewWindow = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      const htmlContent = generateStandaloneHTML(post, backgroundColor, textColor, linkColor);
      previewWindow.document.write(htmlContent);
    }
  };

  const isFullscreen = containerClassName === styles.previewFullscreen;

  return (
    <div className={`${styles.previewContainer} ${containerClassName} ${isVisible ? styles.previewVisible : styles.previewHidden}`}>
      {showControls && (
        <div className={styles.previewHeader}>
          <div className={styles.previewControls}>
            <button 
              className={styles.previewControlButton} 
              onClick={handleExportHTML}
              title="Export as HTML"
              style={{ color: textColor }}
            >
              <span className={styles.buttonIcon}>💾</span> Export
            </button>
            <button 
              className={styles.previewControlButton} 
              onClick={handleCopyEmbedCode}
              title="Copy embed code"
              style={{ color: textColor }}
            >
              <span className={styles.buttonIcon}>📋</span> Embed
            </button>
            <button 
              className={styles.previewControlButton} 
              onClick={handleOpenInNewWindow}
              title="Open in new window"
              style={{ color: textColor }}
            >
              <span className={styles.buttonIcon}>↗️</span> New Window
            </button>
            {onClose && (
              <button 
                className={styles.previewCloseButton}
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

      <div className={styles.previewMode} style={{ backgroundColor }}>
        <article className={styles.blogPreview} style={{ color: textColor }}>
          <div className={styles.heroImageContainer}>
            {post.content.featuredImage?.url ? (
              <div className={styles.heroImageWrapper}>
                <img 
                  src={post.content.featuredImage.url} 
                  alt={post.content.featuredImage.alt} 
                  className={styles.heroImage}
                  style={{
                    objectPosition: `${post.content.featuredImage.position?.x || 50}% ${post.content.featuredImage.position?.y || 50}%`
                  }}
                />
              </div>
            ) : (
              <div className={styles.heroImagePlaceholder} />
            )}
          </div>

          <div className={styles.blogPreviewHeader}>
            <h1 className={styles.blogPreviewTitle}>{post.metadata?.title || 'Untitled'}</h1>
            <div className={styles.blogPreviewMeta}>
              <span className={styles.blogPreviewCategory}>{post.metadata?.category || 'Uncategorized'}</span>
              <span className={styles.separator}>|</span>
              <span className={styles.blogPreviewAuthor}>{post.metadata?.author || 'Anonymous'}</span>
              <span className={styles.separator}>|</span>
              <span className={styles.blogPreviewReadTime}>{post.metadata?.readTime || '5 min read'}</span>
              <span className={styles.separator}>|</span>
              <span className={styles.blogPreviewDate}>{new Date(post.metadata?.date || new Date()).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={styles.blogPreviewContent}>
            {post.content.sections.map(section => (
              <div key={section.id} className={styles.previewSection}>
                {section.type === 'text' && (
                  <div 
                    className={styles.previewTextContent}
                    dangerouslySetInnerHTML={{ __html: section.content }} 
                  />
                )}
                {section.type === 'code' && (
                  <pre className={styles.previewCodeBlock}>
                    <code>{section.content}</code>
                  </pre>
                )}
                {section.type === 'quote' && (
                  <blockquote className={styles.previewQuote}>
                    {section.content}
                  </blockquote>
                )}
                {section.type === 'image' && section.metadata?.image && (
                  <figure className={styles.previewImageContainer}>
                    <img 
                      src={section.metadata.image.url} 
                      alt={section.metadata.image.alt} 
                      className={styles.previewImage}
                    />
                    {section.metadata.image.caption && (
                      <figcaption className={styles.previewImageCaption}>
                        {section.metadata.image.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};

// Helper function to generate standalone HTML
const generateStandaloneHTML = (post: BlogPost, backgroundColor: string, textColor: string, linkColor: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metadata?.title || 'Blog Post'}</title>
  <meta property="og:title" content="${post.metadata?.title || 'Untitled'}">
  <meta property="og:description" content="${post.content.sections[0]?.content || ''}">
  ${post.content.featuredImage?.url ? `<meta property="og:image" content="${post.content.featuredImage.url}">` : ''}
  <meta property="og:type" content="article">
  <style>
    :root {
      --background-color: ${backgroundColor};
      --text-color: ${textColor};
      --link-color: ${linkColor};
      --accent-color: #4a9eff;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-sans);
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--background-color);
      min-height: 100vh;
    }

    .hero-image {
      width: 100%;
      height: 50vh;
      min-height: 400px;
      max-height: 600px;
      object-fit: cover;
      margin-bottom: 2rem;
    }

    .blog-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .blog-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .blog-title {
      font-size: 3rem;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .blog-meta {
      display: flex;
      justify-content: center;
      gap: 1rem;
      font-size: 1rem;
      opacity: 0.8;
    }

    .separator {
      opacity: 0.5;
    }

    .section {
      margin-bottom: 2rem;
    }

    pre {
      background: #2a2a2a;
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 2rem 0;
      font-family: var(--font-mono);
      font-size: 1rem;
    }

    blockquote {
      border-left: 4px solid var(--accent-color);
      padding-left: 2rem;
      margin: 2rem 0;
      font-style: italic;
      font-size: 1.4rem;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    figure {
      margin: 2rem 0;
    }

    figcaption {
      text-align: center;
      margin-top: 1rem;
      font-size: 1rem;
      opacity: 0.8;
      font-style: italic;
    }

    a {
      color: var(--link-color);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${post.content.featuredImage?.url ? 
    `<img src="${post.content.featuredImage.url}" 
         alt="${post.content.featuredImage.alt || ''}" 
         class="hero-image"
         style="object-position: ${post.content.featuredImage.position?.x || 50}% ${post.content.featuredImage.position?.y || 50}%">` : ''}
  
  <div class="blog-content">
    <header class="blog-header">
      <h1 class="blog-title">${post.metadata?.title || 'Untitled'}</h1>
      <div class="blog-meta">
        <span>${post.metadata?.category || 'Uncategorized'}</span>
        <span class="separator">|</span>
        <span>${post.metadata?.author || 'Anonymous'}</span>
        <span class="separator">|</span>
        <span>${post.metadata?.readTime || '5 min read'}</span>
        <span class="separator">|</span>
        <span>${new Date(post.metadata?.date || new Date()).toLocaleDateString()}</span>
      </div>
    </header>

    <main>
      ${post.content.sections.map(section => {
        if (section.type === 'text') {
          return `<div class="section">${section.content}</div>`;
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
    </main>
  </div>
</body>
</html>`;
};

export default BlogPreview; 