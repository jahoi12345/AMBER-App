import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Send, Mic, Phone, Video, Image as ImageIcon, X, Camera } from "lucide-react";
import { playSound } from "../../lib/soundUtils";
import { MessageBubble } from "../../components/MessageBubble";
import { VoiceMemoBubble } from "../../components/VoiceMemoBubble";
import { ImageMessageBubble } from "../../components/ImageMessageBubble";
import { SmartReplyChips } from "../../components/SmartReplyChips";
import { ProfileSheet } from "../../components/ProfileSheet";
import { TypingIndicator } from "../../components/TypingIndicator";
import { ErrorToast } from "../../components/ErrorToast";

// Avatar gradients per contact
const avatarGradients: Record<string, string> = {
  T: 'linear-gradient(135deg, #E8873A, #C4601A)',
  D: 'linear-gradient(135deg, #D4743A, #A84820)',
  E: 'linear-gradient(135deg, #F5A050, #D4601A)',
  M: 'linear-gradient(135deg, #C86028, #8A3A10)',
};

interface Message {
  sender: 'me' | 'them';
  text: string;
  type: 'text' | 'voice' | 'image';
  time?: string;
  duration?: number;
  src?: string;
  id?: number;
}

interface PendingVoiceMemo {
  duration: number;
}

// Thread-specific message data
const THREAD_MESSAGES: Record<string, Message[]> = {
  todd: [
    { sender: 'them', text: "Hi Dad! How was your day?", type: 'text', time: '10:30 AM' },
    { sender: 'me', text: "It was lovely, dear. I had tea by the window.", type: 'text', time: '10:32 AM' },
    { sender: 'them', text: "I made my tea by the window today like you suggested, look how lovely it looked!", type: 'text', time: '10:33 AM' },
    { sender: 'them', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop', time: '10:33 AM' },
    { sender: 'them', text: '', type: 'voice', duration: 18, time: '10:35 AM', id: 1 },
    { sender: 'them', text: "Looking forward to seeing you this weekend!", type: 'text', time: '10:42 AM' },
    { sender: 'me', text: '', type: 'voice', duration: 9, time: '10:44 AM', id: 2 },
  ],
  dave: [
    { sender: 'them', text: "Caught the most wonderful sunrise on my morning walk, had to take a photo for you", type: 'text', time: 'Yesterday 8:12 AM' },
    { sender: 'them', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&h=200&fit=crop', time: '8:13 AM' },
    { sender: 'them', text: "How are you feeling today?", type: 'text', time: '8:15 AM' },
  ],
  eva: [
    { sender: 'me', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=200&fit=crop', time: '2 days ago 3:20 PM' },
    { sender: 'me', text: "Tried that recipe you gave me — came out better than expected! Saving you some for Sunday.", type: 'text', time: '3:21 PM' },
    { sender: 'them', text: "Thanks for the lovely card you sent!", type: 'text', time: '3:45 PM' },
  ],
  mary: [
    { sender: 'me', text: "A little visitor came to the bird feeder this morning, reminded me of when we used to watch them together", type: 'text', time: '9:05 AM' },
    { sender: 'me', text: '', type: 'image', src: 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=300&h=200&fit=crop', time: '9:05 AM' },
    { sender: 'them', text: "Miss you grandpa!", type: 'text', time: '9:20 AM' },
  ],
};

export function UserMessageThread() {
  const navigate = useNavigate();
  const { contactId } = useParams();
  const [message, setMessage] = useState("");
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCompanionPrompt, setShowCompanionPrompt] = useState(false);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [pendingMemo, setPendingMemo] = useState<PendingVoiceMemo | null>(null);
  const [playingMemoId, setPlayingMemoId] = useState<number | null>(null);
  const [memoPlayheadProgress, setMemoPlayheadProgress] = useState<Record<number, number>>({});
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array.from({ length: 15 }, () => 8));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const contactName = contactId ? contactId.charAt(0).toUpperCase() + contactId.slice(1) : "Contact";
  const initial = contactName.charAt(0);
  const gradient = avatarGradients[initial] || avatarGradients['T'];
  
  const initialMessages = THREAD_MESSAGES[contactId || ''] || [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const lastAssistantMessage = [...messages].reverse().find(m => m.sender === 'them' && m.type === 'text')?.text || '';

  // Fetch Freesound audio on mount
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        // Placeholder for Freesound API - using mock URL
        // In production: GET https://freesound.org/apiv2/search/text/?query=phone+conversation+woman+interjections&filter=duration:[5+TO+25]&fields=id,name,previews,duration&token=YOUR_API_KEY
        // Then use result.previews['preview-hq-mp3']
        
        // For demo, simulate loading delay then fail gracefully
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVoiceAudioUrl(null); // No audio - degrades gracefully with silent waveform
        setIsLoadingAudio(false);
      } catch (err) {
        setVoiceAudioUrl(null);
        setIsLoadingAudio(false);
      }
    };
    
    fetchAudio();
  }, []);

  // Check for draft message from localStorage
  useEffect(() => {
    const draftMessage = localStorage.getItem("draftMessage");
    if (draftMessage) {
      setMessage(draftMessage);
      localStorage.removeItem("draftMessage");
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    // On mount — instant scroll to bottom, no animation
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
  }, []); // empty deps = runs once on mount

  // Smooth scroll when new messages are added
  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]); // runs when message count changes

  const callClaudeAPI = async (conversationHistory: Message[], systemPrompt: string) => {
    // Mock API call - In production, this would call the actual Claude API
    const API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE";
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Get the last user message for context
      const lastMessage = conversationHistory[conversationHistory.length - 1]?.text.toLowerCase() || '';
      
      // Get conversation length to vary responses
      const conversationLength = conversationHistory.filter(m => m.type === 'text').length;
      
      let response = "";
      
      // Contextual responses based on message content and conversation flow
      if (lastMessage.includes('tea') || lastMessage.includes('window')) {
        const responses = [
          "That sounds so peaceful. I'm glad you're taking time to enjoy the simple moments.",
          "There's something special about a quiet moment by the window. How was the tea?",
          "Perfect way to spend the afternoon. Did you see anything interesting outside?"
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('walk') || lastMessage.includes('weather') || lastMessage.includes('outside')) {
        const responses = [
          "Fresh air does wonders. The garden must be lovely this time of year. 🌸",
          "I'm so glad you got outside today. It's important to get that fresh air.",
          "Was it nice out? I hope the weather was pleasant for you."
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('weekend') || lastMessage.includes('visit') || lastMessage.includes('see you') || lastMessage.includes('seeing you')) {
        const responses = [
          "I can't wait either! We'll have such a nice time together.",
          "Looking forward to it too! I'll bring that bread you like.",
          "Me too! Let's plan to have lunch together on Saturday."
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('love') || lastMessage.includes('miss')) {
        const responses = [
          "Love you too, so much. You're always in my thoughts. ❤️",
          "Miss you too! We'll catch up soon, I promise.",
          "You're in my heart always. Can't wait to see you again."
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('photo') || lastMessage.includes('picture') || lastMessage.includes('saw this')) {
        const responses = [
          "That's beautiful! Thanks for sharing that with me.",
          "What a lovely photo. It really brightened my day!",
          "I'm so glad you thought of me. That's really special."
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('recipe') || lastMessage.includes('food') || lastMessage.includes('cooking')) {
        const responses = [
          "I'm so happy it turned out well! You're such a good cook.",
          "Can't wait to try it! You always make things taste better than I do.",
          "That recipe is one of my favorites. Glad you enjoyed it!"
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('call') || lastMessage.includes('talk')) {
        const responses = [
          "Yes, let's talk soon! I always love our conversations.",
          "I'd love that. When's a good time for you?",
          "Absolutely! I'll give you a ring tomorrow afternoon."
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('thank') || lastMessage.includes('card') || lastMessage.includes('gift')) {
        const responses = [
          "You're so welcome! I thought you might like it.",
          "I'm glad it made you smile. You deserve it!",
          "It was my pleasure. Thinking of you always."
        ];
        response = responses[conversationLength % responses.length];
      } else if (lastMessage.includes('beautiful') || lastMessage.includes('lovely') || lastMessage.includes('wonderful')) {
        const responses = [
          "I'm so glad you enjoyed it! You deserve all the beautiful moments.",
          "That sounds really special. Tell me more about it!",
          "Those are the moments that matter most, aren't they?"
        ];
        response = responses[conversationLength % responses.length];
      } else {
        // Default contextual responses that vary
        const responses = [
          "That's wonderful to hear. How are you feeling today?",
          "I'm so happy to hear from you. What else have you been up to?",
          "That sounds really nice. I hope you're having a good day.",
          "Thanks for sharing that with me. You always brighten my day.",
          "I love hearing about your day. Keep me posted on how things go!"
        ];
        response = responses[conversationLength % responses.length];
      }
      
      return response;
    } catch (err) {
      throw new Error("Couldn't connect right now");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    playSound("correctAnswer");

    const userMessage: Message = { sender: 'me', text: message, type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      const systemPrompt = `You are a warm, caring family member in the Amber app — a companion app for elderly users. You respond in short, gentle, conversational messages. Maximum 2 sentences. Use simple warm language. Occasionally reference sensory details like weather, tea, gardens, or family moments. Never use emojis except an occasional heart or sun. Sign off sometimes with the contact's name.`;
      
      const response = await callClaudeAPI([...messages, userMessage], systemPrompt);
      
      setIsTyping(false);
      const assistantMessage: Message = { sender: 'them', text: response, type: 'text' };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setIsTyping(false);
      setError((err as Error).message);
    }
  };

  // Simulated recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);

    // Start duration counter
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    // Animate waveform bars
    waveformIntervalRef.current = setInterval(() => {
      setWaveformBars(Array.from({ length: 15 }, () => Math.random() * 20 + 5));
    }, 100);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
    }

    // Reset waveform
    setWaveformBars(Array.from({ length: 15 }, () => 8));

    // Check minimum duration
    if (recordingDuration < 1) {
      setError('Keep holding to record');
      setRecordingDuration(0);
      setTimeout(() => setError(null), 2000);
      return;
    }

    // Show preview card with Send + Cancel
    setPendingMemo({ duration: recordingDuration });
    setRecordingDuration(0);
  };

  const handleSendMemo = () => {
    if (!pendingMemo) return;
    playSound("correctAnswer");

    const duration = `0:${pendingMemo.duration.toString().padStart(2, '0')}`;
    const voiceMessage: Message = {
      sender: 'me',
      text: '',
      type: 'voice',
      duration: pendingMemo.duration,
      id: Date.now(),
    };

    setMessages(prev => [...prev, voiceMessage]);
    setPendingMemo(null);

    // AI responds to voice memo
    setTimeout(async () => {
      setIsTyping(true);
      try {
        const systemPrompt = `You are a warm, caring family member in the Amber app. The user just sent you a voice message. Respond warmly as if you heard something lovely from them.`;
        const response = await callClaudeAPI(messages, systemPrompt);
        
        setIsTyping(false);
        const assistantMessage: Message = { sender: 'them', text: response, type: 'text' };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (err) {
        setIsTyping(false);
        setError((err as Error).message);
      }
    }, 500);
  };

  const handleCancelMemo = () => {
    playSound("pageBackChime");
    setPendingMemo(null);
  };

  const handleMicTap = () => {
    playSound("lightSwitch");
    if (!isRecording) {
      // START recording
      startRecording();
    } else {
      // STOP recording
      stopRecording();
    }
  };

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isRecording) {
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(s => s + 1);
      }, 1000);
      waveformIntervalRef.current = setInterval(() => {
        setWaveformBars(Array.from({ length: 15 }, () => Math.random() * 20 + 5));
      }, 100);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current);
      setIsRecording(false);
      setWaveformBars(Array.from({ length: 15 }, () => 8));
      
      if (recordingDuration >= 1) {
        setPendingMemo({ duration: recordingDuration });
      }
      setRecordingDuration(0);
    }
  };

  const playMemo = (memoId: number, duration: number) => {
    // Parse duration (format "0:18")
    const totalSeconds = duration;

    // Stop any currently playing memo
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    setPlayingMemoId(memoId);
    setMemoPlayheadProgress(prev => ({ ...prev, [memoId]: 0 }));

    // Simulate audio playback with visual progress
    let elapsed = 0;
    playbackIntervalRef.current = setInterval(() => {
      elapsed += 0.1;
      const progress = Math.min(elapsed / totalSeconds, 1);
      setMemoPlayheadProgress(prev => ({ ...prev, [memoId]: progress }));
      
      if (progress >= 1) {
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
        setPlayingMemoId(null);
        setMemoPlayheadProgress(prev => ({ ...prev, [memoId]: 0 }));
      }
    }, 100);

    // Try to play audio if available
    if (voiceAudioUrl) {
      const audio = new Audio(voiceAudioUrl);
      audio.play().catch(() => {
        // Audio blocked — still run the visual progress animation
      });
    }
  };

  const handleSelectImage = (url: string) => {
    setSelectedImage(url);
    setShowImagePicker(false);
  };

  const handleSendImage = () => {
    if (!selectedImage) return;
    playSound("correctAnswer");

    const imageMessage: Message = {
      sender: 'me',
      text: '',
      type: 'image',
      src: selectedImage,
    };

    setMessages(prev => [...prev, imageMessage]);
    setSelectedImage(null);
    setShowCompanionPrompt(true);
    setMessage("Thought of you when I saw this 💛");
  };

  const handleCancelImage = () => {
    playSound("pageBackChime");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset so same file can be reselected
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setSelectedImage(evt.target.result as string);
        setShowImagePicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundColor: '#FDF6EC',
        fontFamily: 'Lato, sans-serif',
      }}
    >
      {/* Background warm glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245,199,132,0.08) 0%, transparent 60%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div 
        className="px-6 pt-16 pb-4 flex items-center justify-between relative z-10"
        style={{
          backgroundColor: '#FDF6EC',
          borderBottom: '0.5px solid #E8D0B0',
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playSound("pageBackChime"); navigate("/user/messages"); }}
            style={{ color: '#C4601A' }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={() => { playSound("navSelect"); setShowProfileSheet(true); }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white"
            style={{
              background: gradient,
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            {initial}
          </button>
          
          <h1 
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#2C1A0E',
            }}
          >
            {contactName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button>
            <Phone size={20} style={{ color: '#E8873A' }} />
          </button>
          <button>
            <Video size={20} style={{ color: '#E8873A' }} />
          </button>
        </div>
      </div>

      {/* Warm gradient below header */}
      <div
        className="relative z-10"
        style={{
          height: '8px',
          background: 'linear-gradient(to bottom, rgba(245,199,132,0.12), transparent)',
        }}
      />
      
      {/* Messages */}
      <div className="flex-1 px-6 py-6 overflow-y-auto relative z-10">
        {messages.length === 0 && (
          <div 
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -60%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            <span style={{ fontSize: '36px', lineHeight: 1 }}>👋</span>
            <p style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '16px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#9A7A60',
              margin: 0,
              whiteSpace: 'nowrap'
            }}>Say hello</p>
          </div>
        )}
        {messages.map((msg, i) => {
          if (msg.type === 'voice') {
            return (
              <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}
                style={{
                  animation: 'slideUpFadeIn 250ms ease-out',
                }}
              >
                <VoiceMemoBubble
                  type={msg.sender === 'me' ? 'sent' : 'received'}
                  duration={formatDuration(msg.duration || 0)}
                  audioUrl={voiceAudioUrl}
                  isLoading={isLoadingAudio}
                  isPlaying={playingMemoId === msg.id}
                  playheadProgress={memoPlayheadProgress[msg.id || 0] || 0}
                  onPlay={() => msg.id && playMemo(msg.id, msg.duration || 0)}
                />
              </div>
            );
          } else if (msg.type === 'image') {
            return (
              <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}
                style={{
                  animation: 'slideUpFadeIn 250ms ease-out',
                }}
              >
                <ImageMessageBubble
                  imageUrl={msg.src || ''}
                  type={msg.sender === 'me' ? 'sent' : 'received'}
                />
              </div>
            );
          } else {
            return (
              <div key={i} style={{ animation: 'slideUpFadeIn 250ms ease-out' }}>
                <MessageBubble
                  type={msg.sender === 'me' ? 'sent' : 'received'}
                  content={msg.text}
                  timestamp={msg.time}
                />
              </div>
            );
          }
        })}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Companion text prompt */}
      {showCompanionPrompt && (
        <div className="px-6 pb-2 relative z-10">
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '14px',
            fontStyle: 'italic',
            color: '#9A7A60',
            textAlign: 'center',
          }}>
            Add a note to go with your photo?
          </p>
        </div>
      )}

      {/* Smart Reply Chips */}
      {!isRecording && !selectedImage && !pendingMemo && lastAssistantMessage && !showCompanionPrompt && (
        <div className="relative z-10">
          <SmartReplyChips
            lastMessage={lastAssistantMessage}
            onSelectReply={(reply) => {
              setMessage(reply);
              setTimeout(() => handleSendMessage(), 100);
            }}
          />
        </div>
      )}

      {/* Pending voice memo preview */}
      {pendingMemo && (
        <div className="px-6 pb-3 relative z-10">
          <div
            className="flex items-center gap-3 px-4"
            style={{
              height: '64px',
              backgroundColor: '#FFFAF3',
              border: '1px solid rgba(196,96,26,0.15)',
              borderRadius: '20px',
              boxShadow: '0px 4px 16px rgba(160,80,20,0.10)',
            }}
          >
            {/* Waveform preview - 16 static bars */}
            <div className="flex items-center gap-0.5 h-6">
              {Array.from({ length: 16 }).map((_, i) => {
                const heights = [12, 18, 24, 16, 20, 14, 22, 18, 16, 20, 15, 19, 21, 17, 14, 10];
                return (
                  <div
                    key={i}
                    style={{
                      width: '2px',
                      height: `${heights[i]}px`,
                      backgroundColor: '#C4601A',
                      borderRadius: '1px',
                      opacity: 0.6,
                    }}
                  />
                );
              })}
            </div>
            
            {/* Duration */}
            <span
              style={{
                fontFamily: 'Lato, sans-serif',
                fontSize: '13px',
                color: '#8A6A50',
              }}
            >
              0:{pendingMemo.duration.toString().padStart(2, '0')}
            </span>
            
            {/* Spacer */}
            <div style={{ flex: 1 }} />
            
            {/* Send button */}
            <button
              onClick={handleSendMemo}
              style={{
                width: '80px',
                height: '36px',
                borderRadius: '999px',
                backgroundColor: '#C4601A',
                color: 'white',
                fontFamily: 'Lato, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A84818'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C4601A'}
            >
              Send
            </button>
            
            {/* Cancel button */}
            <button
              onClick={handleCancelMemo}
              style={{
                width: '24px',
                height: '24px',
                marginLeft: '8px',
                color: '#9A7A60',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Image preview */}
      {selectedImage && (
        <div className="px-6 pb-3 relative z-10">
          <div 
            className="relative"
            style={{
              height: '100px',
              borderRadius: '12px',
              border: '1px solid #E8873A',
              overflow: 'hidden',
            }}
          >
            <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            <button
              onClick={handleCancelImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSendImage}
              className="px-5 py-2 rounded-full flex-1"
              style={{
                background: 'linear-gradient(to right, #D4601A, #E8873A)',
                color: 'white',
                fontFamily: 'Lato, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Send photo
            </button>
            <button
              onClick={handleCancelImage}
              className="px-4 py-2 rounded-full"
              style={{
                color: '#9A7A60',
                fontFamily: 'Lato, sans-serif',
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Image Picker Sheet */}
      {showImagePicker && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-20"
            style={{ backgroundColor: 'rgba(44,26,14,0.20)' }}
            onPointerDown={() => setShowImagePicker(false)}
          />
          
          {/* Sheet */}
          <div 
            className="absolute bottom-0 left-0 right-0 z-30"
            style={{
              backgroundColor: '#FFFAF3',
              borderRadius: '20px 20px 0 0',
              boxShadow: '0px -4px 20px rgba(160,80,20,0.08)',
            }}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            
            {/* Amber accent drag handle */}
            <div style={{
              width: '40px',
              height: '3px',
              backgroundColor: '#E8873A',
              borderRadius: '2px',
              margin: '12px auto 0',
            }} />
            
            <div className="flex flex-col">
              {/* Choose Photo button */}
              <button
                onClick={() => { playSound("navSelect"); fileInputRef.current?.click(); }}
                className="flex items-center justify-center gap-2.5 picker-row"
                style={{
                  height: '62px',
                  cursor: 'pointer',
                  borderBottom: '0.5px solid #E8D0B0',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(196,96,26,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Phosphor camera icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 256 256" fill="none" style={{ pointerEvents: 'none' }}>
                  <path d="M208 56h-27.72l-13.63-20.44A8 8 0 0 0 160 32H96a8 8 0 0 0-6.65 3.56L75.72 56H48a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h160a24 24 0 0 0 24-24V80a24 24 0 0 0-24-24zm-80 112a44 44 0 1 1 44-44 44.05 44.05 0 0 1-44 44z" stroke="#C4601A" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontFamily: 'Lato, sans-serif',
                  fontSize: '17px',
                  color: '#2C1A0E',
                  fontWeight: 500,
                }}>
                  Choose Photo
                </span>
              </button>
              
              {/* Cancel button */}
              <button
                onClick={() => { playSound("pageBackChime"); setShowImagePicker(false); }}
                className="flex items-center justify-center"
                style={{
                  height: '56px',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#9A7A60',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Input Bar */}
      <div className="px-6 py-4 relative z-10">
        <div 
          className="flex items-center gap-2 px-4"
          style={{
            height: '52px',
            borderRadius: '999px',
            backgroundColor: '#F0E4CC',
            border: '1px solid rgba(196,96,26,0.15)',
          }}
        >
          {!isRecording && !selectedImage && !pendingMemo && (
            <>
              <button 
                onClick={() => { playSound("lightSwitch"); setShowImagePicker(!showImagePicker); }}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: '#F2E8D8',
                }}
              >
                <ImageIcon size={20} style={{ color: '#C4601A' }} />
              </button>

              <input
                type="text"
                placeholder="Write a message…"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (showCompanionPrompt && e.target.value !== "Thought of you when I saw this 💛") {
                    setShowCompanionPrompt(false);
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent border-none outline-none"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontSize: '15px',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: '#A07850',
                }}
              />
              
              <button 
                onClick={handleSendMessage}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-110 flex-shrink-0"
                style={{
                  background: 'linear-gradient(to right, #D4601A, #E8873A)',
                }}
              >
                <Send size={18} color="white" />
              </button>

              <button 
                onClick={handleMicTap}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  backgroundColor: '#F5C784',
                }}
              >
                <Mic size={18} style={{ color: '#E8873A' }} />
              </button>
            </>
          )}

          {selectedImage && !pendingMemo && (
            <>
              <div className="flex-1" />
              <button 
                onClick={handleSendImage}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-110"
                style={{
                  background: 'linear-gradient(to right, #D4601A, #E8873A)',
                }}
              >
                <Send size={18} color="white" />
              </button>
            </>
          )}

          {isRecording && (
            <>
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="rounded-full animate-pulse"
                  style={{ 
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#C45A3A',
                  }}
                />
                <div className="flex items-center gap-0.5 h-5">
                  {waveformBars.map((height, i) => (
                    <div
                      key={i}
                      className="w-0.5 transition-all duration-100"
                      style={{
                        height: `${height}px`,
                        backgroundColor: '#E8873A',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontSize: '15px',
                    color: '#9A7A60',
                  }}
                >
                  Recording {formatDuration(recordingDuration)}
                </span>
              </div>
              <button 
                onClick={handleMicTap}
                className="rounded-full flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#C45A3A',
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                <Mic size={20} color="white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Sheet */}
      {showProfileSheet && (
        <ProfileSheet
          name={contactName}
          initial={initial}
          gradient={gradient}
          relationship="Family"
          onClose={() => setShowProfileSheet(false)}
        />
      )}

      {/* Error Toast */}
      {error && (
        <ErrorToast
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUpFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}