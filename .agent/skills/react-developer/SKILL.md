---name: react-developerdescription: Develop React TypeScript components with Tailwind CSS and custom hookslicense: MITcompatibility: opencodemetadata:  audience: developers  stack: react-typescript  project: arunachala-web---
## What I do
- Create React functional components with TypeScript
- Implement custom hooks for state management
- Style with Tailwind CSS classes
- Set up API services with axios
- Implement routing with react-router-dom
- Add proper TypeScript types
- Create responsive layouts
- Handle forms and user input
- Implement SEO best practices (Meta tags, Helmet)
- Ensure accessibility implementation (ARIA, Focus management)

## When to use me
Use this when you need to:
- Create new UI components
- Implement React hooks
- Style components with Tailwind
- Add API integration
- Set up routing
- Handle user interactions
- Create responsive designs
- Implement SEO requirements
- Fix accessibility issues

## My patterns for Arunachala Web
- Use functional components with hooks (no classes)
- Use `src/components/` for reusable components
- Use `src/hooks/` for custom hooks
- Use `src/services/` for API calls
- Use Tailwind CSS classes (no inline styles)
- Follow TypeScript strict mode
- Use `@headlessui/react` for complex UI components
- Use `@heroicons/react` for icons
- Use `framer-motion` for animations
- Use `react-helmet` (or similar) for document head management
- Use `lighthouse` checks for performance/SEO/a11y validation

## Component structure
```typescript
interface ComponentProps {
  // Define props here
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // State and hooks here
  return (
    <div className="tailwind-classes">
      {/* JSX here */}
    </div>
  );
};

export default Component;
```

## 🔍 SEO Implementation
```typescript
import { Helmet } from 'react-helmet';

const PageSEO: React.FC<{ title: string; description: string; path: string }> = ({ 
  title, 
  description,
  path 
}) => (
  <Helmet>
    <title>{title} | Arunachala Yoga</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={`https://arunachalayoga.org${path}`} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
  </Helmet>
);
```

## ♿ Accessibility Implementation
- **Linter**: Ensure `eslint-plugin-jsx-a11y` is active and strict.
- **Testing**: Use `jest-axe` for unit testing component accessibility.
- **Runtime**: Check console for a11y warnings during development.

### A11y Hook Example
```typescript
import { useEffect, useRef } from 'react';

// Hook to manage focus for modals/menus
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const element = containerRef.current;
    if (!element) return;
    
    // Implementation of focus trap logic
    // ...
  }, [isActive]);
  
  return containerRef;
};
```

## Technology specifics
- React 18+ with functional components
- TypeScript in strict mode
- Tailwind CSS v3+ for styling
- React Router v6+ for navigation
- Axios for API calls
- Framer Motion for animations