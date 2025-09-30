import React from 'react';
import { Mail, MapPin, Lock, Globe, AlertTriangle } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="bg-[#2f3654] rounded-xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Privacy Policy & PDPA</h1>
                <p className="text-gray-300 mb-4 text-center">Last updated: 10th October, 2023</p>
                <p className="text-gray-300 mb-8 text-center">Company: Decyphers AI Pte Ltd</p>
                
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">📝</span> DATA PROTECTION NOTICE
                    </h2>
                    <p className="mb-6 text-gray-300">
                        This Data Protection Notice ("Notice") sets out the basis which Decyphers AI Pte Ltd ("we", "us", or "our") may collect, use, disclose or otherwise process personal data of our customers in accordance with the Personal Data Protection Act ("PDPA"). This Notice applies to personal data in our possession or under our control, including personal data in the possession of organisations which we have engaged to collect, use, disclose or process personal data for our purposes.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">👤</span> PERSONAL DATA
                    </h2>
                    <p className="mb-4 text-gray-300">As used in this Notice:</p>
                    <p className="mb-4 text-gray-300">"customer" means an individual who (a) has contacted us through any means to find out more about any goods or services we provide, or (b) may, or has, entered into a contract with us for the supply of any goods or services by us; and</p>
                    <p className="mb-4 text-gray-300">"personal data" means data, whether true or not, about a customer who can be identified: (a) from that data; or (b) from that data and other information to which we have or are likely to have access.</p>
                    <p className="mb-4 text-gray-300">Depending on the nature of your interaction with us, some examples of personal data which we may collect from you include:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 text-gray-300">
                        <p><span className="mr-2">🔛</span> Full name</p>
                        <p><span className="mr-2">🏠</span> Address</p>
                        <p><span className="mr-2">📧</span> Email</p>
                        <p><span className="mr-2">📞</span> Phone number</p>
                        <p><span className="mr-2">🌍</span> Nationality</p>
                        <p><span className="mr-2">🚻</span> Gender</p>
                        <p><span className="mr-2">🎂</span> Date of birth</p>
                        <p><span className="mr-2">💍</span> Marital status</p>
                        <p><span className="mr-2">🖼️</span> Photo</p>
                        <p><span className="mr-2">💼</span> Employment information</p>
                        <p><span className="mr-2">💳</span> Financial information</p>
                    </div>
                    <p className="mt-4 text-gray-300">Other terms used in this Notice shall have the meanings given to them in the PDPA (where the context so permits).</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">📥</span> COLLECTION, USE AND DISCLOSURE OF PERSONAL DATA
                    </h2>
                    <p className="mb-4 text-gray-300">We generally do not collect your personal data unless (a) it is provided to us voluntarily by you directly or via a third party who has been duly authorised by you to disclose your personal data to us (your "authorised representative") after (i) you (or your authorised representative) have been notified of the purposes for which the data is collected, and (ii) you (or your authorised representative) have provided written consent to the collection and usage of your personal data for those purposes, or (b) collection and use of personal data without consent is permitted or required by the PDPA or other laws. We shall seek your consent before collecting any additional personal data and before using your personal data for a purpose which has not been notified to you (except where permitted or authorised by law).</p>
                    
                    <p className="mb-4 text-gray-300">We may collect and use your personal data for any or all of the following purposes:</p>
                    
                    <ul className="list-disc pl-8 space-y-1 text-gray-300 mb-4">
                        <li>performing obligations in the course of or in connection with our provision of the goods and/or services requested by you;</li>
                        <li>verifying your identity;</li>
                        <li>responding to, handling, and processing queries, requests, applications, complaints, and feedback from you;</li>
                        <li>managing your relationship with us;</li>
                        <li>processing payment or credit transactions;</li>
                        <li>complying with any applicable laws, regulations, codes of practice, guidelines, or rules, or to assist in law enforcement and investigations conducted by any governmental and/or regulatory authority;</li>
                        <li>any other purposes for which you have provided the information;</li>
                        <li>transmitting to any unaffiliated third parties including our third party service providers and agents, and relevant governmental and/or regulatory authorities, whether in Singapore or abroad, for the aforementioned purposes; and</li>
                        <li>any other incidental business purposes related to or in connection with the above.</li>
                    </ul>

                    <p className="mb-4 text-gray-300">We may disclose your personal data:</p>
                    
                    <ul className="list-disc pl-8 space-y-1 text-gray-300">
                        <li>where such disclosure is required for performing obligations in the course of or in connection with our provision of the goods and services requested by you; or</li>
                        <li>to third party service providers, agents and other organisations we have engaged to perform any of the functions with reference to the above mentioned purposes.</li>
                    </ul>
                    
                    <p className="mt-4 text-gray-300">The purposes listed in the above clauses may continue to apply even in situations where your relationship with us (for example, pursuant to a contract) has been terminated or altered in any way, for a reasonable period thereafter (including, where applicable, a period to enable us to enforce our rights under a contract with you).</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">❌</span> WITHDRAWING YOUR CONSENT
                    </h2>
                    <p className="mb-4 text-gray-300">The consent that you provide for the collection, use and disclosure of your personal data will remain valid until such time it is being withdrawn by you in writing. You may withdraw consent and request us to stop collecting, using and/or disclosing your personal data for any or all of the purposes listed above by submitting your request in writing or via email to our Data Protection Officer at the contact details provided below.</p>
                    
                    <p className="mb-4 text-gray-300">Upon receipt of your written request to withdraw your consent, we may require reasonable time (depending on the complexity of the request and its impact on our relationship with you) for your request to be processed and for us to notify you of the consequences of us acceding to the same, including any legal consequences which may affect your rights and liabilities to us. In general, we shall seek to process your request within thirty (30) business days of receiving it.</p>
                    
                    <p className="mb-4 text-gray-300">Whilst we respect your decision to withdraw your consent, please note that depending on the nature and scope of your request, we may not be in a position to continue providing our goods or services to you and we shall, in such circumstances, notify you before completing the processing of your request. Should you decide to cancel your withdrawal of consent, please inform us in writing in the manner described in clause 8 above.</p>
                    
                    <p className="mb-4 text-gray-300">Please note that withdrawing consent does not affect our right to continue to collect, use and disclose personal data where such collection, use and disclose without consent is permitted or required under applicable laws.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">📝</span> ACCESS TO AND CORRECTION OF PERSONAL DATA
                    </h2>
                    <p className="mb-4 text-gray-300">If you wish to make (a) an access request for access to a copy of the personal data which we hold about you or information about the ways in which we use or disclose your personal data, or (b) a correction request to correct or update any of your personal data which we hold about you, you may submit your request in writing or via email to our Data Protection Officer at the contact details provided below.</p>
                    
                    <p className="mb-4 text-gray-300">Please note that a reasonable fee may be charged for an access request. If so, we will inform you of the fee before processing your request.</p>
                    
                    <p className="mb-4 text-gray-300">We will respond to your request as soon as reasonably possible. In general, our response will be within thirty (30) business days. Should we not be able to respond to your request within thirty (30) days after receiving your request, we will inform you in writing within thirty (30) days of the time by which we will be able to respond to your request. If we are unable to provide you with any personal data or to make a correction requested by you, we shall generally inform you of the reasons why we are unable to do so (except where we are not required to do so under the PDPA).</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <Lock className="inline w-6 h-6 mr-2 text-blue-400" /> PROTECTION OF PERSONAL DATA
                    </h2>
                    <p className="mb-4 text-gray-300">To safeguard your personal data from unauthorised access, collection, use, disclosure, copying, modification, disposal or similar risks, we have introduced appropriate administrative, physical and technical measures such as authentication and access controls (such as good password practices, need-to-basis for data disclosure, etc.), data anonymisation, up-to-date antivirus protection, regular patching of operating system and other software, securely erase storage media in devices before disposal, web security measures against risks, and security review and testing performed regularly.</p>
                    
                    <p className="mb-4 text-gray-300">You should be aware, however, that no method of transmission over the Internet or method of electronic storage is completely secure. While security cannot be guaranteed, we strive to protect the security of your information and are constantly reviewing and enhancing our information security measures.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">✅</span> ACCURACY OF PERSONAL DATA
                    </h2>
                    <p className="text-gray-300">
                        We generally rely on personal data provided by you (or your authorised representative). In order to ensure that your personal data is current, complete and accurate, please update us if there are changes to your personal data by informing our Data Protection Officer in writing or via email at the contact details provided below.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🗃️</span> RETENTION OF PERSONAL DATA
                    </h2>
                    <p className="mb-4 text-gray-300">
                        We may retain your personal data for as long as it is necessary to fulfil the purpose for which it was collected, or as required or permitted by applicable laws.
                    </p>
                    
                    <p className="mb-4 text-gray-300">
                        We will cease to retain your personal data, or remove the means by which the data can be associated with you, as soon as it is reasonable to assume that such retention no longer serves the purpose for which the personal data was collected, and is no longer necessary for legal or business purposes.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <Globe className="inline w-6 h-6 mr-2 text-blue-400" /> TRANSFERS OF PERSONAL DATA OUTSIDE OF SINGAPORE
                    </h2>
                    <p className="mb-4 text-gray-300">
                        We generally do not transfer your personal data to countries outside of Singapore. However, if we do so, we will obtain your consent for the transfer to be made and we will take steps to ensure that your personal data continues to receive a standard of protection that is at least comparable to that provided under the PDPA.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">👨‍💼</span> DATA PROTECTION OFFICER
                    </h2>
                    <p className="mb-4 text-gray-300">You may contact our Data Protection Officer if you have any enquiries or feedback on our personal data protection policies and procedures, or if you wish to make any request, in the following manner:</p>
                    
                    <div className="space-y-3">
                        <p className="flex items-center text-gray-300">
                            <Mail className="w-5 h-5 mr-2 text-blue-400" />
                            <span>Email: <a href="mailto:support@decyphers.com" className="text-blue-400 hover:underline">support@decyphers.com</a></span>
                        </p>
                        <div className="flex text-gray-300">
                            <MapPin className="w-5 h-5 mr-2 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <p>Address: 76 Playfair Road #08-01, Singapore 367996</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">⚖️</span> ADDITIONAL TERMS
                    </h2>
                    
                    <div className="mb-4">
                        <h3 className="text-xl font-medium mb-2 text-white"><span className="mr-2">📚</span> Governing Law</h3>
                        <p className="text-gray-300 pl-4">
                            These Terms shall be governed and construed in accordance with the laws of Singapore without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <h3 className="text-xl font-medium mb-2 text-white"><span className="mr-2">🔄</span> Changes</h3>
                        <p className="text-gray-300 pl-4">
                            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <h3 className="text-xl font-medium mb-2 text-white"><span className="mr-2">👥</span> Accounts</h3>
                        <p className="text-gray-300 pl-4 mb-2">
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                        <p className="text-gray-300 pl-4 mb-2">
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
                        </p>
                        <p className="text-gray-300 pl-4">
                            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🥽</span> Log Data
                    </h2>
                    <p className="text-gray-300">
                        We collect information that your browser sends whenever you visit our Service ("Log Data"). This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages and other statistics.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🍪</span> Cookies
                    </h2>
                    <p className="mb-4 text-gray-300">
                        Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive.
                    </p>
                    <p className="text-gray-300">
                        We use "cookies" to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🤝</span> Service Providers
                    </h2>
                    <p className="text-gray-300">
                        We may employ third party companies and individuals to facilitate our Service, to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
                    </p>
                    <p className="mt-4 text-gray-300">
                        These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🔐</span> Security
                    </h2>
                    <p className="text-gray-300">
                        The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🔗</span> Links To Other Sites
                    </h2>
                    <p className="mb-4 text-gray-300">
                        Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
                    </p>
                    <p className="text-gray-300">
                        We have no control over, and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <AlertTriangle className="inline w-6 h-6 mr-2 text-blue-400" /> Children's Privacy
                    </h2>
                    <p className="mb-4 text-gray-300">
                        Our Service does not address anyone under the age of 18 ("Children").
                    </p>
                    <p className="text-gray-300">
                        We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us. If we discover that a child under 18 has provided us with Personal Information, we will delete such information from our servers immediately.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">⚖️</span> Compliance With Laws
                    </h2>
                    <p className="text-gray-300">
                        We will disclose your Personal Information where required to do so by law or subpoena.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">🔄</span> EFFECT OF NOTICE AND CHANGES TO NOTICE
                    </h2>
                    <p className="mb-4 text-gray-300">
                        This Notice applies in conjunction with any other notices, contractual clauses and consent clauses that apply in relation to the collection, use and disclosure of your personal data by us.
                    </p>
                    <p className="text-gray-300">
                        We may revise this Notice from time to time without any prior notice. You may determine if any such revision has taken place by referring to the date on which this Notice was last updated. Your continued use of our services constitutes your acknowledgment and acceptance of such changes.
                    </p>
                    <p className="mt-4 text-gray-300">
                        Effective date: 09/10/2023<br />
                        Last updated: 09/10/2023
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        <span className="mr-2">📬</span> Contact Us
                    </h2>
                    <p className="mb-4 text-gray-300">Have questions?</p>
                    
                    <div className="space-y-3">
                        <p className="flex items-center text-gray-300">
                            <Mail className="w-5 h-5 mr-2 text-blue-400" />
                            <span>Email: <a href="mailto:support@decyphers.com" className="text-blue-400 hover:underline">support@decyphers.com</a></span>
                        </p>
                        <div className="flex text-gray-300">
                            <MapPin className="w-5 h-5 mr-2 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <p>Address: 76 Playfair Road #08-01, Singapore 367996</p>
                                <p>Company: Decyphers AI Pte Ltd</p>
                            </div>
                        </div>
                    </div>

                </section>
                
            </div>
        </div>
    );
};

export default PrivacyPolicy;
