import { BlogPost, BlogSection, HeroImage } from '../types/index';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateBlogSection(section: any): section is BlogSection {
  if (!section || typeof section !== 'object') {
    throw new ValidationError('Invalid section: must be an object');
  }

  if (!section.$type || section.$type !== 'BlogSection') {
    throw new ValidationError('Invalid section: missing or incorrect $type');
  }

  if (typeof section.id !== 'string') {
    throw new ValidationError('Invalid section: id must be a string');
  }

  if (!['text', 'image', 'code', 'quote'].includes(section.type)) {
    throw new ValidationError(`Invalid section: type must be one of 'text', 'image', 'code', 'quote'`);
  }

  if (typeof section.content !== 'string') {
    throw new ValidationError('Invalid section: content must be a string');
  }

  if (section.metadata) {
    if (typeof section.metadata !== 'object') {
      throw new ValidationError('Invalid section: metadata must be an object');
    }

    if (section.metadata.title && typeof section.metadata.title !== 'string') {
      throw new ValidationError('Invalid section: metadata.title must be a string');
    }

    if (section.metadata.image) {
      if (typeof section.metadata.image.url !== 'string') {
        throw new ValidationError('Invalid section: metadata.image.url must be a string');
      }
      if (typeof section.metadata.image.alt !== 'string') {
        throw new ValidationError('Invalid section: metadata.image.alt must be a string');
      }
    }
  }

  return true;
}

export function validateBlogPost(post: any): post is BlogPost {
  if (!post || typeof post !== 'object') {
    throw new ValidationError('Invalid post: must be an object');
  }

  if (!post.$type || post.$type !== 'BlogPost') {
    throw new ValidationError('Invalid post: missing or incorrect $type');
  }

  if (typeof post.id !== 'string') {
    throw new ValidationError('Invalid post: id must be a string');
  }

  // Validate metadata
  if (!post.metadata || typeof post.metadata !== 'object') {
    throw new ValidationError('Invalid post: metadata must be an object');
  }

  const requiredMetadataFields = ['title', 'author', 'category', 'readTime', 'date'];
  for (const field of requiredMetadataFields) {
    if (typeof post.metadata[field] !== 'string') {
      throw new ValidationError(`Invalid post: metadata.${field} must be a string`);
    }
  }

  if (typeof post.metadata.featured !== 'boolean') {
    throw new ValidationError('Invalid post: metadata.featured must be a boolean');
  }

  if (!['draft', 'published'].includes(post.metadata.status)) {
    throw new ValidationError('Invalid post: metadata.status must be either "draft" or "published"');
  }

  // Validate content
  if (!post.content || typeof post.content !== 'object') {
    throw new ValidationError('Invalid post: content must be an object');
  }

  // Validate sections
  if (!Array.isArray(post.content.sections)) {
    throw new ValidationError('Invalid post: content.sections must be an array');
  }

  if (post.content.sections.length === 0) {
    throw new ValidationError('Invalid post: content.sections must not be empty');
  }

  post.content.sections.forEach((section: unknown, index: number) => {
    try {
      validateBlogSection(section);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ValidationError(`Invalid section at index ${index}: ${error.message}`);
      }
      throw new ValidationError(`Invalid section at index ${index}: Unknown error`);
    }
  });

  // Validate featured image if present
  if (post.content.featuredImage) {
    if (typeof post.content.featuredImage.url !== 'string') {
      throw new ValidationError('Invalid post: content.featuredImage.url must be a string');
    }
    if (typeof post.content.featuredImage.alt !== 'string') {
      throw new ValidationError('Invalid post: content.featuredImage.alt must be a string');
    }
    if (post.content.featuredImage.position) {
      if (typeof post.content.featuredImage.position.x !== 'number' ||
          typeof post.content.featuredImage.position.y !== 'number') {
        throw new ValidationError('Invalid post: featuredImage position must have numeric x and y coordinates');
      }
    }
  }

  return true;
}

export function validateAndConvertBlogPost(jsonString: string): BlogPost {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new ValidationError(`Invalid JSON: ${error.message}`);
    }
    throw new ValidationError('Invalid JSON: Unknown error');
  }

  if (validateBlogPost(parsed)) {
    return parsed as BlogPost;
  }

  throw new ValidationError('Unknown validation error');
} 