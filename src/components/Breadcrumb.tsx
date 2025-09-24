import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items: customItems,
  className
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if not provided
  const items = customItems || generateBreadcrumbsFromPath(location.pathname);

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.current || !item.href ? (
            <span className="text-foreground font-medium">
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    // Convert segment to readable label
    let label = segment
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    // Handle special cases
    if (segment === 'trending') label = 'Trending';
    if (segment === 'artists') label = 'Artists';
    if (segment === 'search') label = 'Search Results';
    if (segment === 'dashboard') label = 'Dashboard';
    
    items.push({
      label,
      href: isLast ? undefined : href,
      current: isLast
    });
  });
  
  return items;
}

export default Breadcrumb;