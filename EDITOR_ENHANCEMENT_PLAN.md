# Blog Editor Enhancement Plan

## Vision
Create a standalone, reusable blog editor tool that can be:
- Used directly in any website
- Used to write blogs locally or with GitHub integration
- Open-sourced as a separate tool
- Embedded in other sites
- Used to export content in various formats

## Current Architecture Analysis

### Core Components
1. **BlogEditor.tsx** (Main Editor) ✅
   - Manages overall editor state
   - Handles post metadata
   - Controls preview mode
   - Manages sections
   - Handles image uploads
   - Draft/Publish functionality

2. **Section.tsx** (Content Block) ✅
   - Handles individual content blocks
   - Supports multiple content types:
     - Text (Rich text editor)
     - Image (Upload & display)
     - Code (Syntax highlighting)
     - Quote (With attribution)
   - Title editing
   - Section-specific toolbars
   - Delete/Edit actions

3. **EditorSidebar.tsx** (Navigation) ✅
   - Manages section list
   - Section navigation
   - Add new sections
   - Section selection

4. **NavigationBar** (Shared Component) ✅
   - Currently shared across app
   - Handles metadata inputs
   - Action buttons (Preview, Draft, Publish)

### Current Flow
1. **Admin Dashboard** (`/admin`)
   - Lists all blog posts
   - Currently uses hardcoded data
   - Needs GitHub integration
   - Edit/Delete actions
   - Create new post

2. **Editor Flow** ✅
   - Dashboard -> Edit/New -> Editor
   - Editor loads post data
   - Sections management
   - Preview capability
   - Save/Publish actions

3. **Data Flow** ✅
   ```
   Admin Dashboard
   ├─> Lists posts from BlogContext
   ├─> Edit launches BlogEditor
   │   ├─> Loads post data
   │   ├─> Creates sections
   │   └─> Manages content
   └─> Delete removes from context
   ```

### Shared Infrastructure
1. **BlogContext** ✅
   - Currently in-memory storage
   - Handles post CRUD operations
   - Moved to blog editor component for better modularity

2. **AuthContext**
   - Cloudflare authentication
   - Admin access control

## Current State
Currently implemented in `BlogEditor.tsx` with:
- Title, Category, Author, Read Time inputs ✅
- Sections-based content (Excerpt, Introduction, etc.) ✅
- Basic text editor ✅
- Preview mode ✅
- Draft/Publish functionality ✅

## Enhancement Plan

### Phase 1: Core Editor Enhancement
#### Task 1: Data Structure Refinement ✅
```typescript
interface BlogSection {
  id: string;
  type: 'text' | 'image' | 'code' | 'quote';
  content: string;
  metadata?: {
    title?: string;
    language?: string;
    author?: string;
  };
}

interface BlogPost {
  metadata: {
    title: string;
    author: string;
    category: string;
    readTime: string;
    featured: boolean;
    status: 'draft' | 'published';
    date: string;
  };
  content: {
    excerpt: BlogSection;
    sections: BlogSection[];
    featuredImage?: {
      url: string;
      alt: string;
    };
  };
}
```

#### Task 2: Component Modularization ✅
1. Split current editor into:
   - EditorHeader (metadata inputs) ✅
   - EditorContent (sections management) ✅
   - EditorSidebar (section navigation) ✅
   - EditorToolbar (formatting tools) ✅
   - ImageManager (image handling) ⏳
   - PreviewRenderer (preview mode) ⏳

#### Task 3: Export/Import Layer ⏳
```typescript
interface ExportFormat {
  toJSON(): string;
  toHTML(): string;
  toMarkdown(): string;
}

interface ImportFormat {
  fromJSON(json: string): BlogPost;
  fromHTML(html: string): BlogPost;
  fromMarkdown(md: string): BlogPost;
}
```

### Phase 2: Storage Integration
#### Task 4: Storage Layer Interface ⏳
```typescript
interface StorageAdapter {
  save(post: BlogPost): Promise<void>;
  load(id: string): Promise<BlogPost>;
  list(): Promise<BlogPostSummary[]>;
  delete(id: string): Promise<void>;
  uploadImage(file: File): Promise<string>;
  deleteImage(url: string): Promise<void>;
}
```

