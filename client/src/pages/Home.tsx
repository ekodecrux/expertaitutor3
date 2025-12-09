import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  BookOpen,
  Brain,
  GraduationCap,
  LineChart,
  MessageSquare,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Brain,
      title: "AI Conversational Tutor",
      description: "Get personalized, step-by-step explanations from an AI tutor that adapts to your learning style",
    },
    {
      icon: Target,
      title: "Adaptive Learning Engine",
      description: "Intelligent system that tracks your progress and adjusts difficulty based on your performance",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Assessments",
      description: "Practice with multiple question formats, mock exams, and AI-powered subjective scoring",
    },
    {
      icon: LineChart,
      title: "Progress Analytics",
      description: "Detailed insights into your strengths, weaknesses, and learning patterns",
    },
    {
      icon: MessageSquare,
      title: "Instant Doubt Solving",
      description: "Upload questions via text or image and get AI-generated solutions with alternative methods",
    },
    {
      icon: Award,
      title: "Gamification & Rewards",
      description: "Earn points, badges, and maintain streaks to stay motivated in your learning journey",
    },
  ];

  const roles = [
    {
      title: "Students",
      description: "Personalized learning paths, AI tutoring, and comprehensive practice tests",
      icon: GraduationCap,
      color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Parents",
      description: "Monitor progress, track learning time, and receive alerts on performance",
      icon: Users,
      color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Teachers",
      description: "Assign tests, track class performance, and identify at-risk students",
      icon: BookOpen,
      color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    },
    {
      title: "Institutions",
      description: "Manage cohorts, analyze performance, and customize branding",
      icon: Sparkles,
      color: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400",
    },
  ];

  const curricula = [
    "CBSE", "ICSE", "IB", "A-Levels", "AP", "SAT", "GRE", "GMAT", "JEE", "NEET"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Adaptive Learning Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Personal AI Tutor for Academic Excellence
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Personalized learning paths, instant doubt solving, and comprehensive assessments across multiple curricula
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  {user?.role === 'student' && (
                    <Link href="/dashboard">
                      <Button size="lg" variant="secondary" className="text-lg px-8">
                        Go to Dashboard
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'parent' && (
                    <Link href="/parent">
                      <Button size="lg" variant="secondary" className="text-lg px-8">
                        Parent Dashboard
                      </Button>
                    </Link>
                  )}
                  {(user?.role === 'admin' || user?.role === 'institution_admin') && (
                    <Link href="/admin">
                      <Button size="lg" variant="secondary" className="text-lg px-8">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button size="lg" variant="secondary" className="text-lg px-8">
                      Get Started Free
                    </Button>
                  </a>
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20 border-white/30">
                    Watch Demo
                  </Button>
                </>
              )}
            </div>

            {/* Supported Curricula */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm font-medium mb-4 text-white/80">SUPPORTING MULTIPLE CURRICULA</p>
              <div className="flex flex-wrap justify-center gap-3">
                {curricula.map((curr) => (
                  <span
                    key={curr}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium"
                  >
                    {curr}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Effective Learning
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to excel in your academic journey, powered by advanced AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Everyone in Education
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored experiences for students, parents, teachers, and institutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, idx) => (
              <Card key={idx} className="text-center card-hover">
                <CardHeader>
                  <div className={`h-16 w-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}>
                    <role.icon className="h-8 w-8" />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10+</div>
              <div className="text-white/80">Curricula Supported</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
              <div className="text-white/80">Practice Questions</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80">AI Tutor Availability</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
              <div className="text-white/80">Personalized Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container">
          <Card className="max-w-4xl mx-auto text-center p-8 md:p-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Ready to Transform Your Learning?
              </CardTitle>
              <CardDescription className="text-xl text-white/90">
                Join thousands of students achieving academic excellence with AI-powered personalized learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Start Learning for Free
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">AI Tutor Platform</h3>
            <p className="mb-6">Empowering learners worldwide with AI-driven education</p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-sm">© 2024 AI Tutor Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
