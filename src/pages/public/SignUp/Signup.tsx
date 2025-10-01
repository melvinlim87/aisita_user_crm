import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { META_TEXT_GRADIENT } from '@/constants';
import { postRequest } from '@/services/apiRequest';
import { FRONTEND_URL } from '@/config';
import { useTranslation } from 'react-i18next';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('')
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string;
    confirmPassword?: string;
    referralCode?: string;
  }>({});
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const { isLoading } = useAuth();
  const { t } = useTranslation();

  // when load the page, check if got referral code passed, if so, set it to state 
  useEffect(() => {
    const referralCode = new URLSearchParams(window.location.search).get('referral_code');
    if (referralCode) {
      setReferralCode(referralCode);
    }
  }, [])

  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string;
      confirmPassword?: string;
      referralCode?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = t('Validation_NameRequired');
      isValid = false;
    }

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
    } else if (password.length < 6) {
      newErrors.password = t('Validation_PasswordMinLength');
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('Validation_PasswordsDoNotMatch');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    if (validateForm()) {
      try {
        // Define the expected response structure based on the actual API response
        interface RegisterResponse {
          access_token: string;
          token_type: string;
          user_id: number;
          email: string;
          name: string;
          referral_code: string;
          shareable_link: string;
          referral_applied: string | null;
          referral_message: string | null;
        }
        
        // Directly call the /register endpoint with the required structure
        let registerLink = '/register' 
        if (referralCode) {
          registerLink = `/register/${referralCode}`;
        }
        const response = await postRequest<RegisterResponse>(registerLink, {
          name,
          email,
          password,
          password_confirmation: password
        });
                
        // Handle successful registration
        if (response && response.access_token) {
          // Don't auto-login user, show verification message instead
          setUserEmail(response.email);
          setShowVerificationMessage(true);
        } else {
          console.warn('Unexpected response format:', response);
          throw new Error('Invalid response from server');
        }
      } catch (error: any) {
        console.error('Signup failed:', error);
        
        // Get detailed error information
        const errorResponse = error.response?.data;
        const errorStatus = error.response?.status;
        
        // Handle validation errors (typically 422 status code)
        if (errorStatus === 422 && errorResponse?.errors) {
          // Laravel validation errors come in a nested object format
          const validationErrors = errorResponse.errors;
          console.log('Validation errors:', validationErrors);
          if (validationErrors.email) {
            setErrors({ email: validationErrors.email[0] });
          } else if (validationErrors.password) {
            setErrors({ password: validationErrors.password[0] });
          } else if (validationErrors.name) {
            setErrors({ name: validationErrors.name[0] });
          } else if (validationErrors.referral_code) {
            setErrors({ referralCode: validationErrors.referral_code[0] });
          } else {
            // If there are validation errors but not for fields we explicitly check
            setErrors({ email: t('Error_CheckInfoTryAgain') });
          }
        } 
        // Handle other specific error cases
        else if (errorStatus === 409 || (errorResponse?.message && errorResponse.message.includes('already'))) {
          // Conflict - likely email already exists
          setErrors({ email: t('Error_EmailAlreadyRegistered') });
        } 
        else if (errorResponse?.message) {
          // General error with message
          setErrors({ email: errorResponse.message });
        } 
        else {
          // Fallback for network errors or unexpected issues
          setErrors({ email: t('Error_RegistrationFailed') });
        }
      }
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-12 h-12 text-green-400" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${META_TEXT_GRADIENT}`}>
                {t('CheckYourEmail')}
              </h1>
              <p className="text-gray-400">
                {t('VerificationSent')}
              </p>
            </div>
            
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-green-400 font-semibold mb-2">{t('RegistrationSuccessful')}</h3>
              <p className="text-gray-300 text-sm mb-3">
                {t('VerificationEmailSentTo')}
              </p>
              <p className="text-white font-medium mb-3">{userEmail}</p>
              <p className="text-gray-400 text-sm">
                {t('PleaseVerifyInstruction')}
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-400">
                {t('DidntReceiveEmailPrefix')} {' '}
                <button 
                  onClick={() => {
                    setShowVerificationMessage(false);
                    setUserEmail('');
                  }}
                  className="text-[#94a3b8] hover:text-[#cbd5e1] underline"
                >
                  {t('TryAgain')}
                </button>
              </p>
              
              <Link 
                to="/login" 
                className="inline-block w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-center"
              >
                {t('GoToLogin')}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BarChart2 className="w-8 h-8 text-[#94a3b8]" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${META_TEXT_GRADIENT}`}>
              {t('SignupBrand')}
            </h1>
            <p className="text-gray-400">
              {t('SignupTagline')}
            </p>
          </div>
          
          <h2 className="text-xl font-semibold mb-6 text-center">
            {t('SignupTitle')}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <Input
              label={t('Name')}
              type="text"
              id="name"
              placeholder={t('PlaceholderName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              icon={<User className="w-4 h-4" />}
              autoComplete="name"
            />
            
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
              autoComplete="new-password"
            />
            
            <Input
              label={t('ConfirmPassword')}
              type="password"
              id="confirmPassword"
              placeholder={t('PlaceholderPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />

            {/* Referral Code Field */}
            <Input
              label={t('ReferralCodeOptional')}
              type="text"
              id="referralCode"
              placeholder={t('PlaceholderReferralCode')}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              error={errors.referralCode}
              autoComplete="off"
            />
            
            <div className="flex items-center mb-4">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 rounded bg-[#15120c] border-[#3a2a15] text-[#94a3b8] focus:ring-[#94a3b8] focus:ring-offset-[#1a1a20]"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                {t('IAgreeTo')} {' '}
                <a href={`${FRONTEND_URL}/assets/documents/terms-conditions-refund-policy.pdf`} target="_blank" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                  {t('TermsOfService')}
                </a>
                {' '} {t('And')} {' '}
                <a href={`${FRONTEND_URL}/privacy-policy`} target="_blank" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                  {t('PrivacyPolicy')}
                </a>
              </label>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              {t('SignUpLink')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {t('AlreadyHaveAccount')} {' '}
              <Link to="/login" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                {t('SignInLink')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;