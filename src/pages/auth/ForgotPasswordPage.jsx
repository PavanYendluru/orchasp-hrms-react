import { useNavigate  } from 'react-router-dom';
import { AuthLayout  } from '../../components/layouts/AuthLayout';
import { Button  } from '../../components/ui/Button';
import { FormField  } from '../../components/ui/Input';
import { useFormWithYup  } from '../../components/forms/Form';
import * as yup from 'yup';
import { toast  } from 'sonner';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useFormWithYup(schema);

  const onSubmit = () => {
    toast.success('Reset code sent to your email');
    navigate('/otp');
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email to receive a reset code">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} className="input-base" placeholder="you@company.com" />
        </FormField>
        <Button type="submit" size="lg" className="w-full">Send Reset Code</Button>
        <p className="text-center text-sm text-muted-foreground">
          <button onClick={() => navigate('/login')} className="font-medium text-primary hover:underline">Back to sign in</button>
        </p>
      </form>
    </AuthLayout>
  );
}
