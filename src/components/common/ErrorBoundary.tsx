import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallbackPage onGoHome={this.handleGoHome} />
        )
      );
    }

    return this.props.children;
  }
}

/** Ultra luxe 404-style error page with mirror effects */
const ErrorFallbackPage: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => (
  <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#030014] via-[#0a0020] to-[#0e0030] text-white">
    {/* Mirror reflections */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-violet-500/[0.05] to-transparent" />
    </div>

    {/* Glow orbs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[180px] animate-pulseGlow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/15 rounded-full blur-[160px] animate-pulseGlow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[200px]" />
    </div>

    {/* Particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-gradient-to-br from-violet-400/50 to-fuchsia-500/40 blur-[1px] animate-particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 6 + 3}px`,
            height: `${Math.random() * 6 + 3}px`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>

    <div className="relative z-10 text-center px-6">
      {/* Glass mirror card */}
      <div className="relative p-12 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_100px_-20px_rgba(139,92,246,0.3)]">
        {/* Top mirror shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent rounded-t-3xl pointer-events-none" />

        <h1 className="text-[7rem] md:text-[10rem] font-black tracking-widest bg-gradient-to-br from-violet-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_10px_50px_rgba(168,85,247,0.6)] select-none mb-4 leading-none">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent mb-4">
          Page introuvable
        </h2>

        <p className="text-white/50 max-w-md mx-auto mb-10 leading-relaxed">
          Cette page semble s'être perdue dans une autre dimension.
          Retournez à l'accueil pour continuer votre expérience.
        </p>

        <button
          onClick={onGoHome}
          className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
        >
          {/* Button mirror bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl" />
          <div className="absolute inset-[1px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-2xl" />
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl" />
          
          <span className="relative z-10 text-white font-bold text-lg">⟵ Retour à l'accueil</span>
        </button>
      </div>
    </div>
  </div>
);
