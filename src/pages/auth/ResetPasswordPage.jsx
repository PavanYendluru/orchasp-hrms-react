import { useNavigate  } from 'react-router-dom';
import { AuthLayout  } from '../../components/layouts/AuthLayout';
import { Button  } from '../../components/ui/Button';
import { FormField  } from '../../components/ui/Input';
import { useFormWithYup  } from '../../components/forms/Form';
import * as yup from 'yup';
import { toast  } from 'sonner';

const schema = yup.object({
  password: yup.string().required('Password is required').min(8, 'Min 8 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm your password'),
});

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useFormWithYup(schema);

  const onSubmit = () => {
    toast.success('Password reset successfully');
    navigate('/login');
  };

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="New Password" error={errors.password?.message}>
          <input type="password" {...register('password')} className="input-base" placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
          <input type="password" {...register('confirmPassword')} className="input-base" placeholder="••••••••" />
        </FormField>
        <Button type="submit" size="lg" className="w-full">Reset Password</Button>
      </form>
    </AuthLayout>
  );
}
