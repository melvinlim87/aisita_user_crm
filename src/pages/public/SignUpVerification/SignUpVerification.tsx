import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BarChart2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { META_TEXT_GRADIENT } from '@/constants';
import { postRequest } from '@/services/apiRequest';

interface VerifySignupResponse {
  success: boolean;
  message: string;
}

const SignUpVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [code, setCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    const emailParam = searchParams.get('email');

    setCode(codeParam);
    setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    const verifySignup = async () => {
        if (!code || !email) {
            return;
        }

        try {
            setIsVerifying(true);
            
            const response = await postRequest<VerifySignupResponse>('/verify-signup', {
                code,
                email,
            });

            if (response && response.success) {
                setVerificationResult({
                    success: true,
                    message: response.message || 'Email verified successfully!'
                });
            } else {
                setVerificationResult({
                    success: false,
                    message: response?.message || 'Verification failed. Please try again.'
                });
            }
        } catch (error: any) {
            console.error('Error verifying signup:', error);
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Verification failed. Please try again.';
            
            setVerificationResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setIsVerifying(false);
        }
    }

    if (code && email) {
        verifySignup();
    }
  }, [code, email]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${META_TEXT_GRADIENT}`}>
                Verifying Account
              </h1>
              <p className="text-gray-400">
                Please wait while we verify your account...
              </p>
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
              Decypher AI
            </h1>
            <p className="text-gray-400">Account Verification</p>
          </div>

          <div className="text-center">
            {verificationResult?.success ? (
              <>
                {/* Success State */}
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-green-400 mb-4">
                  Account Verified!
                </h2>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-gray-300 text-sm mb-2">
                    {verificationResult.message}
                  </p>
                  {email && (
                    <p className="text-white font-medium">
                      {email}
                    </p>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Your account has been successfully verified. You received 2000 free tokens to get started!
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  variant="primary"
                  fullWidth
                  className="mb-4"
                >
                  Go to Login
                </Button>
              </>
            ) : verificationResult ? (
              <>
                {/* Error State */}
                <div className="flex items-center justify-center mb-4">
                  <XCircle className="w-16 h-16 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-400 mb-4">
                  Verification Failed
                </h2>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <p className="text-gray-300 text-sm">
                    {verificationResult.message}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link to="/signup">
                    <Button variant="outline" fullWidth>
                      Back to Sign Up
                    </Button>
                  </Link>
                  
                  <Link to="/login">
                    <Button variant="outline" fullWidth>
                      Try Login Instead
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Initial State - No code/email in URL */}
                <div className="space-y-4">
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="text-white break-all">{email ?? 'Not found in URL'}</p>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Verification Code</p>
                    <p className="text-white break-all">{code ?? 'Not found in URL'}</p>
                  </div>

                  <div className="pt-2 space-y-3">
                    <Link to="/signup">
                      <Button variant="outline" fullWidth>
                        Back to Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUpVerification;