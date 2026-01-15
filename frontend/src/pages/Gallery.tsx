import { useState, type FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import BgGradient from "../components/ui/BgGradient";
import { CropperModal } from "../components/ui/CropperModal";
import { useDropzone } from "react-dropzone";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Star, GripVertical, ImagePlus, X } from "lucide-react";
import { getUserGallery, saveUserGallery } from "../services/galleryService";

// --- Types ---
interface GalleryImage {
	id: string;
	src: string; // Base64
	caption: string;
	isPrimary: boolean;
}

// --- Sortable Item Component ---
const SortableImageItem = ({
	id,
	image,
	onRemove,
	onSetPrimary,
	onCaptionChange,
}: {
	id: string;
	image: GalleryImage;
	onRemove: (id: string) => void;
	onSetPrimary: (id: string) => void;
	onCaptionChange: (id: string, val: string) => void;
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

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
			className="relative group bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg flex flex-col h-full"
		>
			{/* Drag Handle */}
			<div
				{...attributes}
				{...listeners}
				className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-purple-600"
			>
				<GripVertical size={16} />
			</div>

			{/* Primary Badge */}
			{image.isPrimary && (
				<div className="absolute top-2 left-2 px-2 py-1 bg-linear-to-r from-yellow-500 to-orange-500 rounded-md text-[10px] font-bold text-white shadow-md z-20 flex items-center gap-1">
					<Star size={10} fill="white" /> Primary
				</div>
			)}

			{/* Image Area */}
			<div className="relative aspect-square w-full bg-black/20 group-hover:bg-black/40 transition-colors">
				<img
					src={image.src}
					alt="Gallery"
					className="w-full h-full object-cover"
				/>

				{/* Hover Actions */}
				<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
					{!image.isPrimary && (
						<button
							onClick={() => onSetPrimary(id)}
							className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-yellow-500/80 text-white text-xs font-medium transition-colors"
						>
							Make Primary
						</button>
					)}
					<button
						onClick={() => onRemove(id)}
						className="p-2 rounded-full bg-red-500/20 hover:bg-red-600 text-white transition-colors"
					>
						<Trash2 size={18} />
					</button>
				</div>
			</div>

			{/* Caption Input */}
			<div className="p-2 bg-white/5 mt-auto">
				<input
					type="text"
					placeholder="Add a caption..."
					value={image.caption}
					onChange={(e) => onCaptionChange(id, e.target.value)}
					className="w-full bg-transparent text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:text-white text-center border-b border-transparent focus:border-purple-500 pb-1"
					maxLength={30}
				/>
			</div>
		</div>
	);
};

// --- Main Component ---

