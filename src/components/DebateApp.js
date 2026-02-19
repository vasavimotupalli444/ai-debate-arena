import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Clock, Trophy, MessageSquare, Zap, FileText, User, Bot, Square, Volume2, VolumeX, Type, Share2 } from 'lucide-react';

// Predefined topics
const PREDEFINED_TOPICS = [
  {
    id: 1,
    title: "Artificial Intelligence in Education",
    description: "Should AI replace human teachers in classrooms?"
  },
  {
    id: 2,
    title: "Climate Change Solutions",
    description: "Is renewable energy enough to combat climate change?"
  },
  {
    id: 3,
    title: "Social Media Impact",
    description: "Do social media platforms do more harm than good?"
  },
  {
    id: 4,
    title: "Universal Basic Income",
    description: "Should governments provide universal basic income?"
  },
  {
    id: 5,
    title: "Space Exploration Priorities",
    description: "Should we prioritize Mars colonization over Earth's problems?"
  },
  {
    id: 6,
    title: "Cryptocurrency Future",
    description: "Will cryptocurrencies replace traditional banking?"
  }
];

// User level definitions
const USER_LEVELS = [
  {
    id: 'school',
    title: 'School Student',
    description: 'High school or below - Simple language and basic concepts',
    icon: '🎓',
    complexity: 'beginner'
  },
  {
    id: 'college',
    title: 'College Student',
    description: 'University level - Moderate complexity with academic references',
    icon: '📚',
    complexity: 'intermediate'
  },
  {
    id: 'professional',
    title: 'Working Professional',
    description: 'Advanced level - Complex arguments and professional terminology',
    icon: '💼',
    complexity: 'advanced'
  }
];

// Google Gemini API integration
const apiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY || 'AIzaSyDummy';

const callGoogleAI = async (prompt, maxTokens = 1000) => {
  // Fallback to local responses if key is missing
  if (!apiKey || apiKey === 'AIzaSyDummy' || apiKey === 'YOUR_API_KEY_HERE') {
    return generateIntelligentResponse(prompt, 'college');
  }

  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  // Try up to 3 times if we get a 429 error
  for (let i = 0; i < 3; i++) {
    try {
      // FIX 1: Use gemini-2.5-flash
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: maxTokens,
          }
        })
      });

      // FIX 2: Handle 429 Too Many Requests
      if (response.status === 429) {
        console.warn(`Rate limit hit. Attempt ${i + 1}: Retrying in ${2000 * (i + 1)}ms...`);
        await wait(2000 * (i + 1)); 
        continue;
      }

      if (!response.ok) return generateIntelligentResponse(prompt, 'college');

      const data = await response.json();
      if (data.error) {
  console.error("Gemini API Error:", data.error.message);
  return generateIntelligentResponse(prompt, 'college');
}

