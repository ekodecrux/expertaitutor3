import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";
import {
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  Heart,
  ThumbsUp,
  Lightbulb,
} from "lucide-react";
import { useState, useEffect } from "react";

interface AIAvatarProps {
  message?: string;
  emotion?: "neutral" | "happy" | "thinking" | "encouraging" | "celebrating";
  speaking?: boolean;
  showControls?: boolean;
  size?: "small" | "medium" | "large";
  onSpeak?: (text: string) => void;
}

export default function AIAvatar({
  message,
  emotion = "neutral",
  speaking = false,
  showControls = true,
  size = "medium",
  onSpeak,
}: AIAvatarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (speaking) {
      setIsAnimating(true);
      // Auto-speak if enabled and not muted
      if (!isMuted && message && onSpeak) {
        onSpeak(message);
      }
    } else {
      setIsAnimating(false);
    }
  }, [speaking, message, isMuted, onSpeak]);

  const sizeClasses = {
    small: "w-24 h-24",
    medium: "w-32 h-32",
    large: "w-48 h-48",
  };

  const getAvatarEmoji = () => {
    switch (emotion) {
      case "happy":
        return "😊";
      case "thinking":
        return "🤔";
      case "encouraging":
        return "💪";
      case "celebrating":
        return "🎉";
      default:
        return "🎓";
    }
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case "happy":
        return "from-yellow-400 to-orange-500";
      case "thinking":
        return "from-blue-400 to-indigo-500";
      case "encouraging":
        return "from-green-400 to-emerald-500";
      case "celebrating":
        return "from-pink-400 to-purple-500";
      default:
        return "from-indigo-400 to-purple-500";
    }
  };

  const getEmotionBadge = () => {
    switch (emotion) {
      case "happy":
        return { icon: Heart, label: "Happy to help!", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
      case "thinking":
        return { icon: Lightbulb, label: "Let me think...", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
      case "encouraging":
        return { icon: ThumbsUp, label: "You can do it!", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
      case "celebrating":
        return { icon: Sparkles, label: "Amazing work!", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" };
      default:
        return { icon: Sparkles, label: "Ready to learn", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" };
    }
  };

  const emotionBadge = getEmotionBadge();
  const EmotionIcon = emotionBadge.icon;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Circle */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getEmotionColor()} flex items-center justify-center text-6xl ${
            isAnimating ? "animate-pulse" : ""
          } shadow-2xl relative overflow-hidden`}
        >
          {/* Ripple effect when speaking */}
          {isAnimating && (
            <>
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>
            </>
          )}
          
          {/* Avatar Emoji */}
          <span className="relative z-10 drop-shadow-lg">{getAvatarEmoji()}</span>
        </div>

        {/* Speaking indicator */}
        {isAnimating && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Emotion Badge */}
      <Badge className={`${emotionBadge.color} flex items-center gap-1`}>
        <EmotionIcon className="h-3 w-3" />
        {emotionBadge.label}
      </Badge>

      {/* Message Bubble */}
      {message && (
        <Card className="max-w-md p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="text-sm text-gray-800 dark:text-gray-200">
            <Streamdown>{message}</Streamdown>
          </div>
        </Card>
      )}

      {/* Controls */}
      {showControls && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                Unmute
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Mute
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      )}
    </div>
  );
}
