import { authorizedRequest, type AuthTokenSources } from './api.service';
import type {
  MatchRequestAction,
  MatchRequestRecord,
  MatchRequestsResponse,
  SwipeListUserCollections,
  SwipeListsResponse,
} from '../types/matchmaking';
import type { RecommendationUser } from '../utils/profile.mapper';

interface ApiResponse {
  success: boolean;
  message?: string;
}

export interface SwipeRightResponse extends ApiResponse {
  connected?: boolean;
}

interface SwipeListsOptions {
  includeProfiles?: boolean;
  signal?: AbortSignal;
}

const EMPTY_SWIPE_LISTS: SwipeListUserCollections = {
  leftswiped: [],
  swipedRight: [],
  gotSwipedRight: [],
  matchRequestsSent: [],
  matchRequestsReceived: [],
  connected: [],
  acceptedMatches: [],
  rejectedMatches: [],
};

const getRecommendationUsers = (value: unknown): RecommendationUser[] =>
  Array.isArray(value) ? (value as RecommendationUser[]) : [];

const getMatchRequestRecords = (value: unknown): MatchRequestRecord[] =>
  Array.isArray(value) ? (value as MatchRequestRecord[]) : [];

export const swipeRight = async (
  toUserId: string,
  auth: AuthTokenSources
): Promise<SwipeRightResponse> =>
  authorizedRequest<SwipeRightResponse>('/api/swipe/right', {
    method: 'POST',
    auth,
    body: JSON.stringify({ toUserId }),
  });

export const swipeLeft = async (toUserId: string, auth: AuthTokenSources): Promise<ApiResponse> =>
  authorizedRequest<ApiResponse>('/api/swipe/left', {
    method: 'POST',
    auth,
    body: JSON.stringify({ toUserId }),
  });

export const respondToMatchRequest = async (
  fromUserId: string,
  action: MatchRequestAction,
  auth: AuthTokenSources
): Promise<ApiResponse> =>
  authorizedRequest<ApiResponse>(`/api/match-requests/${fromUserId}/respond`, {
    method: 'POST',
    auth,
    body: JSON.stringify({ action }),
  });

export const getMyMatchRequests = async (
  auth: AuthTokenSources,
  signal?: AbortSignal
) => {
  const response = await authorizedRequest<MatchRequestsResponse>('/api/match-requests/me', {
    method: 'GET',
    auth,
    signal,
  });

  const data = response.data ?? {};

  return {
    incoming: getMatchRequestRecords(response.incoming ?? data.incoming),
    outgoing: getMatchRequestRecords(response.outgoing ?? data.outgoing),
    accepted: getMatchRequestRecords(response.accepted ?? data.accepted),
    rejected: getMatchRequestRecords(response.rejected ?? data.rejected),
  };
};

export const getMySwipeLists = async (
  auth: AuthTokenSources,
  options: SwipeListsOptions = {}
): Promise<SwipeListUserCollections> => {
  const searchParams = new URLSearchParams();

  if (typeof options.includeProfiles === 'boolean') {
    searchParams.set('includeProfiles', String(options.includeProfiles));
  }

  const queryString = searchParams.toString();
  const response = await authorizedRequest<SwipeListsResponse>(
    `/api/swipe/lists/me${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      auth,
      signal: options.signal,
    }
  );

  const data = response.data ?? {};

  return {
    ...EMPTY_SWIPE_LISTS,
    leftswiped: getRecommendationUsers(response.leftswiped ?? data.leftswiped),
    swipedRight: getRecommendationUsers(response.swipedRight ?? data.swipedRight),
    gotSwipedRight: getRecommendationUsers(response.gotSwipedRight ?? data.gotSwipedRight),
    matchRequestsSent: getRecommendationUsers(
      response.matchRequestsSent ?? data.matchRequestsSent
    ),
    matchRequestsReceived: getRecommendationUsers(
      response.matchRequestsReceived ?? data.matchRequestsReceived
    ),
    connected: getRecommendationUsers(response.connected ?? data.connected),
    acceptedMatches: getRecommendationUsers(response.acceptedMatches ?? data.acceptedMatches),
    rejectedMatches: getRecommendationUsers(response.rejectedMatches ?? data.rejectedMatches),
  };
};
