import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, CosmicButton } from './CosmicUI';
import { ChevronLeft, MessageSquare, Mail, MapPin, Send, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      toast.success('Your cosmic message has been sent. Our astronomers will be in touch shortly.');
      setIsSending(false);
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <CosmicBackground className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <GlassCard className="p-8 sm:p-12 bg-black/60 border border-violet-500/30 backdrop-blur-xl" glow="purple">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Contact Us</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                  placeholder="name@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Your Cosmic Message</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-medium resize-none"
                  placeholder="How can we assist your journey?"
                  required
                />
              </div>
              <CosmicButton type="submit" className="w-full flex items-center justify-center gap-2" disabled={isSending}>
                {isSending ? (
                  <Zap className="w-5 h-5 animate-pulse text-violet-300" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </CosmicButton>
            </form>
          </GlassCard>

          <GlassCard className="p-8 sm:p-12 bg-black/40 border border-white/5 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-8">Direct Channels</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                <Mail className="w-6 h-6 text-violet-400 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white">Email Us</h3>
                  <p className="text-white/60">cosmic@astroai.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-500/20">
                <MapPin className="w-6 h-6 text-fuchsia-400 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white">总部 (Headquarters)</h3>
                  <p className="text-white/60">Celestial Way, Galaxy One,<br />Digital Universe 10101</p>
                </div>
              </div>
              <div className="p-6 text-center italic text-white/40 text-sm">
                "Wherever you are in the digital cosmos, we are just a message away."
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default ContactPage;
