import React from 'react';
import { Mail, MapPin } from 'lucide-react';

const RefundPolicy: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="bg-[#2f3654] rounded-xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Return and Refund Policy</h1>
                
                <p className="mb-6 text-gray-300">
                    Welcome to Decyphers AI. This Return and Refund Policy outlines the terms under which purchases are made and accepted on our platform. 
                    By placing an order, you agree to the terms outlined below.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">📘</span> Interpretation and Definitions
                    </h2>
                    <p className="mb-4 text-gray-300">Capitalized Terms used in this policy have the meanings defined below:</p>
                    
                    <div className="space-y-3 pl-4 text-gray-300">
                        <p><strong>Company:</strong> Refers to Decyphers AI Pte Ltd, located at 76 Playfair Road #08-01, Singapore 367996. Referred to as "the Company", "We", "Us", or "Our".</p>
                        <p><strong>Goods:</strong> The digital products and services offered for sale on our website.</p>
                        <p><strong>Orders:</strong> A request submitted by You to purchase Goods from Us.</p>
                        <p><strong>Service:</strong> Refers to our website platform and related services.</p>
                        <p><strong>Website:</strong> The official site of Decyphers AI — https://decyphers.com</p>
                        <p><strong>You:</strong> The individual or legal entity accessing or using our Service.</p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🚫</span> Non-Refundable Clause
                    </h2>
                    
                    <div className="mb-4">
                        <h3 className="text-xl font-medium mb-2 text-white">1. General</h3>
                        <p className="text-gray-300 pl-4">
                            All purchases made through Decyphers.com are final and non-refundable. By purchasing from us, 
                            you agree to waive any right to refunds due to the digital nature of our products.
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <h3 className="text-xl font-medium mb-2 text-white">2. Digital Courses and Software Products</h3>
                        <p className="text-gray-300 pl-4 mb-2">
                            Our offerings include digital products such as:
                        </p>
                        <ul className="list-disc pl-8 space-y-1 text-gray-300">
                            <li>A.I Trading Mentor</li>
                            <li>A.I Trading Master</li>
                            <li>Algo trading software tools</li>
                        </ul>
                        <p className="text-gray-300 pl-4 mt-2">
                            Once accessed, downloaded, or retrieved, these items are deemed "used" and not eligible for return, refund, or exchange.
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <h3 className="text-xl font-medium mb-2 text-white">3. Acknowledgement of Non-Refundability</h3>
                        <p className="text-gray-300 pl-4 mb-2">
                            By completing a purchase, you confirm that:
                        </p>
                        <ul className="list-disc pl-8 space-y-1 text-gray-300">
                            <li>All fees and charges are non-refundable</li>
                            <li>No refunds will be issued under any circumstance</li>
                            <li>You will not initiate chargebacks or disputes with your payment provider</li>
                            <li>No exceptions will be made to this policy</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">💬</span> User Satisfaction and Feedback
                    </h2>
                    <p className="text-gray-300 mb-4">
                        While our refund policy is strict, we prioritize your satisfaction. If you encounter any issues or need assistance with your purchase, please reach out:
                    </p>
                    <p className="flex items-center text-gray-300 mb-2">
                        <Mail className="w-5 h-5 mr-2 text-blue-400" />
                        <span>Email: <a href="mailto:support@decyphers.com" className="text-blue-400 hover:underline">support@decyphers.com</a></span>
                    </p>
                    <p className="text-gray-300">
                        We value your feedback and strive to continuously improve our products and services.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🔄</span> Policy Updates
                    </h2>
                    <p className="text-gray-300">
                        We reserve the right to update this Return and Refund Policy at any time. Changes take effect immediately upon being posted on this page. 
                        Continued use of our Website or Services indicates your acceptance of any revisions.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">📞</span> Contact Us
                    </h2>
                    <p className="text-gray-300 mb-4">
                        If you have any questions or concerns regarding this policy:
                    </p>
                    
                    <div className="space-y-3">
                        <p className="flex items-center text-gray-300">
                            <Mail className="w-5 h-5 mr-2 text-blue-400" />
                            <span>Email: <a href="mailto:support@decyphers.com" className="text-blue-400 hover:underline">support@decyphers.com</a></span>
                        </p>
                        <div className="flex text-gray-300">
                            <MapPin className="w-5 h-5 mr-2 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <p>Mailing Address:</p>
                                <p>Decyphers AI Pte Ltd</p>
                                <p>76 Playfair Road #08-01</p>
                                <p>Singapore 367996</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default RefundPolicy;
