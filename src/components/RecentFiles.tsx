import React from 'react';
import styles from '../styles/components/RecentFiles.module.css';
import { RecentFile } from '../services/FileManager';

interface RecentFilesProps {
  files: RecentFile[];
  onFileSelect: (file: RecentFile) => void;
}

const RecentFiles: React.FC<RecentFilesProps> = ({ files, onFileSelect }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <ul className={styles.recentFilesList}>
      {files.map((file, index) => (
        <li key={`${file.path}-${index}`}>
          <button
            className={styles.recentFileButton}
            onClick={() => onFileSelect(file)}
          >
            {file.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default RecentFiles; 