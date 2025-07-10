// 🎨 AgenticVoice Admin Design System Components

// Re-export components from the central UI library for use in the admin panel.

// Components with default exports are re-exported as named exports.
export { default as Button } from './Button';
export { default as LoadingSpinner } from '@/components/ui/LoadingSpinner';
export { default as Modal } from '@/components/ui/Modal';

// Components with named exports are re-exported directly.
// Based on file analysis, Card, Badge, and Input likely use named exports.
export { Badge, badgeVariants } from './Badge';
export { default as Card, CardHeader, CardContent, CardFooter } from './Card';
export { default as Input } from './Input';

// Typography and related text components from the local admin UI folder.
export { default as Typography, Heading, Text, Caption, Code } from './Typography';
export * from './Table';
export * from './Alert';
export * from './Skeleton';
export * from './dialog';
