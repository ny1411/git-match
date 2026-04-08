import React, { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import EmptyState from '../components/dashboard/EmptyState';
import SwipeContainer from '../components/dashboard/SwipeContainer';
import { CustomButton } from '../components/ui/CustomButton';
import { getDominantColors } from '../components/utils/colorUtils';
import { LocationUpdateModal } from '../components/ui/LocationUpdateModal';
import { useAuth } from '../hooks/useAuth';
import { useDashboardLocation } from '../hooks/useDashboardLocation';
import { useRecommendations } from '../hooks/useRecommendations';
import { startChatConversation } from '../services/chat.service';
import type { Profile } from '../types/profile';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)';
const FALLBACK_GRADIENT = 'linear-gradient(135deg, #1b1e31, #0d0a1e)';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, token, firebaseToken, isLoading: authLoading } = useAuth();

  const {
    profiles,
    isRecommendationsLoading,
    recommendationError,
    swipeError,
    loadRecommendations,
    commitSwipe,
  } = useRecommendations({
    authLoading,
    token,
    firebaseToken,
  });

  const {
    isLocationModalOpen,
    currentLocation,
    isLocationLoaded,
    locationLabel,
    openLocationModal,
    closeLocationModal,
    saveLocation,
  } = useDashboardLocation({
    authLoading,
    userId: userProfile?.uid,
  });

  const [gradient, setGradient] = useState<string>(DEFAULT_GRADIENT);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right', profile: Profile) => {
      commitSwipe(direction, profile);
    },
    [commitSwipe]
  );

  const handleCommentSend = useCallback(
    async (profile: Profile, comment: string) => {
      setCommentError(null);

      try {
        await startChatConversation(
          {
            peerUserId: profile.id,
            text: comment,
          },
          { token, firebaseToken },
          userProfile?.uid
        );
        commitSwipe('right', profile);
      } catch (error) {
        setCommentError(
          error instanceof Error ? error.message : 'Failed to start conversation.'
        );
      }
    },
    [commitSwipe, firebaseToken, token, userProfile?.uid]
  );

  useEffect(() => {
    if (!profiles.length) {
      setGradient(DEFAULT_GRADIENT);
      return;
    }

    let cancelled = false;

    getDominantColors(profiles[0].image)
      .then(([shadow, mid, highlight]) => {
        if (cancelled) {
          return;
        }

        setGradient(`
          radial-gradient(
            circle at top left,
            ${highlight},
            transparent 90%
          ),
          radial-gradient(
            circle at bottom right,
            ${mid},
            transparent 55%
          ),
          linear-gradient(
            135deg,
            ${shadow},
            ${mid}
          )
        `);
      })
      .catch(() => {
        if (!cancelled) {
          setGradient(FALLBACK_GRADIENT);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profiles]);

  if (authLoading || isRecommendationsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3 text-lg">
          <LoaderCircle className="animate-spin" />
          Loading recommendations...
        </div>
      </div>
    );
  }

  if (recommendationError && profiles.length === 0) {
    return (
      <EmptyState
        title="Unable to load profiles"
        message={recommendationError}
        actionLabel="Try again"
        onAction={() => {
          void loadRecommendations();
        }}
        onBack={() => {
          navigate('/');
        }}
      />
    );
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        title="No more profiles"
        message="Check back later for more matches!"
        actionLabel="Refresh recommendations"
        onAction={() => {
          void loadRecommendations();
        }}
      />
    );
  }

  return (
    <div
      className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden transition-colors duration-700 ease-in-out"
      style={{ background: gradient }}
    >
      <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-[60px]" />

      {swipeError ? (
        <div className="absolute top-28 z-20 rounded-full border border-red-400/30 bg-red-950/70 px-4 py-2 text-sm text-red-200 backdrop-blur-md">
          {swipeError}
        </div>
      ) : null}

      {commentError ? (
        <div className="absolute top-42 z-20 rounded-full border border-red-400/30 bg-red-950/70 px-4 py-2 text-sm text-red-200 backdrop-blur-md">
          {commentError}
        </div>
      ) : null}

      <DashboardHeader
        isLocationLoaded={isLocationLoaded}
        locationLabel={locationLabel}
        onBack={() => {
          navigate('/');
        }}
        onOpenLocationModal={openLocationModal}
        onOpenSettings={() => {
          navigate('/settings');
        }}
        onOpenGallery={() => {
          navigate('/gallery');
        }}
        onOpenProfile={() => {
          navigate('/profile');
        }}
      />

      <SwipeContainer
        profiles={profiles}
        onSwipe={handleSwipe}
        onCommentSend={handleCommentSend}
      />

      <CustomButton
        ariaLabel="Open chat"
        className="fixed right-6 bottom-6 z-30 w-auto cursor-pointer gap-2 bg-white/10 px-5 text-white hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-cyan-100 md:right-10 md:bottom-10"
        onClick={() => {
          navigate('/chat');
        }}
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium">Chat</span>
      </CustomButton>

      {isLocationModalOpen ? (
        <LocationUpdateModal
          onClose={closeLocationModal}
          onSave={saveLocation}
          currentLocation={currentLocation}
        />
      ) : null}
    </div>
  );
};

export default Dashboard;
