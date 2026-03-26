import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityCheckPageProps {
  onVerified: () => void;
}

// ✅ 10 images
const images = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
];

// ⭐ Étoile
const Star = ({ type = "fixed" }: { type?: "fixed" | "moving" }) => {
  const isMoving = type === "moving";

  return (
    <svg width="50" height="50" viewBox="0 0 24 24">
      <path
        d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"
        fill={isMoving ? "#ff4d4d" : "#ffffff"}
        stroke={isMoving ? "#ff0000" : "#999999"}
        strokeWidth="2"
      />
    </svg>
  );
};

const SecurityCheckPage: React.FC<SecurityCheckPageProps> = ({ onVerified }) => {
  const [phase, setPhase] = useState<'checking' | 'challenge' | 'verifying' | 'passed' | 'failed'>('checking');

  const [image, setImage] = useState("");
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [slider, setSlider] = useState(0);

  const [verifiedPuzzle, setVerifiedPuzzle] = useState(false);
  const [checked, setChecked] = useState(false);

  const startTime = useRef(Date.now());
  const moveCount = useRef(0);
  const lastMoveTime = useRef(Date.now());

  // ✅ Générer un challenge
  const generateChallenge = () => {
    const img = images[Math.floor(Math.random() * images.length)];
    setImage(img + "?w=800&q=80");

    setTargetX(Math.floor(Math.random() * 220) + 20);
    setTargetY(Math.floor(Math.random() * 100) + 20);

    setSlider(0);
    setVerifiedPuzzle(false);
    setChecked(false);

    moveCount.current = 0;
    startTime.current = Date.now();
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('challenge'), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 🎯 Slider + détection comportement
  const handleSlider = (val: number) => {
    const now = Date.now();

    moveCount.current++;
    const delta = now - lastMoveTime.current;
    lastMoveTime.current = now;

    setSlider(val);

    // ❌ mouvement trop rapide (bot)
    if (delta < 5) {
      setVerifiedPuzzle(false);
      return;
    }

    if (Math.abs(val - targetX) < 8) {
      setVerifiedPuzzle(true);
    } else {
      setVerifiedPuzzle(false);
    }
  };

  // 🔐 Vérification sécurité
  const performSecurityCheck = useCallback(() => {
    const timeSpent = Date.now() - startTime.current;

    if (timeSpent < 1500) return false;
    if (!verifiedPuzzle) return false;
    if (!checked) return false;

    if (moveCount.current < 5) return false;

    if ((navigator as any).webdriver) return false;

    return true;
  }, [verifiedPuzzle, checked]);

  const handleVerify = () => {
    setPhase('verifying');

    setTimeout(() => {
      const isHuman = performSecurityCheck();

      if (isHuman) {
        setPhase('passed');

        sessionStorage.setItem('security_verified', JSON.stringify({
          verified: true,
          timestamp: Date.now(),
        }));

        setTimeout(() => onVerified(), 1200);
      } else {
        setPhase('failed');

        setTimeout(() => {
          generateChallenge();
          setPhase('challenge');
        }, 2500);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">

      {/* Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/20 blur-[140px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-3">
          <Shield className="h-6 w-6 text-white/80" />
          <div>
            <h1 className="text-sm font-semibold text-white">Vérification de sécurité</h1>
            <p className="text-xs text-white/50">Protection anti-bot</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">

            {phase === 'checking' && (
              <motion.div key="checking" className="text-center space-y-4">
                <Loader2 className="h-12 w-12 text-white animate-spin mx-auto" />
                <p className="text-white">Vérification de sécurité en cours…</p>
              </motion.div>
            )}

            {phase === 'challenge' && (
              <motion.div key="challenge" className="space-y-5">

                <p className="text-sm text-white/60 text-center">
                  Alignez l'étoile rouge avec l'étoile blanche
                </p>

                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                  <img src={image} className="w-full h-full object-cover" />

                  {/* ⭐ étoile fixe */}
                  <div style={{ left: targetX, top: targetY }} className="absolute">
                    <Star type="fixed" />
                  </div>

                  {/* 🔴 étoile mobile */}
                  <div style={{ left: slider, top: targetY }} className="absolute">
                    <Star type="moving" />
                  </div>

                  {verifiedPuzzle && (
                    <div
                      className="absolute w-14 h-14 bg-green-400/30 blur-xl rounded-full"
                      style={{ left: slider, top: targetY }}
                    />
                  )}
                </div>

                <input
                  type="range"
                  min={0}
                  max={260}
                  value={slider}
                  onChange={(e) => handleSlider(Number(e.target.value))}
                  className="w-full"
                />

                {/* ✅ CHECKBOX */}
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="w-5 h-5"
                  />
                  Je confirme que je suis un humain
                </label>

                <button
                  onClick={handleVerify}
                  disabled={!verifiedPuzzle || !checked}
                  className={`w-full flex items-center justify-center p-3 rounded-xl border transition-all
                      ${!verifiedPuzzle || !checked
                      ? "bg-white/5 border-white/20 opacity-40 cursor-not-allowed"
                      : "bg-green-500 border-green-400 hover:bg-green-600 text-white"
                    }`}
                >
                  Vérifier
                </button>

              </motion.div>
            )}

            {phase === 'verifying' && (
              <motion.div key="verifying" className="text-center space-y-4">
                <Loader2 className="h-14 w-14 text-white animate-spin mx-auto" />
                <p className="text-white">Vérification en cours…</p>
              </motion.div>
            )}

            {phase === 'passed' && (
              <motion.div key="passed" className="text-center space-y-4">
                <CheckCircle className="h-14 w-14 text-green-400 mx-auto" />
                <p className="text-white">Vérification réussie</p>
              </motion.div>
            )}

            {phase === 'failed' && (
              <motion.div key="failed" className="text-center space-y-4">
                <AlertTriangle className="h-14 w-14 text-red-400 mx-auto" />
                <p className="text-white">Vérification échouée</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 px-6 py-3">
          <p className="text-[10px] text-white/40 text-center">
            Protection par vérification de sécurité • Confidentialité respectée
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default SecurityCheckPage;