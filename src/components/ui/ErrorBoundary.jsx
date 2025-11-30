import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Global Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1c1917] text-white p-6 text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-amber-500" size={32} />
            </div>
            
            <h2 className="text-xl font-serif font-bold mb-3 text-white">
              Мастерская обновляется
            </h2>
            
            <p className="text-stone-400 text-sm mb-8 leading-relaxed">
              Произошла небольшая ошибка. Мы уже знаем о ней. Пожалуйста, перезагрузите страницу.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-amber-500 shadow-lg shadow-amber-600/20"
            >
              <RefreshCw size={18} />
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
