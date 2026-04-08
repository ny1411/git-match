import React from 'react';
import { Camera } from 'lucide-react';

interface ProfilePhotoPanelProps {
  imageSrc: string | null;
  fullName: string;
  age: number | null;
  role: string;
  isPhotoUploading: boolean;
  disabled: boolean;
  onPickPhoto: () => void;
}

const ProfilePhotoPanel: React.FC<ProfilePhotoPanelProps> = ({
  imageSrc,
  fullName,
  age,
  role,
  isPhotoUploading,
  disabled,
  onPickPhoto,
}) => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_30px_120px_rgba(192,38,211,0.15)] lg:sticky lg:top-10 lg:col-span-5 lg:h-[calc(100vh-5rem)]">
      {imageSrc ? (
        <img src={imageSrc} alt="Profile" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2b1039] via-[#170920] to-[#09050f]">
          <Camera className="h-14 w-14 text-white/60" />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20" />

      <button
        type="button"
        onClick={onPickPhoto}
        disabled={disabled}
        className={`group absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-sm transition-opacity duration-300 ${
          isPhotoUploading
            ? 'cursor-not-allowed bg-black/60 opacity-100'
            : 'cursor-pointer bg-black/40 opacity-0 hover:opacity-100 focus:opacity-100'
        }`}
      >
        <div className="mb-3 rounded-full bg-fuchsia-500/20 p-4 text-fuchsia-300 backdrop-blur-md">
          <Camera className="h-8 w-8" />
        </div>
        <span className="font-semibold tracking-wide">
          {isPhotoUploading ? 'Uploading Photo...' : 'Update Photo'}
        </span>
      </button>

      {fullName || role || age !== null ? (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 p-8">
          {fullName ? (
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              {fullName}
              {age !== null ? <span className="font-light"> {age}</span> : null}
            </h1>
          ) : null}
          {role ? <p className="mt-2 text-lg font-medium text-gray-200 drop-shadow-sm">{role}</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePhotoPanel;
