import { Router } from 'express';
import admin from '../firebase/admin.js';
import axios from 'axios';

const router = Router();

// Cache setup
const cache = new Map();
const CACHE_TTL = {
  GITHUB_DATA: 60 * 60 * 1000, // 1 hour
  MATCH_SCORE: 6 * 60 * 60 * 1000, // 6 hours
  TECH_DNA: 4 * 60 * 60 * 1000, // 4 hours
};

// Types
interface GitHubTechDNA {
  primaryLanguages: string[];
  frameworks: string[];
  tools: string[];
  domains: string[];
  activityMetrics: {
    commitFrequency: 'high' | 'medium' | 'low';
    preferredHours: number[];
    reposCount: number;
    starsCount: number;
    followers: number;
    accountAge: number;
  };
  projectPatterns: {
    personalProjects: number;
    collaborativeProjects: number;
    forkRatio: number;
    recentActivity: boolean;
  };
  interests: {
    starredRepos: string[];
    repositoryTopics: string[];
    bioKeywords: string[];
  };
  openSource: {
    contributions: number;
    popularRepos: number;
    issueParticipation: boolean;
    maintainer: boolean;
  };
}

interface MatchRequest {
  userAId: string;
  userBId: string;
}

interface MatchResponse {
  success: boolean;
  matchScore: number;
  compatibility: {
    overall: number;
    profile: number;
    technical: number;
  };
  breakdown: {
    location: { score: number; insight: string };
    ageLifeStage: { score: number; insight: string };
    goals: { score: number; insight: string };
    interests: { score: number; insight: string };
    techSynergy: { score: number; insight: string };
    activityPatterns: { score: number; insight: string };
    projectAlignment: { score: number; insight: string };
    openSource: { score: number; insight: string };
  };
  insights: {
    strengths: string[];
    considerations: string[];
    recommendations: string[];
  };
  techAnalysis: {
    userA: GitHubTechDNA;
    userB: GitHubTechDNA;
    complementaryTech: string[];
    sharedInterests: string[];
  };
}

