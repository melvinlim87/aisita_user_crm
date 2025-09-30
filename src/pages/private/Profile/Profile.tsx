import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, Loader2 } from 'lucide-react';
import { getRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    firebase_uid: string | null;
    country: string | null;
    date_of_birth: string | null;
    gender: string | null;
    profile_picture_url: string | null;
    role: {
        id: number;
        name: string;
        display_name: string;
    };
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: UserProfile;
}

interface UserReferral {
    referral_code: string | null;
    shareable_link: string | null;
}

interface ApiReferralResponse {
    success: boolean;
    message: string;
    data: UserReferral;
}

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [referralCode, setReferralCode] = useState<UserReferral | null>(null)
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    
    // Static activity data for demonstration
    const activityData = {
        dateRange: '06/08/2025 to 07/07/2025',
        updateFrequency: 'three hours',
        analysisStats: {
            accuracyRate: 99,
            totalAnalyses: 11948,
            conversations: 62
        }
    };
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await getRequest<ApiResponse>('/profile');
                
                if (response.success) {
                    setProfile(response.data);
                } else {
                    setError(response.message || t('FailedToLoadProfile'));
                }
            } catch (err) {
                setError(t('ErrorFetchingProfile'));
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        
        const fetchUserReferralCode = async () => {
            try {
                setLoading(true);
                const response = await getRequest<ApiReferralResponse>('/referral/code');
                
                if (response.success) {
                    setReferralCode(response.data);
                } else {
                    setError(t('FailedToLoadReferral'));
                }
            } catch (err) {
                setError(t('ErrorFetchingProfile'));
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        
        fetchUserProfile();
        fetchUserReferralCode()
    }, [t]);

    // Helper function to get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Header Section */}
            <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : profile ? (
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                            {profile.profile_picture_url ? (
                                <img 
                                    src={profile.profile_picture_url} 
                                    alt={profile.name} 
                                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
                                    {getInitials(profile.name)}
                                </div>
                            )}
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                                <span className="px-2 py-0.5 bg-[#2d3748] text-blue-400 text-xs font-medium rounded-full">
                                    {profile.role.display_name}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">{profile.email}</p>
                            <p className="text-gray-500 text-xs mt-1">{t('MemberSince')} {new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>

                        
                        {/* Streak Info */}
                        {/* <div className="bg-[#25252d] rounded-lg px-4 py-2 shadow-md border border-[#3a3a45]">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-300">
                                    2 day streak <span className="text-gray-500">(record 23)</span>
                                </p>
                            </div>
                        </div> */}
                    </div>
                ) : null}
            </div>
            
            {/* Account Activity Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{t('AccountActivityComingSoon')}</h2>
                    {/* <div className="bg-[#25252d] px-4 py-1 rounded-full text-sm text-gray-400">
                        {activityData.dateRange}
                    </div> */}
                </div>
                {/* <p className="text-gray-400 mb-6">Analytics update every {activityData.updateFrequency}</p> */}
                
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    Code Written Stat
                    <div className="bg-[#1a1a20] rounded-lg p-6 border border-[#2d3748] shadow-lg">
                        <h3 className="text-sm text-gray-400 mb-2">% AI analysis accuracy rate</h3>
                        <div className="text-4xl font-bold text-white">{activityData.analysisStats.accuracyRate}%</div>
                    </div>
                    
                    Total Lines Stat
                    <div className="bg-[#1a1a20] rounded-lg p-6 border border-[#2d3748] shadow-lg md:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm text-gray-400">Total chart analyses processed</h3>
                            <div className="flex">
                                <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-l-md">CASCADE</button>
                                <button className="px-3 py-1 bg-[#25252d] text-gray-400 text-xs font-medium rounded-r-md">TAB</button>
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-white mb-4">{activityData.analysisStats.totalAnalyses.toLocaleString()}</div>
                        
                        Chart Placeholder
                        <div className="h-32 bg-[#25252d] rounded-md flex items-center justify-center">
                            <BarChart2 className="w-8 h-8 text-blue-500" />
                            <span className="ml-2 text-blue-400">Analysis History Chart</span>
                        </div>
                    </div>
                    
                    Conversations Stat
                    <div className="bg-[#1a1a20] rounded-lg p-6 border border-[#2d3748] shadow-lg">
                        <h3 className="text-sm text-gray-400 mb-2">Total AI chat sessions</h3>
                        <div className="text-4xl font-bold text-white">{activityData.analysisStats.conversations}</div>
                    </div>
                </div> */}
            </div>
            
            {/* Usage History Section */}
            {/* <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Chart Analysis History</h2>
                <div className="bg-[#1a1a20] rounded-lg p-6 border border-[#2d3748] shadow-lg">
                    <div className="flex items-center justify-center text-gray-400 py-8">
                        <Calendar className="w-6 h-6 mr-2" />
                        <span>Your recent chart analyses will appear here</span>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default Profile;
