import 'webrtc-adapter';
import { useState, useRef, useCallback, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ]
};

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
export type CallType = 'audio' | 'video';

interface UseWebRTCProps {
  visitorId: string;
  adminId: string;
  from: 'visitor' | 'admin';
  eventSourceRef: React.RefObject<EventSource | null>;
  onIncomingCallMeta?: (payload: {
    visitorId: string;
    adminId: string;
    from: 'visitor' | 'admin';
    type: CallType;
  }) => void;
}

interface CallSignal {
  visitorId: string;
  adminId: string;
  from: 'visitor' | 'admin';
  type: string;
  data?: any;
}

export function useWebRTC({ visitorId, adminId, from, eventSourceRef, onIncomingCallMeta }: UseWebRTCProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType>('audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<{ from: string; type: CallType } | null>(null);
  const [activeVisitorId, setActiveVisitorId] = useState(visitorId);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringtoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const callStatusRef = useRef<CallStatus>('idle');
  const callTypeRef = useRef<CallType>('audio');
  const visitorIdRef = useRef(visitorId);
  const adminIdRef = useRef(adminId);
  const activeVisitorIdRef = useRef(visitorId);
  const activeAdminIdRef = useRef(adminId);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  useEffect(() => { visitorIdRef.current = visitorId; }, [visitorId]);
  useEffect(() => { adminIdRef.current = adminId; }, [adminId]);
  useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);
  useEffect(() => { callTypeRef.current = callType; }, [callType]);

  useEffect(() => {
    if (callStatusRef.current === 'idle') {
      activeVisitorIdRef.current = visitorId;
      setActiveVisitorId(visitorId);
    }
  }, [visitorId]);

  useEffect(() => {
    if (callStatusRef.current === 'idle') {
      activeAdminIdRef.current = adminId;
    }
  }, [adminId]);

  const playMediaElement = useCallback((element: HTMLMediaElement | null) => {
    if (!element) return;

    const tryPlay = () => {
      element.play().catch(() => {});
    };

    if (element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
      return;
    }

    element.onloadedmetadata = () => {
      tryPlay();
    };
  }, []);

  const attachStream = useCallback((stream: MediaStream) => {
    remoteStreamRef.current = stream;

    if (remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== stream) {
        remoteVideoRef.current.srcObject = stream;
      }
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      playMediaElement(remoteVideoRef.current);
    }

    if (remoteAudioRef.current) {
      if (remoteAudioRef.current.srcObject !== stream) {
        remoteAudioRef.current.srcObject = stream;
      }
      remoteAudioRef.current.autoplay = true;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1;
      playMediaElement(remoteAudioRef.current);
    }
  }, [playMediaElement]);

  const attachLocalPreview = useCallback((stream: MediaStream | null, type: CallType) => {
    if (!localVideoRef.current) return;

    if (type !== 'video' || !stream) {
      localVideoRef.current.srcObject = null;
      return;
    }

    localVideoRef.current.srcObject = stream;
    localVideoRef.current.muted = true;
    localVideoRef.current.autoplay = true;
    localVideoRef.current.playsInline = true;
    playMediaElement(localVideoRef.current);
  }, [playMediaElement]);

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const markConnected = useCallback(() => {
    if (ringtoneTimeoutRef.current) {
      clearTimeout(ringtoneTimeoutRef.current);
      ringtoneTimeoutRef.current = null;
    }

    if (callStatusRef.current !== 'connected') {
      setCallStatus('connected');
      startDurationTimer();
    }
  }, [startDurationTimer]);

  const sendSignal = useCallback(async (type: string, data?: any) => {
    const targetVisitorId = activeVisitorIdRef.current || visitorIdRef.current;
    const targetAdminId = activeAdminIdRef.current || adminIdRef.current;

    if (!targetVisitorId || !targetAdminId) return;

    try {
      await fetch(`${API_BASE}/api/messagerie/call-signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: targetVisitorId,
          adminId: targetAdminId,
          type,
          data,
          from,
        }),
      });
    } catch (e) {
      console.error('Error sending signal:', e);
    }
  }, [from]);

  const flushPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (!pc.remoteDescription || !pc.remoteDescription.type || pendingCandidatesRef.current.length === 0) {
      return;
    }

    const queued = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] Error adding queued ICE candidate:', err);
      }
    }
  }, []);

  const applyRemoteDescription = useCallback(async (
    pc: RTCPeerConnection,
    description?: RTCSessionDescriptionInit | null
  ) => {
    if (!description) return false;

    const nextDescription = new RTCSessionDescription(description);
    const currentDescription = pc.remoteDescription;

    if (
      currentDescription?.type === nextDescription.type &&
      currentDescription?.sdp === nextDescription.sdp
    ) {
      return false;
    }

    if (nextDescription.type === 'answer' && pc.signalingState !== 'have-local-offer') {
      if (pc.currentRemoteDescription?.type === 'answer') {
        return false;
      }
    }

    await pc.setRemoteDescription(nextDescription);
    await flushPendingCandidates(pc);
    return true;
  }, [flushPendingCandidates]);

  const ensureTransceivers = useCallback((pc: RTCPeerConnection, type: CallType) => {
    const transceivers = pc.getTransceivers();
    const hasAudio = transceivers.some((transceiver) => {
      return transceiver.sender.track?.kind === 'audio' || transceiver.receiver.track?.kind === 'audio';
    });
    const hasVideo = transceivers.some((transceiver) => {
      return transceiver.sender.track?.kind === 'video' || transceiver.receiver.track?.kind === 'video';
    });

    if (!hasAudio) {
      pc.addTransceiver('audio', { direction: 'sendrecv' });
    }

    if (type === 'video' && !hasVideo) {
      pc.addTransceiver('video', { direction: 'sendrecv' });
    }
  }, []);

  const addLocalTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    const existingTrackIds = new Set(
      pc.getSenders()
        .map((sender) => sender.track?.id)
        .filter((trackId): trackId is string => Boolean(trackId))
    );

    stream.getTracks().forEach((track) => {
      if (!existingTrackIds.has(track.id)) {
        pc.addTrack(track, stream);
      }
    });
  }, []);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];
    pendingOfferRef.current = null;

    attachLocalPreview(null, 'audio');
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (ringtoneTimeoutRef.current) {
      clearTimeout(ringtoneTimeoutRef.current);
      ringtoneTimeoutRef.current = null;
    }

    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    activeVisitorIdRef.current = visitorIdRef.current;
    activeAdminIdRef.current = adminIdRef.current;
    setActiveVisitorId(visitorIdRef.current);
  }, [attachLocalPreview]);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    attachStream(remoteStream);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      const incomingStream = event.streams?.[0];

      if (incomingStream) {
        attachStream(incomingStream);
        if (incomingStream.getTracks().some((track) => track.readyState === 'live')) {
          markConnected();
        }
        incomingStream.getTracks().forEach((track) => {
          track.onunmute = () => {
            attachStream(incomingStream);
            markConnected();
          };
        });
        return;
      }

      const stream = remoteStreamRef.current || new MediaStream();
      remoteStreamRef.current = stream;

      if (!stream.getTracks().some(track => track.id === event.track.id)) {
        stream.addTrack(event.track);
      }

      attachStream(stream);

      event.track.onunmute = () => {
        const currentStream = remoteStreamRef.current || stream;
        attachStream(currentStream);
        markConnected();
      };
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        markConnected();
      }

      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        setTimeout(() => {
          if (['failed', 'closed', 'disconnected'].includes(pc.connectionState) && callStatusRef.current !== 'idle') {
            sendSignal('call-ended');
            cleanup();
            setCallStatus('idle');
            setIncomingCall(null);
          }
        }, 3000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        markConnected();
      }

      if (['failed', 'closed', 'disconnected'].includes(pc.iceConnectionState)) {
        setTimeout(() => {
          if (['failed', 'closed', 'disconnected'].includes(pc.iceConnectionState) && callStatusRef.current !== 'idle') {
            sendSignal('call-ended');
            cleanup();
            setCallStatus('idle');
            setIncomingCall(null);
          }
        }, 3000);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [attachStream, cleanup, markConnected, sendSignal]);

  const getMediaStream = useCallback(async (type: CallType): Promise<MediaStream> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia non supporté sur ce navigateur');
    }

    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: { ideal: 1 },
      },
      video: type === 'video'
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 24, max: 30 },
            facingMode: 'user',
          }
        : false,
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (type === 'video') {
        console.warn('[WebRTC] Video failed, retrying with relaxed constraints:', error);
        return navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      }
      throw error;
    }
  }, []);

  const startCall = useCallback(async (type: CallType) => {
    const targetVisitorId = visitorIdRef.current;
    const targetAdminId = adminIdRef.current;

    if (!targetVisitorId || !targetAdminId) return;

    try {
      activeVisitorIdRef.current = targetVisitorId;
      activeAdminIdRef.current = targetAdminId;
      setActiveVisitorId(targetVisitorId);
      setCallType(type);
      callTypeRef.current = type;
      setIncomingCall(null);
      setCallStatus('calling');

      const stream = await getMediaStream(type);
      localStreamRef.current = stream;
      attachLocalPreview(stream, type);

      const pc = createPeerConnection();
      ensureTransceivers(pc, type);
      addLocalTracks(pc, stream);

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video',
      });
      await pc.setLocalDescription(offer);
      await sendSignal('call-offer', {
        sdp: pc.localDescription?.toJSON() ?? offer,
        callType: type,
      });

      ringtoneTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === 'calling') {
          sendSignal('call-ended');
          cleanup();
          setCallStatus('idle');
          setIncomingCall(null);
        }
      }, 30000);
    } catch (e) {
      console.error('[WebRTC] Error starting call:', e);
      cleanup();
      setCallStatus('idle');
      setIncomingCall(null);
    }
  }, [addLocalTracks, attachLocalPreview, cleanup, createPeerConnection, ensureTransceivers, getMediaStream, sendSignal]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      const type = callTypeRef.current || incomingCall.type;
      const stream = await getMediaStream(type);
      localStreamRef.current = stream;
      attachLocalPreview(stream, type);

      const pc = pcRef.current || createPeerConnection();
      ensureTransceivers(pc, type);

      if ((!pc.remoteDescription || !pc.remoteDescription.type) && pendingOfferRef.current) {
        await applyRemoteDescription(pc, pendingOfferRef.current);
      }

      addLocalTracks(pc, stream);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal('call-answer', {
        sdp: pc.localDescription?.toJSON() ?? answer,
        callType: type,
      });
      await flushPendingCandidates(pc);

      setIncomingCall(null);
      if (callStatusRef.current !== 'connected') {
        setCallStatus('calling');
      }
    } catch (e) {
      console.error('[WebRTC] Error accepting call:', e);
      sendSignal('call-ended');
      cleanup();
      setCallStatus('idle');
      setIncomingCall(null);
    }
  }, [addLocalTracks, applyRemoteDescription, attachLocalPreview, cleanup, createPeerConnection, ensureTransceivers, flushPendingCandidates, getMediaStream, incomingCall, sendSignal]);

  const rejectCall = useCallback(() => {
    setIncomingCall(null);
    sendSignal('call-rejected');
    cleanup();
    setCallStatus('idle');
  }, [cleanup, sendSignal]);

  const endCall = useCallback((notify = true) => {
    if (notify) {
      sendSignal('call-ended');
    }
    cleanup();
    setCallStatus('idle');
    setIncomingCall(null);
  }, [cleanup, sendSignal]);

  const toggleMute = useCallback(() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()?.[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  const toggleVideo = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()?.[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoOff(!videoTrack.enabled);
  }, []);

  useEffect(() => {
    let currentEs: EventSource | null = null;

    const isSignalForCurrentSession = (signal: CallSignal) => {
      if (signal.adminId !== adminIdRef.current) return false;

      if (from === 'visitor') {
        return signal.visitorId === visitorIdRef.current;
      }

      if (signal.type === 'call-offer') {
        return true;
      }

      const currentActiveVisitorId = activeVisitorIdRef.current || visitorIdRef.current;
      return signal.visitorId === currentActiveVisitorId;
    };

      const handler = async (e: MessageEvent) => {
        try {
          const signal: CallSignal = JSON.parse(e.data);
          if (signal.from === from) return;
          if (!isSignalForCurrentSession(signal)) return;

          switch (signal.type) {
            case 'call-offer': {
              if (callStatusRef.current !== 'idle' && activeVisitorIdRef.current && activeVisitorIdRef.current !== signal.visitorId) {
                return;
              }

              activeVisitorIdRef.current = signal.visitorId;
              activeAdminIdRef.current = signal.adminId;
              setActiveVisitorId(signal.visitorId);
              pendingOfferRef.current = signal.data?.sdp || null;
              setCallType(signal.data?.callType || 'audio');
              callTypeRef.current = signal.data?.callType || 'audio';
              setIncomingCall({ from: signal.from, type: signal.data?.callType || 'audio' });
              setCallStatus('ringing');
              onIncomingCallMeta?.({
                visitorId: signal.visitorId,
                adminId: signal.adminId,
                from: signal.from,
                type: signal.data?.callType || 'audio'
              });

              const pc = createPeerConnection();
              ensureTransceivers(pc, signal.data?.callType || 'audio');
              if (pendingOfferRef.current) {
                await applyRemoteDescription(pc, pendingOfferRef.current);
              }
              break;
            }

            case 'call-answer': {
              const pc = pcRef.current;
              if (!pc || !signal.data?.sdp) break;

              if (ringtoneTimeoutRef.current) {
                clearTimeout(ringtoneTimeoutRef.current);
                ringtoneTimeoutRef.current = null;
              }

              await applyRemoteDescription(pc, signal.data.sdp);
              setCallType(signal.data?.callType || callTypeRef.current);
              markConnected();
              break;
            }

            case 'ice-candidate': {
              if (!signal.data) break;

              const pc = pcRef.current;
              if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
                pendingCandidatesRef.current.push(signal.data);
                break;
              }

              try {
                await pc.addIceCandidate(new RTCIceCandidate(signal.data));
              } catch (err) {
                console.warn('[WebRTC] Error adding ICE candidate:', err);
              }
              break;
            }

            case 'call-ended':
            case 'call-rejected': {
              cleanup();
              setCallStatus('idle');
              setIncomingCall(null);
              break;
            }
          }
        } catch (err) {
          console.error('[WebRTC] Error handling call signal:', err);
        }
      };

    const checkAndAttach = () => {
      const es = eventSourceRef.current;
      if (es && es !== currentEs) {
        if (currentEs) {
          currentEs.removeEventListener('call_signal', handler as EventListener);
        }
        currentEs = es;
        es.addEventListener('call_signal', handler as EventListener);
      }
    };

    checkAndAttach();
    const pollInterval = setInterval(checkAndAttach, 500);

    return () => {
      clearInterval(pollInterval);
      if (currentEs) {
        currentEs.removeEventListener('call_signal', handler as EventListener);
      }
    };
  }, [createPeerConnection, cleanup, eventSourceRef, flushPendingCandidates, from, markConnected, onIncomingCallMeta]);

  useEffect(() => {
    return () => {
      if (callStatusRef.current !== 'idle') {
        sendSignal('call-ended');
      }
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    callStatus,
    callType,
    isMuted,
    isVideoOff,
    callDuration,
    incomingCall,
    activeVisitorId,
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
