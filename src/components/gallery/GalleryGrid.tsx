import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { ImagePlus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { GalleryImage } from '../../types/gallery';
import { MAX_GALLERY_IMAGES } from '../../utils/gallery.mapper';
import SortableGalleryImageItem from './SortableGalleryImageItem';

interface GalleryGridProps {
  images: GalleryImage[];
  canUpload: boolean;
  onReorder: (activeId: string, overId: string) => void;
  onRemoveImage: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onCaptionChange: (id: string, value: string) => void;
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
}

const GalleryGrid: React.FC<GalleryGridProps> = ({
  images,
  canUpload,
  onReorder,
  onRemoveImage,
  onSetPrimary,
  onCaptionChange,
  getRootProps,
  getInputProps,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;

    if (!overId || activeId === overId) {
      return;
    }

    onReorder(activeId, overId);
  };

  return (
    <div className="w-full max-w-4xl">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="aspect-4/5">
                <SortableGalleryImageItem
                  image={image}
                  onRemove={onRemoveImage}
                  onSetPrimary={onSetPrimary}
                  onCaptionChange={onCaptionChange}
                />
              </div>
            ))}

            {canUpload ? (
              <div
                {...getRootProps()}
                className="group flex aspect-4/5 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 transition-all hover:border-purple-500/50 hover:bg-white/5"
              >
                <input {...getInputProps()} />
                <div className="mb-3 rounded-full bg-white/5 p-4 transition-transform group-hover:scale-110">
                  <ImagePlus className="text-gray-400 group-hover:text-purple-400" size={32} />
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white">
                  Add Photo
                </span>
                <span className="mt-1 text-xs text-gray-600">
                  {images.length}/{MAX_GALLERY_IMAGES}
                </span>
              </div>
            ) : null}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default GalleryGrid;
