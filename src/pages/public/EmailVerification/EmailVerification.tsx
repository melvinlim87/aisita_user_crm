import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Loader2, BarChart2 } from 'lucide-react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { META_TEXT_GRADIENT } from '@/constants';
import { postRequest } from '@/services/apiRequest';

interface VerificationResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
    email_verified_at: string;
  };
}

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setIsVerifying(false);
      setVerificationResult({
        success: false,
        message: 'Invalid verification link. No token provided.'
      });
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsVerifying(true);
      
      // Decode the base64 encoded email
      const decodedEmail = atob(verificationToken);
      
      const response = await postRequest<VerificationResponse>('/verify-email', {
        email: decodedEmail,
        token: verificationToken
      });

      if (response && response.success) {
        setVerificationResult({
          success: true,
          message: response.message || 'Email verified successfully!',
          email: response.user?.email || decodedEmail
        });
      } else {
        setVerificationResult({
          success: false,
          message: response?.message || 'Email verification failed. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Email verification failed. Please try again.';
      
      setVerificationResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationResult?.email) return;
    
    try {
      await postRequest('/resend-verification', {
        email: verificationResult.email
      });
      
      setVerificationResult({
        success: false,
        message: 'Verification email has been resent. Please check your inbox.'
      });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setVerificationResult({
        success: false,
        message: 'Failed to resend verification email. Please try again later.'
      });
    }
  };

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
                Verifying Email
              </h1>
              <p className="text-gray-400">
                Please wait while we verify your email address...
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
            <p className="text-gray-400">
              Advanced AI-powered trading analysis
            </p>
          </div>

          <div className="text-center">
            {verificationResult?.success ? (
              <>
                {/* Success State */}
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-green-400 mb-4">
                  Email Verified!
                </h2>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-gray-300 text-sm mb-2">
                    {verificationResult.message}
                  </p>
                  {verificationResult.email && (
                    <p className="text-white font-medium">
                      {verificationResult.email}
                    </p>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Your account has been successfully verified. You can now log in and start using Decypher AI.
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
            ) : (
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
                    {verificationResult?.message || 'Something went wrong during email verification.'}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {verificationResult?.email && (
                    <Button
                      onClick={handleResendVerification}
                      variant="secondary"
                      fullWidth
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </Button>
                  )}
                  
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
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
