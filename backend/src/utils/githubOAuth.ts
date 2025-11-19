import axios from 'axios';

const GITHUB_CLIENT_ID="Ov23lifJk3Sq0N8AFdeU"
const GITHUB_CLIENT_SECRET="e39e60f87a748a9be9960e9502914c366fbaf721"
const FIREBASE_CALLBACK_URL = "https://gitmatch-20e6d.firebaseapp.com/__/auth/handler"
const GITHUB_CALLBACK_URL="http://localhost:3000/api/auth/github/callback"

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  email: string;
  bio: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export class GitHubOAuth {
  // Generate GitHub OAuth URL
  static getAuthorizationUrl(): string {
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const scope = 'user:email,read:user';
    return `${baseUrl}?client_id=${GITHUB_CLIENT_ID}&scope=${scope}`;
  }

  // Exchange code for access token
  static async getAccessToken(code: string): Promise<string> {
    const response = await axios.post<{ access_token: string }>('https://github.com/login/oauth/access_token', 
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code
      },
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    return response.data.access_token;
  }

  // Get user info from GitHub
  static async getUserInfo(accessToken: string): Promise<GitHubUser> {
    const response = await axios.get<GitHubUser>('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return response.data;
  }

  // Get user email from GitHub (primary email)
  static async getUserEmail(accessToken: string): Promise<string> {
    const response = await axios.get<any[]>('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const emails = response.data;
    const primaryEmail = emails.find((email: any) => email.primary && email.verified);
    return primaryEmail ? primaryEmail.email : emails[0]?.email || '';
  }
}