// Robust parsing for Gemini 2.5 (skipping internal thoughts)
const candidates = data.candidates || [];
if (candidates.length > 0) {
  const parts = candidates[0].content?.parts || [];
  // Find the first part that actually contains 'text'
  const textPart = parts.find(p => p.text);
  if (textPart && textPart.text.trim().length > 5) {
    return textPart.text.trim();
  }
}
      // FIX 3: Robust parsing for candidates
      const parts = data.candidates?.[0]?.content?.parts;
      if (parts) {
        const textPart = parts.find(p => p.text);
        return textPart ? textPart.text.trim() : generateIntelligentResponse(prompt, 'college');
      }

      return generateIntelligentResponse(prompt, 'college');
    } catch (error) {
      console.error("Gemini API Error:", error);
      return generateIntelligentResponse(prompt, 'college');
    }
  }
  return generateIntelligentResponse(prompt, 'college');
};
// Enhanced response generation based on user level
const generateIntelligentResponse = (prompt, userLevel = 'college') => {
  const promptLower = prompt.toLowerCase();
  
  // Enhanced topic detection
  const topicPatterns = {
    education: /education|teacher|school|student|classroom|learning|academic/i,
    climate: /climate|environment|renewable|energy|carbon|pollution|global warming/i,
    social_media: /social media|facebook|twitter|instagram|platform|online/i,
    ai: /artificial intelligence|ai|machine learning|robot|automation/i,
    income: /income|money|universal basic|economy|financial|wealth/i,
    space: /space|mars|exploration|nasa|colonization|planet/i,
    crypto: /crypto|bitcoin|blockchain|digital currency|decentralized/i,
  };

  // Level-specific response databases
  const responses = {
    education: {
      school: [
        "I think human teachers are still very important because they can understand your feelings and help you when you're struggling.",
        "But computers and AI could help teachers do their job better! They could help with homework and let teachers focus on discussions.",
        "The problem is that not everyone has good computers at home. If we replace teachers with AI, some students might get left behind."
      ],
      college: [
        "While AI offers personalized learning experiences, human educators provide irreplaceable emotional intelligence and mentorship.",
        "However, AI-powered educational systems could democratize access to quality education globally, providing 24/7 academic support.",
        "We must consider the digital divide and equity implications. AI implementation could exacerbate educational inequalities."
      ],
      professional: [
        "The integration of AI in educational frameworks requires analysis of pedagogical effectiveness versus human capital displacement.",
        "From an institutional perspective, AI-driven education could optimize resource allocation and enable sophisticated learning analytics.",
        "However, we must address systemic implications including workforce displacement and digital equity gaps."
      ]
    },
    climate: {
      school: [
        "Just using solar panels and wind power isn't enough to stop climate change. We also need to change how we travel and what we eat.",
        "Actually, clean energy is getting much cheaper now! Solar power costs way less than it used to.",
        "But we're running out of time to fix climate change. We might need to try some new ideas like capturing carbon from the air."
      ],
      college: [
        "Renewable energy alone cannot address the comprehensive scope of climate change mitigation. We require integrated solutions.",
        "The exponential cost decline in renewable technologies creates unprecedented opportunities for clean energy adoption.",
        "Given the urgency of climate targets, we may need to consider controversial approaches including nuclear energy expansion."
      ],
      professional: [
        "The renewable energy transition represents only one component of comprehensive climate mitigation requiring systemic transformation.",
        "Market fundamentals have shifted decisively toward renewable deployment due to learning curve effects and grid modernization.",
        "Temporal constraints imposed by carbon budget limitations may necessitate portfolio approaches including advanced nuclear systems."
      ]
    },
    default: {
      school: [
        "I think there might be some problems with that idea.",
        "That's interesting, but I disagree because it could cause issues.",
        "You make a point, but we should think about the downsides too."
      ],
      college: [
        "That perspective has merit, but we should consider potential unintended consequences.",
        "I respectfully disagree - the evidence suggests a more complex relationship between these factors.",
        "Your argument raises important points, though the implementation challenges remain significant."
      ],
      professional: [
        "While your framework presents compelling logic, the underlying assumptions merit critical examination.",
        "That proposition requires deeper analysis of systemic implications and stakeholder impact assessments.",
        "Your perspective warrants consideration, though empirical evidence suggests more nuanced interdependencies."
      ]
    }
  };

  // Determine topic
  let selectedTopic = 'default';
  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(promptLower)) {
      selectedTopic = topic;
      break;
    }
  }

  // Get level-appropriate responses
  const topicResponses = responses[selectedTopic];
  if (topicResponses && topicResponses[userLevel]) {
    const levelResponses = topicResponses[userLevel];
    return levelResponses[Math.floor(Math.random() * levelResponses.length)];
  }

  const defaultResponses = responses.default[userLevel] || responses.default.college;
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Generate AI debate response
const generateAIDebateResponse = async (topic, humanArgument, conversationHistory, userLevel = 'college') => {
  const recentHistory = conversationHistory.slice(-4)
    .map(msg => `${msg.sender === 'human' ? 'Human' : 'AI'}: ${msg.content}`)
    .join('\n');

  const levelInstructions = {
    school: `You are debating with a high school student. Use simple language.`,
    college: `You are debating with a university student. Use moderate complexity.`,
    professional: `You are debating with a working professional. Use advanced concepts.`
  };

  const maxTokens = { school: 800, college: 1000, professional: 1200 };

  const prompt = `${levelInstructions[userLevel]}
Debate Topic: "${topic}"
Recent exchange:
${recentHistory}
Human's latest argument: "${humanArgument}"
Provide a thoughtful counter-argument. Stay within 3 sentences.
Your response:`;

  // CRITICAL FIX: Use the 'callGoogleAI' helper instead of writing a new fetch here!
  // This ensures the 2.5 model and retry logic are actually used.
  const aiResult = await callGoogleAI(prompt, maxTokens[userLevel]);
  return aiResult;
};
// Generate debate summary with quality-based scoring and actual analysis
const generateDebateSummary = async (topic, messages) => {
  const humanMessages = messages.filter(m => m.sender === 'human');
  const aiMessages = messages.filter(m => m.sender === 'ai');
  
  // Return empty result if no actual debate occurred
  if (humanMessages.length === 0 || aiMessages.length === 0) {
    return {
      summary: "No debate took place - insufficient arguments from both sides to provide meaningful analysis.",
      winner: 'none',
      winnerReason: "No debate occurred to determine a winner.",
      humanScore: 0,
      aiScore: 0,
      keyPoints: ["No arguments were exchanged", "Timer may have expired before debate began"],
      participationBreakdown: {
        human: 0,
        ai: 0,
        humanArguments: 0,
        aiArguments: 0
      }
    };
  }
  
  // Quality-based scoring system
  const analyzeArgumentQuality = (message) => {
    const content = message.content.toLowerCase();
    let score = 0;
    
    // Length and depth (0-25 points)
    if (message.content.length > 200) score += 25;
    else if (message.content.length > 100) score += 15;
    else if (message.content.length > 50) score += 10;
    else score += 5;
    
    // Evidence and reasoning indicators (0-25 points)
    const evidenceTerms = ['because', 'research shows', 'studies indicate', 'evidence', 'data', 'statistics', 'according to', 'proven', 'demonstrates'];
    const foundEvidence = evidenceTerms.filter(term => content.includes(term)).length;
    score += Math.min(foundEvidence * 5, 25);
    
    // Counterargument acknowledgment (0-25 points)
    const counterTerms = ['however', 'although', 'while', 'despite', 'on the other hand', 'nevertheless', 'but', 'yet'];
    const foundCounter = counterTerms.filter(term => content.includes(term)).length;
    score += Math.min(foundCounter * 8, 25);
    
    // Logical structure (0-25 points)
    const structureTerms = ['first', 'second', 'finally', 'furthermore', 'moreover', 'additionally', 'therefore', 'thus', 'consequently'];
    const foundStructure = structureTerms.filter(term => content.includes(term)).length;
    score += Math.min(foundStructure * 6, 25);
    
    return Math.min(score, 100);
  };
  
  // Calculate average quality scores
  const humanQualityScore = humanMessages.length > 0 
    ? humanMessages.reduce((sum, msg) => sum + analyzeArgumentQuality(msg), 0) / humanMessages.length 
    : 0;
    
  const aiQualityScore = aiMessages.length > 0 
    ? aiMessages.reduce((sum, msg) => sum + analyzeArgumentQuality(msg), 0) / aiMessages.length 
    : 0;
  
  // Participation factor (max 20 bonus points for engagement)
 
// Scores based purely on argument quality - no participation bias
  const humanFinalScore = Math.round(Math.min(humanQualityScore + 10, 100)); // +10 bonus for participating
  const aiFinalScore = Math.round(Math.min(aiQualityScore, 100));
  const totalMessages = humanMessages.length + aiMessages.length;

  // Determine winner strictly on quality points
  const winner = humanFinalScore > aiFinalScore ? 'human' : 
                 aiFinalScore > humanFinalScore ? 'ai' : 'tie';
  
  // Generate actual analysis from debate content
  // Pick 2 best messages from each side
  const sortedHuman = [...humanMessages].sort((a, b) => 
    analyzeArgumentQuality(b) - analyzeArgumentQuality(a)).slice(0, 2);
  const sortedAI = [...aiMessages].sort((a, b) => 
    analyzeArgumentQuality(b) - analyzeArgumentQuality(a)).slice(0, 2);

  const keyPoints = [
    `You: ${sortedHuman[0]?.content.slice(0, 150) || 'No argument'}`,
    `You: ${sortedHuman[1]?.content.slice(0, 150) || 'No second argument'}`,
    `AI: ${sortedAI[0]?.content.slice(0, 150) || 'No argument'}`,
    `AI: ${sortedAI[1]?.content.slice(0, 150) || 'No second argument'}`,
  ];
  // Create meaningful summary based on actual debate
  const summary = '';
const winnerReason = winner === 'human' ? 
    `Your arguments showed superior quality (${Math.round(humanQualityScore)}/100) and strong participation with ${humanMessages.length} contributions.` : 
    winner === 'ai' ?
    `The AI demonstrated better argument quality (${Math.round(aiQualityScore)}/100) with more structured reasoning in ${aiMessages.length} responses.` :
    `Both sides performed equally well with comparable argument quality and engagement.`;
  
  return {
    summary: summary,
    winner: winner,
    winnerReason: winnerReason,
    humanScore: Math.min(100, humanFinalScore),
    aiScore: Math.min(100, aiFinalScore),
    keyPoints: keyPoints,
    participationBreakdown: {
      human: Math.round((humanMessages.length / totalMessages) * 100),
      ai: Math.round((aiMessages.length / totalMessages) * 100),
      humanArguments: humanMessages.length,
      aiArguments: aiMessages.length
    }
  };
};

