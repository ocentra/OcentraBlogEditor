import React, { useState } from 'react';
import styles from '../styles/components/MediaLibrary.module.css';

interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  lastModified: Date;
}

interface MediaLibraryProps {
  assets: Map<string, Blob>;
  onAssetAdd: (name: string, blob: Blob) => void;
  onAssetDelete: (name: string) => void;
  onAssetSelect?: (asset: Asset) => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  assets,
  onAssetAdd,
  onAssetDelete,
  onAssetSelect
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (const file of e.dataTransfer.files) {
        if (file.type.startsWith('image/')) {
          onAssetAdd(file.name, file);
        }
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      for (const file of e.target.files) {
        if (file.type.startsWith('image/')) {
          onAssetAdd(file.name, file);
        }
      }
    }
  };

  const renderAsset = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const size = (blob.size / 1024).toFixed(1) + ' KB';

    return (
      <div key={name} className={styles.asset}>
        <div className={styles.assetPreview}>
          <img src={url} alt={name} />
        </div>
        <div className={styles.assetInfo}>
          <span className={styles.assetName}>{name}</span>
          <span className={styles.assetSize}>{size}</span>
        </div>
        <div className={styles.assetActions}>
          {onAssetSelect && (
            <button 
              onClick={() => onAssetSelect({ 
                id: name, 
                name, 
                type: blob.type, 
                url, 
                size: blob.size, 
                lastModified: new Date() 
              })}
              className={styles.assetButton}
            >
              Insert
            </button>
          )}
          <button 
            onClick={() => onAssetDelete(name)}
            className={`${styles.assetButton} ${styles.deleteButton}`}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.mediaLibrary}>
      <div className={styles.header}>
        <h3>Media Library</h3>
        <label className={styles.uploadButton}>
          Upload
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      <div 
        className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={styles.assets}>
          {Array.from(assets.entries()).map(([name, blob]) => 
            renderAsset(name, blob)
          )}
        </div>
        
        {assets.size === 0 && (
          <div className={styles.emptyState}>
            <p>Drop images here or click Upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary; 