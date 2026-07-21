/** Catches render failures and presents a recoverable application error state. */
import { Component } from 'react';
import { ErrorState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Page failed to load"
          description="Something broke while rendering this page."
          action={
            <Button onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}
