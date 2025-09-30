import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Users, Award, Rocket, BarChart2, Brain, Code, Globe, ArrowRight } from 'lucide-react';
import Button from '@components/common/Button';
// import Footer from '@components/common/Footer';
import { META_TEXT_GRADIENT, META_GRADIENT } from '@/constants';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a20] text-[#e2e8f0]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${META_TEXT_GRADIENT}`}>
              Our Mission
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Empowering traders with AI-driven insights to make better investment decisions
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-20 bg-[#16161a]/90">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: "Vision",
                description: "To revolutionize financial analysis by making advanced AI technology accessible to traders worldwide."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community",
                description: "Building a global community of traders who share knowledge and insights to grow together."
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Excellence",
                description: "Committed to delivering the highest quality analysis tools and maintaining the highest standards."
              }
            ].map((value, index) => (
              <div key={index} className="bg-[#25252d] rounded-lg p-8 glow-border text-center">
                <div className={`w-16 h-16 rounded-xl ${META_GRADIENT} flex items-center justify-center mx-auto mb-6`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
                Our Story
              </h2>
              <p className="text-lg text-gray-300">
                The journey from idea to innovation
              </p>
            </div>

            <div className="space-y-12">
              {[
                {
                  year: "2022",
                  title: "The Beginning",
                  description: "Founded with a vision to democratize advanced financial analysis through AI technology.",
                  icon: <Rocket className="w-6 h-6" />
                },
                {
                  year: "2023",
                  title: "Innovation & Growth",
                  description: "Launched our core AI analysis engine and expanded our team of experts.",
                  icon: <Brain className="w-6 h-6" />
                },
                {
                  year: "2024",
                  title: "Global Expansion",
                  description: "Reached traders in over 50 countries and launched advanced features.",
                  icon: <Globe className="w-6 h-6" />
                },
                {
                  year: "2025",
                  title: "The Future",
                  description: "Continuing to innovate with new AI models and expanded capabilities.",
                  icon: <Code className="w-6 h-6" />
                }
              ].map((milestone, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className={`w-12 h-12 rounded-full ${META_GRADIENT} flex-shrink-0 flex items-center justify-center`}>
                    {milestone.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-[#94a3b8] bg-[#25252d] px-2 py-1 rounded">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-semibold">{milestone.title}</h3>
                    </div>
                    <p className="text-gray-400">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#16161a]/90">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Our Team
            </h2>
            <p className="text-lg text-gray-300">
              Meet the experts behind Decyphers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                role: "CEO & Founder",
                image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
                description: "Former quantitative analyst with 15 years of experience in financial markets."
              },
              {
                name: "Alex Rivera",
                role: "Head of AI",
                image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
                description: "PhD in Machine Learning, leading our AI development team."
              },
              {
                name: "Mike Johnson",
                role: "Head of Product",
                image: "https://images.pexels.com/photos/2379006/pexels-photo-2379006.jpeg",
                description: "Product veteran with experience at leading fintech companies."
              }
            ].map((member, index) => (
              <div key={index} className="bg-[#25252d] rounded-lg overflow-hidden glow-border">
                <div className="aspect-w-4 aspect-h-3">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-[#94a3b8] text-sm mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#25252d] overflow-hidden">
            <div className="relative p-8 md:p-12">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.pexels.com/photos/7567427/pexels-photo-7567427.jpeg')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#25252d]/80 to-[#25252d]"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
                  Join Our Journey
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Be part of the future of AI-powered financial analysis
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/signup')}
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/contact')}
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
};

export default About;