import { useState } from 'react';
import type { User } from '../../hooks/useUsers';

interface UserFormProps {
  initialValues?: User | null;
  onSubmit: (values: Partial<User>) => void | Promise<void>;
  onCancel: () => void;
}

export function UserForm({ initialValues, onSubmit, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState({
    display_name: initialValues?.display_name || '',
    role: initialValues?.role || 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display Name */}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-1">
          Display Name
        </label>
        <input
          type="text"
          id="display_name"
          value={values.display_name}
          onChange={(e) => setValues({ ...values, display_name: e.target.value })}
          className="input w-full"
          placeholder="John Doe"
          required
        />
      </div>


      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
          Role
        </label>
        <select
          id="role"
          value={values.role}
          onChange={(e) => setValues({ ...values, role: e.target.value })}
          className="input w-full"
        >
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {values.role === 'admin' && 'Full system access'}
          {values.role === 'editor' && 'Can manage content and campaigns'}
          {values.role === 'reviewer' && 'Can review and approve content'}
          {values.role === 'user' && 'View-only access'}
        </p>
      </div>


      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : `${initialValues ? 'Update User' : 'Create User'}`}
        </button>
      </div>
    </form>
  );
}