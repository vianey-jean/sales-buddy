import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import type { CallStatus, CallType } from './useWebRTC';

interface CallOverlayProps {
  callStatus: CallStatus;
  callType: CallType;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  incomingCall: { from: string; type: CallType } | null;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const CallOverlay: React.FC<CallOverlayProps> = ({
  callStatus,
  callType,
  isMuted,
  isVideoOff,
  callDuration,
  incomingCall,
  localVideoRef,
  remoteVideoRef,
  remoteAudioRef,
  callerName,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleVideo,
}) => {
  if (callStatus === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md rounded-3xl overflow-hidden"
      >
        {/* Hidden audio element - always present for audio playback */}
        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

        {/* Video area */}
        {callType === 'video' && callStatus === 'connected' ? (
          <div className="flex-1 relative">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Local video PiP */}
            <div className="absolute top-3 right-3 w-24 h-32 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            {/* Duration on video */}
            <div className="absolute top-3 left-3 bg-black/50 rounded-lg px-3 py-1">
              <span className="text-emerald-400 text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>
        ) : (
          /* Audio call / calling / ringing UI */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* Avatar */}
            <motion.div
              animate={callStatus === 'ringing' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 border-2 border-white/10 flex items-center justify-center"
            >
              <span className="text-3xl font-bold text-white">
                {callerName.charAt(0).toUpperCase()}
              </span>
            </motion.div>
            <div className="text-white font-semibold text-lg">{callerName}</div>

            {callStatus === 'calling' && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-purple-300/70 text-sm"
              >
                Appel en cours...
              </motion.div>
            )}

            {callStatus === 'ringing' && incomingCall && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-emerald-300/70 text-sm"
              >
                {incomingCall.type === 'video' ? '📹 Appel vidéo entrant...' : '📞 Appel audio entrant...'}
              </motion.div>
            )}

            {callStatus === 'connected' && (
              <div className="text-emerald-400 text-sm font-mono">
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="p-6 flex items-center justify-center gap-4">
          {callStatus === 'ringing' && incomingCall ? (
            /* Incoming call: accept / reject */
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-colors"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                onClick={onAccept}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-colors"
              >
                {incomingCall.type === 'video' ? <Video className="h-6 w-6 text-white" /> : <Phone className="h-6 w-6 text-white" />}
              </motion.button>
            </>
          ) : (
            /* Active call / calling: mute, video toggle, hang up */
            <>
              <button
                onClick={onToggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {isMuted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={onToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5 text-white" /> : <Video className="h-5 w-5 text-white" />}
                </button>
              )}

              <button
                onClick={() => onEnd()}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-colors"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallOverlay;
