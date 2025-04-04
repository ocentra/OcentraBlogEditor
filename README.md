# Blog Editor Documentation

## 1. Introduction

### 1.1. Purpose
The purpose of this document is to provide a comprehensive guide for developers working with the Blog Editor project. It outlines the project structure, setup instructions, and best practices for development.

### 1.2. Scope
This document covers:
- Project overview and architecture
- Development environment setup
- Code organization and structure
- Component documentation
- State management
- Testing guidelines
- Deployment process
- Plugin configuration and customization

### 1.3. Definitions, Acronyms, and Abbreviations
- **TS**: TypeScript
- **React**: A JavaScript library for building user interfaces
- **TipTap**: A headless rich text editor framework
- **ESLint**: A tool for identifying and reporting on patterns in JavaScript/TypeScript code
- **Prettier**: A code formatter
- **HMR**: Hot Module Replacement

### 1.4. References
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TipTap Documentation](https://tiptap.dev/docs/editor/introduction)
- [Vite Documentation](https://vitejs.dev/guide/)

### 1.5. Overview
The Blog Editor is a React-based application that provides a rich text editing experience for creating and managing blog posts. It uses TipTap for the rich text editor functionality and TypeScript for type safety. It can be used both as a standalone application and as a plugin in other projects.

## 2. System Architecture

### 2.1. System Context
The Blog Editor is a standalone application that can be integrated into larger content management systems. It communicates with a backend API for saving and retrieving blog posts.

### 2.2. System Components
The system consists of the following main components:
- **BlogEditor**: The main component that orchestrates the editor functionality
- **EditorToolbar**: Provides formatting controls for the editor
- **Section**: Represents individual sections of a blog post
- **EditorSidebar**: Provides navigation and metadata management
- **ConfigProvider**: Manages customizable assets and configuration

### 2.3. Data Flow
1. User interacts with the editor
2. Changes are captured by TipTap
3. State is updated in the BlogEditor component
4. Changes are saved to local storage or backend API

## 3. Development Environment

### 3.1. Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### 3.2. Setup Instructions
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build the library: `npm run build`
5. Build the example: `npm run build:example`

### 3.3. Configuration
- `.eslintrc.js`: ESLint configuration
- `.prettierrc`: Prett configuration
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Build and development configuration

## 4. Code Organization

### 4.1. Directory Structure
```
src/
  ├── components/
  │   ├── EditorToolbar.tsx
  │   ├── Section.tsx
  │   ├── EditorSidebar.tsx
  │   ├── HeroImage.tsx
  │   └── ...
  ├── context/
  │   ├── BlogContext.tsx
  │   └── ConfigContext.tsx
  ├── types/
  │   └── index.ts
  ├── assets/
  │   └── camera.png
  ├── styles/
  │   └── index.css
  └── BlogEditor.tsx
```

### 4.2. Component Structure
Each component follows this structure:
1. Imports
2. Type definitions
3. Component definition
4. Export

### 4.3. State Management
State is managed using React's useState and useEffect hooks. The main state object is the blog post, which contains:
- Title
- Sections
- Metadata
- Hero image

## 5. Plugin Configuration

### 5.1. Using as a Plugin
To use the Blog Editor as a plugin in another project:

```typescript
import { BlogEditor, ConfigProvider } from '@ocentra/blog-editor';

function App() {
  return (
    <ConfigProvider config={{
      icons: {
        camera: '/path/to/your/camera-icon.png'
      }
    }}>
      <BlogEditor />
    </ConfigProvider>
  );
}
```

### 5.2. Configurable Options
The following options can be customized through the ConfigProvider:

#### Icons
- `camera`: Custom camera icon for image upload
- More icons can be added as needed

### 5.3. Asset Handling
- Default assets are bundled with the library
- Custom assets can be provided through the ConfigProvider
- Assets are properly handled in both development and production builds

## 6. Build Process

### 6.1. Building the Library
```bash
npm run build
```
This will create:
- `dist/ocentra-blog-editor.es.js` (ES modules)
- `dist/ocentra-blog-editor.umd.js` (UMD bundle)
- `dist/blog-editor.css` (Styles)
- `dist/index.d.ts` (TypeScript definitions)

### 6.2. Building the Example
```bash
npm run build:example
```
This will build the example application in the `example` directory.

### 6.3. Development
```bash
npm run dev
```
This will start the development server for the example application.

## 7. Component Documentation

### 7.1. BlogEditor
The main component that manages the blog post state and coordinates between other components.

#### Props
- `initialPost`: Initial blog post data
- `onSave`: Callback for saving the post
- `onPublish`: Callback for publishing the post

#### State
- `post`: The current blog post
- `activeSection`: Currently active section
- `isDirty`: Whether there are unsaved changes

### 7.2. EditorToolbar
Provides formatting controls for the rich text editor.

#### Props
- `editor`: TipTap editor instance

#### Features
- Text formatting (bold, italic, underline)
- Headings
- Lists
- Text alignment
- Tables
- Code blocks

### 7.3. Section
Represents an individual section of a blog post.

#### Props
- `section`: Section data
- `onUpdate`: Callback for section updates
- `isActive`: Whether the section is currently active

### 7.4. EditorSidebar
Provides navigation and metadata management.

#### Props
- `post`: Current blog post
- `activeSection`: Currently active section
- `onSectionSelect`: Callback for section selection
- `onMetadataUpdate`: Callback for metadata updates

### 7.5. HeroImage
Handles the blog post's hero image.

#### Props
- `imageUrl`: URL of the hero image
- `alt`: Alt text for the image
- `position`: Image position (x, y coordinates)
- `onImageChange`: Callback for image changes
- `onAltChange`: Callback for alt text changes
- `isActive`: Whether the image is currently active
- `onSelect`: Callback for selection
- `readOnly`: Whether the image is read-only

## 8. Testing

### 8.1. Testing Strategy
- Unit tests for components
- Integration tests for editor functionality
- End-to-end tests for critical user flows

### 8.2. Testing Tools
- Jest
- React Testing Library
- Cypress

### 8.3. Running Tests
- Unit tests: `npm test`
- End-to-end tests: `npm run test:e2e`

## 9. Deployment

### 9.1. Build Process
1. Run tests
2. Build the library: `npm run build`
3. Build the example: `npm run build:example`
4. Deploy to hosting platform

### 9.2. Deployment Checklist
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Environment variables are set
- [ ] Dependencies are up to date

### 9.3. Environment Configuration
- Development: `npm run dev`
- Production: `npm run build`

## 10. Maintenance

### 10.1. Code Review Process
1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main

### 10.2. Version Control
- Use semantic versioning
- Follow GitFlow workflow
- Write meaningful commit messages

### 10.3. Documentation Updates
- Update this document when making significant changes
- Keep component documentation up to date
- Document new features and changes

## 11. Troubleshooting

### 11.1. Common Issues
1. TypeScript errors
   - Check type definitions
   - Update @types packages
2. Editor not working
   - Check TipTap extensions
   - Verify editor configuration
3. Build failures
   - Check dependencies
   - Verify TypeScript configuration
4. HMR issues
   - Check component exports
   - Verify Fast Refresh configuration

### 11.2. Debugging Tips
- Use React DevTools
- Check browser console
- Enable source maps
- Use debugger statements

### 11.3. Performance Optimization
- Use React.memo for pure components
- Implement lazy loading
- Optimize re-renders
- Use proper key props

## 12. Future Enhancements

### 12.1. Planned Features
- Image upload and management
- Version control for posts
- Collaboration features
- Export to different formats
- Additional configurable options

### 12.2. Technical Debt
- Improve test coverage
- Refactor state management
- Optimize bundle size
- Update dependencies

### 12.3. Scalability Considerations
- Implement caching
- Add pagination
- Optimize database queries
- Consider microservices architecture 