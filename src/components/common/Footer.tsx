import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { META_TEXT_GRADIENT } from '../../constants';
import { FRONTEND_URL } from '@/config';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-[#3a3a45]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <BarChart2 className={`w-8 h-8 ${META_TEXT_GRADIENT}`} strokeWidth={1.5} />
              <span className={`ml-2 text-xl font-bold ${META_TEXT_GRADIENT}`}>
                AISITA
              </span>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6">
            <a href={`${FRONTEND_URL}/assets/documents/terms-conditions-refund-policy.pdf`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms & Refund Policy
            </a>
            <a href={`${FRONTEND_URL}/privacy-policy`} className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            {/* <a href="/assets/documents/terms-conditions-refund-policy.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              Refund Policy
            </a> */}
            <a href={`${FRONTEND_URL}/contact`} className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact Us
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-[#3a3a45] text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AISITA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;