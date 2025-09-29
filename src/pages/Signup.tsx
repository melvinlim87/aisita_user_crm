import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { META_TEXT_GRADIENT } from '../constants';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await signup(name, email, password);
        navigate('/dashboard');
      } catch (error) {
        console.error('Signup failed:', error);
        setErrors({
          email: 'This email may already be in use'
        });
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
          <h1 className={`text-2xl font-bold mt-2 ${META_TEXT_GRADIENT}`}>
            Decyphers
          </h1>
          <p className="text-gray-400 mt-1">
            AI-Powered Financial Chart Analyser
          </p>
        </div>
        
        <Card variant="elevated" className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Create your account
          </h2>
          
          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              type="text"
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              icon={<User className="w-4 h-4" />}
              autoComplete="name"
            />
            
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
              autoComplete="new-password"
            />
            
            <Input
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />
            
            <div className="flex items-center mb-4">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 rounded bg-[#25252d] border-[#3a3a45] text-[#94a3b8] focus:ring-[#94a3b8] focus:ring-offset-[#1a1a20]"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign up
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#94a3b8] hover:text-[#cbd5e1]">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;