// Middleware
const verifyToken = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GitHub Data Fetcher
class GitHubDataService {
  private async fetchGitHubData(username: string): Promise<any> {
    const cacheKey = `github:${username}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL.GITHUB_DATA) {
      return cached.data;
    }

    try {
      // Fetch user data
      const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
        headers: { 'User-Agent': 'GitMatch-App' }
      }).catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      });

      // Fetch repositories
      const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers: { 'User-Agent': 'GitMatch-App' }
      }).catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      });

      // Fetch starred repos
      const starsResponse = await axios.get(`https://api.github.com/users/${username}/starred?per_page=100`, {
        headers: { 'User-Agent': 'GitMatch-App' }
      }).catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      });

      const data = {
        user: userResponse?.data || { created_at: new Date().toISOString(), followers: 0, stargazers_count: 0, bio: '' },
        repos: reposResponse?.data || [],
        starred: starsResponse?.data || []
      };

      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`GitHub API error for ${username}:`, error);
      // Return a safe default so matching can continue without a hard failure
      return {
        user: { created_at: new Date().toISOString(), followers: 0, stargazers_count: 0, bio: '' },
        repos: [],
        starred: []
      };
    }
  }

  async extractTechDNA(githubProfileUrl: string): Promise<GitHubTechDNA> {
    let username = '';
    try {
      // Try to parse as a URL first
      const parsed = new URL(githubProfileUrl);
      username = parsed.pathname.replace(/^\//, '').split('/')[0];
    } catch (e) {
      // Fallback to string manipulation
      username = githubProfileUrl.replace('https://github.com/', '').replace('http://github.com/', '').replace('github.com/', '').split('/')[0];
    }

    // Guard against non-user inputs like 'github.com' or empty usernames
    if (!username || username.includes('.') || username.toLowerCase() === 'github.com') {
      return {
        primaryLanguages: [],
        frameworks: [],
        tools: [],
        domains: [],
        activityMetrics: {
          commitFrequency: 'low',
          preferredHours: [],
          reposCount: 0,
          starsCount: 0,
          followers: 0,
          accountAge: 0
        },
        projectPatterns: {
          personalProjects: 0,
          collaborativeProjects: 0,
          forkRatio: 0,
          recentActivity: false
        },
        interests: {
          starredRepos: [],
          repositoryTopics: [],
          bioKeywords: []
        },
        openSource: {
          contributions: 0,
          popularRepos: 0,
          issueParticipation: false,
          maintainer: false
        }
      } as GitHubTechDNA;
    }
    const cacheKey = `techdna:${username}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL.TECH_DNA) {
      return cached.data;
    }

    const githubData = await this.fetchGitHubData(username);
    const { user, repos, starred } = githubData;

    // Analyze languages
    const languageStats = new Map<string, number>();
    repos.forEach((repo: any) => {
      if (repo.language) {
        languageStats.set(repo.language, (languageStats.get(repo.language) || 0) + 1);
      }
    });
    const primaryLanguages = Array.from(languageStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    // Extract frameworks and tools from repo topics and descriptions
    const frameworks = new Set<string>();
    const tools = new Set<string>();
    const domains = new Set<string>();

    repos.forEach((repo: any) => {
      // Analyze topics
      if (repo.topics) {
        repo.topics.forEach((topic: string) => {
          if (topic.includes('react') || topic.includes('vue') || topic.includes('angular')) frameworks.add('Frontend');
          if (topic.includes('node') || topic.includes('express') || topic.includes('django')) frameworks.add('Backend');
          if (topic.includes('mobile') || topic.includes('ios') || topic.includes('android')) domains.add('Mobile');
          if (topic.includes('ai') || topic.includes('ml') || topic.includes('data')) domains.add('AI/ML');
          if (topic.includes('devops') || topic.includes('docker') || topic.includes('kubernetes')) tools.add('DevOps');
        });
      }

      // Analyze description
      const desc = (repo.description || '').toLowerCase();
      if (desc.includes('react') || desc.includes('vue') || desc.includes('angular')) frameworks.add('Frontend');
      if (desc.includes('node') || desc.includes('express') || desc.includes('spring')) frameworks.add('Backend');
      if (desc.includes('mobile') || desc.includes('flutter') || desc.includes('react-native')) domains.add('Mobile');
      if (desc.includes('machine learning') || desc.includes('ai') || desc.includes('tensorflow')) domains.add('AI/ML');
      if (desc.includes('docker') || desc.includes('kubernetes') || desc.includes('aws')) tools.add('DevOps');
    });

    // Activity analysis
    const totalCommits = repos.reduce((sum: number, repo: any) => sum + (repo.size || 0), 0);
    const commitFrequency = totalCommits > 1000 ? 'high' : totalCommits > 100 ? 'medium' : 'low';

    // Recent activity (last 30 days)
    const recentActivity = repos.some((repo: any) => {
      const lastUpdate = new Date(repo.updated_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastUpdate > thirtyDaysAgo;
    });

    // Project patterns
    const personalProjects = repos.filter((repo: any) => !repo.fork).length;
    const collaborativeProjects = repos.filter((repo: any) => repo.fork).length;
    const forkRatio = collaborativeProjects / repos.length;

    // Open source analysis
    const popularRepos = repos.filter((repo: any) => repo.stargazers_count > 10).length;
    const contributions = repos.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0);
    const issueParticipation = repos.some((repo: any) => repo.open_issues_count > 0);
    const maintainer = popularRepos > 0;

    // Interests from starred repos and bio
    const starredRepos = starred.slice(0, 20).map((repo: any) => repo.full_name);
    const reposArr = repos as any[];
    const repositoryTopics: string[] = Array.from(new Set<string>(reposArr.flatMap((repo: any) => (repo.topics || []) as string[]))).slice(0, 10);
    const bioKeywords = (user.bio || '').toLowerCase().split(' ').filter((word: string) => word.length > 3);

    // Account age in years
    const accountAge = new Date().getFullYear() - new Date(user.created_at).getFullYear();

    const techDNA: GitHubTechDNA = {
      primaryLanguages,
      frameworks: Array.from(frameworks),
      tools: Array.from(tools),
      domains: Array.from(domains),
      activityMetrics: {
        commitFrequency,
        preferredHours: [9, 10, 11, 14, 15, 16], // Default working hours
        reposCount: repos.length,
        starsCount: user.stargazers_count || 0,
        followers: user.followers,
        accountAge
      },
      projectPatterns: {
        personalProjects,
        collaborativeProjects,
        forkRatio: isNaN(forkRatio) ? 0 : forkRatio,
        recentActivity
      },
      interests: {
        starredRepos,
        repositoryTopics,
        bioKeywords
      },
      openSource: {
        contributions,
        popularRepos,
        issueParticipation,
        maintainer
      }
    };

    cache.set(cacheKey, { data: techDNA, timestamp: Date.now() });
    return techDNA;
  }
}

// Matching Engine
class MatchingEngine {
  private githubService = new GitHubDataService();

  // Profile Compatibility (35%)
  private calculateProfileCompatibility(userA: any, userB: any) {
    let totalScore = 0;
    const breakdown: any = {};

    // Location (12%)
    const locationScore = this.calculateLocationScore(userA.location, userB.location);
    totalScore += locationScore;
    breakdown.location = { 
      score: locationScore, 
      insight: this.getLocationInsight(userA.location, userB.location) 
    };

    // Age & Life Stage (8%)
    const ageScore = this.calculateAgeScore(userA.age, userB.age);
    totalScore += ageScore;
    breakdown.ageLifeStage = { 
      score: ageScore, 
      insight: this.getAgeInsight(userA.age, userB.age) 
    };

    // Goals (7%)
    const goalsScore = this.calculateGoalsScore(userA.goal, userB.goal);
    totalScore += goalsScore;
    breakdown.goals = { 
      score: goalsScore, 
      insight: this.getGoalsInsight(userA.goal, userB.goal) 
    };

    // Interests (8%)
    const interestsScore = this.calculateInterestsScore(userA.interest, userB.interest);
    totalScore += interestsScore;
    breakdown.interests = { 
      score: interestsScore, 
      insight: this.getInterestsInsight(userA.interest, userB.interest) 
    };

    return { score: totalScore, breakdown };
  }

  // Technical Compatibility (65%)
  private calculateTechnicalCompatibility(techDNAA: GitHubTechDNA, techDNAB: GitHubTechDNA) {
    let totalScore = 0;
    const breakdown: any = {};

    // Tech Synergy (25%)
    const techSynergyScore = this.calculateTechSynergy(techDNAA, techDNAB);
    totalScore += techSynergyScore;
    breakdown.techSynergy = {
      score: techSynergyScore,
      insight: this.getTechSynergyInsight(techDNAA, techDNAB)
    };

    // Activity Patterns (15%)
    const activityScore = this.calculateActivityCompatibility(techDNAA, techDNAB);
    totalScore += activityScore;
    breakdown.activityPatterns = {
      score: activityScore,
      insight: this.getActivityInsight(techDNAA, techDNAB)
    };

    // Project Alignment (15%)
    const projectScore = this.calculateProjectAlignment(techDNAA, techDNAB);
    totalScore += projectScore;
    breakdown.projectAlignment = {
      score: projectScore,
      insight: this.getProjectInsight(techDNAA, techDNAB)
    };

    // Open Source (10%)
    const openSourceScore = this.calculateOpenSourceCompatibility(techDNAA, techDNAB);
    totalScore += openSourceScore;
    breakdown.openSource = {
      score: openSourceScore,
      insight: this.getOpenSourceInsight(techDNAA, techDNAB)
    };

    return { score: totalScore, breakdown };
  }

  // Individual scoring methods
  private calculateLocationScore(locA: string, locB: string): number {
    if (!locA || !locB) return 3; // Default score if missing
    
    const locALower = locA.toLowerCase();
    const locBLower = locB.toLowerCase();
    
    if (locALower === locBLower) return 12;
    if (locALower.includes(locBLower) || locBLower.includes(locALower)) return 9;
    if (this.sameCountry(locALower, locBLower)) return 6;
    return 3;
  }

  private calculateAgeScore(ageA?: number, ageB?: number): number {
    if (!ageA || !ageB) return 4;
    
    const ageDiff = Math.abs(ageA - ageB);
    if (ageDiff <= 2) return 8;
    if (ageDiff <= 5) return 6;
    if (ageDiff <= 10) return 4;
    return 2;
  }

  private calculateGoalsScore(goalA?: string, goalB?: string): number {
    if (!goalA || !goalB) return 3.5;
    
    const goals = [goalA.toLowerCase(), goalB.toLowerCase()];
    if (goals[0] === goals[1]) return 7;
    
    const compatiblePairs = [
      ['friendship', 'casual'],
      ['casual', 'long term'],
      ['mentorship', 'learning']
    ];
    
    if (compatiblePairs.some(pair => 
      (pair[0] === goals[0] && pair[1] === goals[1]) ||
      (pair[1] === goals[0] && pair[0] === goals[1])
    )) return 5;
    
    return 1;
  }

  private calculateInterestsScore(interestsA?: string, interestsB?: string): number {
    if (!interestsA || !interestsB) return 2;
    
    const interestsListA = interestsA.split(',').map(i => i.trim().toLowerCase());
    const interestsListB = interestsB.split(',').map(i => i.trim().toLowerCase());
    
    const common = interestsListA.filter(interest => interestsListB.includes(interest));
    const overlapRatio = common.length / Math.max(interestsListA.length, interestsListB.length);
    
    if (overlapRatio > 0.6) return 8;
    if (overlapRatio > 0.3) return 6;
    if (overlapRatio > 0.1) return 4;
    return 1;
  }

  private calculateTechSynergy(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): number {
    // Check for complementary tech stacks
    const hasFrontendA = dnaA.frameworks.includes('Frontend') || dnaA.domains.includes('Frontend');
    const hasBackendA = dnaA.frameworks.includes('Backend') || dnaA.domains.includes('Backend');
    const hasFrontendB = dnaB.frameworks.includes('Frontend') || dnaB.domains.includes('Frontend');
    const hasBackendB = dnaB.frameworks.includes('Backend') || dnaB.domains.includes('Backend');
    
    // Perfect complementary match
    if ((hasFrontendA && hasBackendB) || (hasBackendA && hasFrontendB)) return 25;
    
    // Same stack
    const commonLanguages = dnaA.primaryLanguages.filter(lang => dnaB.primaryLanguages.includes(lang));
    if (commonLanguages.length >= 2) return 18;
    
    // Some overlap
    if (commonLanguages.length >= 1) return 12;
    
    return 5;
  }

  private calculateActivityCompatibility(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): number {
    const freqA = dnaA.activityMetrics.commitFrequency;
    const freqB = dnaB.activityMetrics.commitFrequency;
    
    if (freqA === freqB) return 15;
    if ((freqA === 'high' && freqB === 'medium') || (freqA === 'medium' && freqB === 'high')) return 12;
    if ((freqA === 'medium' && freqB === 'low') || (freqA === 'low' && freqB === 'medium')) return 8;
    return 4;
  }

  private calculateProjectAlignment(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): number {
    const commonTopics = dnaA.interests.repositoryTopics.filter(topic => 
      dnaB.interests.repositoryTopics.includes(topic)
    );
    
    const commonStars = dnaA.interests.starredRepos.filter(star => 
      dnaB.interests.starredRepos.includes(star)
    );
    
    const totalAlignment = commonTopics.length + commonStars.length;
    
    if (totalAlignment >= 5) return 15;
    if (totalAlignment >= 3) return 12;
    if (totalAlignment >= 1) return 8;
    return 3;
  }

  private calculateOpenSourceCompatibility(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): number {
    const bothActive = dnaA.openSource.contributions > 0 && dnaB.openSource.contributions > 0;
    const bothPopular = dnaA.openSource.popularRepos > 0 && dnaB.openSource.popularRepos > 0;
    
    if (bothActive && bothPopular) return 10;
    if (bothActive) return 8;
    if (dnaA.openSource.contributions > 0 || dnaB.openSource.contributions > 0) return 5;
    return 2;
  }

  // Insight generators
  private getLocationInsight(locA: string, locB: string): string {
    if (!locA || !locB) return "Location data not available";
    if (locA.toLowerCase() === locB.toLowerCase()) return "Perfect location match!";
    return `Different locations: ${locA} & ${locB}`;
  }

  private getAgeInsight(ageA?: number, ageB?: number): string {
    if (!ageA || !ageB) return "Age information not available";
    const diff = Math.abs(ageA - ageB);
    if (diff <= 2) return "Very close in age";
    if (diff <= 5) return "Similar age range";
    return `Age difference: ${diff} years`;
  }

  private getTechSynergyInsight(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): string {
    const hasFrontendA = dnaA.frameworks.includes('Frontend');
    const hasBackendA = dnaA.frameworks.includes('Backend');
    const hasFrontendB = dnaB.frameworks.includes('Frontend');
    const hasBackendB = dnaB.frameworks.includes('Backend');
    
    if ((hasFrontendA && hasBackendB) || (hasBackendA && hasFrontendB)) {
      return "Perfect full-stack combination!";
    }
    
    const commonLangs = dnaA.primaryLanguages.filter(lang => dnaB.primaryLanguages.includes(lang));
    if (commonLangs.length > 0) {
      return `Shared languages: ${commonLangs.join(', ')}`;
    }
    
    return "Different technical backgrounds";
  }

  // Add other insight methods similarly...
  private getActivityInsight(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): string {
    const freqA = dnaA.activityMetrics.commitFrequency;
    const freqB = dnaB.activityMetrics.commitFrequency;
    
    if (freqA === freqB) return `Both have ${freqA} activity levels`;
    return `Different activity patterns: ${freqA} vs ${freqB}`;
  }

  private getGoalsInsight(goalA?: string, goalB?: string): string {
    if (!goalA || !goalB) return "Goals not specified";
    if (goalA === goalB) return `Both looking for ${goalA}`;
    return `Different goals: ${goalA} & ${goalB}`;
  }

  private getInterestsInsight(interestsA?: string, interestsB?: string): string {
    if (!interestsA || !interestsB) return "Interests not specified";
    return "Check shared interests above";
  }

  private getProjectInsight(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): string {
    const commonTopics = dnaA.interests.repositoryTopics.filter(topic => 
      dnaB.interests.repositoryTopics.includes(topic)
    );
    if (commonTopics.length > 0) return `Shared project interests: ${commonTopics.slice(0, 3).join(', ')}`;
    return "Different project focus areas";
  }

  private getOpenSourceInsight(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): string {
    const bothActive = dnaA.openSource.contributions > 0 && dnaB.openSource.contributions > 0;
    if (bothActive) return "Both are active in open source!";
    if (dnaA.openSource.contributions > 0 || dnaB.openSource.contributions > 0) return "One is active in open source";
    return "Limited open source involvement";
  }

  private sameCountry(locA: string, locB: string): boolean {
    // Simple country detection - in production, use a proper geocoding service
    const countries = ['usa', 'united states', 'india', 'canada', 'uk', 'germany', 'france'];
    return countries.some(country => locA.includes(country) && locB.includes(country));
  }

  // Main matching method
  async calculateMatch(userAId: string, userBId: string): Promise<MatchResponse> {
    const cacheKey = `match:${userAId}:${userBId}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL.MATCH_SCORE) {
      return cached.data;
    }

    // Fetch user profiles
    const [userADoc, userBDoc] = await Promise.all([
      admin.firestore().collection('users').doc(userAId).get(),
      admin.firestore().collection('users').doc(userBId).get()
    ]);

    if (!userADoc.exists || !userBDoc.exists) {
      throw new Error('One or both users not found');
    }

    const userA = userADoc.data()!;
    const userB = userBDoc.data()!;

    // Fetch GitHub tech DNA
    const [techDNAA, techDNAB] = await Promise.all([
      this.githubService.extractTechDNA(userA.githubProfileUrl),
      this.githubService.extractTechDNA(userB.githubProfileUrl)
    ]);

    // Calculate scores
    const profileCompatibility = this.calculateProfileCompatibility(userA, userB);
    const technicalCompatibility = this.calculateTechnicalCompatibility(techDNAA, techDNAB);

    const overallScore = profileCompatibility.score + technicalCompatibility.score;

    // Generate insights
    const insights = this.generateInsights(userA, userB, techDNAA, techDNAB, overallScore);

    // Find complementary tech and shared interests
    const complementaryTech = this.findComplementaryTech(techDNAA, techDNAB);
    const sharedInterests = this.findSharedInterests(techDNAA, techDNAB);

    const result: MatchResponse = {
      success: true,
      matchScore: Math.round(overallScore),
      compatibility: {
        overall: Math.round(overallScore),
        profile: Math.round(profileCompatibility.score),
        technical: Math.round(technicalCompatibility.score)
      },
      breakdown: profileCompatibility.breakdown as any,
      insights,
      techAnalysis: {
        userA: techDNAA,
        userB: techDNAB,
        complementaryTech,
        sharedInterests
      }
    };

    // Merge technical breakdown
    Object.assign(result.breakdown, technicalCompatibility.breakdown);

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  private generateInsights(userA: any, userB: any, dnaA: GitHubTechDNA, dnaB: GitHubTechDNA, score: number) {
    const strengths: string[] = [];
    const considerations: string[] = [];
    const recommendations: string[] = [];

    // Strengths
    if (score >= 80) strengths.push("Excellent overall compatibility!");
    if (dnaA.frameworks.includes('Frontend') && dnaB.frameworks.includes('Backend')) {
      strengths.push("Perfect full-stack partnership potential");
    }
    if (userA.location && userB.location && userA.location === userB.location) {
      strengths.push("Same location - easy to meet up!");
    }

    // Considerations
    if (Math.abs((userA.age || 0) - (userB.age || 0)) > 10) {
      considerations.push("Significant age difference");
    }
    if (dnaA.activityMetrics.commitFrequency !== dnaB.activityMetrics.commitFrequency) {
      considerations.push("Different coding activity levels");
    }

    // Recommendations
    if (score >= 70) recommendations.push("Great match for collaborative projects");
    if (dnaA.openSource.contributions > 0 && dnaB.openSource.contributions > 0) {
      recommendations.push("Consider contributing to open source together");
    }

    return { strengths, considerations, recommendations };
  }

  private findComplementaryTech(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): string[] {
    const complementary: string[] = [];
    
    if (dnaA.frameworks.includes('Frontend') && dnaB.frameworks.includes('Backend')) {
      complementary.push("Frontend + Backend development");
    }
    if (dnaA.domains.includes('Mobile') && dnaB.domains.includes('Backend')) {
      complementary.push("Mobile app with backend API");
    }
    if (dnaA.tools.includes('DevOps') && (dnaB.frameworks.includes('Frontend') || dnaB.frameworks.includes('Backend'))) {
      complementary.push("Development + DevOps deployment");
    }

    return complementary;
  }

  private findSharedInterests(dnaA: GitHubTechDNA, dnaB: GitHubTechDNA): string[] {
    const shared: string[] = [];
    
    const commonTopics = dnaA.interests.repositoryTopics.filter(topic => 
      dnaB.interests.repositoryTopics.includes(topic)
    );
    if (commonTopics.length > 0) shared.push(`Both interested in: ${commonTopics.slice(0, 3).join(', ')}`);

    const commonLanguages = dnaA.primaryLanguages.filter(lang => 
      dnaB.primaryLanguages.includes(lang)
    );
    if (commonLanguages.length > 0) shared.push(`Shared programming languages: ${commonLanguages.join(', ')}`);

    return shared;
  }
}