#### Task 5: GitHub Integration ⏳
1. Implement GitHub storage adapter
2. Add GitHub authentication
3. Handle image uploads to GitHub
4. Implement caching layer

#### Task 6: Local Storage ⏳
1. Implement local storage adapter
2. Add file system integration
3. Handle local image storage
4. Add export to file system

### Phase 3: Open Source Preparation
#### Task 7: Package Structure ⏳
```
blog-editor/
  packages/
    core/           # Main editor component
    storage/        # Storage adapters
    exporters/      # Export utilities
    ui/            # Theme components
    plugins/       # Official plugins
  examples/
    github-pages/  # Example with GitHub Pages
    nextjs/        # Example with Next.js
    react/         # Basic React example
```

#### Task 8: Plugin System ⏳
```typescript
interface BlogEditorPlugin {
  name: string;
  type: 'storage' | 'export' | 'editor' | 'ui';
  hooks: {
    onInit?: () => void;
    onSave?: (data: BlogPost) => Promise<void>;
    onExport?: (data: BlogPost) => Promise<string>;
  };
  components?: {
    toolbar?: React.ComponentType;
    sidebar?: React.ComponentType;
  };
}
```

#### Task 9: Documentation ⏳
1. API documentation
2. Usage examples
3. Plugin development guide
4. Deployment guides

## Development Approach
1. Work on one task at a time ✅
2. Verify functionality after each task ✅
3. Maintain backward compatibility ✅
4. Keep code modular and testable ✅
5. Document changes and decisions ✅

## Testing Strategy
1. Unit tests for each component ⏳
2. Integration tests for storage adapters ⏳
3. End-to-end tests for complete workflows ⏳
4. Manual testing of UI/UX ⏳

## Future Considerations
1. Additional export formats ⏳
2. More storage providers ⏳
3. Custom themes ⏳
4. Collaboration features ⏳
5. Real-time preview ⏳
6. SEO optimization tools ⏳

## Notes
- Keep current functionality working while refactoring ✅
- Maintain type safety throughout ✅
- Consider backward compatibility ✅
- Focus on user experience ✅
- Keep performance in mind ✅

## Component Extraction Plan

### Phase 1: Core Components
#### Task 1a: Extract Navigation Components ✅
1. Create standalone NavigationBar package
   ```typescript
   interface NavigationBarProps {
     items: NavItem[];
     variant: 'form' | 'navigation';
     onAction: (action: string) => void;
   }
   ```

#### Task 1b: Extract Section Components ✅
1. Create standalone Section package
   ```typescript
   interface SectionModule {
     Section: React.FC<SectionProps>;
     SectionList: React.FC<SectionListProps>;
     SectionTypes: Record<string, SectionConfig>;
   }
   ```

#### Task 1c: Extract Editor Components ✅
1. Create base editor package
   ```typescript
   interface EditorCore {
     EditorProvider: React.FC;
     useEditor: () => EditorContext;
     EditorComponents: {
       Header: React.FC;
       Content: React.FC;
       Sidebar: React.FC;
       Toolbar: React.FC;
     };
   }
   ```

### Phase 2: Storage Integration
[Previous storage section remains the same...]

### Phase 3: Admin Dashboard Enhancement
#### Task 7a: GitHub Integration for Admin ⏳
1. Create GitHub posts adapter
   ```typescript
   interface GitHubPostsAdapter {
     fetchPosts(): Promise<BlogPost[]>;
     fetchPost(id: string): Promise<BlogPost>;
     updatePost(id: string, post: BlogPost): Promise<void>;
     deletePost(id: string): Promise<void>;
   }
   ```

2. Implement post listing
3. Add search and filtering
4. Add pagination
5. Add sorting options

#### Task 7b: Admin UI Enhancement ⏳
1. Add post status indicators
2. Add bulk actions
3. Add quick edit capabilities
4. Add post analytics (if available)

[Rest of the original plan remains the same...] 