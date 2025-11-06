import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 전역 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하고 폴백 UI를 표시합니다.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 폴백 UI를 표시하도록 상태 업데이트
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 정보를 상태에 저장
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅 (개발 환경)
    if (import.meta.env.DEV) {
      console.group('🔴 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // 프로덕션 환경에서는 에러 리포팅 서비스로 전송
    // 예: Sentry, LogRocket 등
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                문제가 발생했습니다
              </h1>
              <p className="text-muted-foreground">
                애플리케이션에서 예상치 못한 오류가 발생했습니다.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  에러 정보 (개발 모드):
                </p>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground">
                      컴포넌트 스택 보기
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
              <Button
                onClick={this.handleReload}
                className="flex-1"
              >
                페이지 새로고침
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              문제가 계속되면 관리자에게 문의하세요.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