// Routes
router.post('/calculate-score', verifyToken, async (req, res) => {
  try {
    const { userAId, userBId }: MatchRequest = req.body;
    
    if (!userAId || !userBId) {
      return res.status(400).json({
        success: false,
        message: 'Both userAId and userBId are required'
      });
    }

    const engine = new MatchingEngine();
    const result = await engine.calculateMatch(userAId, userBId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Matching error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate match score'
    });
  }
});

// Get multiple matches for a user
router.get('/suggestions/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get all users except current user
    const usersSnapshot = await admin.firestore().collection('users')
      .where('uid', '!=', userId)
      .limit(limit)
      .get();

    const engine = new MatchingEngine();
    const matches = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const otherUser = doc.data();
        try {
          const matchResult = await engine.calculateMatch(userId, otherUser.uid);
          return {
            user: {
              uid: otherUser.uid,
              fullName: otherUser.fullName,
              role: otherUser.role,
              location: otherUser.location,
              profileImage: otherUser.profileImage
            },
            matchScore: matchResult.matchScore,
            compatibility: matchResult.compatibility
          };
        } catch (error) {
          return null;
        }
      })
    );

    const validMatches = matches.filter(match => match !== null);
    validMatches.sort((a, b) => b!.matchScore - a!.matchScore);

    res.json({
      success: true,
      matches: validMatches,
      total: validMatches.length
    });
  } catch (error: any) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get match suggestions'
    });
  }
});

