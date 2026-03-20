import { useRef, useState, useCallback, useEffect } from 'react';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

export type CallType = 'audio' | 'video';
export type CallDirection = 'outgoing' | 'incoming';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface CallInfo {
  callId: string;
  callType: CallType;
  callerType: 'visitor' | 'admin';
  callerId: string;
  callerName: string;
  receiverType: 'visitor' | 'admin';
  receiverId: string;
  receiverName: string;
}

interface UseWebRTCProps {
  myId: string;
  myName: string;
  myType: 'visitor' | 'admin';
  authHeaders?: Record<string, string>;
}

export function useWebRTC({ myId, myName, myType, authHeaders }: UseWebRTCProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDirection, setCallDirection] = useState<CallDirection | null>(null);
  const [callType, setCallType] = useState<CallType | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallInfo | null>(null);
  const [remoteCallerName, setRemoteCallerName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentCallIdRef = useRef<string | null>(null);
  const iceCandidateBufferRef = useRef<RTCIceCandidateInit[]>([]);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStateRef = useRef<CallState>('idle');

  useEffect(() => { callStateRef.current = callState; }, [callState]);

  const sendSignal = useCallback(async (signal: any) => {
    try {
      await fetch(`${API_BASE}/api/messagerie/call-signal`, {
        method: 'POST',
        headers: authHeaders || { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal),
      });
    } catch (e) {
      console.error('Error sending signal:', e);
    }
  }, [authHeaders]);

  const startTimer = useCallback(() => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopTimer();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    iceCandidateBufferRef.current = [];
    currentCallIdRef.current = null;
    setCallState('idle');
    setCallDirection(null);
    setCallType(null);
    setIncomingCall(null);
    setRemoteCallerName('');
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
  }, [stopTimer]);

  const createPeerConnection = useCallback((callId: string, targetType: 'visitor' | 'admin', targetId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          callId,
          fromType: myType,
          fromId: myId,
          toType: targetType,
          toId: targetId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        if (callStateRef.current !== 'connected') {
          setCallState('connected');
          startTimer();
        }
      }
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        if (callStateRef.current === 'connected' || callStateRef.current === 'calling' || callStateRef.current === 'ringing') {
          endCall(callId, targetType, targetId);
        }
      }
    };

    return pc;
  }, [myType, myId, sendSignal, startTimer]);

  const startCall = useCallback(async (targetType: 'visitor' | 'admin', targetId: string, targetName: string, type: CallType) => {
    if (callStateRef.current !== 'idle') return;

    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    currentCallIdRef.current = callId;
    setCallType(type);
    setCallDirection('outgoing');
    setCallState('calling');
    setRemoteCallerName(targetName);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeerConnection(callId, targetType, targetId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignal({
        type: 'offer',
        callId,
        callType: type,
        fromType: myType,
        fromId: myId,
        fromName: myName,
        toType: targetType,
        toId: targetId,
        sdp: offer.sdp,
      });
    } catch (e) {
      console.error('Error starting call:', e);
      cleanup();
    }
  }, [myType, myId, myName, createPeerConnection, sendSignal, cleanup]);

  const answerCall = useCallback(async () => {
    if (!incomingCall) return;

    const { callId, callType: cType, callerType, callerId, callerName } = incomingCall;
    currentCallIdRef.current = callId;
    setCallType(cType);
    setCallDirection('incoming');
    setCallState('ringing');
    setRemoteCallerName(callerName);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: cType === 'video',
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeerConnection(callId, callerType, callerId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Set remote description from the offer stored in incomingCall
      const offerSdp = (incomingCall as any).sdp;
      if (offerSdp) {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerSdp }));
      }

      // Process buffered ICE candidates
      for (const candidate of iceCandidateBufferRef.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }
      iceCandidateBufferRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendSignal({
        type: 'answer',
        callId,
        fromType: myType,
        fromId: myId,
        toType: callerType,
        toId: callerId,
        sdp: answer.sdp,
      });

      setIncomingCall(null);
    } catch (e) {
      console.error('Error answering call:', e);
      cleanup();
    }
  }, [incomingCall, myType, myId, createPeerConnection, sendSignal, cleanup]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;
    await sendSignal({
      type: 'reject',
      callId: incomingCall.callId,
      fromType: myType,
      fromId: myId,
      toType: incomingCall.callerType,
      toId: incomingCall.callerId,
    });
    setIncomingCall(null);
    cleanup();
  }, [incomingCall, myType, myId, sendSignal, cleanup]);

  const endCall = useCallback(async (callId?: string, targetType?: string, targetId?: string) => {
    const cId = callId || currentCallIdRef.current;
    if (cId) {
      // Determine target from incomingCall or from args
      const tType = targetType || incomingCall?.callerType;
      const tId = targetId || incomingCall?.callerId;
      if (tType && tId) {
        sendSignal({
          type: 'hangup',
          callId: cId,
          fromType: myType,
          fromId: myId,
          toType: tType,
          toId: tId,
        });
      }
    }
    cleanup();
  }, [myType, myId, incomingCall, sendSignal, cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(prev => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsVideoOff(prev => !prev);
    }
  }, []);

  // Handle incoming signaling events
  const handleSignal = useCallback(async (signal: any) => {
    if (signal.type === 'offer') {
      // Incoming call
      const callInfo: CallInfo & { sdp: string } = {
        callId: signal.callId,
        callType: signal.callType,
        callerType: signal.fromType,
        callerId: signal.fromId,
        callerName: signal.fromName,
        receiverType: myType,
        receiverId: myId,
        receiverName: myName,
        sdp: signal.sdp,
      };
      setIncomingCall(callInfo);
      setRemoteCallerName(signal.fromName);
    } else if (signal.type === 'answer') {
      const pc = pcRef.current;
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
        // Process buffered ICE candidates
        for (const candidate of iceCandidateBufferRef.current) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
        }
        iceCandidateBufferRef.current = [];
      }
    } else if (signal.type === 'ice-candidate') {
      const pc = pcRef.current;
      if (pc && pc.remoteDescription) {
        try { await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)); } catch {}
      } else {
        iceCandidateBufferRef.current.push(signal.candidate);
      }
    } else if (signal.type === 'hangup') {
      cleanup();
    } else if (signal.type === 'reject') {
      cleanup();
    }
  }, [myType, myId, myName, cleanup]);

  return {
    callState,
    callDirection,
    callType,
    incomingCall,
    remoteCallerName,
    isMuted,
    isVideoOff,
    callDuration,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    handleSignal,
    cleanup,
  };
}
