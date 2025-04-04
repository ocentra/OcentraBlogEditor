import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { BlogSection } from '../types/index';

const styles = {
  editorSidebar: {
    width: '300px',
    position: 'relative' as const,
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '16px',
    overflow: 'hidden',
    background: 'rgba(2, 6, 23, 0.1)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgb(51, 122, 183)',
    height: '100%',
  },
  editorSidebarCollapsed: {
    width: '40px',
  },
  sidebarContent: {
    height: '100%',
    overflowY: 'auto' as const,
    padding: '20px',
    paddingTop: '52px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    opacity: 1,
    transition: 'opacity 0.2s',
    position: 'relative' as const,
    zIndex: 1,
  },
  sidebarContentCollapsed: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
  sidebarToggle: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    width: '100%',
    height: '32px',
    background: 'rgba(2, 6, 23, 0.3)',
    border: 'none',
    borderRadius: '16px 16px 0 0',
    color: 'var(--editor-text)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.2s ease',
  },
  sidebarToggleCollapsed: {
    width: '40px',
    borderRadius: 0,
    borderLeft: 'none',
  },
  sidebarToggleHover: {
    background: 'rgba(2, 6, 23, 0.4)',
  },
  visuallyHidden: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: 0,
  },
  documentTree: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  documentTreeTitle: {
    color: 'var(--editor-text)',
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
  },
  heroImageBtn: {
    width: '100%',
    padding: '8px',
    background: 'rgba(2, 6, 23, 0.3)',
    border: 'none',
    borderRadius: '4px',
    color: 'var(--editor-text)',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  heroImageBtnHover: {
    background: 'rgba(2, 6, 23, 0.4)',
  },
  heroImageBtnHasImage: {
    background: 'rgba(0, 123, 255, 0.15)',
    color: 'var(--editor-accent)',
  },
  sectionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  documentSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none' as const,
    background: 'rgba(2, 6, 23, 0.3)',
    '&:hover .delete-section-btn': {
      opacity: 1,
    },
  },
  documentSectionHover: {
    background: 'rgba(2, 6, 23, 0.4)',
  },
  documentSectionActive: {
    background: 'rgba(2, 6, 23, 0.5)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  documentSectionDragOver: {
    borderColor: 'var(--editor-accent)',
  },
  dragHandle: {
    color: 'var(--editor-text)',
    cursor: 'grab',
    fontSize: '16px',
    lineHeight: 1,
    userSelect: 'none' as const,
  },
  dragHandleGrabbing: {
    cursor: 'grabbing',
  },
  sectionTitle: {
    flex: 1,
    fontSize: '14px',
    color: 'var(--editor-text)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis' as const,
  },
  deleteSectionBtn: {
    padding: '4px',
    background: 'transparent',
    border: 'none',
    color: 'var(--editor-text)',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    borderRadius: '4px',
    opacity: 0,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: 'var(--editor-accent)',
    },
  },
  editSectionBtn: {
    padding: '4px',
    background: 'transparent',
    border: 'none',
    color: 'var(--editor-text)',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    borderRadius: '4px',
    opacity: 0,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: 'var(--editor-accent)',
    },
  },
  sectionTitleContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
  },
  sectionTitleInput: {
    flex: 1,
    background: 'transparent',
    border: '1px solid var(--editor-accent)',
    color: 'var(--editor-text)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: 0,
  },
  addSectionContainer: {
    marginTop: '8px',
  },
  addSectionBtn: {
    width: '100%',
    padding: '8px',
    background: 'rgba(2, 6, 23, 0.3)',
    border: 'none',
    borderRadius: '4px',
    color: 'var(--editor-text)',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  addSectionBtnHover: {
    background: 'rgba(2, 6, 23, 0.4)',
  },
  newSectionForm: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 20, 40, 0.8)',
    borderRadius: '4px',
    padding: '4px',
    gap: '4px',
  },
  newSectionInput: {
    flex: 1,
    padding: '8px',
    background: 'transparent',
    border: 'none',
    color: 'var(--editor-text)',
    fontSize: '14px',
  },
  newSectionBtn: {
    padding: '6px',
    minWidth: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(22, 163, 74)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  newSectionBtnHover: {
    backgroundColor: 'rgb(34, 197, 94)',
  },
  newSectionBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed' as const,
  },
  emptySections: {
    textAlign: 'center' as const,
    padding: '32px 20px',
    borderRadius: '8px',
    background: 'rgba(2, 6, 23, 0.3)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  emptySectionsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    fontSize: '13px',
    letterSpacing: '0.3px',
  },
  addFirstSectionBtn: {
    padding: '10px 20px',
    background: 'rgba(0, 123, 255, 0.15)',
    border: 'none',
    borderRadius: '4px',
    color: 'var(--editor-accent)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  addFirstSectionBtnHover: {
    background: 'rgba(0, 123, 255, 0.25)',
  },
};

