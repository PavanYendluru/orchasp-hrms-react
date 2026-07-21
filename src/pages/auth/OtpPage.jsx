/** Verifies the one-time passcode during password recovery. */
import { useRef, useState  } from 'react';
import { useNavigate  } from 'react-router-dom';
import { AuthLayout  } from '../../components/layouts/AuthLayout';
import { Button  } from '../../components/ui/Button';
import { toast  } from 'sonner';

export function OtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);

  const handleChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[i] = value;
    setOtp(next);
    if (value && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, event) => {
    if (event.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onSubmit = () => {
    if (otp.join('').length === 6) {
      toast.success('Code verified');
      navigate('/reset-password');
    } else {
      toast.error('Enter all 6 digits');
    }
  };

  return (
    <AuthLayout title="Verify your identity" subtitle="Enter the 6-digit code sent to your email">
      <div className="space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              maxLength={1}
              className="h-14 w-12 rounded-lg border border-input bg-card text-center font-display text-xl font-bold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              inputMode="numeric"
            />
          ))}
        </div>
        <Button size="lg" className="w-full" onClick={onSubmit}>Verify Code</Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn't receive a code? <button className="font-medium text-primary hover:underline" onClick={() => toast.info('Code resent')}>Resend</button>
        </p>
      </div>
    </AuthLayout>
  );
}
