import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Star, MousePointer, ChevronLeft, ChevronRight, MessageSquare, Maximize2, Minimize2, X, Send } from 'lucide-react';

const Hero = () => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const { scrollY } = useScroll();

  // Parallax and scroll-based animations
  const y = useSpring(useTransform(scrollY, [0, 500], [0, -150]), {
    stiffness: 100,
    damping: 30
  });
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  // Sample reviews data
  const reviews = [
    {
      id: 1,
      name: "Shreyash",
      rating: 5,
      comment: "This platform completely transformed my career journey! I was confused about what career path to choose, but the AI-driven recommendations and assessments gave me a clear direction. I landed my first job in just three months with their personalized guidance!",
      
    },
    {
      id: 2,
      name: "Rahul Shrivatsav",
      rating: 4,
      comment: "As a mid-career professional, I was looking to transition into data science, but I had no idea where to start. This platform provided a tailored learning pathway, connecting me with the right courses, mentorship, and job opportunities. Within six months, I secured a role as a Data Analyst!",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 3,
      name: "Yash Bhojwani",
      rating: 5,
      comment: "This platform helped me pick the right ones based on my goals and even connected me to a like-minded community. ",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 3,
      name: "Ved Thaware",
      rating: 5,
      comment: "This platform makes career counseling so much easier! It provides structured insights into students' strengths and weaknesses, helping them choose the right path. It’s a game-changer for educators and mentors.",
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 3,
      name: "Pournima Bhosale",
      rating: 5,
      comment: " I finally found a job that aligns with my passion and skills, thanks to this platform!",
      avatar: "/api/placeholder/32/32"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Hero Content */}
      <div className="container mx-auto px-6 pt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <motion.div 
            style={{ y, opacity }}
            className="flex-1 max-w-xl relative z-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg mb-6"
            >
              <MousePointer className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">Personalized Learning, Your Way!</span>
            </motion.div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500"
            >
              Chart Your Unique Path to Success with Sahay
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 mb-8 text-lg"
            >
              Create a learning path that adapts to your strengths, interests, and aspirations. Step by step, we’re here to guide you forward.
              Your journey, your rules.
            </motion.p>
            
            <motion.div className="flex gap-4">
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 4px 15px rgba(234, 179, 8, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden border-2 border-gray-200 text-black px-8 py-3 rounded-full font-medium"
              >
                <span className="relative z-10">Learn More</span>
                <motion.div
                  className="absolute inset-0 bg-gray-50"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Content - Enhanced Decorative Elements */}
          <motion.div 
            style={{ scale }}
            className="flex-1 relative h-[600px]"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 0.9, 1]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0"
            >
              <motion.div 
                className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-tr-[100px] transform rotate-45"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-indigo-600 to-violet-500 opacity-20 rounded-bl-[80px] transform -rotate-12"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

            {/* Floating Elements */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 0],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-32 mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          
          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">

                  <div>
                    <h3 className="font-semibold">{review.name}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </motion.div>
            ))}
          </div>

          {/* Add Review Form */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-12 max-w-xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-semibold mb-6">Share Your Experience</h3>
            <div className="flex gap-2 mb-4">
              {[...Array(5)].map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(index + 1)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review..."
              className="w-full p-4 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Submit Review
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // API endpoint configuration
  const API_URL = 'http://localhost:5005';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setPosition({
      x: window.innerWidth - 420,
      y: window.innerHeight - 620
    });
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-controls')) return;
    setIsDragging(true);
    const chatWindow = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - chatWindow.left,
      y: e.clientY - chatWindow.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - (isMinimized ? 60 : 600), e.clientY - dragOffset.y));
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isMinimized]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = { text: message, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        const botMessage = {
          text: data.response,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle error response
        const errorMessage = {
          text: data.response || 'Sorry, I encountered an error. Please try again.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#ffb800] text-navy-900 p-4 rounded-full shadow-lg hover:bg-[#ffd700] transition-all z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  const chatStyle = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: isMinimized ? '300px' : '400px',
    height: isMinimized ? '60px' : '600px',
    zIndex: 1000,
    transform: 'none'
  };

  return (
    <div
      style={chatStyle}
      className="bg-white rounded-lg shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <div
        className="bg-[#ffb800] text-navy-900 p-4 cursor-move flex justify-between items-center select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-bold">Sahay Assistant</h3>
        <div className="chat-controls flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[#ffd700] rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[#ffd700] rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div 
            ref={chatContainerRef}
            className="h-[calc(100%-120px)] overflow-y-auto p-4 bg-gray-50"
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                Send a message to start the conversation!
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-[#ffb800] text-navy-900'
                      : 'bg-gray-200 text-navy-900'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb800]"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                className={`bg-[#ffb800] text-navy-900 p-2 rounded-lg hover:bg-[#ffd700] transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;