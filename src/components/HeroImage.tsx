import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { icons as defaultIcons } from '../assets';
import styles from '../styles/components/HeroImage.module.css';

interface HeroImageProps {
  imageUrl: string;
  alt: string;
  position?: { x: number; y: number };
  zoom?: number;
  onImageChange: (url: string, alt: string, position?: { x: number; y: number }, zoom?: number) => void;
  onAltChange: (alt: string) => void;
  isActive: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

const HeroImage: React.FC<HeroImageProps> = ({
  imageUrl,
  alt,
  position = { x: 50, y: 50 },
  zoom = 100,
  onImageChange,
  onAltChange,
  isActive,
  onSelect,
  readOnly = false,
}) => {
  const { icons = defaultIcons } = useConfig();
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [tempAlt, setTempAlt] = useState(alt);
  const [imagePosition, setImagePosition] = useState(position);
  const [imageZoom, setImageZoom] = useState(zoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState(position);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStart, setZoomStart] = useState(0);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    setTempAlt(alt);
  }, [alt]);

  useEffect(() => {
    setImagePosition(position);
    setStartPosition(position);
  }, [position]);

  useEffect(() => {
    if (imageUrl) {
      setIsImageLoading(true);
      setImageError(false);
      const img = new Image();
      img.onload = () => {
        setIsImageLoading(false);
        setImageError(false);
      };
      img.onerror = () => {
        setIsImageLoading(false);
        setImageError(true);
      };
      img.src = imageUrl;
    } else {
      setIsImageLoading(false);
      setImageError(false);
    }
  }, [imageUrl]);

  const calculateNewPosition = (clientX: number, clientY: number): { x: number, y: number } => {
    if (!imageWrapperRef.current) return imagePosition;

    const rect = imageWrapperRef.current.getBoundingClientRect();
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    const newX = Math.max(0, Math.min(100, startPosition.x + (deltaX / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, startPosition.y + (deltaY / rect.height) * 100));

    return { x: newX, y: newY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl || readOnly || isEditingAlt) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition({ ...imagePosition });
    imageWrapperRef.current?.focus();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || readOnly) return;
    const newPos = calculateNewPosition(e.clientX, e.clientY);
    setImagePosition(newPos);
  }, [isDragging, readOnly, dragStart, startPosition, imageWrapperRef.current]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || readOnly) return;
    setIsDragging(false);
    onImageChange(imageUrl, tempAlt, imagePosition, imageZoom);
  }, [isDragging, readOnly, imageUrl, tempAlt, imagePosition, imageZoom, onImageChange]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageUrl || readOnly || isEditingAlt || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setStartPosition({ ...imagePosition });
    imageWrapperRef.current?.focus();
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || readOnly || e.touches.length !== 1) return;
    const newPos = calculateNewPosition(e.touches[0].clientX, e.touches[0].clientY);
    setImagePosition(newPos);
  }, [isDragging, readOnly, dragStart, startPosition, imageWrapperRef.current]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || readOnly) return;
    setIsDragging(false);
    onImageChange(imageUrl, tempAlt, imagePosition, imageZoom);
  }, [isDragging, readOnly, imageUrl, tempAlt, imagePosition, imageZoom, onImageChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleReplaceClick = () => {
    if (fileInputRef.current && !readOnly) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result as string, file.name, { x: 50, y: 50 }, imageZoom);
          setTempAlt(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleEditAltClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setIsEditingAlt(true);
    setTempAlt(alt);
  };

  const handleSaveAltClick = (e: React.MouseEvent | null) => {
    if (e) {
      e.stopPropagation();
    }
    if (readOnly) return;
    onAltChange(tempAlt);
    setIsEditingAlt(false);
  };

  const handleCancelAltClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setTempAlt(alt);
    setIsEditingAlt(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!imageUrl || readOnly || isEditingAlt) return;

    const step = e.shiftKey ? 5 : 1;
    let moved = false;
    let newX = imagePosition.x;
    let newY = imagePosition.y;

    switch (e.key) {
      case 'ArrowUp': newY = Math.max(0, imagePosition.y - step); moved = true; break;
      case 'ArrowDown': newY = Math.min(100, imagePosition.y + step); moved = true; break;
      case 'ArrowLeft': newX = Math.max(0, imagePosition.x - step); moved = true; break;
      case 'ArrowRight': newX = Math.min(100, imagePosition.x + step); moved = true; break;
      default: return;
    }

    if (moved) {
      e.preventDefault();
      const newPos = { x: newX, y: newY };
      setImagePosition(newPos);
      onImageChange(imageUrl, tempAlt, newPos, imageZoom);
    }
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(50, Math.min(200, imageZoom + delta));
    setImageZoom(newZoom);
    onImageChange(imageUrl, tempAlt, imagePosition, newZoom);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageUrl || readOnly || isEditingAlt) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    handleZoom(delta);
  };

  const handleZoomStart = (e: React.MouseEvent) => {
    if (!imageUrl || readOnly || isEditingAlt) return;
    e.preventDefault();
    setIsZooming(true);
    setZoomStart(e.clientY);
  };

  const handleZoomMove = (e: MouseEvent) => {
    if (!isZooming || readOnly) return;
    const delta = (e.clientY - zoomStart) / 10;
    handleZoom(-delta);
    setZoomStart(e.clientY);
  };

  const handleZoomEnd = () => {
    setIsZooming(false);
  };

  useEffect(() => {
    if (isZooming) {
      document.addEventListener('mousemove', handleZoomMove);
      document.addEventListener('mouseup', handleZoomEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleZoomMove);
      document.removeEventListener('mouseup', handleZoomEnd);
    };
  }, [isZooming]);

  const hasValidImage = imageUrl && !imageError && !isImageLoading;
  const showToolbar = (isActive || isHovered) && !readOnly && !isEditingAlt && hasValidImage;
  const showPlaceholder = !hasValidImage && !readOnly;

  return (
    <div 
      className={`${styles.container} ${isActive ? styles.containerActive : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div
        ref={imageWrapperRef}
        className={styles.wrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onWheel={handleWheel}
      >
        {imageUrl && !imageError && !isImageLoading ? (
          <>
            <div
              className={styles.zoomContainer}
              style={{
                transform: `scale(${imageZoom / 100})`,
                transformOrigin: 'center center'
              }}
            >
              <img
                src={imageUrl}
                alt={alt}
                className={styles.image}
                style={{
                  objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
            </div>
            {!readOnly && (
              <div className={`${styles.toolbar} ${showToolbar ? styles.toolbarVisible : ''}`}>
                <div className={styles.zoomControls}>
                  <button
                    className={`${styles.zoomButton} ${imageZoom <= 50 ? styles.zoomButtonDisabled : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom(-5);
                    }}
                    disabled={imageZoom <= 50}
                  >
                    -
                  </button>
                  <span className={styles.zoomValue}>
                    {imageZoom}%
                  </span>
                  <button
                    className={`${styles.zoomButton} ${imageZoom >= 200 ? styles.zoomButtonDisabled : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom(5);
                    }}
                    disabled={imageZoom >= 200}
                  >
                    +
                  </button>
                </div>
                <button
                  className={styles.zoomButton}
                  onClick={handleEditAltClick}
                >
                  Edit Alt Text
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderContent}>
              <img src={icons.camera} alt="" className={styles.placeholderIcon} />
              <button 
                className={styles.addButton}
                onClick={handleReplaceClick}
              >
                Add Cover Image
              </button>
              <span className={styles.placeholderSubtitle}>
                Recommended size: 1200x600px
              </span>
            </div>
          </div>
        )}
      </div>
      {isEditingAlt && (
        <div className={styles.altEdit}>
          <input
            type="text"
            value={tempAlt}
            onChange={(e) => setTempAlt(e.target.value)}
            placeholder="Enter image description"
            autoFocus
            onBlur={() => handleSaveAltClick(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveAltClick(e as any);
              } else if (e.key === 'Escape') {
                handleCancelAltClick(e as any);
              }
            }}
            className={styles.altInput}
          />
        </div>
      )}
    </div>
  );
};

export default HeroImage; 