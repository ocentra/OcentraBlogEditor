import React, { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import styles from '../styles/components/NavigationBar.module.css';

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
  style?: React.CSSProperties;
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

const arrowButtonStyles = {
  base: {
    width: '32px',
    height: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  hover: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  left: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  right: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
};

const ArrowButton: React.FC<{
  direction: 'left' | 'right';
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
}> = ({ direction, onClick, ariaLabel, disabled }) => (
  <button
    className={`${styles.arrowButton} ${direction === 'left' ? styles.arrowButtonLeft : styles.arrowButtonRight} ${disabled ? styles.arrowButtonDisabled : ''}`}
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
  style
}) => {
  const { categories = [] } = useConfig();
  
  // Add category selector if onCategoryChange is provided
  const items = React.useMemo(() => {
    if (onCategoryChange) {
      const categoryItem = {
        name: 'Category',
        type: 'select' as const,
        value: selectedCategory,
        onChange: onCategoryChange,
        options: categories,
        placeholder: 'Select category...',
        minWidth: '200px',
      };
      
      // Insert category after the first item
      return [
        ...propItems.slice(0, 1),
        categoryItem,
        ...propItems.slice(1)
      ];
    }
    return propItems;
  }, [propItems, onCategoryChange, selectedCategory, categories]);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [showNavigationArrows, setShowNavigationArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(-1);
  const [contentAlignment, setContentAlignment] = useState<'center' | 'flex-start'>('center');

  const updateScrollState = useCallback(() => {
    if (navContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      
      setShowNavigationArrows(hasOverflow);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      
      // Update alignment based on available space
      setContentAlignment(hasOverflow ? 'flex-start' : 'center');
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

  // Helper function to calculate input width
  const calculateInputWidth = useCallback((text: string, minWidth: string = '200px') => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = '14px sans-serif'; // Match the input's font
      const textWidth = context.measureText(text || '').width;
      const minWidthPx = parseInt(minWidth);
      // Add padding and some extra space for comfortable typing
      return Math.max(minWidthPx, textWidth + 32);
    }
    return parseInt(minWidth);
  }, []);

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
        const inputWidth = calculateInputWidth(item.value || '', item.minWidth);
        return (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'white', whiteSpace: 'nowrap' }}>{item.name}:</label>
            <div style={{ position: 'relative', flex: '1 1 auto', minWidth: item.minWidth || '200px', maxWidth: '600px' }}>
              <input
                type="text"
                value={item.value}
                onChange={(e) => {
                  item.onChange?.(e.target.value);
                  const target = e.target as HTMLInputElement;
                  target.style.width = `${calculateInputWidth(e.target.value, item.minWidth)}px`;
                }}
                placeholder={item.placeholder}
                disabled={item.disabled}
                style={{
                  ...commonStyles,
                  width: `${inputWidth}px`,
                  minWidth: item.minWidth || '200px',
                }}
                aria-label={item.ariaLabel || item.name}
                onFocus={() => setActiveItemIndex(index)}
              />
            </div>
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
              style={{
                ...commonStyles,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'white',
                appearance: 'none',
                paddingRight: '24px', // Space for the custom arrow
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='white' d='M0 2l4 4 4-4z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '8px'
              }}
              aria-label={item.ariaLabel || item.name}
              onFocus={() => setActiveItemIndex(index)}
            >
              <option value="" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                {item.placeholder || `Select ${item.name.toLowerCase()}...`}
              </option>
              {item.options?.map((option, optionIndex) => (
                <option 
                  key={`${item.name}-${option}-${optionIndex}`} 
                  value={option}
                  style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                >
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
      className={`${styles.navContainer} ${isExpanded ? styles.navContainerExpanded : styles.navContainerCollapsed}`}
      style={style}
    >
      <div className={styles.navBackground} />
      
      {showArrows && showNavigationArrows && (
        <div className={`${styles.arrowContainer} ${styles.arrowContainerLeft}`}>
          <button
            className={`${styles.arrowButton} ${styles.arrowButtonLeft} ${!canScrollLeft ? styles.arrowButtonDisabled : ''}`}
            onClick={() => scrollNav('left')}
            disabled={!canScrollLeft}
          >
            ←
          </button>
        </div>
      )}

      <div 
        className={styles.navContent} 
        ref={navContainerRef}
        style={{ justifyContent: contentAlignment }}
      >
        <div className={styles.navItems}>
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </div>

      {showArrows && showNavigationArrows && (
        <div className={`${styles.arrowContainer} ${styles.arrowContainerRight}`}>
          <button
            className={`${styles.arrowButton} ${styles.arrowButtonRight} ${!canScrollRight ? styles.arrowButtonDisabled : ''}`}
            onClick={() => scrollNav('right')}
            disabled={!canScrollRight}
          >
            →
          </button>
        </div>
      )}

      {onToggleExpand && (
        <button
          className={styles.toggleButton}
          onClick={onToggleExpand}
        >
          {isExpanded ? '↑' : '↓'}
        </button>
      )}
    </div>
  );
};

export default NavigationBar; 