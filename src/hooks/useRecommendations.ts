import { useCallback, useEffect, useState } from 'react';
import type { Profile } from '../types/profile';
import { authorizedRequest } from '../services/api.service';
import { mapRecommendationToProfile, type RecommendationUser } from '../utils/profile.mapper';

interface RecommendationsResponse {
  success: boolean;
  message: string;
  count: number;
  users?: RecommendationUser[];
}

interface ApiResponse {
  success: boolean;
  message: string;
}

interface RightSwipeResponse extends ApiResponse {
  connected?: boolean;
}

interface UseRecommendationsOptions {
  authLoading: boolean;
  token?: string | null;
  firebaseToken?: string | null;
  limit?: number;
}

const DEFAULT_RECOMMENDATIONS_LIMIT = 20;
const SWIPE_ERROR_RESET_MS = 4000;

export const useRecommendations = ({
  authLoading,
  token,
  firebaseToken,
  limit = DEFAULT_RECOMMENDATIONS_LIMIT,
}: UseRecommendationsOptions) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [swipeError, setSwipeError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setIsRecommendationsLoading(true);
    setRecommendationError(null);

    try {
      const result = await authorizedRequest<RecommendationsResponse>(
        `/api/recommendations?limit=${limit}`,
        {
          method: 'GET',
          auth: { token, firebaseToken },
        }
      );

      setProfiles((result.users ?? []).map(mapRecommendationToProfile));
    } catch (error) {
      setProfiles([]);
      setRecommendationError(
        error instanceof Error ? error.message : 'Failed to retrieve recommendations'
      );
    } finally {
      setIsRecommendationsLoading(false);
    }
  }, [firebaseToken, limit, token]);

  const commitSwipe = useCallback(
    (direction: 'left' | 'right', swipedProfile: Profile) => {
      setSwipeError(null);

      setProfiles((previousProfiles) => {
        if (previousProfiles.length === 0) {
          return previousProfiles;
        }

        if (previousProfiles[0].id === swipedProfile.id) {
          return previousProfiles.slice(1);
        }

        return previousProfiles.filter((profile) => profile.id !== swipedProfile.id);
      });

      if (direction === 'left') {
        void authorizedRequest<ApiResponse>('/api/leftswipe', {
          method: 'POST',
          auth: { token, firebaseToken },
          body: JSON.stringify({ targetUserId: swipedProfile.id }),
        }).catch((error) => {
          setSwipeError(error instanceof Error ? error.message : 'Failed to record left swipe');
        });
        return;
      }

      void authorizedRequest<RightSwipeResponse>('/api/swipe/right', {
        method: 'POST',
        auth: { token, firebaseToken },
        body: JSON.stringify({ toUserId: swipedProfile.id }),
      }).catch((error) => {
        setSwipeError(error instanceof Error ? error.message : 'Failed to record right swipe');
      });
    },
    [firebaseToken, token]
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadRecommendations();
  }, [authLoading, loadRecommendations]);

  useEffect(() => {
    if (!swipeError) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSwipeError(null);
    }, SWIPE_ERROR_RESET_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [swipeError]);

  return {
    profiles,
    isRecommendationsLoading,
    recommendationError,
    swipeError,
    loadRecommendations,
    commitSwipe,
  };
};
