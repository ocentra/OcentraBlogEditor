import React, { useState, useRef, useEffect, useCallback } from 'react';
import './HeroImage.css';
import { useConfig } from '../context/ConfigContext';
import { icons as defaultIcons } from '../assets';

interface HeroImageProps {
  imageUrl: string;
  alt: string;
  position?: { x: number; y: number };
  onImageChange: (url: string, alt: string, position?: { x: number; y: number }) => void;
  onAltChange: (alt: string) => void;
  isActive: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

const HeroImage: React.FC<HeroImageProps> = ({
  imageUrl,
  alt,
  position = { x: 50, y: 50 },
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState(position);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempAlt(alt);
  }, [alt]);

  useEffect(() => {
    setImagePosition(position);
    setStartPosition(position);
  }, [position]);

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
    onImageChange(imageUrl, tempAlt, imagePosition);
  }, [isDragging, readOnly, imageUrl, tempAlt, imagePosition, onImageChange]);

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
    onImageChange(imageUrl, tempAlt, imagePosition);
  }, [isDragging, readOnly, imageUrl, tempAlt, imagePosition, onImageChange]);

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
          onImageChange(event.target.result as string, file.name, { x: 50, y: 50 });
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

  const handleSaveAltClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      onImageChange(imageUrl, tempAlt, newPos);
    }
  };

  const showToolbar = (isActive || isHovered) && !readOnly && !isEditingAlt;
  const showPlaceholder = !imageUrl && !readOnly;

  return (
    <div
      className={`hero-image-container ${isActive ? 'hero-image-active' : ''} ${readOnly ? 'hero-image-readonly' : ''}`}
      onClick={readOnly ? undefined : onSelect}
      onMouseEnter={() => !readOnly && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={readOnly ? -1 : 0}
      onFocus={readOnly ? undefined : onSelect}
      onKeyDown={handleKeyDown}
      aria-label={alt || "Hero image container"}
    >
      {showToolbar && (
        <div className={`hero-image-toolbar ${showToolbar ? 'hero-image-toolbar-visible' : ''}`}>
          {imageUrl && (
            <>
              <button
                onClick={handleReplaceClick}
                className="hero-image-toolbar-button hero-image-replace-button"
                title="Replace cover image"
                disabled={readOnly}
              >
                <img src={icons.camera} alt="" className="hero-image-icon" /> Replace
              </button>
              <button
                onClick={handleEditAltClick}
                className="hero-image-toolbar-button"
                title="Edit image description (alt text)"
                disabled={readOnly}
              >
                ✏️ Alt
              </button>
              <span className="hero-image-toolbar-button drag-hint" title="Drag or use arrow keys to reposition">
                ✥ Reposition
              </span>
            </>
          )}
        </div>
      )}
      {isEditingAlt ? (
        <div className="hero-image-edit-form" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={tempAlt}
            onChange={(e) => setTempAlt(e.target.value)}
            placeholder="Image description (alt text)..."
            className="hero-image-alt-input"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveAltClick(e as any);
              if (e.key === 'Escape') handleCancelAltClick(e as any);
            }}
          />
          <div className="hero-image-edit-actions">
            <button onClick={handleSaveAltClick} className="hero-image-save-button">Save</button>
            <button onClick={handleCancelAltClick} className="hero-image-cancel-button">Cancel</button>
          </div>
        </div>
      ) : (
        <div
          ref={imageWrapperRef}
          className="hero-image-wrapper"
          onClick={readOnly ? undefined : handleReplaceClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : (imageUrl ? 'grab' : 'pointer')) }}
          tabIndex={-1}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={alt}
              className="hero-image"
              style={{ objectPosition: `${imagePosition.x}% ${imagePosition.y}%` }}
              draggable="false"
            />
          ) : (
            <div className="hero-image-placeholder">
              <div className="hero-image-placeholder-content">
                <img src={icons.camera} alt="" className="hero-image-placeholder-icon" />
                <button
                  className="hero-image-add-button"
                  onClick={handleReplaceClick}
                  disabled={readOnly}
                >
                  Add Cover Image
                </button>
                <span className="hero-image-placeholder-subtitle">Recommended: 1920×1080px</span>
              </div>
            </div>
          )}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        disabled={readOnly}
      />
    </div>
  );
};

export default HeroImage; 