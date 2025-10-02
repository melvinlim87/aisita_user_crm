import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, BarChart2 } from 'lucide-react';
import Footer from '../components/common/Footer';
import { META_TEXT_GRADIENT } from '../constants';

const Faq = () => {
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
      answer: "Our AI models have been trained on millions of historical chart patterns and achieve over 85% accuracy in pattern recognition. However, please note that no analysis tool can guarantee future market performance."
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
    {
      category: 'Security',
      question: "How long do you retain my data?",
      answer: "We retain your data for as long as your account is active. You can delete your data at any time from your account settings."
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
    },
    {
      category: 'Support',
      question: "What are your support hours?",
      answer: "Our support team is available 24/5 during market hours. Enterprise customers get 24/7 support coverage."
    }
  ];

  const filteredFaqs = allFaqs.filter(faq => 
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
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className={`w-12 h-12 ${META_TEXT_GRADIENT}`} strokeWidth={1.5} />
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${META_TEXT_GRADIENT}`}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-300">
            Find answers to common questions about AISITA
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
      
      <Footer />
    </div>
  );
};

export default Faq;