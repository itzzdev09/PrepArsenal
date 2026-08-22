'use client'

import { use } from 'react'
import { login, signup } from './actions'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const unwrappedSearchParams = use(searchParams);

  return (
    <div className="login-container">
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
                      radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.1) 0%, transparent 40%);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          background: rgba(10, 14, 26, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-logo {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .login-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .login-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .auth-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 2rem;
        }
        .error-message {
          padding: 0.75rem;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          border-radius: 0.5rem;
          color: var(--error);
          font-size: 0.85rem;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 2rem;
          font-size: 0.85rem;
          color: var(--text-tertiary);
          text-decoration: none;
          transition: color 150ms;
        }
        .back-link:hover {
          color: var(--text-secondary);
        }
      `}</style>

      <div>
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">⚔️</div>
            <h1 className="login-title">Welcome to PrepArsenal</h1>
            <p className="login-subtitle">Sign in to sync your progress and track your prep.</p>
          </div>

          {unwrappedSearchParams?.message && (
            <div className="error-message">
              {unwrappedSearchParams.message}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              form="login-form"
              placeholder="you@example.com"
              required
              style={{ width: '100%' }}
            />
            {/* Hidden input to share state with the second form */}
            <input type="hidden" name="email" form="signup-form" value="" />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              form="login-form"
              placeholder="••••••••"
              required
              style={{ width: '100%' }}
            />
            {/* Hidden input to share state with the second form */}
            <input type="hidden" name="password" form="signup-form" value="" />
          </div>

          <div className="auth-actions">
            <form id="login-form" action={login} style={{ width: '100%' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={(e) => {
                  const form = e.currentTarget.form;
                  if (!form?.checkValidity()) {
                    form?.reportValidity();
                    e.preventDefault();
                  }
                }}
              >
                Sign In
              </button>
            </form>
            
            <form id="signup-form" action={signup} style={{ width: '100%' }}>
              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={(e) => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passInput = document.getElementById('password') as HTMLInputElement;
                  if (!emailInput.checkValidity() || !passInput.checkValidity()) {
                    emailInput.reportValidity();
                    e.preventDefault();
                    return;
                  }
                  const form = e.currentTarget.form;
                  if (form) {
                    (form.elements.namedItem('email') as HTMLInputElement).value = emailInput.value;
                    (form.elements.namedItem('password') as HTMLInputElement).value = passInput.value;
                  }
                }}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
