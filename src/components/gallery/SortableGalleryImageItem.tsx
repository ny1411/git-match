import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, Trash2 } from 'lucide-react';
import type { GalleryImage } from '../../types/gallery';

interface SortableGalleryImageItemProps {
  image: GalleryImage;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onCaptionChange: (id: string, value: string) => void;
}

const SortableGalleryImageItem: React.FC<SortableGalleryImageItemProps> = ({
  image,
  onRemove,
  onSetPrimary,
  onCaptionChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-20 cursor-grab rounded-lg bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-purple-600 active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </div>

      {image.isPrimary ? (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 rounded-md bg-linear-to-r from-yellow-500 to-orange-500 px-2 py-1 text-[10px] font-bold text-white shadow-md">
          <Star size={10} fill="white" />
          Primary
        </div>
      ) : null}

      <div className="relative aspect-square w-full bg-black/20 transition-colors group-hover:bg-black/40">
        <img src={image.src} alt="Gallery" className="h-full w-full object-cover" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          {!image.isPrimary ? (
            <button
              onClick={() => onSetPrimary(image.id)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-500/80"
            >
              Make Primary
            </button>
          ) : null}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this photo?')) {
                onRemove(image.id);
              }
            }}
            className="rounded-full bg-red-500/20 p-2 text-white transition-colors hover:bg-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-auto bg-white/5 p-2">
        <input
          type="text"
          placeholder="Add a caption..."
          value={image.caption}
          onChange={(event) => onCaptionChange(image.id, event.target.value)}
          className="w-full border-b border-transparent bg-transparent pb-1 text-center text-xs text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:text-white focus:outline-none"
          maxLength={30}
        />
      </div>
    </div>
  );
};

export default SortableGalleryImageItem;
