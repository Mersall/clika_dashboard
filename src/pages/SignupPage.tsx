import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@services/supabase';
import toast from 'react-hot-toast';

export function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      setLoading(true);
      
      // Create user with admin role
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            display_name: 'Admin User'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        await supabase.from('user_profile').insert({
          user_id: data.user.id,
          display_name: 'Admin User',
          geo_consent: true,
          personalized_ads: true
        });

        toast.success('Admin account created! You can now login.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

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
                defaultValue="admin@clika.com"
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
                defaultValue="Admin123!"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: Admin123!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Create Admin Account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}