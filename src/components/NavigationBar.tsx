import React, { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

// Navigation spacing constants
const DEFAULT_NAV_ITEM_GAP = 8; // Default gap between navigation items
const DEFAULT_NAV_ITEM_MARGIN = 4; // Default margin between navigation items
const DEFAULT_NAV_ITEM_PADDING = '8px 16px'; // Default padding inside navigation items
const NAV_ARROW_WIDTH = 32;
const NAV_ARROW_HEIGHT = 32;

interface NavigationItem {
  name: string;
  type: 'button' | 'link' | 'input' | 'select' | 'checkbox' | 'color';
  href?: string;
  onClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  options?: string[];
  placeholder?: string;
  minWidth?: string;
  disabled?: boolean;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

interface NavigationBarProps {
  items?: NavigationItem[];
  height: number;
  showArrows?: boolean;
  variant?: 'default' | 'form';
  itemGap?: number;
  itemMargin?: number;
  itemPadding?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

const commonButtonStyles: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '4px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '32px',
};

const commonInputStyles: React.CSSProperties = {
  ...commonButtonStyles,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  cursor: 'text',
  textAlign: 'left',
  justifyContent: 'flex-start',
};

const ArrowButton: React.FC<{
  direction: 'left' | 'right';
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
}> = ({ direction, onClick, ariaLabel, disabled }) => (
  <button
    className={`nav-arrow nav-arrow-${direction}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-disabled={disabled}
  >
    {direction === 'left' ? '←' : '→'}
  </button>
);

const NavigationBar: React.FC<NavigationBarProps> = ({
  items: propItems = [],
  height,
  showArrows = true,
  variant = 'default',
  itemGap = DEFAULT_NAV_ITEM_GAP,
  itemMargin = DEFAULT_NAV_ITEM_MARGIN,
  itemPadding = DEFAULT_NAV_ITEM_PADDING,
  ariaLabel = 'Navigation',
  autoFocus = false,
  isExpanded = true,
  onToggleExpand,
  onCategoryChange,
  selectedCategory = '',
}) => {
  // Remove automatic category selector addition
  const items = propItems;

  const navContainerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [showNavigationArrows, setShowNavigationArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(-1);

  const updateScrollState = useCallback(() => {
    if (navContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.current;
      setShowNavigationArrows(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    if (autoFocus && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [autoFocus]);

  const scrollNav = useCallback((direction: 'left' | 'right') => {
    if (navContainerRef.current) {
      const container = navContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      const scrollStep = Math.min(container.clientWidth * 0.8, 300);

      const newScroll = direction === 'right'
        ? Math.min(currentScroll + scrollStep, maxScroll)
        : Math.max(currentScroll - scrollStep, 0);

      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (navContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (navContainerRef.current) {
      event.preventDefault();
      const container = navContainerRef.current;
      const scrollStep = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
      container.scrollTo({
        left: container.scrollLeft + scrollStep,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const formItems = items.filter(item => 
      item.type === 'input' || item.type === 'select' || item.type === 'checkbox'
    );
    
    switch (event.key) {
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          scrollNav('right');
        } else if (activeItemIndex < formItems.length - 1) {
          setActiveItemIndex(prev => prev + 1);
        }
        break;
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          scrollNav('left');
        } else if (activeItemIndex > 0) {
          setActiveItemIndex(prev => prev - 1);
        }
        break;
      case 'Home':
        event.preventDefault();
        setActiveItemIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveItemIndex(formItems.length - 1);
        break;
    }
  }, [items, activeItemIndex, scrollNav]);

  useEffect(() => {
    const container = navContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleWheel, handleScroll]);

  const renderFormItem = useCallback((item: NavigationItem, index: number) => {
    const isActive = index === activeItemIndex;
    const commonStyles = {
      ...commonInputStyles,
      padding: itemPadding,
      margin: `0 ${itemMargin}px`,
      minWidth: item.minWidth,
      opacity: item.disabled ? 0.5 : 1,
      cursor: item.disabled ? 'not-allowed' : 'text',
      outline: isActive ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
      ...item.style,
    };

    switch (item.type) {
      case 'input':
        return (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'white', whiteSpace: 'nowrap' }}>{item.name}:</label>
            <input
              type="text"
              value={item.value}
              onChange={(e) => item.onChange?.(e.target.value)}
              placeholder={item.placeholder}
              disabled={item.disabled}
              style={commonStyles}
              aria-label={item.ariaLabel || item.name}
              onFocus={() => setActiveItemIndex(index)}
            />
          </div>
        );
      case 'button':
        return (
          <button
            key={item.name}
            onClick={item.onClick}
            disabled={item.disabled}
            style={{
              ...commonButtonStyles,
              padding: itemPadding,
              margin: `0 ${itemMargin}px`,
              opacity: item.disabled ? 0.5 : 1,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              ...item.style,
            }}
            aria-label={item.ariaLabel || item.name}
          >
            {item.value || item.name}
          </button>
        );
      case 'select':
        return (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'white', whiteSpace: 'nowrap' }}>{item.name}:</label>
            <select
              value={item.value}
              onChange={(e) => item.onChange?.(e.target.value)}
              disabled={item.disabled}
              style={commonStyles}
              aria-label={item.ariaLabel || item.name}
              onFocus={() => setActiveItemIndex(index)}
            >
              <option value="">{item.placeholder || `Select ${item.name.toLowerCase()}...`}</option>
              {item.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case 'checkbox':
        return (
          <label
            key={item.name}
            style={{
              ...commonButtonStyles,
              padding: itemPadding,
              margin: `0 ${itemMargin}px`,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              opacity: item.disabled ? 0.5 : 1,
              outline: isActive ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="checkbox"
              checked={item.value === 'true'}
              onChange={(e) => item.onChange?.(e.target.checked ? 'true' : 'false')}
              disabled={item.disabled}
              aria-label={item.ariaLabel || item.name}
              onFocus={() => setActiveItemIndex(index)}
            />
            {item.name}
          </label>
        );
      case 'color':
        return (
          <input
            key={item.name}
            type="color"
            value={item.value}
            onChange={(e) => item.onChange?.(e.target.value)}
            disabled={item.disabled}
            style={{
              ...item.style,
              margin: `0 ${itemMargin}px`,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              opacity: item.disabled ? 0.5 : 1,
              outline: isActive ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
            }}
            aria-label={item.ariaLabel || item.name}
            onFocus={() => setActiveItemIndex(index)}
          />
        );
      default:
        return null;
    }
  }, [itemPadding, itemMargin, activeItemIndex]);

  const renderDefaultItem = useCallback((item: NavigationItem, index: number) => {
    const buttonStyles = {
      ...commonButtonStyles,
      padding: itemPadding,
      margin: `0 ${itemMargin}px`,
      opacity: item.disabled ? 0.5 : 1,
      cursor: item.disabled ? 'not-allowed' : 'pointer',
    };

    if (item.onClick) {
      return (
        <button
          key={item.name}
          onClick={item.disabled ? undefined : item.onClick}
          disabled={item.disabled}
          aria-label={item.ariaLabel || item.name}
          style={buttonStyles}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          }}
        >
          {item.name}
        </button>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href || '#'}
        style={buttonStyles}
        aria-label={item.ariaLabel || item.name}
        onMouseEnter={(e) => {
          if (!item.disabled) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!item.disabled) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }
        }}
      >
        {item.name}
      </Link>
    );
  }, [itemPadding, itemMargin]);

  const renderItem = useCallback((item: NavigationItem, index: number) => {
    return variant === 'form' ? renderFormItem(item, index) : renderDefaultItem(item, index);
  }, [variant, renderFormItem, renderDefaultItem]);

  return (
    <div
      className={`navigation-bar ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={{ height }}
      role="navigation"
      aria-label={ariaLabel}
    >
      {/* Nav Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: variant === 'form' ? '42px' : `${height + 10}px`,
          right: variant === 'form' ? '42px' : `${height + 10}px`,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          borderRadius: '5px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      />

      {/* Left Arrow */}
      {showArrows && showNavigationArrows && (
        <div
          style={{
            height: variant === 'form' ? '32px' : `${height}px`,
            width: variant === 'form' ? '32px' : `${height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
        >
          <ArrowButton
            direction="left"
            onClick={() => scrollNav('left')}
            ariaLabel="Scroll left"
            disabled={!canScrollLeft}
          />
        </div>
      )}

      {/* Scrollable Content */}
      <div
        ref={navContainerRef}
        className="nav-container"
        style={{
          height: '100%',
          width: variant === 'form' ? 'calc(100% - 84px)' : `calc(100% - ${(height + 10) * 2}px)`,
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          justifyContent: showNavigationArrows ? 'flex-start' : 'center',
          position: 'relative',
          zIndex: 1,
          scrollBehavior: 'smooth',
          padding: variant === 'form' ? '0 10px' : '0',
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="tablist"
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '100%',
            gap: `${itemGap}px`,
            padding: '0 5px',
            flexWrap: 'nowrap',
            width: 'max-content',
          }}
        >
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </div>

      {/* Right Arrow */}
      {showArrows && showNavigationArrows && (
        <div
          style={{
            height: variant === 'form' ? '32px' : `${height}px`,
            width: variant === 'form' ? '32px' : `${height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
        >
          <ArrowButton
            direction="right"
            onClick={() => scrollNav('right')}
            ariaLabel="Scroll right"
            disabled={!canScrollRight}
          />
        </div>
      )}

      {onToggleExpand && (
        <button
          className="nav-toggle"
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '←' : '→'}
        </button>
      )}
    </div>
  );
};

export default NavigationBar; 