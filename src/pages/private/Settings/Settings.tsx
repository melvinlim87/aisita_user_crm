import React, { useState, useEffect } from 'react';
import { getRequest, putRequest, postRequest } from '@/services/apiRequest';
import { saveAuthData } from '@/hooks/useAuth';
import Cookies from 'js-cookie';
import { Loader2, Pencil, Info, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  firebase_uid: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  date_of_birth: string | null;
  gender: string | null;
  profile_picture_url: string | null;
  telegram_id?: string | null;
  telegram_username?: string | null;
  role: {
    id: number;
    name: string;
    display_name: string;
  };
  created_at: string;
  updated_at: string;
}

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const userData = localStorage.getItem('user');
  const user = JSON.parse(userData || '{}');  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [telegramCode, setTelegramCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isTelegramConnected, setIsTelegramConnected] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<boolean>(false);
  const [editableProfile, setEditableProfile] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [tokenAlert, setTokenAlert] = useState<{show: boolean; amount: number; source: string}>({show: false, amount: 0, source: ''});
  const [profileCompletionStatus, setProfileCompletionStatus] = useState<{
    isComplete: boolean;
    missingFields: string[];
    completionPercentage: number;
  }>({ isComplete: false, missingFields: [], completionPercentage: 0 });
  
  // Profile image upload modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Change password state (append-only)
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<boolean>(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  interface ApiResponse {
    success: boolean;
    data: UserProfile;
    message?: string;
    tokens_awarded?: number;
    profile_complete?: boolean;
  }

  // Function to toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Cancel editing - reset to original profile data
      if (profile) {
        setEditableProfile({
          name: profile.name,
          email: profile.email,
          phone_number: profile.phone_number,
          street_address: profile.street_address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          country: profile.country,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender
        });
      }
    }
    setIsEditing(!isEditing);
  };

  // Function to update profile
  const updateProfile = async () => {
    if (!profile || !editableProfile.name?.trim()) return;
    
    try {
      setUpdating(true);
      setUpdateSuccess(false);
      
      // Prepare the update data
      const updateData = {
        name: editableProfile.name,
        phone_number: editableProfile.phone_number || null,
        street_address: editableProfile.street_address || null,
        city: editableProfile.city || null,
        state: editableProfile.state || null,
        zip_code: editableProfile.zip_code || null,
        country: editableProfile.country || null,
        date_of_birth: editableProfile.date_of_birth || null,
        gender: editableProfile.gender || null
      };
      
      // Call the API with the updated data
      const response = await putRequest<ApiResponse>('/profile', updateData);
      
      if (response.success) {
        // Update the local profile state
        const updatedProfile = profile ? {
          ...profile,
          ...updateData
        } : null;
        
        setProfile(updatedProfile);
        
        // Update profile completion status
        if (updatedProfile) {
          const completionStatus = checkProfileCompletion(updatedProfile);
          setProfileCompletionStatus(completionStatus);
        }
        
        // Update the user data in localStorage to update the navbar
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.name = editableProfile.name;
          
          // Use saveAuthData to update the user information
          const token = Cookies.get('token') || '';
          const userType = localStorage.getItem('userType') || 'user';
          saveAuthData({ token, user, type: userType });
        }
        
        setIsEditing(false);
        
        // Show appropriate success message
        if (response.tokens_awarded) {
          setTokenAlert({show: true, amount: response.tokens_awarded, source: 'profile completion'});
          setTimeout(() => setTokenAlert({show: false, amount: 0, source: ''}), 8000);
        } else {
          setUpdateSuccess(true);
          setTimeout(() => setUpdateSuccess(false), 3000);
        }
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error('Profile update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Function to check profile completion
  const checkProfileCompletion = (profile: UserProfile) => {
    const requiredFields = [
      { key: 'name', label: t('Name') },
      { key: 'phone_number', label: t('PhoneNumber') },
      { key: 'street_address', label: t('StreetAddress') },
      { key: 'city', label: t('City') },
      { key: 'state', label: t('State') },
      { key: 'zip_code', label: t('ZipCode') },
      { key: 'country', label: t('Country') },
      { key: 'date_of_birth', label: t('DateOfBirth') },
      { key: 'gender', label: t('Gender') }
    ];

    const missingFields: string[] = [];
    let filledFields = 0;

    requiredFields.forEach(field => {
      const value = profile[field.key as keyof UserProfile];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field.label);
      } else {
        filledFields++;
      }
    });

    const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
    const isComplete = missingFields.length === 0;

    return { isComplete, missingFields, completionPercentage };
  };

  // Function to check if Telegram is connected
  const checkTelegramConnection = async () => {
    try {
      const response = await getRequest<{success: boolean; message: string; user?: any}>('/telegram/check-telegram-connect');
      if (response.success) {
        setIsTelegramConnected(true);
      } else {
        setIsTelegramConnected(false);
      }
    } catch (error) {
      console.error('Error checking Telegram connection:', error);
      setIsTelegramConnected(false);
    }
  };

  // Function to handle Telegram verification
  const handleTelegramVerification = async () => {
    if (!telegramCode.trim()) {
      setError(t('PleaseEnterVerificationCode'));
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await postRequest<{success: boolean; message: string; user?: any; tokens_awarded?: number}>('/telegram/verify-code', {
        verification_code: telegramCode,
        profile_complete: profileCompletionStatus.isComplete
      });

      if (response.success) {
        setIsTelegramConnected(true);
        setShowTelegramModal(false);
        setTelegramCode('');
        
        // Show success message with token award info if applicable
        if (response.tokens_awarded) {
          setTokenAlert({show: true, amount: response.tokens_awarded, source: 'Telegram connection'});
          setTimeout(() => setTokenAlert({show: false, amount: 0, source: ''}), 8000);
        } else {
          setUpdateSuccess(true);
          setTimeout(() => setUpdateSuccess(false), 3000);
        }
      } else {
        setError(response.message || t('VerificationFailed'));
      }
    } catch (err) {
      setError(t('VerificationError'));
      console.error('Telegram verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Function to handle opening Telegram modal
  const handleTelegramConnect = () => {
    setShowTelegramModal(true);
    setError('');
    setTelegramCode('');
  };

  // Handle change password (append-only)
  const handleChangePassword = async () => {
    setChangePasswordError(null);
    setChangePasswordSuccess(false);
    if (!currentPassword || !newPassword) {
      setChangePasswordError('Please fill in both current and new password');
      return;
    }
    setChangingPassword(true);
    try {
      const response = await postRequest<{ success: boolean; message?: string }>(
        '/change-password',
        { current_password: currentPassword, password: newPassword, user_id: user.id }
      );
      if (response?.success) {
        setChangePasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setChangePasswordSuccess(false), 3000);
      } else {
        setChangePasswordError(response?.message || 'Failed to change password');
      }
    } catch (err: any) {
      setChangePasswordError(
        err?.response?.data?.message || 'An error occurred while changing password'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await getRequest<ApiResponse>('/profile');
        console.log("profile", response.data);
        if (response.success) {
          setProfile(response.data);
          // Initialize the editable profile with current data
          setEditableProfile({
            name: response.data.name || '',
            email: response.data.email || '',
            phone_number: response.data.phone_number || '',
            street_address: response.data.street_address || '',
            city: response.data.city || '',
            state: response.data.state || '',
            zip_code: response.data.zip_code || '',
            country: response.data.country || '',
            date_of_birth: response.data.date_of_birth || '',
            gender: response.data.gender || ''
          });
          
          // Check profile completion status
          const completionStatus = checkProfileCompletion(response.data);
          setProfileCompletionStatus(completionStatus);
          
          // Check if Telegram is already connected based on profile data
          if (response.data.telegram_id) {
            setIsTelegramConnected(true);
          } else {
            // Double-check with the dedicated API endpoint
            checkTelegramConnection();
          }
        } else {
          setError(response.message || 'Failed to load profile');
        }
      } catch (error) {
        setError('An error occurred while fetching profile data');
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  // Generate initials from name if no avatar is available
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to open profile image upload modal
  const openImageUploadModal = () => {
    setIsImageModalOpen(true);
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  // Function to close profile image upload modal
  const closeImageUploadModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  // Function to handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      setImageError(t('InvalidImageType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError(t('FileSizeExceeded'));
      return;
    }

    setSelectedImage(file);
    setImageError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Function to upload profile image
  const uploadProfileImage = async () => {
    if (!selectedImage) {
      setImageError(t('PleaseSelectImage'));
      return;
    }

    try {
      setUploadingImage(true);
      setImageError(null);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('profile_picture', selectedImage);
      
      // Use postRequest to upload the image with FormData
      const response = await postRequest<{
        success: boolean;
        message: string;
        data: {
          profile_picture_url: string;
        };
      }>('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success) {
        // Update profile with new image URL
        setProfile(prev => prev ? {...prev, profile_picture_url: response.data.profile_picture_url} : null);

        // Update user data in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.profile_picture_url = response.data.profile_picture_url;

          const token = Cookies.get('token') || '';
          const userType = localStorage.getItem('userType') || 'user';
          saveAuthData({ token, user, type: userType });
        }

        closeImageUploadModal();
      } else {
        setImageError(response.message || t('FailedToUploadImage'));
      }
    } catch (err) {
      setImageError(t('ErrorUploadingImage'));
      console.error('Profile picture upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
        <h1 className="text-2xl font-medium mb-8 text-white pb-2 border-b border-[#2d3748]">{t('ProfileInformation')}</h1>

        {/* Profile Image Upload Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a20] rounded-lg shadow-xl border border-[#2d3748] w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-medium text-white mb-4">{t('UpdateProfilePicture')}</h3>
                
                {imageError && (
                  <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-4">
                    {imageError}
                  </div>
                )}
                
                <div className="mb-6">
                  {imagePreview ? (
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-[#2d3748] shadow-md bg-gradient-to-r from-blue-500 to-purple-600">
                      <img 
                        src={imagePreview} 
                        alt={t('ProfilePreview')} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 mx-auto rounded-full bg-[#2d3748] flex items-center justify-center text-gray-400 border border-[#3a4a61]">
                      <span className="text-sm">{t('NoImageSelected')}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('SelectImage')}</label>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/gif" 
                    onChange={handleImageSelect}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#2d3748] file:text-gray-300 hover:file:bg-[#3a4a61] file:cursor-pointer cursor-pointer block"
                  />
                  <p className="mt-1 text-xs text-gray-400">{t('FileConstraints')}</p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={closeImageUploadModal}
                    className="px-4 py-2 bg-transparent border border-[#3a4a61] text-gray-300 rounded-md hover:bg-[#2d3748] transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button 
                    onClick={uploadProfileImage}
                    disabled={uploadingImage || !selectedImage}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${uploadingImage || !selectedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('Uploading')}
                      </>
                    ) : t('Upload')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-400">{t('LoadingProfile')}</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : profile ? (
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 relative group">
              {profile.profile_picture_url ? (
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#2d3748] shadow-md bg-gradient-to-r from-blue-500 to-purple-600">
                  <img 
                    src={profile.profile_picture_url} 
                    alt={`${profile.name}'s avatar`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-medium border-2 border-[#2d3748] shadow-md">
                  {getInitials(profile.name)}
                </div>
              )}
              <button 
                onClick={openImageUploadModal}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2d3748] shadow-md flex items-center justify-center border border-[#3a4a61] text-gray-300 hover:bg-[#3a4a61] transition-colors"
                aria-label={t('UpdateProfilePicture')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              {/* Edit/Cancel Button */}
              <div className="mb-6 flex justify-end">
                <button 
                  onClick={toggleEdit}
                  className={`px-4 py-2 ${isEditing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md text-sm transition-colors flex items-center gap-2`}
                >
                  <Pencil className="w-4 h-4" />
                  {isEditing ? t('Cancel') : t('EditProfile')}
                </button>
              </div>

              {/* Profile Completion Status */}
              <div className="mb-6 p-4 bg-[#2d3748] border border-[#3a4a61] rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-white">{t('ProfileCompletion')}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profileCompletionStatus.isComplete 
                      ? 'bg-green-900/30 text-green-400 border border-green-800' 
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                  }`}>
                    {t('PercentComplete', { percent: profileCompletionStatus.completionPercentage })}
                  </span>
                </div>
                
                <div className="w-full bg-[#1a1a20] rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      profileCompletionStatus.isComplete ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${profileCompletionStatus.completionPercentage}%` }}
                  ></div>
                </div>
                
                {!profileCompletionStatus.isComplete && (
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">{t('CompleteProfileUnlock')}</p>
                    <div className="flex flex-wrap gap-2">
                      {profileCompletionStatus.missingFields.map((field, index) => (
                        <span key={index} className="px-2 py-1 bg-[#1a1a20] text-yellow-400 rounded text-xs border border-yellow-800/30">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {profileCompletionStatus.isComplete && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('ProfileCompleteMsg')}
                  </div>
                )}
              </div>

              {/* Token Award Alert */}
              {tokenAlert.show && (
                <div className="mb-4 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50 rounded-lg shadow-lg relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                  
                  <div className="relative flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">🎉 {t('Congratulations')}</h3>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full animate-pulse">
                          +{tokenAlert.amount.toLocaleString()} {t('Tokens')}
                        </span>
                      </div>
                      
                      <p className="text-blue-100 font-medium mb-1" dangerouslySetInnerHTML={{ __html: t('AwardedTokensMsg', { amount: tokenAlert.amount.toLocaleString(), source: tokenAlert.source }) }} />
                      
                      <p className="text-blue-200 text-sm">{t('TokensCredited')}</p>
                      
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{t('TokensCredited')}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setTokenAlert({show: false, amount: 0, source: ''})}
                      className="flex-shrink-0 text-blue-300 hover:text-white transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Regular Success Message */}
              {updateSuccess && (
                <div className="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-md flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-green-100 font-medium">{t('ProfileUpdated')}</p>
                    <p className="text-green-200 text-sm">{t('ProfileSaved')}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-md flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-red-100 font-medium">{t('UpdateFailed')}</p>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('Name')}</label>
                  <input 
                    type="text" 
                    value={editableProfile.name || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, name: e.target.value}))}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('Email')}</label>
                  <input 
                    type="email" 
                    value={editableProfile.email || ''} 
                    disabled
                    className="w-full px-3 py-2 bg-[#1a1a20] border border-[#2d3748] rounded-md text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('PhoneNumber')}</label>
                  <input 
                    type="tel" 
                    value={editableProfile.phone_number || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, phone_number: e.target.value}))}
                    disabled={!isEditing}
                    placeholder={t('PhonePlaceholder')}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('Gender')}</label>
                  <select 
                    value={editableProfile.gender || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, gender: e.target.value}))}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <option value="">{t('SelectGender')}</option>
                    <option value="male">{t('Male')}</option>
                    <option value="female">{t('Female')}</option>
                    <option value="other">{t('Other')}</option>
                    <option value="prefer_not_to_say">{t('PreferNotToSay')}</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('DateOfBirth')}</label>
                  <input 
                    type="date" 
                    value={editableProfile.date_of_birth || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, date_of_birth: e.target.value}))}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Street Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('StreetAddress')}</label>
                  <input 
                    type="text" 
                    value={editableProfile.street_address || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, street_address: e.target.value}))}
                    disabled={!isEditing}
                    placeholder={t('StreetPlaceholder')}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('City')}</label>
                  <input 
                    type="text" 
                    value={editableProfile.city || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, city: e.target.value}))}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('State')}</label>
                  <input 
                    type="text" 
                    value={editableProfile.state || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, state: e.target.value}))}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('ZipCode')}</label>
                  <input 
                    type="text" 
                    value={editableProfile.zip_code || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, zip_code: e.target.value}))}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">{t('Country')}</label>
                  <input 
                    type="text" 
                    value={editableProfile.country || ''} 
                    onChange={(e) => setEditableProfile(prev => ({...prev, country: e.target.value}))}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isEditing 
                        ? 'bg-[#25252d] text-gray-200' 
                        : 'bg-[#1a1a20] text-gray-400 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Save Button - Only show when editing */}
              {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={updateProfile}
                    disabled={updating || !editableProfile.name?.trim()}
                    className={`px-6 py-2 ${updating ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-medium rounded-md text-sm transition-colors flex items-center gap-2`}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('Saving')}
                      </>
                    ) : t('SaveChanges')}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            {t('NoProfileInformationAvailable')}
          </div>
        )}
      </div>
      
      {/* Notifications Card */}
      {/* <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
        <h1 className="text-2xl font-medium mb-8 text-white pb-2 border-b border-[#2d3748]">Notifications</h1>
        
        <div className="flex justify-between items-center py-4">
          <div>
            <h3 className="text-white font-medium">Newsletter</h3>
            <p className="text-gray-400 text-sm mt-1">Receive our newsletter with AI feature updates and decryption insights.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <div className={`w-11 h-6 rounded-full peer ${notifications ? 'bg-blue-600' : 'bg-gray-700'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div> */}
      
      {/* Messaging Integration Card */}
      <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
        <div className="flex items-center justify-between mb-8 border-b border-[#2d3748] pb-2">
          <h1 className="text-2xl font-medium text-white">{t('AppsIntegration')}</h1>
          <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-md border border-blue-500/30">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-300 text-sm font-medium">{t('Get4000FreeTokens')}</span>
          </div>
        </div>
        
        {/* Telegram Integration */}
        <div className="flex justify-between items-center py-4 border-b border-[#2d3748]">
          <div>
            <h3 className="text-white font-medium flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#26A5E4">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.055-1.37 5.385-.168.56-.505 1.334-.825 1.334-.319 0-.654-.331-.905-.586-.465-.474-2.229-1.447-3.027-1.892-.837-.466-.196-1.166.152-1.862.363-.697 2.889-2.573 3.023-2.932.017-.046.026-.105.026-.164a.298.298 0 0 0-.297-.297c-.09 0-.176.047-.238.123-1.045 1.285-2.979 3.076-3.163 3.227-.466.387-.466.387-1.472.046-1.006-.34-1.601-.586-1.601-.586s-.505-.34.359-.68c.865-.34 4.693-2.026 6.294-2.706.865-.34 1.601-.586 1.601-.586s.505-.34.359-.68c-.073-.34-.432-.34-.432-.34s-2.467.833-4.693 1.666c-2.229.833-2.229.833-2.229.833-.865.34-1.73.833-1.73 1.666 0 .833.865 1.666 1.73 1.666h1.73c.865 0 2.229.833 3.096 1.666.865.833 1.73 1.666 2.596 1.666.865 0 1.73-.833 1.73-1.666v-3.332c0-.833.505-1.67.505-1.67s.505-.833-.359-1.173c-.865-.34-1.73.833-1.73.833z"/>
              </svg>
              {t('Telegram')}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{t('LinkTelegramAccount')}</p>
          </div>
          {isTelegramConnected ? (
            <button 
              className="relative px-4 py-2 bg-green-600 text-white rounded-md transition-colors flex items-center"
              disabled
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('Connected')}</span>
            </button>
          ) : (
            <button 
              onClick={handleTelegramConnect}
              className="relative px-4 py-2 bg-[#26A5E4] hover:bg-[#1e96d3] text-white rounded-md transition-colors group"
            >
              <span>{t('Connect')}</span>
              <span className="absolute -top-2 -right-2 bg-blue-600 text-xs text-white px-1.5 py-0.5 rounded-full font-medium group-hover:animate-pulse">+4000</span>
            </button>
          )}
        </div>
        
        {/* WhatsApp Integration */}
        {/* <div className="flex justify-between items-center py-4">
          <div>
            <h3 className="text-white font-medium flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t('WhatsApp')}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{t('LinkWhatsAppAccount')}</p>
          </div>
          <button className="relative px-4 py-2 bg-[#25D366] hover:bg-[#1eb958] text-white rounded-md transition-colors group">
            <span>{t('Connect')}</span>
            <span className="absolute -top-2 -right-2 bg-green-600 text-xs text-white px-1.5 py-0.5 rounded-full font-medium group-hover:animate-pulse">+50</span>
          </button>
        </div> */}
      </div>
      
      {/* Change Password Card (append-only) */}
      <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
        <h1 className="text-2xl font-medium mb-8 text-white pb-2 border-b border-[#2d3748]">{t('ChangePassword')}</h1>

        {changePasswordSuccess && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-md flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-green-100 font-medium">{t('PasswordUpdated')}</p>
              <p className="text-green-200 text-sm">{t('YourPasswordHasBeenChangedSuccessfully')}.</p>
            </div>
          </div>
        )}
        {changePasswordError && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-md flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-100 font-medium">{t('FailedToUpdatePassword')}</p>
              <p className="text-red-200 text-sm">{changePasswordError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t('CurrentPassword')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#25252d] text-gray-200"
              placeholder={t("EnterCurrentPassword")}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t("NewPassword")}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#2d3748] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-[#25252d] text-gray-200"
              placeholder={t("EnterNewPassword")}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword}
            className={`px-6 py-2 ${changingPassword ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-medium rounded-md text-sm transition-colors flex items-center gap-2`}
          >
            {changingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('Saving')}
              </>
            ) : t('UpdatePassword')}
          </button>
        </div>
      </div>
      
      {/* Privacy Card */}
      {/* <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
        <h1 className="text-2xl font-medium mb-8 text-white pb-2 border-b border-[#2d3748]">Privacy</h1>
        
        <div className="flex justify-between items-center py-4">
          <div className="flex items-start gap-2">
            <div>
              <h3 className="text-white font-medium flex items-center gap-2">
                Disable Telemetry
                <button className="text-gray-400 hover:text-gray-300" title="Information about telemetry data">
                  <Info className="w-4 h-4" />
                </button>
              </h3>
              <p className="text-gray-400 text-sm mt-1">Opt out of non-essential data collection that helps us improve AI analysis accuracy and chart decryption algorithms.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={telemetry}
              onChange={() => setTelemetry(!telemetry)}
            />
            <div className={`w-11 h-6 rounded-full peer ${telemetry ? 'bg-blue-600' : 'bg-gray-700'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div> */}
      
      {/* Delete Account Card */}
      {/* <div className="bg-[#1a1a20] rounded-lg shadow-lg p-8 mb-8 border border-[#2d3748]">
        <h1 className="text-2xl font-medium mb-8 text-white pb-2 border-b border-[#2d3748]">Delete account</h1>
        
        <div className="flex justify-between items-center py-4">
          <div>
            <p className="text-gray-400">Once you delete your account, all your saved analyses, chart histories, and AI conversation data will be permanently removed. Please be certain.</p>
          </div>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-sm transition-colors">
            Delete account
          </button>
        </div>
      </div> */}
      
      {/* Telegram Verification Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[#1a1a20] border border-[#3a3a45] rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative">
            {/* Close button */}
            <button 
              onClick={() => {
                setShowTelegramModal(false);
                setTelegramCode('');
              }}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-[#2d3748] rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Modal content with responsive layout */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Modal header */}
              <div className="flex items-center mb-6">
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="#26A5E4">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.055-1.37 5.385-.168.56-.505 1.334-.825 1.334-.319 0-.654-.331-.905-.586-.465-.474-2.229-1.447-3.027-1.892-.837-.466-.196-1.166.152-1.862.363-.697 2.889-2.573 3.023-2.932.017-.046.026-.105.026-.164a.298.298 0 0 0-.297-.297c-.09 0-.176.047-.238.123-1.045 1.285-2.979 3.076-3.163 3.227-.466.387-.466.387-1.472.046-1.006-.34-1.601-.586-1.601-.586s-.505-.34.359-.68c.865-.34 4.693-2.026 6.294-2.706.865-.34 1.601-.586 1.601-.586s.505-.34.359-.68c-.073-.34-.432-.34-.432-.34s-2.467.833-4.693 1.666c-2.229.833-2.229.833-2.229.833-.865.34-1.73.833-1.73 1.666 0 .833.865 1.666 1.73 1.666h1.73c.865 0 2.229.833 3.096 1.666.865.833 1.73 1.666 2.596 1.666.865 0 1.73-.833 1.73-1.666v-3.332c0-.833.505-1.67.505-1.67s.505-.833-.359-1.173c-.865-.34-1.73.833-1.73.833z"/>
                </svg>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">{t('ConnectTelegram')}</h2>
              </div>
              
              {/* Token reward notice */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-md p-3 sm:p-4 mb-6 flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-300 text-sm sm:text-base">{t('ConnectTelegramNow')}</span>
              </div>
              
              {/* Profile completion status notice */}
              {!profileCompletionStatus.isComplete && (
                <div className="bg-amber-900/30 border border-amber-500/30 rounded-md p-3 sm:p-4 mb-6 flex items-start">
                  <svg className="w-5 h-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-amber-300 text-sm font-medium mb-1">{t('CompleteProfileUnlock')}</p>
                    <p className="text-amber-200 text-sm mb-2">{t('CompleteProfileUnlockDesc')}</p>
                    <p className="text-amber-200 text-xs">{t('MissingFields', { fields: profileCompletionStatus.missingFields.join(', ') })}</p>
                  </div>
                </div>
              )}
              
              {/* Step-by-step layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left side - QR Code and Telegram Button */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">{t('Step1ConnectToBot')}</h3>
                    <p className="text-gray-300 text-sm mb-4">{t('ScanQRCodeOrOpenTelegram')}</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <img 
                      src="/telegram-qr.png" 
                      alt={t('TelegramBotQRCode')} 
                      className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg border-2 border-[#26A5E4] p-1"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/200x200/26A5E4/ffffff?text=Telegram+Bot';
                      }}
                    />
                    
                    <a
                      href="https://t.me/DecyphersAI_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-[#26A5E4] hover:bg-[#1e96d3] text-white rounded-md transition-colors flex justify-center items-center font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.055-1.37 5.385-.168.56-.505 1.334-.825 1.334-.319 0-.654-.331-.905-.586-.465-.474-2.229-1.447-3.027-1.892-.837-.466-.196-1.166.152-1.862.363-.697 2.889-2.573 3.023-2.932.017-.046.026-.105.026-.164a.298.298 0 0 0-.297-.297c-.09 0-.176.047-.238.123-1.045 1.285-2.979 3.076-3.163 3.227-.466.387-.466.387-1.472.046-1.006-.34-1.601-.586-1.601-.586s-.505-.34.359-.68c.865-.34 4.693-2.026 6.294-2.706.865-.34 1.601-.586 1.601-.586s.505-.34.359-.68c-.073-.34-.432-.34-.432-.34s-2.467.833-4.693 1.666c-2.229.833-2.229.833-2.229.833-.865.34-1.73.833-1.73 1.666 0 .833.865 1.666 1.73 1.666h1.73c.865 0 2.229.833 3.096 1.666.865.833 1.73 1.666 2.596 1.666.865 0 1.73-.833 1.73-1.666v-3.332c0-.833.505-1.67.505-1.67s.505-.833-.359-1.173c-.865-.34-1.73.833-1.73.833z"/>
                      </svg>
                      {t('OpenTelegramApp')}
                    </a>
                  </div>
                </div>
                
                {/* Right side - Instructions and Verification */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">{t('Step2GetVerificationCode')}</h3>
                    <div className="bg-[#252530] rounded-md p-4 mb-4">
                      <p className="text-gray-300 text-sm mb-3">{t('AfterConnectingWithOurBot')}</p>
                      <ol className="list-decimal list-inside text-gray-300 text-sm space-y-2">
                        <li>{t('SendStartCommand')}</li>
                        <li>{t('ReceiveVerificationCode')}</li>
                        <li>{t('EnterCodeBelow')}</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">{t('Step3EnterVerificationCode')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{t('VerificationCode')}</label>
                        <input
                          type="text"
                          value={telegramCode}
                          onChange={(e) => setTelegramCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          className="block w-full px-4 py-3 rounded-md bg-[#252530] border border-[#3a3a45] text-white focus:ring-blue-500 focus:border-blue-500 text-center tracking-widest text-xl"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      
                      <button
                        onClick={handleTelegramVerification}
                        disabled={telegramCode.length !== 6 || isVerifying}
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center font-medium"
                      >
                        {isVerifying ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('Verifying')}
                          </>
                        ) : t('VerifyAndConnect')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
