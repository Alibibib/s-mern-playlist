'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '@/lib/store/use-player-store';
import { Button } from '@/components/ui/button';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2
} from 'lucide-react';

export function AudioPlayer() {
    const {
        currentSong,
        isPlaying,
        volume,
        isExpanded,
        togglePlay,
        playNext,
        playPrevious,
        setVolume,
        toggleExpanded
    } = usePlayerStore();

    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback error:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentSong, isPlaying]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleEnded = () => {
        playNext();
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isExpanded ? 'h-full bg-black/90 backdrop-blur-3xl' : 'h-24'}`}>
            <div className={`h-full glass-panel border-t border-white/10 ${isExpanded ? 'flex flex-col justify-center p-8' : 'px-4'}`}>
                <audio
                    ref={audioRef}
                    src={`http://localhost:4000/api/upload/stream/${currentSong.fileId}`}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                />

                {/* Minimized View Layout */}
                <div className={`flex items-center justify-between h-full max-w-7xl mx-auto w-full ${isExpanded ? 'hidden' : 'flex'}`}>
                    {/* Song Info */}
                    <div className="flex items-center gap-4 w-1/4">
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-white font-bold text-lg">♫</span>
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
                            <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
                        <div className="flex items-center gap-6">
                            <button onClick={playPrevious} className="text-gray-400 hover:text-white transition-colors">
                                <SkipBack size={20} />
                            </button>
                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg hover:shadow-white/20"
                            >
                                {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                            </button>
                            <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
                                <SkipForward size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full text-xs text-gray-400 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                            />
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Volume & Expand */}
                    <div className="flex items-center justify-end gap-4 w-1/4">
                        <div className="flex items-center gap-2 group">
                            {volume === 0 ? <VolumeX size={18} className="text-gray-400" /> : <Volume2 size={18} className="text-gray-400 group-hover:text-white transition-colors" />}
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white opacity-0 group-hover:opacity-100 transition-all"
                            />
                        </div>
                        <button onClick={toggleExpanded} className="text-gray-400 hover:text-white transition-colors">
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Expanded View Content (Placeholder for now) */}
                {isExpanded && (
                    <div className="flex flex-col items-center justify-center h-full gap-8">
                        <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_100px_rgba(124,58,237,0.3)]">
                            <span className="text-white text-6xl">♫</span>
                        </div>
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">{currentSong.title}</h2>
                            <p className="text-xl text-gray-400">{currentSong.artist}</p>
                        </div>

                        <div className="w-full max-w-2xl flex flex-col gap-6">
                            {/* Expanded Controls reuse logic here or create shared components */}
                            <div className="flex items-center justify-center gap-12">
                                <button onClick={playPrevious} className="text-gray-300 hover:text-white"><SkipBack size={32} /></button>
                                <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                                    {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
                                </button>
                                <button onClick={playNext} className="text-gray-300 hover:text-white"><SkipForward size={32} /></button>
                            </div>

                            <div className="w-full flex items-center gap-4">
                                <span className="text-sm font-mono text-gray-400">{formatTime(currentTime)}</span>
                                <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-violet-500" />
                                <span className="text-sm font-mono text-gray-400">{formatTime(duration)}</span>
                            </div>

                            <button onClick={toggleExpanded} className="absolute top-8 right-8 text-white/50 hover:text-white">
                                <Minimize2 size={32} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
