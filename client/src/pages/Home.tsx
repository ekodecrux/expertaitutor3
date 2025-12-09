import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import {
  BookOpen,
  Brain,
  Target,
  Award,
  Video,
  MessageSquare,
  TrendingUp,
  Users,
  GraduationCap,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const curricula = ["CBSE", "ICSE", "IB", "A-Levels", "AP", "SAT", "GRE", "GMAT", "JEE", "NEET"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">AI-Powered Adaptive Learning Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Myschool-HCL Jigsaw
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Personalized learning paths, instant doubt solving, and comprehensive assessments across multiple curricula
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={getLoginUrl()}>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Student Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">AI Tutor</CardTitle>
              <CardDescription className="text-white/80">
                Get instant help with step-by-step explanations powered by advanced AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Adaptive Learning</CardTitle>
              <CardDescription className="text-white/80">
                Personalized study plans that adapt to your learning pace and style
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Comprehensive Courses</CardTitle>
              <CardDescription className="text-white/80">
                Access courses across 10+ curricula with expert instructors
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Video Lessons</CardTitle>
              <CardDescription className="text-white/80">
                Learn through interactive video lessons with progress tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Instant Doubts</CardTitle>
              <CardDescription className="text-white/80">
                Ask questions anytime and get AI-powered solutions instantly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Gamification</CardTitle>
              <CardDescription className="text-white/80">
                Earn points, unlock badges, and compete on leaderboards
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Supported Curricula */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            SUPPORTING MULTIPLE CURRICULA
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {curricula.map((curriculum) => (
              <div
                key={curriculum}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium"
              >
                {curriculum}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">10,000+</div>
            <div className="text-white/80 text-lg">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">500+</div>
            <div className="text-white/80 text-lg">Expert Teachers</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">95%</div>
            <div className="text-white/80 text-lg">Success Rate</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl text-white mb-4">
                Ready to Transform Your Learning?
              </CardTitle>
              <CardDescription className="text-white/80 text-lg mb-6">
                Join thousands of students achieving academic excellence with Myschool-HCL Jigsaw
              </CardDescription>
              <Link href={getLoginUrl()}>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Start Learning Today
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
