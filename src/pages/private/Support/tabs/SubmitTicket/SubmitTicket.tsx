import React, { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { postRequest } from "@/services/apiRequest";
import { useTranslation } from 'react-i18next';

interface FormData {
    //issueType: string;
    subject: string;
    description: string;
    priority: string;
    //attachments: File[];
}

const SubmitTicket: React.FC = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<FormData>({
        //issueType: '',
        subject: '',
        description: '',
        priority: 'medium'
        //attachments: []
    });
    
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    
    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when field is being edited
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };
    
    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};
        
        //if (!formData.issueType) newErrors.issueType = t('PleaseSelectIssueType');
        if (!formData.subject) newErrors.subject = t('SubjectRequired');
        if (!formData.description) newErrors.description = t('DescriptionRequired');
        if (!formData.priority) newErrors.priority = t('PleaseSelectPriority');
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            setIsSubmitting(true);
            
            try {
                // Prepare request body
                const requestBody = {
                    subject: formData.subject,
                    description: formData.description,
                    priority: formData.priority
                };
                
                // Send API request
                await postRequest('/support/tickets', requestBody);
                
                // Handle success
                setIsSubmitting(false);
                setSubmitSuccess(true);
                
                // Reset form after success
                setTimeout(() => {
                    setFormData({
                        subject: '',
                        description: '',
                        priority: 'medium'
                    });
                    setSubmitSuccess(false);
                }, 3000);
            } catch (error) {
                // Handle error
                console.error('Error submitting ticket:', error);
                setIsSubmitting(false);
                // Could add error state handling here
            }
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto bg-[#1a1a20] border border-[#3a3a45] rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6">{t('SubmitSupportTicket')}</h1>
            
            {submitSuccess ? (
                <div className="bg-emerald-500/20 border border-emerald-500 rounded-lg p-4 mb-6 flex items-center">
                    <CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="font-medium text-white">{t('TicketSubmittedSuccessfully')}</h3>
                        <p className="text-gray-400">{t('TicketSubmittedDesc')}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Subject Field */}
                    <div className="mb-6">
                        <label htmlFor="subject" className="block text-gray-300 mb-2 font-medium">{t('Subject')}</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder={t('SubjectPlaceholder')}
                            className="w-full bg-[#252530] border border-[#3a3a45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.subject && (
                            <p className="mt-2 text-sm text-red-500">{errors.subject}</p>
                        )}
                    </div>
                    
                    {/* Description Field */}
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-gray-300 mb-2 font-medium">{t('Description')}</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            placeholder={t('DescriptionPlaceholder')}
                            className="w-full bg-[#252530] border border-[#3a3a45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        ></textarea>
                        {errors.description && (
                            <p className="mt-2 text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>
                    
                    {/* Priority Selection */}
                    <div className="mb-6">
                        <label htmlFor="priority" className="block text-gray-300 mb-2 font-medium">{t('Priority')}</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full bg-[#252530] border border-[#3a3a45] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "0.65rem auto" }}
                        >
                            <option value="low">{t('PriorityLow')}</option>
                            <option value="medium">{t('PriorityMedium')}</option>
                            <option value="high">{t('PriorityHigh')}</option>
                            <option value="critical">{t('PriorityCritical')}</option>
                        </select>
                        {errors.priority && (
                            <p className="mt-2 text-sm text-red-500">{errors.priority}</p>
                        )}
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:opacity-90'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-3"></div>
                                    <span className="text-white">{t('Submitting')}</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 mr-2 text-white" />
                                    <span className="text-white">{t('SubmitTicket')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SubmitTicket;