const DebateApp = () => {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [debateMode, setDebateMode] = useState(''); // 'voice' or 'text'
  const [debateTimer, setDebateTimer] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isDebateActive, setIsDebateActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [debateSummary, setDebateSummary] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [pendingVoiceInput, setPendingVoiceInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [canUserSpeak, setCanUserSpeak] = useState(true);
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition with improved settings
  useEffect(() => {
    const checkSpeechSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        initializeSpeechRecognition();
        return true;
      } else {
        setSpeechSupported(false);
        console.log('Speech recognition not supported');
        return false;
      }
    };
    checkSpeechSupport();
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Optimized settings for better voice capture
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;
    
    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      finalTranscriptRef.current = '';
    };
    
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          finalTranscriptRef.current = finalTranscript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Show live transcription
      const displayTranscript = finalTranscript + interimTranscript;
      setCurrentTranscript(displayTranscript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.');
      } else if (event.error === 'no-speech') {
        // Continue listening for voice mode
        if (debateMode === 'voice' && isDebateActive && canUserSpeak) {
          setTimeout(() => {
            if (!isListening) {
              startListening();
            }
          }, 1000);
        }
      }
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Store final transcript for user to review and send
      const finalText = finalTranscriptRef.current.trim();
      if (finalText && finalText.length > 0) {
        console.log('Final transcript ready for sending:', finalText);
        setPendingVoiceInput(finalText);
        setCurrentTranscript('');
        finalTranscriptRef.current = '';
      }
    };
  };

  // Timer logic
  useEffect(() => {
    if (isDebateActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endDebateNaturally();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isDebateActive, timeRemaining]);

  const startListening = () => {
    if (recognitionRef.current && speechSupported && !isListening && canUserSpeak && !isAISpeaking && isDebateActive) {
      try {
        finalTranscriptRef.current = '';
        setCurrentTranscript('');
        recognitionRef.current.start();
        console.log('Starting speech recognition');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Unable to start speech recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      console.log('Stopping speech recognition');
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window && debateMode === 'voice') {
      // Disable user speech when AI is speaking
      setCanUserSpeak(false);
      
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && (
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft')
        )
      ) || voices.find(voice => voice.lang.includes('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => {
        setIsAISpeaking(true);
      };
      
      utterance.onend = () => {
        setIsAISpeaking(false);
        // Re-enable user speech and start listening again for voice mode
        setCanUserSpeak(true);
        if (debateMode === 'voice' && isDebateActive) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsAISpeaking(false);
        setCanUserSpeak(true);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUserArgument = async (argument) => {
    if (!argument.trim() || !isDebateActive) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'human',
      content: argument.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setTextInput('');
    setIsAITyping(true);
    
    // Disable user input while AI is responding
    setCanUserSpeak(false);
    
    try {
      const aiResponse = await generateAIDebateResponse(
        selectedTopic, 
        argument.trim(), 
        [...messages, userMessage],
        userLevel
      );
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setTurnCount(prev => prev + 1);
      
      setTimeout(() => {
        setIsAITyping(false);
        if (debateMode === 'voice') {
          speakText(aiResponse);
        } else {
          // Re-enable user input for text mode
          setCanUserSpeak(true);
        }
      }, 500);
      
    } catch (error) {
      setIsAITyping(false);
      setCanUserSpeak(true);
      console.error('Error generating AI response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: "I'm having trouble generating a response. Could you try rephrasing your argument?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && canUserSpeak && isDebateActive) {
      handleUserArgument(textInput.trim());
    }
  };

  const handleVoiceSend = () => {
    if (pendingVoiceInput.trim() && isDebateActive) {
      handleUserArgument(pendingVoiceInput.trim());
      setPendingVoiceInput('');
    }
  };

  const discardVoiceInput = () => {
    setPendingVoiceInput('');
    if (debateMode === 'voice' && isDebateActive && canUserSpeak) {
      setTimeout(() => startListening(), 500);
    }
  };
const debateEndedRef = useRef(false);
  const startDebate = (topic) => {
    debateEndedRef.current = false;
    setSelectedTopic(topic);
    setTimeRemaining(debateTimer * 60);
    setIsDebateActive(true);
    setMessages([]);
    setTurnCount(0);
    setDebateSummary(null);
    setCurrentScreen('debate');
    setTextInput('');
    setCurrentTranscript('');
    setPendingVoiceInput('');
    setCanUserSpeak(false);
    finalTranscriptRef.current = '';
    
    setTimeout(() => {
      const greeting = `Welcome to our debate on "${topic}". I'm ready to engage in a thoughtful discussion. Please share your opening perspective.`;
      
      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        content: greeting,
        timestamp: new Date()
      };
      
      setMessages([aiMessage]);
      
      setTimeout(() => {
        if (debateMode === 'voice') {
          speakText(greeting);
        } else {
          setCanUserSpeak(true);
        }
      }, 1000);
    }, 500);
  };

  const endDebateNaturally = async () => {
  if (debateEndedRef.current) return;
  debateEndedRef.current = true;

  console.log('Debate ended naturally - timer completed');
  setIsDebateActive(false);
  stopListening();
  setIsAITyping(true);
  
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  setIsAISpeaking(false);
  
  const summary = await generateDebateSummary(selectedTopic, messages);

  // Save to backend
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch('https://ai-debate-arena-q031.onrender.com/debates/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: selectedTopic,
          winner: summary.winner,
          humanScore: summary.humanScore,
          aiScore: summary.aiScore,
          userLevel,
          debateMode,
          messages,
          keyPoints: summary.keyPoints
        })
      });
      console.log('✅ Debate saved!');
    }
  } catch (err) {
    console.error('Failed to save debate:', err);
  }

  setDebateSummary(summary);
  setCurrentScreen('summary');
  setIsAITyping(false);
};
  const stopDebateManually = () => {
    console.log('Debate stopped manually by user');
    setIsDebateActive(false);
    stopListening();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAISpeaking(false);
    
    // Show simple message for manual stop
    setCurrentScreen('manual-stop');
  };

  const startNewDebate = () => {
    setCurrentScreen('landing');
    setMessages([]);
    setDebateSummary(null);
    setSelectedTopic('');
    setCustomTopic('');
    setUserLevel('');
    setDebateMode('');
    setTurnCount(0);
    setTextInput('');
    setCurrentTranscript('');
    setPendingVoiceInput('');
    setCanUserSpeak(true);
    finalTranscriptRef.current = '';
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAISpeaking(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const shareResults = () => {
    if (!debateSummary) return;
    
    const shareText = `🏆 AI Debate Results 🏆

Topic: ${selectedTopic}
Winner: ${debateSummary.winner === 'human' ? 'Human' : debateSummary.winner === 'ai' ? 'AI' : 'Tie'}
Scores: Human ${debateSummary.humanScore}% vs AI ${debateSummary.aiScore}%
Participation: Human ${debateSummary.participationBreakdown.humanArguments} arguments (${debateSummary.participationBreakdown.human}%) vs AI ${debateSummary.participationBreakdown.aiArguments} arguments (${debateSummary.participationBreakdown.ai}%)

${debateSummary.winnerReason}

#AIDebate #CriticalThinking`;

    if (navigator.share) {
      navigator.share({
        title: 'AI Debate Results',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Results copied to clipboard!');
      });
    }
  };

  const renderLandingScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Debate Arena
          </h1>
          <p className="text-xl text-blue-200">
            Challenge Advanced AI in intelligent debates
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Trophy className="mr-2" /> Choose Your Battle
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PREDEFINED_TOPICS.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                  onClick={() => {
                    setSelectedTopic(topic.title);
                    setCurrentScreen('level-selection');
                  }}
                >
                  <h3 className="font-semibold mb-2">{topic.title}</h3>
                  <p className="text-sm text-blue-200">{topic.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FileText className="mr-2" /> Custom Topic
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter your debate topic..."
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => {
                  if (customTopic.trim()) {
                    setSelectedTopic(customTopic);
                    setCurrentScreen('level-selection');
                  }
                }}
                disabled={!customTopic.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Debate
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const renderLevelSelection = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-4xl w-full mx-4">
        <motion.div
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-semibold mb-4">Select Your Level</h2>
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-300 mb-2">Selected Topic:</h3>
            <p className="text-white">{selectedTopic}</p>
          </div>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {USER_LEVELS.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                userLevel === level.id 
                  ? 'bg-blue-600/30 border-blue-400' 
                  : 'bg-white/10 border-white/20 hover:border-white/40'
              }`}
              onClick={() => setUserLevel(level.id)}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{level.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{level.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{level.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentScreen('landing')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Topics
          </button>
          <button
            onClick={() => setCurrentScreen('mode-selection')}
            disabled={!userLevel}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderModeSelection = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-2xl w-full mx-4">
        <motion.div
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-semibold mb-4">Choose Debate Mode</h2>
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-300 mb-2">Topic & Level:</h3>
            <p className="text-white">{selectedTopic}</p>
            <p className="text-green-300 text-sm mt-1">
              {USER_LEVELS.find(level => level.id === userLevel)?.title}
            </p>
          </div>
        </motion.div>
        
        <div className="grid gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
              debateMode === 'voice' 
                ? 'bg-purple-600/30 border-purple-400' 
                : 'bg-white/10 border-white/20 hover:border-white/40'
            }`}
            onClick={() => setDebateMode('voice')}
          >
            <div className="flex items-center">
              <div className="p-4 bg-purple-500/20 rounded-lg mr-6">
                <Mic className="h-8 w-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Voice Debate</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  AI speaks responses aloud. You must wait for AI to finish speaking before responding. 
                  Use microphone to record your arguments.
                </p>
                <div className="mt-3 text-xs text-purple-300">
                  {speechSupported ? 'Microphone supported ✓' : 'Microphone not supported ✗'}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
              debateMode === 'text' 
                ? 'bg-blue-600/30 border-blue-400' 
                : 'bg-white/10 border-white/20 hover:border-white/40'
            }`}
            onClick={() => setDebateMode('text')}
          >
            <div className="flex items-center">
              <div className="p-4 bg-blue-500/20 rounded-lg mr-6">
                <Type className="h-8 w-8 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Text Debate</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Traditional text-based debate. Type your arguments and read AI responses. 
                  Faster interaction with immediate responses.
                </p>
                <div className="mt-3 text-xs text-blue-300">
                  Always available ✓
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentScreen('level-selection')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Level
          </button>
          <button
            onClick={() => setCurrentScreen('timer-setup')}
            disabled={!debateMode}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue to Timer
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderTimerSetup = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center">
          <Clock className="mr-2" /> Set Debate Timer
        </h2>
        <div className="space-y-6">
          <div>
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-300 mb-2">Topic:</h3>
              <p className="text-white text-sm">{selectedTopic}</p>
              <div className="mt-2 pt-2 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-green-300 font-medium">Level: </span>
                    <span className="text-white">{USER_LEVELS.find(level => level.id === userLevel)?.title}</span>
                  </div>
                  <div className="flex items-center">
                    {debateMode === 'voice' ? (
                      <>
                        <Mic className="h-4 w-4 text-purple-400 mr-1" />
                        <span className="text-purple-300 text-sm">Voice</span>
                      </>
                    ) : (
                      <>
                        <Type className="h-4 w-4 text-blue-400 mr-1" />
                        <span className="text-blue-300 text-sm">Text</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <label className="block text-sm font-medium mb-2">
              Duration: {debateTimer} minutes
            </label>
            <input
              type="range"
              min="1"
              max="60"
              value={debateTimer}
              onChange={(e) => setDebateTimer(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-blue-200 mt-1">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentScreen('mode-selection')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => startDebate(selectedTopic)}
              className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Clock className="mr-2 h-4 w-4" />
              Start Debate
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDebateScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex flex-col"
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">{selectedTopic}</h1>
            <p className="text-blue-200">Round {Math.floor(turnCount / 2) + 1} • {debateMode === 'voice' ? 'Voice Mode' : 'Text Mode'}</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${timeRemaining <= 60 ? 'text-red-400' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-blue-200">remaining</div>
          </div>
          <button
            onClick={stopDebateManually}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
          >
            <Square className="mr-2 h-4 w-4" />
            End Debate
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg ${
                  message.sender === 'human' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : 'bg-white/20 text-white border border-white/20'
                }`}>
                  <div className="flex items-center p-3 pb-2">
                    {message.sender === 'human' ? (
                      <User className="h-4 w-4 mr-2 text-blue-200" />
                    ) : (
                      <Bot className="h-4 w-4 mr-2 text-purple-300" />
                    )}
                    <span className="font-semibold text-sm">
                      {message.sender === 'human' ? 'You' : 'AI Opponent'}
                    </span>
                    {isAISpeaking && message.sender === 'ai' && (
                      <div className="ml-2 flex items-center">
                        <Volume2 className="h-3 w-3 animate-pulse text-purple-300" />
                      </div>
                    )}
                  </div>
                  <div className="px-3 pb-3">
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* AI Typing Indicator */}
          {isAITyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/20 text-white border border-white/20 rounded-lg p-3">
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-2 text-purple-300" />
                  <span className="font-semibold text-sm mr-2">AI Opponent</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Waiting indicators */}
          {debateMode === 'voice' && isAISpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-lg border border-purple-400/50">
                <Volume2 className="mr-2 h-4 w-4 animate-pulse text-purple-300" />
                <span className="text-purple-200 text-sm">AI is speaking... Please wait to respond</span>
              </div>
            </motion.div>
          )}
          
          {messages.length === 0 && !isAITyping && (
            <div className="text-center text-blue-200 py-20">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">Ready to begin the debate!</p>
              <p className="text-sm opacity-70">
                {debateMode === 'voice' ? 'Wait for AI greeting, then use the microphone to respond' : 'Start by typing your argument'}
              </p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/20 p-4">
        <div className="max-w-4xl mx-auto">
          {debateMode === 'text' ? (
            // Text mode input
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTextSubmit();
                    }
                  }}
                  placeholder="Type your argument..."
                  disabled={!isDebateActive || isAITyping || !canUserSpeak}
                  className="w-full p-4 pr-12 rounded-xl bg-white/10 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[56px] max-h-32"
                  rows="1"
                />
                
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || !isDebateActive || isAITyping || !canUserSpeak}
                  className="absolute right-2 bottom-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            // Voice mode input
            <div className="flex flex-col items-center gap-4">
              {/* Pending voice input display with send/discard options */}
              {pendingVoiceInput && (
                <div className="w-full max-w-2xl">
                  <div className="bg-blue-600/20 border-2 border-blue-400 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-blue-300 mr-2" />
                        <span className="text-sm font-medium text-blue-200">Your recorded message:</span>
                      </div>
                      <div className="text-xs text-blue-300">Ready to send</div>
                    </div>
                    <p className="text-white mb-4 leading-relaxed">{pendingVoiceInput}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleVoiceSend}
                        disabled={!isDebateActive || isAITyping}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </button>
                      <button
                        onClick={discardVoiceInput}
                        className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Record Again
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Live transcription display for voice mode */}
              {currentTranscript && debateMode === 'voice' && !pendingVoiceInput && (
                <div className="w-full max-w-2xl">
                  <div className="bg-white/10 border border-white/30 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <Mic className="h-4 w-4 text-red-400 mr-2 animate-pulse" />
                      <span className="text-sm font-medium text-blue-200">Listening...</span>
                    </div>
                    <p className="text-white">{currentTranscript}</p>
                  </div>
                </div>
              )}
              
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!isDebateActive || isAITyping || !speechSupported || !canUserSpeak || pendingVoiceInput}
                className={`p-6 rounded-full font-semibold transition-all flex items-center justify-center relative ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 min-w-[80px] min-h-[80px]`}
                title={
                  pendingVoiceInput ? 'Send or discard your message first' :
                  !speechSupported ? 'Speech recognition not supported' :
                  !canUserSpeak ? 'Wait for AI to finish speaking' :
                  isListening ? 'Stop Recording' : 'Start Recording'
                }
              >
                {isListening ? (
                  <>
                    <MicOff className="h-8 w-8 text-white" />
                    <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
                  </>
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </button>
              
              <p className="text-center text-sm text-blue-200 max-w-md">
                {pendingVoiceInput ? 'Review your message above and choose to send or record again' :
                 !canUserSpeak ? 'Please wait for AI to finish speaking before responding' :
                 isListening ? 'Speak your argument... Click to stop recording' :
                 'Click the microphone to record your argument'}
              </p>
            </div>
          )}
          
          {/* Status indicators */}
          <div className="mt-3 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              {isAISpeaking && (
                <div className="flex items-center text-purple-300">
                  <Volume2 className="w-3 h-3 mr-2 animate-pulse" />
                  AI Speaking...
                </div>
              )}
              
              {debateMode === 'voice' && !speechSupported && (
                <div className="text-yellow-300">
                  Voice features require Chrome/Edge
                </div>
              )}
            </div>
            
            <div className="text-blue-300">
              Turn {Math.floor(turnCount / 2) + 1} • {messages.filter(m => m.sender === 'human').length} arguments
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderManualStopScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center"
    >
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
        >
          <Square className="h-24 w-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4">Debate Ended</h2>
          <p className="text-blue-200 text-lg mb-6 leading-relaxed">
            You stopped the debate before the timer completed. Only debates that run their full course receive detailed analysis and scoring.
          </p>
          <button
            onClick={startNewDebate}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
          >
            Start New Debate
          </button>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderSummaryScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Debate Results</h1>
          <p className="text-xl text-blue-200">Complete Analysis & Scoring</p>
        </motion.div>

        {debateSummary && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Winner Announcement */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`relative overflow-hidden rounded-xl p-8 text-center ${
                debateSummary.winner === 'human' 
                  ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-2 border-green-400/50' 
                  : debateSummary.winner === 'ai'
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-400/50'
                  : 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-2 border-yellow-400/50'
              }`}
            >
              <Trophy className={`h-24 w-24 mx-auto mb-6 ${
                debateSummary.winner === 'human' ? 'text-yellow-400' : 
                debateSummary.winner === 'ai' ? 'text-blue-400' : 'text-yellow-400'
              }`} />
              <h2 className="text-3xl font-bold mb-4">
                Winner: {debateSummary.winner === 'human' ? 'You!' : 
                         debateSummary.winner === 'ai' ? 'AI Opponent' : 'It\'s a Tie!'}
              </h2>
              
              {/* Score Display */}
              <div className="mb-6">
                <div className="flex justify-center items-center gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400">
                      {debateSummary.humanScore}
                    </div>
                    <div className="text-sm text-gray-300">Your Score</div>
                  </div>
                  <div className="text-2xl text-gray-400">vs</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400">
                      {debateSummary.aiScore}
                    </div>
                    <div className="text-sm text-gray-300">AI Score</div>
                  </div>
                </div>
                
                {/* Participation Breakdown */}
                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm text-blue-200 mb-2">Participation:</p>
                  <div className="flex justify-center gap-8 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-300">{debateSummary.participationBreakdown.humanArguments}</div>
                      <div className="text-xs text-gray-300">Your Arguments ({debateSummary.participationBreakdown.human}%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-300">{debateSummary.participationBreakdown.aiArguments}</div>
                      <div className="text-xs text-gray-300">AI Arguments ({debateSummary.participationBreakdown.ai}%)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-blue-200 text-lg leading-relaxed mb-6">
                {debateSummary.winnerReason}
              </p>

              {/* Share Button */}
              <button
                onClick={shareResults}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6 py-3 rounded-lg font-semibold transition-all flex items-center mx-auto"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </button>
            </motion.div>

            {/* Debate Summary */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <MessageSquare className="mr-3 text-blue-400" /> Debate Analysis
              </h3>
              <p className="text-blue-100 leading-relaxed text-lg mb-4">{debateSummary.summary}</p>
              
              {/* Key Points */}
              {debateSummary.keyPoints && debateSummary.keyPoints.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-blue-300">Key Points:</h4>
                  <div className="grid gap-3">
                    {debateSummary.keyPoints.map((point, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start bg-white/5 rounded-lg p-3"
                      >
                        <div className="h-2 w-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-blue-100 text-sm leading-relaxed">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <button
                onClick={startNewDebate}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
              >
                Start New Debate
              </button>
              <p className="text-blue-300 text-sm mt-4 max-w-md mx-auto">
                Challenge yourself with more topics and improve your debate skills!
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && renderLandingScreen()}
        {currentScreen === 'level-selection' && renderLevelSelection()}
        {currentScreen === 'mode-selection' && renderModeSelection()}
        {currentScreen === 'timer-setup' && renderTimerSetup()}
        {currentScreen === 'debate' && renderDebateScreen()}
        {currentScreen === 'manual-stop' && renderManualStopScreen()}
        {currentScreen === 'summary' && renderSummaryScreen()}
      </AnimatePresence>
    </div>
  );
};

export default DebateApp;