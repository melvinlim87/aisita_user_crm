import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Zap, Globe, BarChart2, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
//import Footer from '@components/common/Footer';
import Button from '@components/common/Button';
import { VerticalCircuitLines } from '@components/common/VerticalCircuitLines';
import { META_TEXT_GRADIENT, META_GRADIENT } from '@/constants';

const Partner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a20] text-[#e2e8f0]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${META_TEXT_GRADIENT}`}>
              Partner with Decyphers
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Join our partner ecosystem and help shape the future of AI-powered financial analysis
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/contact')}
            >
              Become a Partner
            </Button>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Partnership Programs
            </h2>
            <p className="text-lg text-gray-300">
              Choose the partnership type that best fits your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Building2 className="w-8 h-8" />,
                title: "Technology Partners",
                description: "Integrate our AI analysis capabilities into your trading platform or financial software.",
                features: [
                  "API access",
                  "Technical support",
                  "Custom integration",
                  "White-label options"
                ]
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Reseller Partners",
                description: "Offer Decyphers to your clients and earn competitive commissions.",
                features: [
                  "Competitive margins",
                  "Marketing support",
                  "Sales training",
                  "Partner portal access"
                ]
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Strategic Partners",
                description: "Build long-term value through deep collaboration and innovation.",
                features: [
                  "Joint development",
                  "Revenue sharing",
                  "Co-marketing",
                  "Executive support"
                ]
              }
            ].map((program, index) => (
              <div key={index} className="bg-[#25252d] rounded-lg p-8 glow-border">
                <div className={`w-16 h-16 rounded-xl ${META_GRADIENT} flex items-center justify-center mb-6`}>
                  {program.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{program.title}</h3>
                <p className="text-gray-400 mb-6">{program.description}</p>
                <ul className="space-y-3">
                  {program.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#94a3b8] mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  className="mt-8 w-full"
                  onClick={() => navigate('/contact')}
                >
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Partner Benefits
            </h2>
            <p className="text-lg text-gray-300">
              Unlock exclusive advantages when you partner with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Fast Integration",
                description: "Quick and easy integration with your existing systems through our comprehensive API."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Enterprise Security",
                description: "Bank-grade security measures and compliance with industry regulations."
              },
              {
                icon: <BarChart2 className="w-6 h-6" />,
                title: "Revenue Growth",
                description: "Access new revenue streams and expand your market reach."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Dedicated Support",
                description: "Priority access to our technical team and partner success managers."
              }
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="bg-[#25252d] rounded-lg p-6 glow-border flex items-start space-x-4"
              >
                <div className={`w-12 h-12 rounded-full ${META_GRADIENT} flex-shrink-0 flex items-center justify-center`}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate Program Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Affiliate Program
            </h2>
            <p className="text-lg text-gray-300">
              Earn competitive commissions by referring new customers to Decyphers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                tier: "Bronze",
                referrals: "10",
                commission: "20%",
                features: [
                  "20% commission on all referrals",
                  "Monthly payouts",
                  "Marketing materials",
                  "Basic support"
                ]
              },
              {
                tier: "Silver",
                referrals: "50",
                commission: "25%",
                popular: true,
                features: [
                  "25% commission on all referrals",
                  "Bi-weekly payouts",
                  "Premium marketing kit",
                  "Priority support",
                  "Custom landing pages"
                ]
              },
              {
                tier: "Gold",
                referrals: "100",
                commission: "30%",
                features: [
                  "30% commission on all referrals",
                  "Weekly payouts",
                  "VIP marketing package",
                  "Dedicated account manager",
                  "Co-marketing opportunities",
                  "Early access to features"
                ]
              }
            ].map((tier, index) => (
              <div 
                key={index} 
                className={`
                  relative bg-[#25252d] rounded-lg p-8
                  ${tier.popular ? 'glow-border transform hover:scale-105' : 'border border-[#3a3a45] hover:border-[#94a3b8]'}
                  transition-all duration-300
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className={`${META_GRADIENT} text-gray-900 text-sm font-medium px-3 py-1 rounded-full`}>
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">{tier.tier} Tier</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold">{tier.commission}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {tier.referrals}+ paid referrals
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-[#94a3b8] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.popular ? "primary" : "secondary"}
                  className="w-full"
                  onClick={() => navigate('/contact')}
                >
                  Join Program
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#25252d] overflow-hidden">
            <div className="relative p-8 md:p-12">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.pexels.com/photos/7567427/pexels-photo-7567427.jpeg')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#25252d]/80 to-[#25252d]"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
                  Ready to Partner with Us?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Take the first step towards a successful partnership. Our team is ready to discuss how we can grow together.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/contact')}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started
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

export default Partner;