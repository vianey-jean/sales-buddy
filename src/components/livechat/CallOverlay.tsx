import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
import type { CallState, CallType, CallDirection } from './useWebRTC';

interface CallOverlayProps {
  callState: CallState;
  callDirection: CallDirection | null;
  callType: CallType | null;
  remoteCallerName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  incomingCall: any;
  onAnswer: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const CallOverlay: React.FC<CallOverlayProps> = ({
  callState,
  callDirection,
  callType,
  remoteCallerName,
  isMuted,
  isVideoOff,
  callDuration,
  localVideoRef,
  remoteVideoRef,
  incomingCall,
  onAnswer,
  onReject,
  onEndCall,
  onToggleMute,
  onToggleVideo,
}) => {
  const isActive = callState !== 'idle';
  const isRinging = !!incomingCall && callState === 'idle';

  if (!isActive && !isRinging) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col"
      >
        {/* Incoming call screen */}
        {isRinging && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              {incomingCall.callType === 'video' ? (
                <Video className="h-9 w-9 text-white" />
              ) : (
                <Phone className="h-9 w-9 text-white" />
              )}
            </motion.div>

            <div className="text-center">
              <div className="text-white text-lg font-bold">{remoteCallerName}</div>
              <div className="text-emerald-300/70 text-sm mt-1">
                Appel {incomingCall.callType === 'video' ? 'vidéo' : 'audio'} entrant...
              </div>
            </div>

            <div className="flex items-center gap-8">
              <button
                onClick={onReject}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-transform active:scale-95"
              >
                <PhoneOff className="h-7 w-7 text-white" />
              </button>
              <button
                onClick={onAnswer}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform active:scale-95"
              >
                <Phone className="h-7 w-7 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Calling / Connected screen */}
        {isActive && (
          <div className="flex-1 flex flex-col">
            {/* Video area */}
            {callType === 'video' && callState === 'connected' ? (
              <div className="flex-1 relative bg-black">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 w-24 h-32 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-900">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <VideoOff className="h-6 w-6 text-white/40" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                {/* Hidden video elements for audio calls */}
                <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />

                <motion.div
                  animate={callState === 'calling' ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    callState === 'connected'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                      : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_40px_rgba(139,92,246,0.3)]'
                  }`}
                >
                  {callType === 'video' ? (
                    <Video className="h-9 w-9 text-white" />
                  ) : (
                    <Phone className="h-9 w-9 text-white" />
                  )}
                </motion.div>

                <div className="text-center">
                  <div className="text-white text-lg font-bold">{remoteCallerName}</div>
                  <div className={`text-sm mt-1 ${callState === 'connected' ? 'text-emerald-300/70' : 'text-purple-300/70'}`}>
                    {callState === 'calling' && 'Appel en cours...'}
                    {callState === 'ringing' && 'Connexion...'}
                    {callState === 'connected' && formatDuration(callDuration)}
                  </div>
                </div>

                {callState === 'calling' && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex gap-2 mt-2"
                  >
                    <span className="w-2.5 h-2.5 bg-violet-400 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-violet-400 rounded-full" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2.5 h-2.5 bg-violet-400 rounded-full" style={{ animationDelay: '0.4s' }} />
                  </motion.div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="px-6 py-5 bg-slate-900/90 backdrop-blur flex items-center justify-center gap-5">
              <button
                onClick={onToggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                  isMuted ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/[0.08] border border-white/[0.1]'
                }`}
              >
                {isMuted ? <MicOff className="h-5 w-5 text-red-400" /> : <Mic className="h-5 w-5 text-white" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={onToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                    isVideoOff ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/[0.08] border border-white/[0.1]'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5 text-red-400" /> : <Video className="h-5 w-5 text-white" />}
                </button>
              )}

              <button
                onClick={() => onEndCall()}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-transform active:scale-95"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CallOverlay;
