---name: ui-design-systemdescription: Arunachala Web UI design system with Tailwind CSS, components, and UX patternslicense: MITcompatibility: antigravity, opencodemetadata:  audience: developers  domain: frontend-ui  project: arunachala-web---
## What I do
- Implement consistent UI design system for Arunachala Web
- Create reusable components with Tailwind CSS
- Apply brand colors, typography, and spacing patterns
- Ensure responsive design across all devices
- Implement accessibility standards (WCAG 2.1)
- Create animations and micro-interactions
- Maintain design consistency across features

## When to use me
Use this when you need to:
- Design new UI components or pages
- Apply brand styling and colors
- Ensure responsive layouts
- Create consistent spacing and typography
- Implement design system tokens
- Add animations and transitions
- Ensure accessibility compliance
- Create mobile-first responsive designs

## Arunachala Web Design System

### 🎨 Brand Identity
#### Colors
```css
/* Primary Colors - Serenity & Wellness */
:root {
  /* Primary - Calm Blue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-900: #1e3a8a;
  
  /* Secondary - Warm Earth */
  --color-secondary-50: #fef3c7;
  --color-secondary-100: #fde68a;
  --color-secondary-500: #f59e0b;
  --color-secondary-600: #d97706;
  --color-secondary-700: #b45309;
  --color-secondary-900: #78350f;
  
  /* Accent - Spirit Purple */
  --color-accent-50: #f3e8ff;
  --color-accent-100: #e9d5ff;
  --color-accent-500: #a855f7;
  --color-accent-600: #9333ea;
  --color-accent-700: #7c3aed;
  --color-accent-900: #5b21b6;
  
  /* Neutral - Calm Grays */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

#### Typography
```css
:root {
  /* Fonts - Wellness & Readability */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-serif: 'Crimson Text', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Type Scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;   /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### Spacing System
```css
:root {
  /* Spacing Scale - Based on 4px grid */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  
  /* Container & Layout */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}
```

### 🧩 Component Patterns

#### Button System
```typescript
// Base Button Component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

#### Card Component
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'none';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md' 
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    none: 'shadow-none'
  };
  
  return (
    <div className={`
      bg-white rounded-xl border border-gray-200
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${className}
    `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
};
```

### 🎨 Layout Patterns

#### Header Layout
```typescript
interface HeaderProps {
  user?: User | null;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ user, currentPage }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              Arunachala Yoga
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/yoga" className={`
              text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium
              ${currentPage === 'yoga' ? 'text-primary-600 bg-primary-50' : ''}
            `}>
              Yoga
            </a>
            <a href="/therapies" className={`
              text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium
              ${currentPage === 'therapies' ? 'text-primary-600 bg-primary-50' : ''}
            `}>
              Terapias
            </a>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

#### Hero Section Pattern
```typescript
interface HeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

const Hero: React.FC<HeroProps> = ({ 
  title, 
  subtitle, 
  backgroundImage,
  primaryAction,
  secondaryAction 
}) => {
  return (
    <section className={`
      relative flex items-center justify-center
      min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50
      ${backgroundImage ? `bg-cover bg-center` : ''}
    `}>
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-40 z-10"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {secondaryAction && (
              <Button variant="outline" size="lg" onClick={secondaryAction.onClick}>
                {secondaryAction.text}
              </Button>
            )}
            {primaryAction && (
              <Button variant="primary" size="lg" onClick={primaryAction.onClick}>
                {primaryAction.text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
```

### 📱 Responsive Design Patterns

#### Mobile-First Container
```typescript
const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
};
```

#### Grid System
```typescript
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const Grid: React.FC<GridProps> = ({ children, cols = 1, gap = 'md' }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };
  
  return (
    <div className={`grid ${gridClasses[cols]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
};
```

### 🎭 Animation Patterns

#### Page Transitions
```typescript
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
```

#### Hover Effects
```typescript
const InteractiveCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      className="card-base"
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};
```

### ♿ Accessibility Standards

#### Focus Management
```typescript
const FocusTrap: React.FC<{ children: React.ReactNode; isOpen: boolean; onClose: () => void }> = ({ 
  children, 
  isOpen, 
  onClose 
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};
```

#### ARIA Labels
```typescript
const AccessibleButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      {...props}
      aria-label={props.ariaLabel || props.children?.toString()}
      role="button"
      tabIndex={props.disabled ? -1 : 0}
    >
      {props.children}
    </Button>
  );
};
```

### 🎨 Specific Component Guidelines

#### Yoga Class Cards
```typescript
interface YogaClassCardProps {
  class: YogaClass;
  onBook?: (classId: string) => void;
}

const YogaClassCard: React.FC<YogaClassCardProps> = ({ class: yogaClass, onBook }) => {
  return (
    <Card shadow="md" className="hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {yogaClass.title}
          </h3>
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${yogaClass.level === 'beginner' ? 'bg-green-100 text-green-800' :
              yogaClass.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}
          `}>
            {yogaClass.level}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          {yogaClass.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {yogaClass.duration}
            </span>
            <span className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1" />
              {yogaClass.capacity}
            </span>
          </div>
          
          <Button 
            size="sm" 
            onClick={() => onBook?.(yogaClass.id)}
            disabled={yogaClass.isFull}
          >
            {yogaClass.isFull ? 'Full' : 'Book'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

#### Therapy Cards
```typescript
const TherapyCard: React.FC<TherapyCardProps> = ({ therapy, onBook }) => {
  return (
    <Card shadow="md" className="hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {therapy.name}
          </h3>
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${therapy.type === 'massage' ? 'bg-secondary-100 text-secondary-800' :
              therapy.type === 'reiki' ? 'bg-purple-100 text-purple-800' :
              'bg-accent-100 text-accent-800'}
          `}>
            {therapy.type}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          {therapy.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {therapy.duration}
            </span>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onBook?.(therapy.id)}
          >
            Reserve
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

## Usage Examples

### Creating a New Landing Page
```typescript
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero
        title="Bienvenido a Arunachala Yoga"
        subtitle="Encuentra tu equilibrio interior a través del yoga y las terapias holísticas"
        backgroundImage="/images/yoga-studio.jpg"
        primaryAction={{
          text: "Comenzar Ahora",
          onClick: () => navigate('/booking')
        }}
        secondaryAction={{
          text: "Ver Clases",
          onClick: () => navigate('/yoga')
        }}
      />
      
      <Container>
        <Grid cols={3}>
          <YogaClassCard class={beginnerYoga} />
          <YogaClassCard class={intermediateYoga} />
          <YogaClassCard class={advancedYoga} />
        </Grid>
      </Container>
    </div>
  );
};
```

### Creating a Booking Flow
```typescript
const BookingPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'yoga' | 'therapy'>('yoga');
  
  return (
    <PageTransition>
      <Container>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Reserva tu Experiencia
          </h1>
          <div className="flex justify-center space-x-4">
            <Button
              variant={selectedType === 'yoga' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('yoga')}
            >
              Clases de Yoga
            </Button>
            <Button
              variant={selectedType === 'therapy' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('therapy')}
            >
              Terapias
            </Button>
          </div>
        </div>
        
        <Grid cols={2}>
          {selectedType === 'yoga' ? (
            <>
              <YogaClassCard class={yogaClass1} />
              <YogaClassCard class={yogaClass2} />
            </>
          ) : (
            <>
              <TherapyCard therapy={therapy1} />
              <TherapyCard therapy={therapy2} />
            </>
          )}
        </Grid>
      </Container>
    </PageTransition>
  );
};
```

## Integration with Other Skills

### With react-developer
- Use these design patterns with react-developer skill
- Ensure components follow TypeScript patterns
- Combine design tokens with component logic

### With booking-system
- Apply these design patterns to booking interfaces
- Use consistent styling for class/therapy cards
- Ensure responsive design for booking flows

### With ai-content
- Use design patterns for displaying AI-generated content
- Apply consistent styling to mantras and articles
- Ensure proper typography for readability

## Best Practices

### Design System Usage
1. **Always use CSS variables**: Never hardcode colors/sizes
2. **Mobile-first approach**: Start with mobile, enhance for desktop
3. **Consistent spacing**: Use the spacing scale
4. **Accessibility first**: Include ARIA labels, focus management
5. **Performance optimized**: Use Tailwind's PurgeCSS features

### Component Development
1. **TypeScript interfaces**: Always define Props interfaces
2. **Consistent variants**: Use similar patterns for all components
3. **Responsive defaults**: Make mobile as baseline
4. **Animation subtlety**: Keep animations minimal and meaningful
5. **Dark mode ready**: Design for future dark theme support

### Typography Guidelines
1. **Readability priority**: Use Inter for UI, Crimson for content
2. **Consistent scale**: Follow the defined type scale
3. **Proper line heights**: Use defined leading values
4. **Color contrast**: Ensure WCAG AA compliance
5. **Hierarchy clear**: Use size scale for information hierarchy

### Arunachala-Specific Patterns
1. **Yoga class cards**: Use serenity blue for primary actions
2. **Therapy cards**: Use warm earth tones with type indicators
3. **Booking flows**: Mobile-first with clear CTAs
4. **Wellness aesthetic**: Calm, peaceful design language
5. **In-studio focus**: Physical presence over online features