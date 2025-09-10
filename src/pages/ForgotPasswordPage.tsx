import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@services/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-primary-500">CLIKA</h1>
            <p className="text-sm text-gray-400">
              {emailSent ? 'Check your email' : 'Reset your password'}
            </p>
          </div>

          {emailSent ? (
            <div className="text-center">
              <svg className="mx-auto mb-4 h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mb-6 text-gray-300">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Link
                to="/login"
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="label mb-2">
                    Email address
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    id="email"
                    className="input"
                    placeholder="admin@clika.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending reset email...
                    </span>
                  ) : (
                    'Send reset email'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}