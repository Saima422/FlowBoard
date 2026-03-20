import { ThemeToggle } from '@/components/common/ThemeToggle';
import { AuthArtwork } from './AuthArtwork';
import './Auth.scss';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      {/* Glow blobs at page level so they span both panels */}
      <div className="art-glow art-glow-1" />
      <div className="art-glow art-glow-2" />
      <div className="art-glow art-glow-3" />
      <div className="art-glow art-glow-4" />
      <div className="art-glow art-glow-5" />
      <div className="art-glow art-glow-6" />

      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-theme-toggle-wrap">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </div>
      <div className="auth-right">
        <AuthArtwork />
      </div>
    </div>
  );
}
