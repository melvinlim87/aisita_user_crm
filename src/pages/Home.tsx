import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Upload, MessageSquare, Zap, LineChart, TrendingUp, ShieldCheck, BarChartHorizontal, Bot, Mail, Phone, MapPin, ChevronDown, Search } from 'lucide-react';
import Button from '../components/common/Button';
import { META_TEXT_GRADIENT, META_GRADIENT } from '../constants';
import { VerticalCircuitLines } from '../components/common/VerticalCircuitLines';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  
  const categories = ['General', 'Technical', 'Pricing', 'Security', 'Support'];
  
  const allFaqs = [
    // General
    {
      category: 'General',
      question: "What is AISITA?",
      answer: "AISITA is an AI-powered financial chart analysis platform that helps traders identify patterns, trends, and trading opportunities using advanced machine learning algorithms."
    },
    {
      category: 'General',
      question: "How accurate is the AI analysis?",
      answer: "Our AI models have been trained on millions of chart patterns and achieve over 85% accuracy in pattern recognition. However, please note that no analysis tool can guarantee future market performance."
    },
    {
      category: 'General',
      question: "What types of charts can I analyze?",
      answer: "We support all major chart types including candlestick, line, and bar charts. You can upload charts from any trading platform as PNG, JPG, or GIF files."
    },
    // Technical
    {
      category: 'Technical',
      question: "What technical indicators does the AI analyze?",
      answer: "Our AI analyzes a wide range of technical indicators including RSI, MACD, Moving Averages, Bollinger Bands, and volume patterns. It can also identify support/resistance levels and chart patterns."
    },
    {
      category: 'Technical',
      question: "How long does the analysis take?",
      answer: "Chart analysis is typically completed within seconds. You'll receive initial insights immediately and can then dive deeper through the interactive chat interface."
    },
    {
      category: 'Technical',
      question: "Can I customize the analysis parameters?",
      answer: "Yes, Pro and Enterprise users can customize analysis parameters including timeframes, indicator combinations, and sensitivity levels."
    },
    // Pricing
    {
      category: 'Pricing',
      question: "What are the pricing plans?",
      answer: "We offer three plans: Basic (free), Pro ($49/month), and Enterprise (custom pricing). Each plan includes different features and analysis quotas."
    },
    {
      category: 'Pricing',
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated based on your billing cycle."
    },
    {
      category: 'Pricing',
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
    },
    // Security
    {
      category: 'Security',
      question: "How secure is my data?",
      answer: "We use enterprise-grade encryption for all data storage and transmission. Your charts and analysis are private and only accessible to you."
    },
    {
      category: 'Security',
      question: "Do you share data with third parties?",
      answer: "No, we never share your charts or analysis data with third parties. Your privacy is our top priority."
    },
    // Support
    {
      category: 'Support',
      question: "How can I get help?",
      answer: "We offer multiple support channels including email, live chat, and documentation. Pro and Enterprise users get priority support."
    },
    {
      category: 'Support',
      question: "Do you offer training?",
      answer: "Yes, we provide free video tutorials, documentation, and webinars. Enterprise customers also get personalized training sessions."
    }
  ];

  const filteredFaqs = allFaqs.filter(faq => 
    (faq.category === selectedCategory || selectedCategory === 'All') &&
    (searchQuery === '' || 
     faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#000000] to-[#111111] text-[#e2e8f0]">
      {/* subtle gold glow overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.10),_transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(184,115,51,0.08),_transparent_60%)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a20]"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6770609/pexels-photo-6770609.jpeg')] bg-cover bg-center opacity-15 mix-blend-overlay"></div>
          
          {/* Animated glow effects */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#94a3b8] opacity-15 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-[#cbd5e1] opacity-15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <BarChart2 className={`w-12 h-12 ${META_TEXT_GRADIENT}`} strokeWidth={1.5} />
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${META_TEXT_GRADIENT}`}>
              AI-Powered Financial Chart Analysis
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Upload your financial charts and get instant AI analysis, pattern recognition, and trading insights through an interactive chat interface.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Get Started for Free
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              How AISITA Works
            </h2>
            <p className="text-lg text-gray-300">
              Analyze any financial chart in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                vector: (
                  <div className="vector-upload">
                    <div className="vector-chart-container">
                      <div className="chart-grid" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="candlestick" />
                      <div className="mouse-pointer" />
                    </div>
                  </div>
                ),
                title: "Upload Your Chart",
                description: "Drag and drop or browse to upload your financial chart image in PNG, JPG, or GIF format."
              },
              {
                vector: (
                  <div className="vector-analyze">
                    <div className="vector-analyze-container">
                      <div className="analyze-grid" />
                      <div className="analyze-candlesticks">
                        <div className="analyze-candlestick" />
                        <div className="analyze-candlestick" />
                        <div className="analyze-candlestick" />
                        <div className="analyze-candlestick" />
                        <div className="analyze-candlestick" />
                        <div className="analyze-candlestick" />
                        <div className="analyze-candlestick" />
                        <div className="ai-robot" />
                      </div>
                    </div>
                  </div>
                ),
                title: "AI Analyzes Patterns",
                description: "Our advanced AI detects chart patterns, trends, support/resistance levels, and technical indicators."
              },
              {
                vector: (
                  <div className="vector-chat">
                    <div className="vector-chat-container">
                      <div className="chat-grid" />
                      <div className="ai-assistant">
                        <Bot className="w-7 h-7 absolute inset-0 m-auto text-[#94a3b8]" />
                      </div>
                      <div className="chat-bubble">Analysis</div>
                      <div className="chat-bubble">Insights</div>
                      <div className="chat-bubble">Signals</div>
                    </div>
                  </div>
                ),
                title: "Chat About Insights",
                description: "Interact with the AI through a chat interface to ask specific questions and get detailed analysis."
              }
            ].map((step, index) => (
              <div key={index} className="bg-[#25252d]/90 rounded-lg p-6 glow-border">
                <div className="h-32 flex items-center justify-center mb-6 mx-auto">
                  {step.vector}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{step.title}</h3>
                <p className="text-gray-400 text-center">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Premium Features
            </h2>
            <p className="text-lg text-gray-300">
              Powerful tools to elevate your trading analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <BarChartHorizontal className="w-6 h-6" />,
                image: "https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg",
                title: "Pattern Recognition",
                description: "Automatically identify common chart patterns like head and shoulders, double tops/bottoms, flags, and more."
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                image: "https://images.pexels.com/photos/6771985/pexels-photo-6771985.jpeg",
                title: "Technical Indicators",
                description: "Analyze RSI, MACD, Moving Averages, Bollinger Bands, and other key technical indicators."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                image: "https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg",
                title: "Real-time Analysis",
                description: "Get instant analysis and insights seconds after uploading your chart images."
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                image: "https://images.pexels.com/photos/5473955/pexels-photo-5473955.jpeg",
                title: "Secure & Private",
                description: "Your charts and analysis history are securely stored and only accessible to you."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-lg glow-border"
              >
                <div className="absolute inset-0">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#25252d] via-[#25252d]/90 to-transparent" />
                </div>
                <div className="relative p-6">
                  <div className="flex items-start">
                    <div className={`w-12 h-12 rounded-full ${META_GRADIENT} flex-shrink-0 flex items-center justify-center mr-4`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Coming Soon Section */}
      <section className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Coming Soon
            </h2>
            <p className="text-lg text-gray-300">
              Revolutionary features that will transform your trading experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-lg glow-border group">
              <div className="absolute inset-0">
                <img 
                  src="https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg"
                  alt="AI Expert Advisor"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#25252d] via-[#25252d]/90 to-transparent" />
              </div>
              <div className="relative p-8">
                <div className="flex flex-col items-center text-center md:text-left md:items-start">
                  <div className={`w-16 h-16 rounded-xl ${META_GRADIENT} flex items-center justify-center p-4 mb-4`}>
                    <Bot className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Expert Advisor Generator</h3>
                    <ul className="space-y-3 text-gray-300 text-left">
                      <li className="flex items-start gap-3 justify-start">
                        <span className="w-3 h-3 rounded-full bg-[#00E5FF] flex-shrink-0 mt-1.5 shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse">
                        </span>
                        <span>AI-powered trading strategy development</span>
                      </li>
                      <li className="flex items-start gap-3 justify-start">
                        <span className="w-3 h-3 rounded-full bg-[#00E5FF] flex-shrink-0 mt-1.5 shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse">
                        </span>
                        <span>Custom indicator creation and optimization</span>
                      </li>
                      <li className="flex items-start gap-3 justify-start">
                        <span className="w-3 h-3 rounded-full bg-[#00E5FF] flex-shrink-0 mt-1.5 shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse">
                        </span>
                        <span>Intelligent error debugging and code optimization</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg glow-border group">
              <div className="absolute inset-0">
                <img 
                  src="https://images.pexels.com/photos/7567427/pexels-photo-7567427.jpeg"
                  alt="Chart Analysis"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#25252d] via-[#25252d]/90 to-transparent" />
              </div>
              <div className="relative p-8">
                <div className="flex flex-col items-center text-center md:text-left md:items-start">
                  <div className={`w-16 h-16 rounded-xl ${META_GRADIENT} flex items-center justify-center p-4 mb-4`}>
                    <LineChart className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Chart Analysis on Demand</h3>
                    <ul className="space-y-3 text-gray-300 text-left">
                      <li className="flex items-start gap-3 justify-start">
                        <span className="w-3 h-3 rounded-full bg-[#00E5FF] flex-shrink-0 mt-1.5 shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse">
                        </span>
                        <span>Instant symbol and timeframe selection</span>
                      </li>
                      <li className="flex items-start gap-3 justify-start">
                        <span className="w-3 h-3 rounded-full bg-[#00E5FF] flex-shrink-0 mt-1.5 shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse">
                        </span>
                        <span>Customizable indicator combinations (up to 5)</span>
                      </li>
                      <li className="flex items-start gap-3 justify-start">
                        <span className="w-3 h-3 rounded-full bg-[#00E5FF] flex-shrink-0 mt-1.5 shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse">
                        </span>
                        <span>Real-time AI-powered market analysis</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-300">
              Everything you need to know about AISITA
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#25252d] border border-[#3a3a45] rounded-lg text-[#e2e8f0] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedCategory === category 
                      ? 'bg-[#3a3a45] text-white' 
                      : 'bg-[#25252d] text-gray-400 hover:bg-[#3a3a45] hover:text-white'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#25252d] rounded-lg p-6 glow-border transition-all duration-200 hover:border-[#94a3b8]"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-[#e2e8f0] mb-3">{faq.question}</h3>
                  <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />
                </div>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
            
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <BarChart2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No matching questions found</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl bg-[#25252d] overflow-hidden glow-border">
            <div className="relative p-8 md:p-12">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.pexels.com/photos/6772076/pexels-photo-6772076.jpeg')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#25252d]/80 to-[#25252d]"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
                  Start Analyzing Your Charts Today
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of traders who are already using AI to enhance their technical analysis and improve their trading decisions.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started for Free
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/contact')}
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 relative">
        <VerticalCircuitLines theme="light" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
              Get in Touch
            </h2>
            <p className="text-lg text-gray-300">
              Have questions? We're here to help
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#25252d] rounded-lg p-8 glow-border">
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <a href="mailto:support@aisita.ai" className="text-[#e2e8f0] hover:text-white">
                      support@aisita.ai
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <a href="tel:+1234567890" className="text-[#e2e8f0] hover:text-white">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-[#e2e8f0]">
                      123 Innovation Street<br />
                      Tech City, TC 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#25252d] rounded-lg p-8 glow-border">
              <h3 className="text-xl font-semibold mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-[#1a1a20] border border-[#3a3a45] rounded-md text-[#e2e8f0] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 bg-[#1a1a20] border border-[#3a3a45] rounded-md text-[#e2e8f0] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:border-transparent"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    placeholder="Your message"
                    className="w-full px-4 py-2 bg-[#1a1a20] border border-[#3a3a45] rounded-md text-[#e2e8f0] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:border-transparent resize-none"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-[#3a3a45]">
        <div className="container mx-auto px-4">
        </div>
      </footer>
    </div>
  );
};

export default Home;