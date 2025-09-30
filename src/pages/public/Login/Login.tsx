import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart2, Mail, Lock } from 'lucide-react';
import type { LoginResponse } from '@/types/common/useAuth';
import { saveAuthData } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { META_TEXT_GRADIENT } from '@/constants';
import { getRequest, postRequest } from '@services/apiRequest';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();

  // Check if user is already authenticated and redirect
  // useEffect(() => {
  //   if (!authLoading && isAuthenticated) {
  //     navigate('/dashboard');
  //   }
  // }, [isAuthenticated, authLoading, navigate]);

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    if (rememberedPassword) {
      setPassword(rememberedPassword);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = t('Validation_EmailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('Validation_EmailInvalid');
      isValid = false;
    }

    if (!password) {
      newErrors.password = t('Validation_PasswordRequired');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const loginResponse = await postRequest<LoginResponse>('/login', {
          email,
          password
        }, { withCredentials: false });
        
        if (loginResponse) {
          // Handle remember me functionality
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberedPassword', password);
          } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
          }

          saveAuthData({
            token: loginResponse.access_token,
            user: loginResponse.user,
            type: loginResponse.token_type
          }, rememberMe);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({
          email: t('InvalidEmailOrPassword')
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a20] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center">
            <BarChart2 className={`w-10 h-10 ${META_TEXT_GRADIENT}`} />
          </Link>
          <Link to="https://decyphers.com" className="inline-flex items-center justify-center">
            <img src="/assets/images/logo/decyphers-logo.png" alt="Decyphers" className="w-full bg-transparent" />
          </Link>
          {/* <h1 className={`text-2xl font-bold mt-2 ${META_TEXT_GRADIENT}`}>
            Decyphers
          </h1> */}
          <p className="text-gray-400 mt-1">
            {t('LoginTagline')}
          </p>
        </div>
        
        <Card variant="elevated" className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {t('LoginTitle')}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <Input
              label={t('Email')}
              type="email"
              id="email"
              placeholder={t('PlaceholderEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            
            <Input
              label={t('Password')}
              type="password"
              id="password"
              placeholder={t('PlaceholderPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
            />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded bg-[#25252d] border-[#3a3a45] text-[#94a3b8] focus:ring-[#94a3b8] focus:ring-offset-[#1a1a20]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                  {t('RememberMe')}
                </label>
              </div>
              
              <Link to="/forgot-password" className="text-sm text-[#94a3b8] hover:text-[#cbd5e1]">
                {t('ForgotPassword')}
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              {t('SignIn')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {t("DontHaveAccount")} {' '}
              <Link to="/signup" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                {t('SignUpLink')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;