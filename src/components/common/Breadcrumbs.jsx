/** Renders the hierarchical navigation trail for the current page. */
import { Fragment  } from 'react';
import { Link  } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';

export function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/dashboard" className="flex items-center gap-1 transition-colors hover:text-foreground">
        <HomeIcon className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => (
        <Fragment key={i}>
          <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
          {item.path && i < items.length - 1 ? (
            <Link to={item.path} className="transition-colors hover:text-foreground">{item.label}</Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
