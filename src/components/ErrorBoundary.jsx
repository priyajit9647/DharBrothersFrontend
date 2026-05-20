import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console - replace with reporting service if available
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught error', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Something went wrong loading this page.</Typography>
          {this.state.error?.message && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{String(this.state.error.message)}</Typography>
          )}
          <Button variant="contained" onClick={this.handleReload}>Reload</Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
