import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Clock,
  Search,
  Star,
  TrendingUp,
  Users,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: subjects } = trpc.curriculum.getSubjects.useQuery({
    curriculum: 'CBSE',
  });

  // Mock courses data - in real app, this would come from tRPC
  const mockCourses = [
    {
      id: 1,
      name: "Complete Mathematics for JEE",
      description: "Comprehensive mathematics course covering all JEE topics with practice problems",
      subject: "Mathematics",
      grade: "11-12",
      thumbnail: "🔢",
      instructor: "Dr. Sharma",
      duration: 120,
      difficulty: "Advanced",
      enrolled: 1250,
      rating: 4.8,
      progress: 0,
    },
    {
      id: 2,
      name: "Physics Fundamentals",
      description: "Master the fundamentals of physics with interactive lessons and experiments",
      subject: "Physics",
      grade: "10",
      thumbnail: "⚛️",
      instructor: "Prof. Kumar",
      duration: 80,
      difficulty: "Intermediate",
      enrolled: 980,
      rating: 4.7,
      progress: 0,
    },
    {
      id: 3,
      name: "Organic Chemistry Mastery",
      description: "Deep dive into organic chemistry with reaction mechanisms and synthesis",
      subject: "Chemistry",
      grade: "12",
      thumbnail: "🧪",
      instructor: "Dr. Patel",
      duration: 100,
      difficulty: "Advanced",
      enrolled: 750,
      rating: 4.9,
      progress: 0,
    },
    {
      id: 4,
      name: "English Literature & Grammar",
      description: "Improve your English skills with literature analysis and grammar practice",
      subject: "English",
      grade: "10",
      thumbnail: "📚",
      instructor: "Ms. Singh",
      duration: 60,
      difficulty: "Beginner",
      enrolled: 1500,
      rating: 4.6,
      progress: 0,
    },
  ];

  const enrolledCourses = mockCourses.filter(c => c.progress > 0);
  const availableCourses = mockCourses.filter(c => c.progress === 0);

  const filteredCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnroll = (courseId: number, courseName: string) => {
    toast.success(`Enrolled in ${courseName}!`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore and enroll in courses to enhance your learning
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">
            Enrolled ({enrolledCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses by name or subject..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{course.thumbnail}</div>
                    <Badge variant={
                      course.difficulty === 'Beginner' ? 'default' :
                      course.difficulty === 'Intermediate' ? 'secondary' :
                      'destructive'
                    }>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.subject}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}h</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {course.enrolled} enrolled
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Instructor:</span> {course.instructor}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleEnroll(course.id, course.name)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">
                No courses found matching your search
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{course.thumbnail}</div>
                      {course.progress === 100 && (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>{course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <Button className="w-full" variant="default">
                      <Play className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't enrolled in any courses yet
              </p>
              <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="all"]')?.click()}>
                Browse Courses
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
