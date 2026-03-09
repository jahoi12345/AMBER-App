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

export function FamilyMessages() {
  const [contacts, setContacts] = useState<Contact[]>([
    { 
      name: "Grandma", 
      unreadCount: 1,
      messages: [
        { sender: 'them', text: "Good morning sweetheart. Did you sleep well last night?", type: 'text', time: '8:02 AM' },
        { sender: 'me', text: "Morning Grandma! I slept wonderfully. How are you feeling today?", type: 'text', time: '8:15 AM' },
        { sender: 'them', text: "Oh I'm doing just fine dear. I made my famous apple cake this morning, the whole house smells wonderful.", type: 'text', time: '8:17 AM' },
        { sender: 'them', text: "I'm saving you a big slice for when you visit on Sunday.", type: 'text', time: '8:18 AM' },
        { sender: 'me', text: '', type: 'voice', duration: 12, time: '8:24 AM' },
        { sender: 'them', text: "That made me laugh! You always know how to brighten my morning.", type: 'text', time: '8:26 AM' },
        { sender: 'me', text: "I can't wait to see you Sunday. I'll bring those flowers you like from the market.", type: 'text', time: '8:29 AM' },
        { sender: 'me', text: "Spotted these at the market yesterday, thought of you straight away.", type: 'text', time: '8:30 AM' },
        { sender: 'them', text: "Oh they're just beautiful. You are so thoughtful, just like your grandfather was.", type: 'text', time: '8:34 AM' },
        { sender: 'them', text: '', type: 'voice', duration: 18, time: '8:36 AM' },
        { sender: 'them', text: "See you Sunday darling. Love you to the moon.", type: 'text', time: '8:37 AM' },
      ]
    },
    { 
      name: "Grandpa", 
      timestamp: "Yesterday",
      messages: [
        { sender: 'them', text: "A little visitor came to the bird feeder this morning, reminded me of when we used to watch them together", type: 'text', time: '9:05 AM' },
        { sender: 'them', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=300&h=200&fit=crop', time: '9:05 AM' },
        { sender: 'me', text: "Miss you grandpa!", type: 'text', time: '9:20 AM' },
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
                  to={`/family/messages/${contact.name.toLowerCase()}`}
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
      
      <NavBar type="family" />
      
      {showAddSheet && (
        <AddContactSheet
          onClose={() => setShowAddSheet(false)}
          onAddContact={handleAddContact}
        />
      )}
    </div>
  );
}