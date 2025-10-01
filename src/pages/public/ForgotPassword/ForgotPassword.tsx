import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Mail } from 'lucide-react';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { META_TEXT_GRADIENT } from '@/constants';
import { postRequest } from '@services/apiRequest';
import { useTranslation } from 'react-i18next';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const { t } = useTranslation();

  const validate = () => {
    if (!email) {
      setError(t('Validation_EmailRequired'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('Validation_EmailInvalid'));
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSuccessMessage(undefined);
    try {
      await postRequest('/reset-password', { email }, { withCredentials: false });
      setSuccessMessage(t('ForgotPassword_Success'));
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t('ForgotPassword_Error_Generic')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center">
            <BarChart2 className={`w-10 h-10 ${META_TEXT_GRADIENT}`} />
          </Link>
          <Link to="https://aisita.ai" className="inline-flex items-center justify-center">
            <img src="/assets/images/logo/decyphers-logo.png" alt="Decyphers" className="w-full bg-transparent" />
          </Link>
          <p className="text-gray-400 mt-1">{t('ForgotPasswordTagline')}</p>
        </div>

        <Card variant="elevated" className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">{t('ForgotPasswordTitle')}</h2>

          <form onSubmit={handleSubmit}>
            <Input
              label={t('Email')}
              type="email"
              id="email"
              placeholder={t('PlaceholderEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            {successMessage && (
              <div className="text-sm text-green-400 mb-4">{successMessage}</div>
            )}

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              {t('SendResetLink')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {t('RememberedYourPassword')} {' '}
              <Link to="/login" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                {t('BackToLogin')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
