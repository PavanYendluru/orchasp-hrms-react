/** Groups reusable form fields and validation messages behind one context. */
import { useForm } from 'react-hook-form';
import { yupResolver  } from '@hookform/resolvers/yup';
export function useFormWithYup(schema, options) {
  return useForm({
    resolver: yupResolver(schema),
    ...options,
  });
}

export function FormFieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs font-medium text-danger">{error}</p>;
}

export function FormContainer({ children, onSubmit, className }) {
  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      {children}
    </form>
  );
}