export default router;

// -----------------------------------------------------------------------------
// Swipe endpoints
// These endpoints maintain three lists for each user in Firestore:
//  - `swipedRight`      : uids this user has swiped right on
//  - `gotSwipedRight`   : uids that swiped right on this user
//  - `connected`        : mutual connections (both users swiped right)
// The endpoints are intentionally small and defensive: they create missing
// arrays if needed and avoid duplicate entries using Firestore arrayUnion.
// -----------------------------------------------------------------------------

// Record a right-swipe from the authenticated user to `toUserId`.
// Body: { toUserId: string }
router.post('/swipe/right', verifyToken, async (req: any, res: any) => {
  try {
    const fromUserId = req.user && req.user.uid;
    const { toUserId } = req.body;

    if (!fromUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!toUserId) return res.status(400).json({ success: false, message: 'toUserId is required' });
    if (fromUserId === toUserId) return res.status(400).json({ success: false, message: 'Cannot swipe on yourself' });

    const usersColl = admin.firestore().collection('users');
    const fromRef = usersColl.doc(fromUserId);
    const toRef = usersColl.doc(toUserId);

    // Read both docs to check for mutual swipe
    const [fromSnap, toSnap] = await Promise.all([fromRef.get(), toRef.get()]);

    // Ensure documents exist (create a minimal doc if missing)
    if (!fromSnap.exists) await fromRef.set({ uid: fromUserId }, { merge: true });
    if (!toSnap.exists) await toRef.set({ uid: toUserId }, { merge: true });

    // Add to `swipedRight` for fromUser and to `gotSwipedRight` for toUser
    await Promise.all([
      fromRef.update({ swipedRight: admin.firestore.FieldValue.arrayUnion(toUserId) }),
      toRef.update({ gotSwipedRight: admin.firestore.FieldValue.arrayUnion(fromUserId) })
    ]);

    // Re-fetch target doc to check if they already swiped right on the actor
    const updatedToSnap = await toRef.get();
    const updatedToData = updatedToSnap.data() || {};
    const targetSwipedRight: string[] = updatedToData.swipedRight || [];

    // If mutual, add to both `connected` lists
    if (targetSwipedRight.includes(fromUserId)) {
      await Promise.all([
        fromRef.update({ connected: admin.firestore.FieldValue.arrayUnion(toUserId) }),
        toRef.update({ connected: admin.firestore.FieldValue.arrayUnion(fromUserId) })
      ]);

      return res.json({ success: true, connected: true, message: 'It\'s a match!' });
    }

    return res.json({ success: true, connected: false });
  } catch (error: any) {
    console.error('Swipe right error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to record swipe' });
  }
});

// Get the three lists for a user. Use authenticated user when :userId is 'me'
router.get('/swipe/lists/:userId', verifyToken, async (req: any, res: any) => {
  try {
    const paramId = req.params.userId;
    const userId = paramId === 'me' ? (req.user && req.user.uid) : paramId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const doc = await admin.firestore().collection('users').doc(userId).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'User not found' });

    const data = doc.data() || {};
    return res.json({
      success: true,
      lists: {
        swipedRight: data.swipedRight || [],
        gotSwipedRight: data.gotSwipedRight || [],
        connected: data.connected || []
      }
    });
  } catch (error: any) {
    console.error('Get swipe lists error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to get lists' });
  }
});