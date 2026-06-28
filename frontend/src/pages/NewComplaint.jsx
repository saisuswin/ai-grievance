import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, UploadCloud, X, Send, Image as ImageIcon, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NewComplaint = () => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [language, setLanguage] = useState('en-US');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Speech to text handling
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition. Please use Chrome.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = (event) => console.error("Speech recognition error", event.error);
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !image) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);
    formData.append('location', 'User GPS Location (Mock)');
    formData.append('language', language);
    if (user?.email) formData.append('userEmail', user.email);

    try {
      await axios.post('http://localhost:5000/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/complaints');
      }, 2000);
    } catch (error) {
      console.error('Error submitting complaint', error);
      alert("Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center mt-32 space-y-4">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="text-green-400 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold">Complaint Registered!</h2>
        <p className="text-gray-400">Our AI has successfully analyzed and routed your issue.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold neon-text">File a Grievance</h1>
        <p className="text-gray-400 mt-2">Use text, voice, or image. AI will handle the rest.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        
        <div className="flex justify-end">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-darker/80 text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="en-US">English</option>
            <option value="kn-IN">Kannada</option>
            <option value="hi-IN">Hindi</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Describe the Issue</label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="E.g. There is a huge pothole near the main road..."
              className="w-full glass-input min-h-[120px] resize-none pr-12"
            ></textarea>
            
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={startRecording}
              className={`absolute bottom-4 right-4 p-3 rounded-full transition-all shadow-lg ${
                isRecording 
                  ? 'bg-red-500 animate-pulse shadow-red-500/50' 
                  : 'bg-primary/20 text-primary hover:bg-primary/40'
              }`}
            >
              <Mic size={20} className={isRecording ? "text-white" : ""} />
            </button>
            {isRecording && (
              <div className="absolute bottom-6 right-16 flex items-center space-x-1">
                <div className="w-1 h-3 bg-red-500 animate-pulse rounded-full"></div>
                <div className="w-1 h-4 bg-red-500 animate-pulse rounded-full" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-2 bg-red-500 animate-pulse rounded-full" style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Attach Evidence (AI Vision)</label>
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors hover:bg-white/5"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="text-primary" size={32} />
              </div>
              <p className="text-gray-300 font-medium">Click to upload image</p>
              <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden h-64 border border-white/10 group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => { setImage(null); setPreview(''); }} className="p-3 bg-red-500/80 rounded-full text-white hover:bg-red-600">
                  <X size={24} />
                </button>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (!text && !image)}
          className="w-full py-4 bg-gradient-to-r from-primary to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-bold text-white flex justify-center items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
        >
          {isSubmitting ? (
             <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
             <>
               <span>Submit for AI Processing</span>
               <Send size={18} />
             </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default NewComplaint;
