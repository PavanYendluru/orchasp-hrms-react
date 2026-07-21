/** Collects credentials and starts the application's mock login flow. */
import { useState  } from 'react';
import { useNavigate  } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { AuthLayout  } from '../../components/layouts/AuthLayout';
import { Button  } from '../../components/ui/Button';
import { FormField  } from '../../components/ui/Input';
import { useFormWithYup  } from '../../components/forms/Form';
import { useAuth  } from '../../context/AuthContext';
import * as yup from 'yup';
import { toast  } from 'sonner';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Min 6 characters'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useFormWithYup(schema);

  const onSubmit = (data) => {
    login(data.email);
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Orchasp HRMS account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} className="input-base" placeholder="you@company.com" />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} {...register('password')} className="input-base pr-10" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <VisibilityOffOutlinedIcon className="h-4 w-4" /> : <VisibilityOutlinedIcon className="h-4 w-4" />}
            </button>
          </div>
        </FormField>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="rounded border-border" /> Remember me</label>
          <button type="button" onClick={() => navigate('/forgot-password')} className="font-medium text-primary hover:underline">Forgot password?</button>
        </div>
        <Button type="submit" size="lg" className="w-full">Sign In</Button>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <button onClick={() => navigate('/forgot-password')} className="font-medium text-primary hover:underline">Contact admin</button>
        </p>
      </form>
    </AuthLayout>
  );
}
