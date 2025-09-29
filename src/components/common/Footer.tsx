import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { META_TEXT_GRADIENT } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-[#3a3a45]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <BarChart2 className={`w-8 h-8 ${META_TEXT_GRADIENT}`} strokeWidth={1.5} />
            <span className={`ml-2 text-xl font-bold ${META_TEXT_GRADIENT}`}>
              Decyphers
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6">
            <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact Us
            </Link>
            <Link to="/help" className="text-sm text-gray-400 hover:text-white transition-colors">
              Help & Support
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-[#3a3a45] text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Decyphers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;