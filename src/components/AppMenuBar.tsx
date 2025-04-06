import React, { useState, useEffect } from 'react';
import styles from '../styles/components/AppMenuBar.module.css';
import RecentFiles from './RecentFiles';
import FileManager, { RecentFile } from '../services/FileManager';
import { BlogPost } from '../types/interfaces';
import { logger } from '../utils/logger';

interface AppMenuBarProps {
  onNewBlog: () => void;
  onOpenBlog: (post: BlogPost) => void;
  onSaveBlog: () => void;
  onSaveAsBlog: () => void;
  onExportBlog: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleSidebar: () => void;
  onTogglePreview: () => void;
  onToggleTheme: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSidebarVisible: boolean;
  isPreviewVisible: boolean;
  isDarkTheme: boolean;
}

export const AppMenuBar: React.FC<AppMenuBarProps> = ({
  onNewBlog,
  onOpenBlog,
  onSaveBlog,
  onSaveAsBlog,
  onExportBlog,
  onUndo,
  onRedo,
  onToggleSidebar,
  onTogglePreview,
  onToggleTheme,
  canUndo,
  canRedo,
  isSidebarVisible,
  isPreviewVisible,
  isDarkTheme,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const fileManager = FileManager.getInstance();

  useEffect(() => {
    setRecentFiles(fileManager.getRecentFiles());
  }, []);

  const handleMenuClick = (menu: string) => {
    logger.info(`Menu ${menu} ${activeMenu === menu ? 'closed' : 'opened'}`);
    if (menu === 'file') {
      setRecentFiles(fileManager.getRecentFiles());
    }
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuBlur = () => {
    logger.debug('Menu blur triggered');
    setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const handleOpenBlog = async () => {
    try {
      logger.info('Opening blog file...');
      const post = await fileManager.openBlog();
      onOpenBlog(post);
      setActiveMenu(null);
      logger.info('Blog file opened successfully');
    } catch (error) {
      logger.error('Error opening blog:', error);
    }
  };

  const handleRecentFileSelect = async (file: RecentFile) => {
    try {
      logger.info(`Opening recent file: ${file.path}`);
      const post = await fileManager.openRecentFile(file);
      onOpenBlog(post);
      setActiveMenu(null);
      logger.info('Recent file opened successfully');
    } catch (error) {
      logger.error('Error opening recent file:', error);
    }
  };

  const handleClearRecent = () => {
    logger.info('Clearing recent files list');
    fileManager.clearRecentFiles();
    setRecentFiles([]);
    setActiveMenu(null);
  };

  return (
    <div className={styles.menuBar} onBlur={handleMenuBlur}>
      <div className={styles.menuItem}>
        <button 
          className={styles.menuButton}
          onClick={() => handleMenuClick('file')}
        >
          File
        </button>
        {activeMenu === 'file' && (
          <div className={styles.menuDropdown}>
            <button onClick={onNewBlog}>New Blog</button>
            <button onClick={handleOpenBlog}>Open...</button>
            <div className={styles.menuDivider} />
            <button onClick={onSaveBlog}>Save</button>
            <button onClick={onSaveAsBlog}>Save As...</button>
            <div className={styles.menuDivider} />
            <button onClick={onExportBlog}>Export...</button>
            {recentFiles.length > 0 && (
              <>
                <div className={styles.menuDivider} />
                <div className={styles.recentFilesMenu}>
                  <div className={styles.menuLabel}>Recent</div>
                  <RecentFiles
                    files={recentFiles}
                    onFileSelect={handleRecentFileSelect}
                  />
                  <div className={styles.menuDivider} />
                  <button onClick={handleClearRecent}>Clear Recent</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.menuItem}>
        <button 
          className={styles.menuButton}
          onClick={() => handleMenuClick('edit')}
        >
          Edit
        </button>
        {activeMenu === 'edit' && (
          <div className={styles.menuDropdown}>
            <button onClick={onUndo} disabled={!canUndo}>Undo</button>
            <button onClick={onRedo} disabled={!canRedo}>Redo</button>
          </div>
        )}
      </div>

      <div className={styles.menuItem}>
        <button 
          className={styles.menuButton}
          onClick={() => handleMenuClick('view')}
        >
          View
        </button>
        {activeMenu === 'view' && (
          <div className={styles.menuDropdown}>
            <button onClick={onToggleSidebar}>
              {isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
            </button>
            <button onClick={onTogglePreview}>
              {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        )}
      </div>

      <div className={styles.menuItem}>
        <button 
          className={styles.menuButton}
          onClick={() => handleMenuClick('settings')}
        >
          Settings
        </button>
        {activeMenu === 'settings' && (
          <div className={styles.menuDropdown}>
            <button onClick={onToggleTheme}>
              {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 