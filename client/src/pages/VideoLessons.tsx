import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Play,
  Clock,
  CheckCircle2,
  Video,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

export default function VideoLessons() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const mockVideos = [
    {
      id: 1,
      title: "Introduction to Quadratic Equations",
      subject: "Mathematics",
      topic: "Algebra",
      duration: 1200, // seconds
      thumbnail: "🎓",
      instructor: "Dr. Sharma",
      watched: 0,
      totalDuration: 1200,
    },
    {
      id: 2,
      title: "Newton's Laws of Motion",
      subject: "Physics",
      topic: "Mechanics",
      duration: 1800,
      thumbnail: "⚛️",
      instructor: "Prof. Kumar",
      watched: 900,
      totalDuration: 1800,
    },
    {
      id: 3,
      title: "Organic Reactions - Part 1",
      subject: "Chemistry",
      topic: "Organic Chemistry",
      duration: 1500,
      thumbnail: "🧪",
      instructor: "Dr. Patel",
      watched: 1500,
      totalDuration: 1500,
    },
    {
      id: 4,
      title: "Trigonometric Ratios Explained",
      subject: "Mathematics",
      topic: "Trigonometry",
      duration: 1000,
      thumbnail: "📐",
      instructor: "Dr. Sharma",
      watched: 0,
      totalDuration: 1000,
    },
  ];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (watched: number, total: number) => {
    return Math.round((watched / total) * 100);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Video Lessons
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn through interactive video lessons
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVideos.map((video) => {
              const progress = getProgress(video.watched, video.totalDuration);
              return (
                <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-6xl">
                        {video.thumbnail}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    <CardDescription>
                      {video.subject} • {video.topic}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {video.instructor}
                      </span>
                    </div>

                    {progress > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <Button className="w-full">
                      {progress === 100 ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Watch Again
                        </>
                      ) : progress > 0 ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Continue
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Watching
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="inprogress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVideos.filter(v => v.watched > 0 && v.watched < v.totalDuration).map((video) => {
              const progress = getProgress(video.watched, video.totalDuration);
              return (
                <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <CardHeader>
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-6xl mb-3">
                      {video.thumbnail}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVideos.filter(v => v.watched === v.totalDuration).map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <CardHeader>
                  <div className="relative">
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-6xl mb-3">
                      {video.thumbnail}
                    </div>
                    <CheckCircle2 className="absolute top-2 right-2 h-8 w-8 text-green-500 bg-white rounded-full" />
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Again
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <div className="text-center">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video Player Placeholder</p>
                <p className="text-sm text-gray-400 mt-2">
                  In production, this would be a real video player
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedVideo?.instructor}</p>
                <p className="text-sm text-gray-500">
                  {selectedVideo?.subject} • {selectedVideo?.topic}
                </p>
              </div>
              <Badge>
                {selectedVideo && formatDuration(selectedVideo.duration)}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
