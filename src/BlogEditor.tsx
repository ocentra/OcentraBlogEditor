import './styles/base/index.css';
import styles from './styles/editor/BlogEditor.module.css';
import React, { useState, useRef, useEffect } from 'react';
import { BlogPost, BlogEditorProps } from './types/interfaces';
import Section from './components/Section';
import { EditorSidebar } from './components/EditorSidebar';
import NavigationBar from './components/NavigationBar';
import HeroImage from './components/HeroImage';
import BlogPreview from './components/BlogPreview';
import { AppMenuBar } from './components/AppMenuBar';
import { useConfig } from './context/ConfigContext';
import FileManager from './services/FileManager';
import { Logger } from './utils/logger';

const logger = Logger.getInstance('[BlogEditor]');

export const BlogEditor: React.FC<BlogEditorProps> = ({
  initialPost,
  onSave,
  onPublish,
  onDraft,
  readOnly = false
}) => {
  const { defaultHeroImage, categories = [] } = useConfig();
  const fileManager = FileManager.getInstance();
  
  // Determine the source of the initial post
  const [postSource, setPostSource] = useState<'disk' | 'indexedDB' | 'default' | 'example'>('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  
  const updatePost = (updates: Partial<BlogPost>) => {
    setPost(prev => {
      if (!prev) return null;
      const updatedMetadata = {
        title: prev.metadata.title,
        author: prev.metadata.author,
        category: prev.metadata.category,
        readTime: prev.metadata.readTime,
        featured: prev.metadata.featured,
        status: prev.metadata.status,
        date: prev.metadata.date,
        ...(updates.metadata || {})
      };
      const updatedContent = {
        sections: updates.content?.sections || prev.content.sections,
        featuredImage: updates.content?.featuredImage || prev.content.featuredImage,
        backgroundColor: updates.content?.backgroundColor || prev.content.backgroundColor
      };
      const updatedPost: BlogPost = {
        id: prev.id,
        metadata: updatedMetadata,
        content: updatedContent
      };
      return updatedPost;
    });
  };

  // Initialize only once
  useEffect(() => {
    if (!isInitialized && !post) {
      const loadPost = async () => {
        try {
          // First try initialPost from example app
          if (initialPost) {
            logger.info('Loading example post from props:', {
              title: initialPost.metadata?.title,
              sectionCount: initialPost.content?.sections?.length,
              source: 'example'
            });
            setPostSource('example');
            setPost(initialPost);
          } else {
            // Then try IndexedDB auto-save
            try {
              const autoSavedPost = await fileManager.getAutoSave();
              if (autoSavedPost) {
                logger.info('Loading auto-saved post from IndexedDB:', {
                  title: autoSavedPost.metadata?.title,
                  sectionCount: autoSavedPost.content?.sections?.length,
                  source: 'indexedDB'
                });
                setPostSource('indexedDB');
                setPost(autoSavedPost);
              } else {
                // If all else fails, create a new post
                logger.info('No existing post found, creating new post');
                createNewPost();
              }
            } catch (error) {
              logger.error('Error loading from IndexedDB:', error);
              logger.info('Creating new post after IndexedDB error');
              createNewPost();
            }
          }
        } catch (error) {
          logger.error('Error during initialization:', error);
          logger.info('Creating new post after initialization error');
          createNewPost();
        }
        setIsInitialized(true);
      };

      loadPost();
    }
  }, [initialPost, isInitialized, post]);

  const createNewPost = () => {
    logger.info('BlogEditor: Creating new empty post');
    setPostSource('default');
    const newPost: BlogPost = {
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
    };
    setPost(newPost);
  };

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
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

  // Add a function to get the current post source
  const getPostSource = () => postSource;

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    const autoSave = async () => {
      if (!post) return;
      
      const currentPost: BlogPost = {
        id: post.id,
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

      // Check if there are actual changes
      const lastSavedPost = await fileManager.getAutoSave();
      if (lastSavedPost && JSON.stringify(lastSavedPost) === JSON.stringify(currentPost)) {
        logger.debug('No changes detected, skipping auto-save');
        return;
      }

      try {
        await fileManager.saveToIndexedDB(currentPost);
        logger.info(`Auto-saved "${currentPost.metadata.title}" to IndexedDB`);
        
        // After successful save, try to load from IndexedDB
        const autoSavedPost = await fileManager.getAutoSave();
        if (autoSavedPost) {
          logger.info('Switching to auto-saved version from IndexedDB');
          setPost(autoSavedPost);
          setPostSource('indexedDB');
        }
        
        localStorage.setItem('blogDraft', JSON.stringify(currentPost));
        if (onSave) {
          onSave(currentPost);
        }
      } catch (error) {
        logger.error('Error during auto-save:', error);
      }
    };

    autoSaveTimerRef.current = setInterval(autoSave, 30000);
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [post, heroImage, backgroundColor, onSave]);

  const updateSection = (id: string, content: string) => {
    if (!post) return;
    
    setPost(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content: {
          ...prev.content,
          sections: prev.content.sections.map(section => 
            section.id === id ? { ...section, content } : section
          )
        }
      };
    });
  };

  const updateSectionMeta = (id: string, metadata: Partial<BlogPost['content']['sections'][0]['metadata']>) => {
    if (!post) return;
    
    setPost(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content: {
          ...prev.content,
          sections: prev.content.sections.map(section => 
            section.id === id ? { ...section, metadata: { ...section.metadata, ...metadata } } : section
          )
        }
      };
    });
  };

  const deleteSection = (id: string) => {
    if (!post) return;
    
    setPost(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content: {
          ...prev.content,
          sections: prev.content.sections.filter(section => section.id !== id)
        }
      };
    });
    if (activeSection === id) {
      setActiveSection(null);
    }
  };

  const handleHeroImageChange = (url: string, alt: string, position?: {x: number, y: number}) => {
    // If the URL is a base64 string, ensure it's properly formatted
    if (url.startsWith('data:')) {
      setHeroImage({ url, alt, position: position || { x: 50, y: 50 } });
    } else {
      // For non-base64 URLs, try to download and convert to base64
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setHeroImage({ 
              url: base64, 
              alt, 
              position: position || { x: 50, y: 50 } 
            });
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          logger.error('Error converting image to base64:', error);
          // If conversion fails, keep the original URL
          setHeroImage({ url, alt, position: position || { x: 50, y: 50 } });
        });
    }
  };

  const handleHeroImageAltChange = (alt: string) => {
    setHeroImage(prev => ({ ...prev, alt }));
  };

  const saveDraft = () => {
    if (!post) return;
    
    const currentPost: BlogPost = {
      id: post.id,
      metadata: {
        title: post.metadata.title || 'Untitled',
        author: post.metadata.author || 'Anonymous',
        category: post.metadata.category || 'Uncategorized',
        readTime: post.metadata.readTime || '5 min',
        featured: post.metadata.featured || false,
        status: 'draft',
        date: post.metadata.date || new Date().toISOString(),
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
    if (!post) return;
    
    const publishedPost: BlogPost = {
      id: post.id,
      metadata: {
        title: post.metadata.title || 'Untitled',
        author: post.metadata.author || 'Anonymous',
        category: post.metadata.category || 'Uncategorized',
        readTime: post.metadata.readTime || '5 min',
        featured: post.metadata.featured || false,
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
    logger.info(`Toggling preview mode: ${!isPreviewMode ? 'on' : 'off'}`);
    setIsPreviewMode(prev => !prev);
  };

  const handleSectionReorder = (fromIndex: number, toIndex: number) => {
    if (!post) return;
    
    setPost(prev => {
      if (!prev) return null;
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

  const handleNewBlog = () => {
    logger.info('Creating new blog post');
    setPost({
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
    setHeroImage({
      url: '',
      alt: '',
      position: { x: 50, y: 50 }
    });
    setBackgroundColor('#333333');
    logger.info('New blog post created');
  };

  const handleOpenBlog = async (openedPost?: BlogPost) => {
    try {
      const newPost = openedPost || await fileManager.openBlog();
      if (!newPost || !newPost.id) {
        logger.error('BlogEditor: No valid post loaded from disk');
        return;
      }
      
      logger.info('BlogEditor: Loading new post from disk:', {
        title: newPost.metadata?.title,
        sectionCount: newPost.content?.sections?.length
      });
      setPostSource('disk');
      setPost(newPost);
      setHeroImage({
        url: newPost.content.featuredImage?.url || '',
        alt: newPost.content.featuredImage?.alt || '',
        position: newPost.content.featuredImage?.position || { x: 50, y: 50 }
      });
      setBackgroundColor(newPost.content.backgroundColor || '#333333');
    } catch (error) {
      logger.error('BlogEditor: Error loading post from disk:', error);
    }
  };

  const handleSaveBlog = async () => {
    if (!post) return;
    
    try {
      logger.info('Saving blog post...');
      const currentPost: BlogPost = {
        id: post.id,
        metadata: {
          title: post.metadata.title || 'Untitled',
          author: post.metadata.author || 'Anonymous',
          category: post.metadata.category || 'Uncategorized',
          readTime: post.metadata.readTime || '5 min',
          featured: post.metadata.featured || false,
          status: 'draft',
          date: post.metadata.date || new Date().toISOString(),
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
      await fileManager.saveBlog(currentPost);
      saveDraft();
      logger.info('Blog post saved successfully');
    } catch (error) {
      logger.error('Error saving blog:', error);
    }
  };

  const handleSaveAsBlog = async () => {
    if (!post) return;
    
    try {
      logger.info('Saving blog post as new file...');
      await fileManager.saveBlogAs(post);
      logger.info('Blog post saved as new file successfully');
    } catch (error) {
      logger.error('Error saving blog as new file:', error);
    }
  };

  const handleExportBlog = async () => {
    if (!post) return;
    
    try {
      logger.info('Exporting blog post...');
      await fileManager.exportBlog(post);
      logger.info('Blog post exported successfully');
    } catch (error) {
      logger.error('Error exporting blog:', error);
    }
  };

  const handleUndo = () => {
    // TODO: Implement undo functionality
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
  };

  const handleToggleTheme = () => {
    logger.info(`Toggling theme: ${!isDarkTheme ? 'dark' : 'light'}`);
    setIsDarkTheme(!isDarkTheme);
  };

  // Don't render until post is loaded
  if (!post) {
    return null;
  }

  const navigationItems = [
    {
      name: 'Title',
      type: 'input' as const,
      value: post.metadata.title,
      onChange: (value: string) => updatePost({
        metadata: {
          title: value,
          author: post.metadata.author,
          category: post.metadata.category,
          readTime: post.metadata.readTime,
          featured: post.metadata.featured,
          status: post.metadata.status,
          date: post.metadata.date
        }
      }),
      placeholder: 'Enter title...',
      minWidth: '200px',
    },
    {
      name: 'Author',
      type: 'input' as const,
      value: post.metadata.author,
      onChange: (value: string) => updatePost({
        metadata: {
          title: post.metadata.title,
          author: value,
          category: post.metadata.category,
          readTime: post.metadata.readTime,
          featured: post.metadata.featured,
          status: post.metadata.status,
          date: post.metadata.date
        }
      }),
      placeholder: 'Author name...',
      minWidth: '150px',
    },
    {
      name: 'Read Time',
      type: 'input' as const,
      value: post.metadata.readTime,
      onChange: (value: string) => updatePost({
        metadata: {
          title: post.metadata.title,
          author: post.metadata.author,
          category: post.metadata.category,
          readTime: value,
          featured: post.metadata.featured,
          status: post.metadata.status,
          date: post.metadata.date
        }
      }),
      placeholder: 'Read time...',
      minWidth: '100px',
    },
    {
      name: 'Featured',
      type: 'checkbox' as const,
      value: post.metadata.featured ? 'true' : 'false',
      onChange: (value: string) => updatePost({
        metadata: {
          title: post.metadata.title,
          author: post.metadata.author,
          category: post.metadata.category,
          readTime: post.metadata.readTime,
          featured: value === 'true',
          status: post.metadata.status,
          date: post.metadata.date
        }
      }),
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
    <div className={styles.blogEditor}>
      <AppMenuBar
        onNewBlog={handleNewBlog}
        onOpenBlog={handleOpenBlog}
        onSaveBlog={handleSaveBlog}
        onSaveAsBlog={handleSaveAsBlog}
        onExportBlog={handleExportBlog}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        onToggleTheme={handleToggleTheme}
        canUndo={canUndo}
        canRedo={canRedo}
        isSidebarVisible={!sidebarCollapsed}
        isPreviewVisible={isPreviewMode}
        isDarkTheme={isDarkTheme}
      />
      {isPreviewMode ? (
        <BlogPreview 
          post={{
            ...post,
            content: {
              ...post.content,
              featuredImage: heroImage.url ? {
                url: heroImage.url,
                alt: heroImage.alt,
                position: heroImage.position
              } : undefined,
              backgroundColor
            }
          }}
          backgroundColor={backgroundColor}
          onClose={togglePreview}
          containerClassName={styles.previewFullscreen}
        />
      ) : (
        <div className={styles.editorContainer}>
          <NavigationBar
            items={navigationItems}
            height={40}
            showArrows={true}
            variant="form"
            itemGap={4}
            itemMargin={2}
            itemPadding="4px 10px"
            selectedCategory={post.metadata.category}
            onCategoryChange={(category) => setPost(prev => {
              if (!prev) return null;
              return {
                ...prev,
                metadata: { ...prev.metadata, category }
              };
            })}
          />
          <div className={styles.editorMain}>
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
                setPost(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    content: {
                      ...prev.content,
                      sections: [...prev.content.sections, newSection]
                    }
                  };
                });
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

            <div 
              className={styles.editorContent} 
              ref={editorContentRef} 
              style={{ backgroundColor }}
            >
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
                    readOnly={readOnly}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 