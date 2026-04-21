import type { RecommendationUser } from '../utils/profile.mapper';

export type MatchRequestAction = 'accept' | 'reject';

export interface MatchRequestUser {
  uid?: string;
  _id?: string;
  id?: string;
  fullName?: string;
  age?: number;
  role?: string;
  location?: string;
  city?: string;
  country?: string;
  aboutMe?: string;
  profileImage?: string;
  githubProfileUrl?: string;
  interests?: string[];
  goal?: string;
}

export interface MatchRequestRecord {
  id?: string;
  _id?: string;
  fromUserId?: string;
  toUserId?: string;
  fromUser?: MatchRequestUser | RecommendationUser;
  toUser?: MatchRequestUser | RecommendationUser;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchRequestsResponse {
  success: boolean;
  message?: string;
  incoming?: MatchRequestRecord[];
  outgoing?: MatchRequestRecord[];
  accepted?: MatchRequestRecord[];
  rejected?: MatchRequestRecord[];
  data?: {
    incoming?: MatchRequestRecord[];
    outgoing?: MatchRequestRecord[];
    accepted?: MatchRequestRecord[];
    rejected?: MatchRequestRecord[];
  };
}

export interface SwipeListUserCollections {
  leftswiped: RecommendationUser[];
  swipedRight: RecommendationUser[];
  gotSwipedRight: RecommendationUser[];
  matchRequestsSent: RecommendationUser[];
  matchRequestsReceived: RecommendationUser[];
  connected: RecommendationUser[];
  acceptedMatches: RecommendationUser[];
  rejectedMatches: RecommendationUser[];
}

export interface SwipeListsResponse {
  success: boolean;
  message?: string;
  leftswiped?: RecommendationUser[];
  swipedRight?: RecommendationUser[];
  gotSwipedRight?: RecommendationUser[];
  matchRequestsSent?: RecommendationUser[];
  matchRequestsReceived?: RecommendationUser[];
  connected?: RecommendationUser[];
  acceptedMatches?: RecommendationUser[];
  rejectedMatches?: RecommendationUser[];
  data?: Partial<SwipeListUserCollections>;
}
