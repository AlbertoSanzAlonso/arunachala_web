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

## When to use me
Use this when you need to:
- Create new UI components
- Implement React hooks
- Style components with Tailwind
- Add API integration
- Set up routing
- Handle user interactions
- Create responsive designs

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

## Technology specifics
- React 18+ with functional components
- TypeScript in strict mode
- Tailwind CSS v3+ for styling
- React Router v6+ for navigation
- Axios for API calls
- Framer Motion for animations