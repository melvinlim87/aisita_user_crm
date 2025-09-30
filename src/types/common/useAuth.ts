export interface User {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    email_verified_at: string | null;
    telegram_id: string | null;
    bonuses_earned: number;
    total_referrals: number;
    total_tokens_used: number;
    created_at: string;
    updated_at: string;
    firebase_uid: string | null;
    tokens: number;
    referral_code: string;
    referral_count: number;
    referred_by: string | null;
    referral_code_created_at: string;
    profile_picture_url?: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface AuthData {
    token: string;
    user: User;
    type: string;
}