const Gallery: FC = () => {
	const { firebaseToken, userProfile, isLoading: authLoading } = useAuth(); // Assuming auth context provides these
	const navigate = useNavigate();

	const [images, setImages] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(false);
	const [saveStatus, setSaveStatus] = useState<string | null>(null);

	// Cropper State
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [isCropperOpen, setIsCropperOpen] = useState(false);

	// DND Sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	if (authLoading) return <div>Loading...</div>;

	// --- Fetch Gallery on Mount ---
	useEffect(() => {
		const loadGallery = async () => {
			// Ensure we have a user ID and firebaseToken before fetching
			if (userProfile?.uid && firebaseToken) {
				try {
					console.log("Loading gallery for user:", userProfile.uid);
					const savedImages = await getUserGallery(userProfile.uid);
					// Update state with images from Firestore
					setImages(savedImages);
					console.log("Gallery loaded successfully:", savedImages);
				} catch (error) {
					console.error("Failed to load gallery:", error);
				}
			} else {
				console.log(
					"Waiting for user profile and firebase token...",
					firebaseToken ? "Token ready" : "Token pending"
				);
			}
		};

		if (!authLoading && userProfile?.uid && firebaseToken) {
			loadGallery();
		}
	}, [firebaseToken, userProfile?.uid, authLoading]);

	// --- Handlers ---

	const onDrop = (acceptedFiles: File[]) => {
		if (images.length >= 6) return;
		const file = acceptedFiles[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setSelectedFile(reader.result as string);
				setIsCropperOpen(true);
			};
			reader.readAsDataURL(file);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: { "image/*": [] },
		maxFiles: 1,
		disabled: images.length >= 6,
	});

	const handleCropComplete = (base64: string) => {
		const newImage: GalleryImage = {
			id: Math.random().toString(36).substr(2, 9), // Temp ID
			src: base64,
			caption: "",
			isPrimary: images.length === 0, // First image is primary by default
		};
		setImages((prev) => [...prev, newImage]);
		setIsCropperOpen(false);
		setSelectedFile(null);
	};

	const handleRemoveImage = (id: string) => {
		if (window.confirm("Are you sure you want to delete this photo?")) {
			setImages((prev) => {
				const filtered = prev.filter((img) => img.id !== id);
				// If we deleted the primary, make the first available one primary
				if (
					prev.find((img) => img.id === id)?.isPrimary &&
					filtered.length > 0
				) {
					filtered[0].isPrimary = true;
				}
				return filtered;
			});
		}
	};

	const handleSetPrimary = (id: string) => {
		setImages((prev) =>
			prev.map((img) => ({
				...img,
				isPrimary: img.id === id,
			}))
		);
	};

	const handleCaptionChange = (id: string, val: string) => {
		setImages((prev) =>
			prev.map((img) => (img.id === id ? { ...img, caption: val } : img))
		);
	};

	// DND Handlers
	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		if (active.id !== over.id) {
			setImages((items) => {
				const oldIndex = items.findIndex((i) => i.id === active.id);
				const newIndex = items.findIndex((i) => i.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleSaveGallery = async () => {
		setLoading(true);
		setSaveStatus("Saving...");

		try {
			if (!userProfile) {
				throw new Error("User not authenticated.");
			}
			saveUserGallery(userProfile.uid, images);
			await new Promise((resolve) => setTimeout(resolve, 1500)); // Fake delay
			setSaveStatus("Gallery saved successfully!");
			setTimeout(() => setSaveStatus(null), 3000);
		} catch (e) {
			setSaveStatus("Failed to save.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen w-full relative">
			<BgGradient />

			{/* Cropper Modal */}
			{isCropperOpen && selectedFile && (
				<CropperModal
					imageSrc={selectedFile}
					onCancel={() => setIsCropperOpen(false)}
					onCropComplete={handleCropComplete}
				/>
			)}

			<main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
				{/* Header */}
				<div className="w-full max-w-4xl flex justify-between items-end mb-8 border-b border-white/10 pb-4">
					<div>
						<h1 className="text-3xl font-bold text-white mb-2">
							Profile Gallery
						</h1>
						<p className="text-gray-400 text-sm">
							Add up to 6 photos to showcase your personality.
						</p>
					</div>
					<button
						onClick={handleSaveGallery}
						disabled={loading}
						className="px-6 py-2.5 rounded-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Saving..." : "Save Changes"}
					</button>
				</div>

				{/* Status Toast */}
				{saveStatus && (
					<div className="fixed top-4 right-4 z-50 bg-green-900/80 text-green-200 px-4 py-2 rounded-lg border border-green-500/30 backdrop-blur-md">
						{saveStatus}
					</div>
				)}

				{/* Gallery Grid */}
				<div className="w-full max-w-4xl">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={images.map((i) => i.id)}
							strategy={rectSortingStrategy}
						>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
								{/* Render Existing Images */}
								{images.map((img) => (
									<div key={img.id} className="aspect-4/5">
										<SortableImageItem
											id={img.id}
											image={img}
											onRemove={handleRemoveImage}
											onSetPrimary={handleSetPrimary}
											onCaptionChange={
												handleCaptionChange
											}
										/>
									</div>
								))}

								{/* Upload Button Slot (Visible if < 6 images) */}
								{images.length < 6 && (
									<div
										{...getRootProps()}
										className="aspect-4/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all group"
									>
										<input {...getInputProps()} />
										<div className="p-4 bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
											<ImagePlus
												className="text-gray-400 group-hover:text-purple-400"
												size={32}
											/>
										</div>
										<span className="text-gray-400 text-sm font-medium group-hover:text-white">
											Add Photo
										</span>
										<span className="text-gray-600 text-xs mt-1">
											{images.length}/6
										</span>
									</div>
								)}
							</div>
						</SortableContext>
					</DndContext>
				</div>

				{/* Empty State Helper */}
				{images.length === 0 && (
					<div className="mt-12 text-center p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm max-w-md">
						<p className="text-gray-300 mb-4">
							Your gallery is empty!
						</p>
						<p className="text-sm text-gray-500">
							Upload your best shots to get better matches. The
							first photo you upload will be your primary profile
							picture.
						</p>
					</div>
				)}
			</main>
		</div>
	);
};

export default Gallery;
