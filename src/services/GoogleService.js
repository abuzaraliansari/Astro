import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { Capacitor } from '@capacitor/core';

export class GoogleService {
    static instance = null;

    constructor() {
        if (GoogleService.instance) {
            return GoogleService.instance;
        }
        this.init();
        GoogleService.instance = this;
    }

    async init() {
        if (Capacitor.isNativePlatform()) {
            await GoogleAuth.initialize({
                clientId: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID,
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            });
        }
    }

    async login() {
        try {
            if (!Capacitor.isNativePlatform()) {
                await GoogleAuth.initialize({
                    clientId: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID,
                    scopes: ['profile', 'email'],
                    grantOfflineAccess: true,
                });
            }

            const response = await GoogleAuth.signIn();
            
            return {
                success: true,
                user: {
                    id: response.id,
                    email: response.email,
                    name: response.name,
                    given_name: response.givenName,
                    family_name: response.familyName,
                    picture: response.imageUrl,
                },
                idToken: response.authentication.idToken,
                accessToken: response.authentication.accessToken
            };
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            return {
                success: false,
                error: error.message || 'Google sign-in failed'
            };
        }
    }

    async logout() {
        try {
            await GoogleAuth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const googleService = new GoogleService();