interface EditorSidebarProps {
  sections: BlogSection[];
  activeSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionAdd: (title: string) => void;
  onSectionReorder: (fromIndex: number, toIndex: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasHeroImage: boolean;
  onTitleChange: (sectionId: string, newTitle: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  sections,
  activeSection,
  onSectionSelect,
  onSectionDelete,
  onSectionAdd,
  onSectionReorder,
  isCollapsed,
  onToggleCollapse,
  hasHeroImage,
  onTitleChange,
}) => {
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<number | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const newSectionInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const handleDragStart = (index: number) => {
    setDraggedSection(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSection === null || draggedSection === index) return;
    setDragOverSection(index);
  };

  const handleDragEnd = () => {
    if (draggedSection !== null && dragOverSection !== null && draggedSection !== dragOverSection) {
      onSectionReorder(draggedSection, dragOverSection);
    }
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>, index: number) => {
    const currentSection = sections[index];
    if (!currentSection) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          onSectionSelect(sections[index - 1].id);
          sectionRefs.current[index - 1]?.focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index < sections.length - 1) {
          onSectionSelect(sections[index + 1].id);
          sectionRefs.current[index + 1]?.focus();
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onSectionDelete(currentSection.id);
        }
        break;
      case 'Enter':
        if (!isAddingSection) {
          e.preventDefault();
          setIsAddingSection(true);
          setTimeout(() => newSectionInputRef.current?.focus(), 0);
        }
        break;
    }
  }, [sections, onSectionSelect, onSectionDelete, isAddingSection]);

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      onSectionAdd(newSectionTitle.trim());
      setNewSectionTitle('');
      setIsAddingSection(false);
    }
  };

  const handleAddSectionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSection();
    } else if (e.key === 'Escape') {
      setIsAddingSection(false);
      setNewSectionTitle('');
    }
  };

  const handleTitleEdit = (sectionId: string, currentTitle: string) => {
    setEditingTitle(sectionId);
    setEditedTitle(currentTitle);
    onSectionSelect(sectionId);
  };

  const handleTitleSave = (sectionId: string) => {
    if (editedTitle.trim()) {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        onTitleChange(sectionId, editedTitle.trim());
      }
    }
    setEditingTitle(null);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>, sectionId: string) => {
    if (e.key === 'Enter') {
      handleTitleSave(sectionId);
    } else if (e.key === 'Escape') {
      setEditingTitle(null);
    }
  };

  return (
    <div 
      style={{
        ...styles.editorSidebar,
        ...(isCollapsed ? styles.editorSidebarCollapsed : {})
      }}
      role="complementary"
      aria-label="Document sections"
    >
      <button 
        style={{
          ...styles.sidebarToggle,
          ...(isCollapsed ? styles.sidebarToggleCollapsed : {})
        }}
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        aria-expanded={!isCollapsed}
      >
        <span style={styles.visuallyHidden}>
          {isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        </span>
      </button>
      
      <div style={{
        ...styles.sidebarContent,
        ...(isCollapsed ? styles.sidebarContentCollapsed : {})
      }}>
        <div style={styles.documentTree} role="tree">
          <h3 style={styles.documentTreeTitle}>Document Sections</h3>
          
          <div style={styles.sectionsList} role="group" aria-label="Document sections">
            {/* Hero Image Section */}
            <div
              style={{
                ...styles.documentSection,
                ...(activeSection === 'hero' ? styles.documentSectionActive : {})
              }}
              onClick={() => onSectionSelect('hero')}
              onDoubleClick={() => onSectionSelect('hero')}
              tabIndex={0}
              role="treeitem"
              aria-selected={activeSection === 'hero'}
            >
              <span style={styles.dragHandle} aria-hidden="true">⋮⋮</span>
              <div style={styles.sectionTitleContainer}>
                <span style={styles.sectionTitle}>
                  {hasHeroImage ? 'Hero Image' : 'Add Hero Image'}
                </span>
              </div>
            </div>

            {/* Regular Sections */}
            {sections.map((section, index) => (
              <div
                ref={el => sectionRefs.current[index] = el}
                key={section.id}
                style={{
                  ...styles.documentSection,
                  ...(activeSection === section.id ? styles.documentSectionActive : {}),
                  ...(dragOverSection === index ? styles.documentSectionDragOver : {})
                }}
                onClick={() => onSectionSelect(section.id)}
                onDoubleClick={() => handleTitleEdit(section.id, section.metadata?.title || 'Untitled Section')}
                onKeyDown={(e) => handleKeyDown(e, index)}
                draggable={editingTitle !== section.id}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                tabIndex={0}
                role="treeitem"
                aria-selected={activeSection === section.id}
              >
                <span 
                  style={{
                    ...styles.dragHandle,
                    cursor: editingTitle === section.id ? 'default' : 'grab'
                  }} 
                  aria-hidden="true"
                >
                  ⋮⋮
                </span>
                <div style={styles.sectionTitleContainer}>
                  {editingTitle === section.id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={(e) => handleTitleKeyDown(e, section.id)}
                      onBlur={() => handleTitleSave(section.id)}
                      style={styles.sectionTitleInput}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span style={styles.sectionTitle}>
                        {section.metadata?.title || 'Untitled Section'}
                      </span>
                      <button 
                        style={{
                          ...styles.editSectionBtn,
                          opacity: activeSection === section.id ? 1 : 0
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTitleEdit(section.id, section.metadata?.title || 'Untitled Section');
                        }}
                        title="Edit section title"
                      >
                        <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                <button 
                  style={{
                    ...styles.deleteSectionBtn,
                    opacity: activeSection === section.id ? 1 : 0
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSectionDelete(section.id);
                  }}
                  aria-label={`Delete section: ${section.metadata?.title || 'Untitled Section'}`}
                >
                  <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div style={styles.addSectionContainer}>
            {isAddingSection ? (
              <div style={styles.newSectionForm}>
                <input
                  ref={newSectionInputRef}
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={handleAddSectionKeyDown}
                  placeholder="New section title..."
                  style={styles.newSectionInput}
                  aria-label="New section title"
                />
                <button
                  style={{
                    ...styles.newSectionBtn,
                    ...(!newSectionTitle.trim() ? styles.newSectionBtnDisabled : {})
                  }}
                  onClick={handleAddSection}
                  disabled={!newSectionTitle.trim()}
                  aria-label="Add section"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                style={styles.addSectionBtn}
                onClick={() => setIsAddingSection(true)}
                aria-label="Add new section"
              >
                <span>+</span> Add Section
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 