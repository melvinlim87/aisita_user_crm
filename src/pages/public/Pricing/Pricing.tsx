import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Shield, BarChart2, Bot, LineChart, ArrowRight } from 'lucide-react';
//import Footer from '@components/common/Footer';
import Button from '@components/common/Button';
import { VerticalCircuitLines } from '@components/common/VerticalCircuitLines';
import { META_TEXT_GRADIENT, META_GRADIENT } from '@/constants';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started with AI chart analysis",
      features: [
        "5 chart analyses per month",
        "Basic pattern recognition",
        "Standard response time",
        "Community support",
        "Email support"
      ]
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "Advanced features for serious traders",
      popular: true,
      features: [
        "Unlimited chart analyses",
        "Advanced pattern recognition",
        "Priority response time",
        "Premium indicators",
        "API access",
        "Priority support",
        "Custom alerts"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Custom solutions for organizations",
      features: [
        "Custom integration",
        "Dedicated support team",
        "SLA guarantees",
        "Advanced API features",
        "White-label options",
        "Custom ML models",
        "24/7 phone support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#e2e8f0]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${META_TEXT_GRADIENT}`}>
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-4">
              Choose the perfect plan for your trading needs
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`
                  relative bg-[#15120c] rounded-lg p-8
                  ${plan.popular ? 'glow-border transform hover:scale-105' : 'border border-[#3a2a15] hover:border-[#94a3b8]'}
                  transition-all duration-300
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className={`${META_GRADIENT} text-gray-900 text-sm font-medium px-3 py-1 rounded-full`}>
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-[#94a3b8] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full"
                  onClick={() => navigate('/signup')}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credits Section */}
      <section className="py-16 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Top Up Credits
            </h2>
            <p className="text-lg text-gray-300">
              Purchase additional analysis credits for your account
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                credits: "100",
                price: "$29",
                perCredit: "$0.29/credit",
                popular: false
              },
              {
                credits: "500",
                price: "$119",
                perCredit: "$0.24/credit",
                popular: false
              },
              {
                credits: "1000",
                price: "$199",
                perCredit: "$0.20/credit",
                popular: true,
                savings: "Save 31%"
              },
              {
                credits: "2500",
                price: "$399",
                perCredit: "$0.16/credit",
                popular: false,
                savings: "Save 45%"
              }
            ].map((pack, index) => (
              <div 
                key={index}
                className={`
                  relative bg-[#15120c] rounded-lg p-6 text-center
                  ${pack.popular ? 'glow-border transform hover:scale-105' : 'border border-[#3a2a15] hover:border-[#94a3b8]'}
                  transition-all duration-300
                `}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className={`${META_GRADIENT} text-gray-900 text-xs font-medium px-2 py-0.5 rounded-full`}>
                      Best Value
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-1">
                    {pack.credits} Credits
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {pack.price}
                  </div>
                  <div className="text-sm text-gray-400">
                    {pack.perCredit}
                  </div>
                  {pack.savings && (
                    <div className="text-sm text-emerald-400 mt-1">
                      {pack.savings}
                    </div>
                  )}
                </div>
                
                <Button
                  variant={pack.popular ? "primary" : "secondary"}
                  className="w-full"
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Purchase
                </Button>
              </div>
            ))}
          </div>
          
          <div className="max-w-2xl mx-auto mt-12 bg-[#15120c] rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 ${META_GRADIENT} rounded-lg flex-shrink-0 flex items-center justify-center`}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">How Credits Work</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• 1 credit = 1 detailed chart analysis</li>
                  <li>• Credits never expire</li>
                  <li>• Bulk purchases offer better value</li>
                  <li>• Additional features included with Pro/Enterprise plans</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Every Plan Includes
            </h2>
            <p className="text-lg text-gray-300">
              Core features available across all plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Bot className="w-6 h-6" />,
                title: "AI-Powered Analysis",
                description: "Advanced pattern recognition and technical analysis powered by machine learning"
              },
              {
                icon: <LineChart className="w-6 h-6" />,
                title: "Multiple Chart Types",
                description: "Support for candlestick, line, and bar charts with various timeframes"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure Storage",
                description: "Enterprise-grade security for your charts and analysis history"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 ${META_GRADIENT} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-300">
              Common questions about our pricing and plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans."
              },
              {
                question: "Is there a long-term contract?",
                answer: "No, all plans are month-to-month with no long-term commitment required."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-[#15120c] rounded-lg p-6 glow-border">
                <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#15120c] overflow-hidden">
            <div className="relative p-8 md:p-12">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.pexels.com/photos/6771985/pexels-photo-6771985.jpeg')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#15120c]/80 to-[#15120c]"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Choose your plan and start analyzing charts with AI today.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/signup')}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
};

export default Pricing;