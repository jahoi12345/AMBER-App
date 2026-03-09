import { useState } from 'react';
import { useNavigate } from 'react-router';
import { NavBar } from '../../components/NavBar';
import { SettingsButton } from '../../components/SettingsButton';
import { ContactRow } from "../../components/ContactRow";
import { AddContactSheet } from "../../components/AddContactSheet";
import { Plus, Search } from "lucide-react";
import { playSound } from "../../lib/soundUtils";
interface Message {
  sender: 'me' | 'them';
  text: string;
  type: 'text' | 'voice' | 'image';
  time?: string;
  duration?: number;
  src?: string;
}

interface Contact {
  name: string;
  preview?: string;  // Made optional since we'll generate it dynamically
  unreadCount?: number | null;
  timestamp?: string;  // Made optional since we'll generate it dynamically
  avatarUrl?: string;
  messages: Message[];
}

// Helper to generate thread preview from messages
function getThreadPreview(contact: Contact): string {
  const messages = contact.messages;
  if (!messages || messages.length === 0) return 'Say hello 👋';
  
  const last = messages[messages.length - 1];
  
  if (last.type === 'text') {
    // Truncate to fit one line
    return last.text.length > 42
      ? last.text.substring(0, 42) + '...'
      : last.text;
  }
  if (last.type === 'voice') {
    return last.sender === 'me' ? 'You sent a voice message' : 'Voice message';
  }
  if (last.type === 'image') {
    return last.sender === 'me' ? 'You sent a photo' : 'Sent a photo';
  }
  return '';
}

// Helper to get thread timestamp
function getThreadTimestamp(contact: Contact): string {
  const messages = contact.messages;
  if (!messages || messages.length === 0) return '';
  return messages[messages.length - 1].time ?? '';
}

export function UserMessages() {
  const [contacts, setContacts] = useState<Contact[]>([
    { 
      name: "Todd", 
      unreadCount: 2,
      messages: [
        { sender: 'them', text: "Hi Dad! How was your day?", type: 'text', time: '10:30 AM' },
        { sender: 'me', text: "It was lovely, dear. I had tea by the window.", type: 'text', time: '10:32 AM' },
        { sender: 'them', text: "I made my tea by the window today like you suggested, look how lovely it looked!", type: 'text', time: '10:33 AM' },
        { sender: 'them', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop', time: '10:33 AM' },
        { sender: 'them', text: '', type: 'voice', duration: 18, time: '10:35 AM' },
        { sender: 'them', text: "Looking forward to seeing you this weekend!", type: 'text', time: '10:42 AM' },
        { sender: 'me', text: '', type: 'voice', duration: 9, time: '10:44 AM' },
      ]
    },
    { 
      name: "Dave", 
      timestamp: "Yesterday",
      messages: [
        { sender: 'them', text: "Caught the most wonderful sunrise on my morning walk, had to take a photo for you", type: 'text', time: 'Yesterday 8:12 AM' },
        { sender: 'them', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&h=200&fit=crop', time: '8:13 AM' },
        { sender: 'them', text: "How are you feeling today?", type: 'text', time: '8:15 AM' },
      ]
    },
    { 
      name: "Eva", 
      timestamp: "2 days ago",
      messages: [
        { sender: 'me', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit=crop', time: '2 days ago 3:20 PM' },
        { sender: 'me', text: "Tried that recipe you gave me — came out better than expected! Saving you some for Sunday.", type: 'text', time: '3:21 PM' },
        { sender: 'them', text: "Thanks for the lovely card you sent!", type: 'text', time: '3:45 PM' },
      ]
    },
    { 
      name: "Mary", 
      unreadCount: 1,
      messages: [
        { sender: 'me', text: "A little visitor came to the bird feeder this morning, reminded me of when we used to watch them together", type: 'text', time: '9:05 AM' },
        { sender: 'me', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=300&h=200&fit=crop', time: '9:05 AM' },
        { sender: 'them', text: "Miss you grandpa!", type: 'text', time: '9:20 AM' },
      ]
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newContactAnimating, setNewContactAnimating] = useState<string | null>(null);

  const handleAddContact = (newContact: { name: string; relationship: string; photo?: string }) => {
    const contact: Contact = {
      name: newContact.name,
      preview: '',  // Empty - no pre-filled preview
      unreadCount: null,  // null instead of 0
      avatarUrl: newContact.photo,  // Save photo as avatarUrl
      messages: [],
    };
    
    setContacts([contact, ...contacts]);
    setNewContactAnimating(contact.name);
    
    // Clear animation flag after animation completes
    setTimeout(() => setNewContactAnimating(null), 300);
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Highlight matching letters in name
  const highlightMatch = (name: string) => {
    if (!searchQuery) return name;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = name.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} style={{ color: '#E8873A' }}>{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };
  
  return (
    <div 
      className="min-h-screen pb-32"
      style={{
        backgroundColor: 'var(--amber-background)',
        fontFamily: 'Lato, sans-serif',
      }}
    >
      <SettingsButton />

      <div className="px-5 pt-16">
        {/* Header with two lines and add button */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 
              className="mb-1"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '32px',
                fontWeight: 500,
                color: '#2C1A0E',
              }}
            >
              Messages
            </h1>
            <p
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '13px',
                fontStyle: 'italic',
                color: '#9A7A60',
              }}
            >
              {contacts.length} conversations
            </p>
          </div>
          <button
            onClick={() => { playSound("navSelect"); setShowAddSheet(true); }}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#E8873A',
            }}
          >
            <Plus size={16} color="white" />
          </button>
        </div>

        {/* Search bar */}
        <div 
          className="flex items-center gap-3 px-5 mb-4"
          style={{
            height: '44px',
            borderRadius: '999px',
            backgroundColor: '#F2E8D8',
          }}
        >
          <Search size={16} style={{ color: 'rgba(232, 135, 58, 0.6)' }} />
          <input
            type="text"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '14px',
              color: '#2C1A0E',
            }}
          />
        </div>

        {/* Decorative divider */}
        <div 
          className="my-4"
          style={{
            height: '0.5px',
            backgroundColor: '#E8D0B0',
          }}
        />
        
        {/* Contact list */}
        {filteredContacts.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {filteredContacts.map((contact) => (
              <div
                key={contact.name}
                className="transition-all duration-150"
                style={{
                  animation: newContactAnimating === contact.name 
                    ? 'scaleIn 300ms ease-out' 
                    : searchQuery && !filteredContacts.includes(contact)
                    ? 'fadeOut 150ms ease-out'
                    : 'none',
                }}
              >
                <ContactRow
                  name={contact.name}
                  preview={getThreadPreview(contact)}
                  unreadCount={contact.unreadCount}
                  timestamp={getThreadTimestamp(contact)}
                  to={`/user/messages/${contact.name.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#9A7A60',
              }}
            >
              No conversations found
            </p>
          </div>
        )}
      </div>
      
      <NavBar type="user" />
      
      {showAddSheet && (
        <AddContactSheet
          onClose={() => setShowAddSheet(false)}
          onAddContact={handleAddContact}
        />
      )}
    </div>
  );
}