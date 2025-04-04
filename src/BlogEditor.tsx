import './styles/index.css';
import './styles/BlogEditor.css';
import React, { useState, useRef, useEffect } from 'react';
import { BlogPost, BlogEditorProps } from './types/interfaces';
import Section from './components/Section';
import { EditorSidebar } from './components/EditorSidebar';
import NavigationBar from './components/NavigationBar';
import HeroImage from './components/HeroImage';
import { useConfig } from './context/ConfigContext';

export const BlogEditor: React.FC<BlogEditorProps> = ({
  initialPost,
  onSave,
  onPublish,
  onDraft,
  readOnly = false,
  previewMode = false,
  previewBackground = '#ffffff'
}) => {
  const { defaultHeroImage, categories = [] } = useConfig();
  const [post, setPost] = useState<BlogPost>(initialPost || {
    id: crypto.randomUUID(),
    metadata: {
      title: '',
      author: '',
      date: new Date().toISOString(),
      category: '',
      readTime: '',
      featured: false,
      status: 'draft'
    },
    content: {
      sections: []
    }
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    initialPost?.content.backgroundColor || '#333333'
  );
  const [heroImage, setHeroImage] = useState<{
    url: string;
    alt: string;
    position?: { x: number; y: number };
  }>({
    url: initialPost?.content?.featuredImage?.url || '',
    alt: initialPost?.content?.featuredImage?.alt || '',
    position: initialPost?.content?.featuredImage?.position || { x: 50, y: 50 }
  });
  const editorContentRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Load saved draft on mount
    const savedDraft = localStorage.getItem('blogDraft');
    if (savedDraft && !initialPost) {
      try {
        const draft = JSON.parse(savedDraft);
        setPost(draft);
        setBackgroundColor(draft.content.backgroundColor || '#333333');
        setHeroImage({
          url: draft.content.featuredImage?.url || '',
          alt: draft.content.featuredImage?.alt || 'Blog hero image',
          position: draft.content.featuredImage?.position || { x: 50, y: 50 }
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [initialPost]);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    const autoSave = () => {
      const currentPost: BlogPost = {
        ...post,
        content: {
          ...post.content,
          featuredImage: heroImage.url ? {
            url: heroImage.url,
            alt: heroImage.alt,
            position: heroImage.position
          } : undefined,
          backgroundColor: backgroundColor
        },
        metadata: {
          ...post.metadata,
          status: 'draft'
        }
      };
      localStorage.setItem('blogDraft', JSON.stringify(currentPost));
      console.log('Auto-saved at:', new Date().toLocaleTimeString());
    };

    autoSaveTimerRef.current = setInterval(autoSave, 30000);
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [post, heroImage, backgroundColor]);

  const updateSection = (id: string, content: string) => {
    setPost(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map(section => 
          section.id === id ? { ...section, content } : section
        )
      }
    }));
  };

  const updateSectionMeta = (id: string, metadata: Partial<BlogPost['content']['sections'][0]['metadata']>) => {
    setPost(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map(section => 
          section.id === id ? { ...section, metadata: { ...section.metadata, ...metadata } } : section
        )
      }
    }));
  };

  const deleteSection = (id: string) => {
    setPost(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.filter(section => section.id !== id)
      }
    }));
    if (activeSection === id) {
      setActiveSection(null);
    }
  };

  const handleHeroImageChange = (url: string, alt: string, position?: {x: number, y: number}) => {
    setHeroImage({ url, alt, position: position || { x: 50, y: 50 } });
  };

  const handleHeroImageAltChange = (alt: string) => {
    setHeroImage(prev => ({ ...prev, alt }));
  };

  const saveDraft = () => {
    const currentPost: BlogPost = {
      id: post.id || crypto.randomUUID(),
      metadata: {
        title: post.metadata?.title || 'Untitled',
        author: post.metadata?.author || 'Anonymous',
        category: post.metadata?.category || 'Uncategorized',
        readTime: post.metadata?.readTime || '5 min',
        featured: post.metadata?.featured || false,
        status: 'draft',
        date: post.metadata?.date || new Date().toISOString(),
      },
      content: {
        sections: post.content.sections,
        featuredImage: heroImage.url ? {
          url: heroImage.url,
          alt: heroImage.alt,
          position: heroImage.position
        } : undefined,
        backgroundColor: backgroundColor
      }
    };
    localStorage.setItem('blogDraft', JSON.stringify(currentPost));
    if (onDraft) onDraft(currentPost);
  };

  const publish = () => {
    const publishedPost: BlogPost = {
      id: post.id || crypto.randomUUID(),
      metadata: {
        title: post.metadata?.title || 'Untitled',
        author: post.metadata?.author || 'Anonymous',
        category: post.metadata?.category || 'Uncategorized',
        readTime: post.metadata?.readTime || '5 min',
        featured: post.metadata?.featured || false,
        status: 'published',
        date: new Date().toISOString(),
      },
      content: {
        sections: post.content.sections,
        featuredImage: heroImage.url ? {
          url: heroImage.url,
          alt: heroImage.alt,
          position: heroImage.position
        } : undefined,
        backgroundColor: backgroundColor
      }
    };
    if (onPublish) onPublish(publishedPost);
  };

  const togglePreview = () => {
    setIsPreviewMode(prev => !prev);
  };

  const scrollToHeroImage = () => {
    if (editorContentRef.current) {
      editorContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleSectionReorder = (fromIndex: number, toIndex: number) => {
    setPost(prev => {
      const newSections = [...prev.content.sections];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      return {
        ...prev,
        content: {
          ...prev.content,
          sections: newSections
        }
      };
    });
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      // Scroll to top for hero image
      if (editorContentRef.current) {
        editorContentRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      return;
    }

    const sectionElement = sectionRefs.current[sectionId];
    if (sectionElement && editorContentRef.current) {
      const editorContent = editorContentRef.current;
      const sectionRect = sectionElement.getBoundingClientRect();
      const editorRect = editorContent.getBoundingClientRect();
      
      // Calculate the scroll position to center the section
      const scrollTop = sectionElement.offsetTop - (editorRect.height / 2) + (sectionRect.height / 2);
      
      editorContent.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    scrollToSection(sectionId);
  };

  const navigationItems = [
    {
      name: 'Title',
      type: 'input' as const,
      value: post.metadata?.title || '',
      onChange: (value: string) => setPost(prev => ({
        ...prev,
        metadata: { ...prev.metadata, title: value }
      })),
      placeholder: 'Enter title...',
      minWidth: '200px',
    },
    {
      name: 'Category',
      type: 'select' as const,
      value: post.metadata?.category || '',
      onChange: (value: string) => setPost(prev => ({
        ...prev,
        metadata: { ...prev.metadata, category: value }
      })),
      options: categories,
      placeholder: categories.length > 0 ? 'Select category...' : 'No categories available',
      minWidth: '150px',
      disabled: categories.length === 0,
    },
    {
      name: 'Author',
      type: 'input' as const,
      value: post.metadata?.author || '',
      onChange: (value: string) => setPost(prev => ({
        ...prev,
        metadata: { ...prev.metadata, author: value }
      })),
      placeholder: 'Author name...',
      minWidth: '150px',
    },
    {
      name: 'Read Time',
      type: 'input' as const,
      value: post.metadata?.readTime || '',
      onChange: (value: string) => setPost(prev => ({
        ...prev,
        metadata: { ...prev.metadata, readTime: value }
      })),
      placeholder: 'Read time...',
      minWidth: '100px',
    },
    {
      name: 'Featured',
      type: 'checkbox' as const,
      value: post.metadata?.featured ? 'true' : 'false',
      onChange: (value: string) => setPost(prev => ({
        ...prev,
        metadata: { ...prev.metadata, featured: value === 'true' }
      })),
    },
    {
      name: 'Background',
      type: 'color' as const,
      value: backgroundColor,
      onChange: (value: string) => setBackgroundColor(value),
      minWidth: '100px',
    },
    {
      name: 'Preview',
      type: 'button' as const,
      onClick: togglePreview,
      value: isPreviewMode ? 'Edit' : 'Preview',
    },
    {
      name: 'Save Draft',
      type: 'button' as const,
      onClick: saveDraft,
      value: 'Save Draft',
    },
    {
      name: 'Publish',
      type: 'button' as const,
      onClick: publish,
      value: 'Publish',
      style: {
        backgroundColor: 'rgba(74, 158, 255, 0.2)',
        borderColor: 'rgba(74, 158, 255, 0.5)',
      },
    }
  ];

  return (
    <div className="blog-editor" style={{ backgroundColor }}>
      <div className="editor-container">
        <NavigationBar
          items={navigationItems}
          height={40}
          showArrows={true}
          variant="form"
          itemGap={4}
          itemMargin={2}
          itemPadding="4px 10px"
          selectedCategory={post.metadata.category}
          onCategoryChange={(category) => setPost(prev => ({
            ...prev,
            metadata: { ...prev.metadata, category }
          }))}
        />
        <div className="editor-main">
          <EditorSidebar
            sections={post.content.sections}
            activeSection={activeSection}
            onSectionSelect={handleSectionSelect}
            onSectionDelete={deleteSection}
            onSectionAdd={(title) => {
              const newSection = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'text' as const,
                content: '',
                metadata: {
                  title: title
                }
              };
              setPost(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  sections: [...prev.content.sections, newSection]
                }
              }));
              setActiveSection(newSection.id);
            }}
            onSectionReorder={handleSectionReorder}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            hasHeroImage={heroImage.url !== '' && heroImage.url !== defaultHeroImage}
            onTitleChange={(sectionId, newTitle) => {
              updateSectionMeta(sectionId, { title: newTitle });
            }}
          />

          <div className="editor-content" ref={editorContentRef}>
            {isPreviewMode ? (
              <div className="preview-container">
                <div className="preview-mode">
                  <div className="preview-header">
                    <button 
                      className="preview-close-button"
                      onClick={togglePreview}
                      aria-label="Exit preview"
                    >
                      ✕
                    </button>
                  </div>
                  <article className="blog-preview">
                    <meta property="og:title" content={post.metadata?.title || 'Untitled'} />
                    <meta property="og:description" content={post.content.sections[0]?.content || ''} />
                    {heroImage.url && (
                      <meta property="og:image" content={heroImage.url} />
                    )}
                    <meta property="og:type" content="article" />
                    <meta property="og:url" content={window.location.href} />
                    
                    <div className="hero-image-container">
                      {heroImage.url ? (
                        <div className="hero-image-wrapper">
                          <img 
                            src={heroImage.url} 
                            alt={heroImage.alt} 
                            className="hero-image"
                            style={{
                              objectPosition: `${heroImage.position?.x || 50}% ${heroImage.position?.y || 50}%`
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
                              className="preview-text-content"
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
                  </article>
                </div>
              </div>
            ) : (
              <>
                <div ref={el => sectionRefs.current['hero'] = el}>
                  <HeroImage
                    imageUrl={heroImage.url}
                    alt={heroImage.alt}
                    position={heroImage.position}
                    onImageChange={handleHeroImageChange}
                    onAltChange={handleHeroImageAltChange}
                    isActive={activeSection === 'hero'}
                    onSelect={() => handleSectionSelect('hero')}
                  />
                </div>
                {post.content.sections.map((section) => (
                  <div
                    key={section.id}
                    ref={el => sectionRefs.current[section.id] = el}
                  >
                    <Section
                      type={section.type}
                      content={section.content}
                      metadata={section.metadata}
                      isActive={activeSection === section.id}
                      onSelect={() => handleSectionSelect(section.id)}
                      onDelete={() => deleteSection(section.id)}
                      onUpdate={(content) => updateSection(section.id, content)}
                      onTypeChange={(type) => updateSectionMeta(section.id, { language: type })}
                      onTitleChange={(title) => updateSectionMeta(section.id, { title })}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 