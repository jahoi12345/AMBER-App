import { useState } from "react";
import { X, Camera } from "lucide-react";
import { playSound } from "../lib/soundUtils";

interface AddContactSheetProps {
  onClose: () => void;
  onAddContact: (contact: {
    name: string;
    relationship: string;
    photo?: string;
  }) => void;
}

const relationships = ["Grandparent", "Parent", "Sibling", "Friend"];

export function AddContactSheet({ onClose, onAddContact }: AddContactSheetProps) {
  const [name, setName] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (name.trim().length >= 2 && selectedRelationship) {
      playSound("correctAnswer");
      onAddContact({
        name: name.trim(),
        relationship: selectedRelationship,
        photo: photo || undefined,
      });
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        onClick={() => { playSound("pageBackChime"); onClose(); }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8"
        style={{
          height: '65%',
          backgroundColor: '#FFFAF3',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0px -8px 32px rgba(160, 80, 20, 0.12)',
        }}
      >
        {/* Drag handle */}
        <div
          className="mt-3 mb-6 mx-auto rounded-full"
          style={{
            width: '48px',
            height: '4px',
            backgroundColor: 'rgba(44, 26, 14, 0.1)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '26px',
              fontWeight: 600,
              color: '#2C1A0E',
            }}
          >
            Add someone new
          </h2>
          <button
            onClick={() => { playSound("pageBackChime"); onClose(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(44, 26, 14, 0.05)',
              color: '#2C1A0E',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Field 1: Name */}
        <div className="mb-4">
          <label
            className="block mb-2"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '12px',
              color: '#9A7A60',
            }}
          >
            Their name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Margaret"
            className="w-full px-5 outline-none"
            style={{
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#F2E8D8',
              fontFamily: 'Lato, sans-serif',
              fontSize: '16px',
              color: '#2C1A0E',
              border: 'none',
            }}
          />
        </div>

        {/* Field 2: Relationship */}
        <div className="mb-4">
          <label
            className="block mb-2"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '12px',
              color: '#9A7A60',
            }}
          >
            Relationship
          </label>
          <div className="flex gap-2 flex-wrap">
            {relationships.map((rel) => (
              <button
                key={rel}
                onClick={() => { playSound("navSelect"); setSelectedRelationship(rel); }}
                className="px-4 py-2 rounded-full transition-all"
                style={{
                  backgroundColor: selectedRelationship === rel ? '#E8873A' : '#F2E8D8',
                  color: selectedRelationship === rel ? 'white' : '#9A7A60',
                  fontFamily: 'Lato, sans-serif',
                  fontSize: '14px',
                }}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>

        {/* Field 3: Profile photo */}
        <div className="mb-6">
          <label
            className="block mb-2"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '12px',
              color: '#9A7A60',
            }}
          >
            Profile photo (optional)
          </label>
          <label className="flex flex-col items-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                border: photo ? 'none' : '2px dashed #E8873A',
                backgroundColor: photo ? 'transparent' : 'transparent',
              }}
            >
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} style={{ color: '#E8873A' }} />
              )}
            </div>
            {!photo && (
              <span
                className="mt-2"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontSize: '12px',
                  color: '#9A7A60',
                }}
              >
                Add photo
              </span>
            )}
          </label>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={name.trim().length < 2 || !selectedRelationship}
          className="w-full"
          style={{
            height: '56px',
            borderRadius: '999px',
            background: name.trim().length >= 2 && selectedRelationship 
              ? 'linear-gradient(to right, #D4601A, #E8873A)'
              : '#E8D0B0',
            color: 'white',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px',
            fontWeight: 600,
            opacity: name.trim().length >= 2 && selectedRelationship ? 1 : 0.5,
          }}
        >
          Add to conversations
        </button>
      </div>
    </>
  );
}