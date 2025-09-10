import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@services/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();
  const password = watch('password');

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsValidToken(false);
        toast.error('Invalid or expired reset link');
      }
    });
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      
      // Sign out to ensure clean login with new password
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
            <svg className="mx-auto mb-4 h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mb-2 text-xl font-bold text-white">Invalid Reset Link</h2>
            <p className="mb-6 text-gray-400">
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn btn-primary"
            >
              Request a new link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-primary-500">CLIKA</h1>
            <p className="text-sm text-gray-400">Create a new password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="password" className="label mb-2">
                New Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message: 'Password must contain uppercase, lowercase and numbers'
                  }
                })}
                type="password"
                id="password"
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label mb-2">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type="password"
                id="confirmPassword"
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="rounded-lg bg-gray-800 p-4 text-sm text-gray-300">
              <p className="font-medium mb-2">Password requirements:</p>
              <ul className="space-y-1 text-xs">
                <li className={password?.length >= 8 ? 'text-green-400' : 'text-gray-400'}>
                  • At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password || '') ? 'text-green-400' : 'text-gray-400'}>
                  • One uppercase letter
                </li>
                <li className={/[a-z]/.test(password || '') ? 'text-green-400' : 'text-gray-400'}>
                  • One lowercase letter
                </li>
                <li className={/\d/.test(password || '') ? 'text-green-400' : 'text-gray-400'}>
                  • One number
                </li>
              </ul>
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
                  Updating password...
                </span>
              ) : (
                'Update password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}