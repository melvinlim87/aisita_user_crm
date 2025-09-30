import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
//import Footer from '@components/common/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg">Have questions? We're here to help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-gray-800/50 p-8 rounded-lg backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-gray-100 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-[#94a3b8]" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a href="mailto:support@decyphers.com" className="text-[#e2e8f0] hover:text-white">
                    support@decyphers.com
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* <Phone className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-gray-300">Phone</p>
                  <a href="tel:+1234567890" className="text-blue-400 hover:text-blue-300">
                    +1 (234) 567-890
                  </a>
                </div> */}
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-5 h-5 text-[#94a3b8]" />
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-[#e2e8f0]">
                    76 Playfair Road #08-01<br />
                    Singapore 367996
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800/50 p-8 rounded-lg backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-gray-100 mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 bg-[#1a1a20] border border-[#3a3a45] rounded-md text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 bg-[#1a1a20] border border-[#3a3a45] rounded-md text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 bg-[#1a1a20] border border-[#3a3a45] rounded-md text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:border-transparent"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#94a3b8] hover:bg-[#718096] text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Contact;