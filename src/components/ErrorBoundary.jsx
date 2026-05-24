import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props
      if (fallback) return fallback

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="text-fg font-semibold text-lg">该模块加载失败</p>
          <p className="text-fg-muted text-sm max-w-xs">
            {this.state.error?.message || '发生了一个意外错误'}
          </p>
          <button
            className="btn-primary mt-2"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
