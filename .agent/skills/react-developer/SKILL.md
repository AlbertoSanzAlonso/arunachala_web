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

## My patterns for Arunachala Web (Clean Architecture)
- **UI Components (`src/components/`)**: "Dumb" presentation only.
  - ❌ NO direct calls to `axios` or `fetch`.
  - ❌ NO complex business logic.
  - ✅ Receive data via props.
- **Features/Pages (`src/pages/`)**: Container components.
  - ✅ Manage state.
  - ✅ Compose UI components.
- **Custom Hooks (`src/hooks/`)**: Encapsulated Logic.
  - ✅ Complex state logic goes here.
  - ✅ API Data fetching logic goes here.
- **Services (`src/services/`)**: API Interaction.
  - ✅ ONLY place where `axios` is used.
  - ✅ Define strict Types/Interfaces for API responses.
- **Styling**: Tailwind CSS classes (clean and readable).
- Follow TypeScript strict mode
- Use `@headlessui/react` for complex UI components
- Use `@heroicons/react` for icons
- Use `framer-motion` for animations
- Use `react-helmet` (or similar) for document head management
- Use `lighthouse` checks for performance/SEO/a11y validation

## 🎨 Page Creation Standards
To ensure consistency, SEO, ease of maintenance, and high performance:

### 1. SEO & Metadata
- **Tool**: Use `react-helmet-async`.
- **Requirement**: Every page must define `<title>` and `<nav>` meta tags.
- **URLs**: Spanish and SEO-friendly (e.g., `/terapias-y-masajes`).

### 2. Performance & Lazy Loading
- **Suspense**: Wrap heavy components in `React.lazy` and `<Suspense>`.
- **Images**: Use `loading="lazy"` for below-the-fold images.
- **Code Splitting**: Main route components should be lazy loaded in `App.tsx`.

### 3. Accessibility (a11y)
- **Semantic HTML**: Use proper tags (`<main>`, `<article>`, `<nav>`).
- **Labels**: All interactive elements MUST have `aria-label` or visible text.
- **Images**: Mandatory `alt` text.

### 4. Code & Import Organization
- **Imports**: Group imports: React/libs first, Components second, Assets/Config last.
- **Clean Code**: Remove unused imports immediately.

### 5. Mobile & Responsive Design
- **Spacing**: Use generous padding/gap (`py-24`, `gap-8`).
- **Typography**: Adjust font sizes (`text-3xl md:text-5xl`).

### 6. UX & Animations
- **Smooth Scroll**: Use `element.scrollIntoView({ behavior: 'smooth' })`.
- **Transitions**: Use `<FadeInSection>` (framer-motion).
- **Feedback**: Provide loading skeletons/spinners.

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