import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Images, LoaderCircle, MapPin, Settings, UserRound } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';

interface DashboardHeaderProps {
  isLocationLoaded: boolean;
  locationLabel: string;
  onBack: () => void;
  onOpenLocationModal: () => void;
  onOpenSettings: () => void;
  onOpenGallery: () => void;
  onOpenProfile: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isLocationLoaded,
  locationLabel,
  onBack,
  onOpenLocationModal,
  onOpenSettings,
  onOpenGallery,
  onOpenProfile,
}) => {
  return (
    <div className="absolute top-10 z-10 flex w-full items-center justify-between px-12">
      <CustomButton onClick={onBack} className="cursor-pointer bg-white/10 text-white">
        <ArrowLeft />
      </CustomButton>

      <CustomButton
        onClick={onOpenLocationModal}
        className="ml-26 flex w-fit cursor-pointer items-center justify-center gap-2 bg-white/10 px-4 text-white hover:border-green-500/50 hover:bg-green-500/20 hover:text-green-400"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isLocationLoaded ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <LoaderCircle className="animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="location"
              className="flex gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <MapPin />
              {locationLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </CustomButton>

      <div className="flex gap-4">
        <CustomButton
          onClick={onOpenSettings}
          className="cursor-pointer bg-white/10 text-white hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-400"
        >
          <Settings />
        </CustomButton>
        <CustomButton
          onClick={onOpenGallery}
          className="cursor-pointer bg-white/10 text-white hover:border-amber-500/50 hover:bg-amber-500/20 hover:text-amber-400"
        >
          <Images />
        </CustomButton>
        <CustomButton
          onClick={onOpenProfile}
          className="cursor-pointer bg-white/10 text-white hover:border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-400"
        >
          <UserRound />
        </CustomButton>
      </div>
    </div>
  );
};

export default DashboardHeader;
