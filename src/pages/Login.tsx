import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { META_TEXT_GRADIENT } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({
          email: 'Invalid email or password'
        });
      }
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#000000] to-[#111111] flex items-center justify-center p-4">
      {/* subtle gold glow overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.10),_transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(184,115,51,0.08),_transparent_60%)]"></div>
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center">
            <BarChart2 className={`w-10 h-10 ${META_TEXT_GRADIENT}`} />
          </Link>
          <h1 className={`text-2xl font-bold mt-2 ${META_TEXT_GRADIENT}`}>
            AISITA
          </h1>
          <p className="text-gray-400 mt-1">
            AI-Powered Financial Chart Analyser
          </p>
        </div>
        
        <Card variant="elevated" className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Log in to your account
          </h2>
          
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            
            <Input
              label="Password"
              type="password"
              id="password"
              placeholder="••••••••"
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
                  className="h-4 w-4 rounded bg-[#25252d] border-[#3a3a45] text-[#94a3b8] focus:ring-[#94a3b8] focus:ring-offset-[#1a1a20]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              
              <Link to="/forgot-password" className="text-sm text-[#94a3b8] hover:text-[#cbd5e1]">
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;