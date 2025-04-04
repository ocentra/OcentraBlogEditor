import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { icons as defaultIcons } from '../assets';

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

  const styles = {
    container: {
      position: 'relative' as const,
      width: '100%',
      height: '400px',
      backgroundColor: 'transparent',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px',
      border: isActive ? '2px solid #007bff' : '1px solid rgba(255, 255, 255, 0.1)',
    },
    wrapper: {
      position: 'relative' as const,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    zoomContainer: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      transition: 'transform 0.2s ease',
      backgroundColor: 'transparent',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      transition: 'object-position 0.2s ease',
      backgroundColor: 'transparent',
    },
    toolbar: {
      position: 'absolute' as const,
      bottom: '16px',
      left: '16px',
      right: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '8px',
      borderRadius: '4px',
      opacity: isHovered ? 1 : 0,
      transition: 'opacity 0.2s ease',
    },
    zoomControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    zoomButton: {
      background: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.2s ease',
    },
    zoomButtonHover: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    zoomButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    zoomValue: {
      color: 'white',
      fontSize: '14px',
      minWidth: '40px',
      textAlign: 'center' as const,
    },
    placeholder: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(2, 6, 23, 0.1)',
      border: '2px dashed rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
    },
    placeholderContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '12px',
    },
    placeholderIcon: {
      width: '48px',
      height: '48px',
      opacity: 0.7,
    },
    placeholderSubtitle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '14px',
      marginTop: '8px',
    },
    addButton: {
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
    },
    addButtonHover: {
      backgroundColor: '#0056b3',
    },
    altEdit: {
      position: 'absolute' as const,
      bottom: '-40px',
      left: 0,
      right: 0,
      padding: '8px',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    altInput: {
      width: '100%',
      padding: '4px 8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
    },
    altInputFocus: {
      outline: 'none',
      borderColor: '#007bff',
    },
  };

  return (
    <div 
      style={styles.container}
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
        style={styles.wrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onWheel={handleWheel}
      >
        {imageUrl && !imageError && !isImageLoading ? (
          <>
            <div
              style={{
                ...styles.zoomContainer,
                transform: `scale(${imageZoom / 100})`,
                transformOrigin: 'center center'
              }}
            >
              <img
                src={imageUrl}
                alt={alt}
                style={{
                  ...styles.image,
                  objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
            </div>
            {!readOnly && (
              <div style={styles.toolbar}>
                <div style={styles.zoomControls}>
                  <button
                    style={{
                      ...styles.zoomButton,
                      ...(imageZoom <= 50 ? styles.zoomButtonDisabled : {})
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom(-5);
                    }}
                    disabled={imageZoom <= 50}
                  >
                    -
                  </button>
                  <span style={styles.zoomValue}>
                    {imageZoom}%
                  </span>
                  <button
                    style={{
                      ...styles.zoomButton,
                      ...(imageZoom >= 200 ? styles.zoomButtonDisabled : {})
                    }}
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
                  style={styles.zoomButton}
                  onClick={handleEditAltClick}
                >
                  Edit Alt Text
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={styles.placeholder}>
            <div style={styles.placeholderContent}>
              <img src={icons.camera} alt="" style={styles.placeholderIcon} />
              <button 
                style={styles.addButton}
                onClick={handleReplaceClick}
              >
                Add Cover Image
              </button>
              <span style={styles.placeholderSubtitle}>
                Recommended size: 1200x600px
              </span>
            </div>
          </div>
        )}
      </div>
      {isEditingAlt && (
        <div style={styles.altEdit}>
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
            style={styles.altInput}
          />
        </div>
      )}
    </div>
  );
};

export default HeroImage; 