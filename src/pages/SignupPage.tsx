import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      setLoading(true);
      setUserEmail(email);
      
      // Use the signUp method from AuthContext
      const { needsConfirmation } = await signUp(email, password, 'Admin User');
      
      if (needsConfirmation) {
        setShowConfirmation(true);
        toast.success('Account created! Please check your email to confirm.');
      } else {
        // Directly confirmed (rare case)
        toast.success('Account created and confirmed!');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
            <div className="mb-8 text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h1 className="mb-2 text-2xl font-bold text-white">Check Your Email</h1>
              <p className="text-gray-400">
                We've sent a confirmation link to:
              </p>
              <p className="text-primary-500 font-semibold mt-1">{userEmail}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 mb-2">
                Please check your email and click the confirmation link to activate your account.
              </p>
              <p className="text-sm text-gray-400">
                Note: The link will expire in 24 hours.
              </p>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary w-full"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Create another account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-primary-500">CLIKA</h1>
            <p className="text-sm text-gray-400">Create Admin Account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="email" className="label mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input"
                placeholder="Enter a strong password"
                minLength={8}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-400">Already have an account? </span>
              <Link
                to="/login"
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}