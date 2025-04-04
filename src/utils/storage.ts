import type { BlogPost as BlogData } from '../types/index';

const STORAGE_KEY = 'blog_editor_draft';

export const saveDraft = (data: BlogData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const loadDraft = (): BlogData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
}; 