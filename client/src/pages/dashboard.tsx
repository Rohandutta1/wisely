import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChartLine, Trophy, Flame, Star, Clock, Battery, Zap, Target } from "lucide-react";

interface Test {
  id: number;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTime, setSelectedTime] = useState(0);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: testHistory = [] } = useQuery<Test[]>({
    queryKey: ["/api/tests/history"],
    enabled: isAuthenticated,
    retry: false,
  });

  const stats = {
    testsCompleted: testHistory.length,
    averageScore: testHistory.length > 0 
      ? Math.round(testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length)
      : 0,
    streakDays: 7, // Placeholder
    level: testHistory.length < 5 ? "Beginner" : testHistory.length < 15 ? "Intermediate" : "Advanced"
  };

  const startTest = async () => {
    if (!selectedDifficulty || !selectedTime) {
      toast({
        title: "Missing Selection",
        description: "Please select both difficulty level and test duration.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Store test configuration in sessionStorage for the test page
      sessionStorage.setItem('testConfig', JSON.stringify({
        difficulty: selectedDifficulty,
        duration: selectedTime
      }));
      
      setLocation("/test");
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start test. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Student'}! 👋
            </h2>
            <p className="text-gray-600">Ready to improve your English skills today?</p>
          </div>

          {/* Progress Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartLine className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.testsCompleted}</h3>
                <p className="text-gray-600">Tests Completed</p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.averageScore}%</h3>
                <p className="text-gray-600">Average Score</p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.streakDays}</h3>
                <p className="text-gray-600">Day Streak</p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.level}</h3>
                <p className="text-gray-600">Current Level</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Selection */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800 text-center">Choose Your Test 📚</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Difficulty Selection */}
              <div>
                <h4 className="text-xl font-semibold text-gray-700 mb-4">Select Difficulty Level:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { level: "beginner", icon: "🌱", title: "Beginner", desc: "Basic grammar & vocabulary" },
                    { level: "intermediate", icon: "🔥", title: "Intermediate", desc: "Complex sentences & comprehension" },
                    { level: "advanced", icon: "🚀", title: "Advanced", desc: "Professional & academic English" }
                  ].map(({ level, icon, title, desc }) => (
                    <Button
                      key={level}
                      variant={selectedDifficulty === level ? "default" : "outline"}
                      className={`p-6 h-auto flex flex-col space-y-2 ${
                        selectedDifficulty === level ? "bg-primary text-white" : ""
                      }`}
                      onClick={() => setSelectedDifficulty(level)}
                    >
                      <div className="text-3xl">{icon}</div>
                      <h5 className="font-semibold">{title}</h5>
                      <p className="text-sm opacity-80">{desc}</p>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <h4 className="text-xl font-semibold text-gray-700 mb-4">Select Test Duration:</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { time: 10, icon: Zap, label: "10 min" },
                    { time: 30, icon: Battery, label: "30 min" },
                    { time: 40, icon: Clock, label: "40 min" },
                    { time: 60, icon: Target, label: "1 hour" }
                  ].map(({ time, icon: Icon, label }) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className={`p-4 h-auto flex flex-col space-y-1 ${
                        selectedTime === time ? "bg-accent text-white" : ""
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      <Icon size={24} />
                      <span className="font-semibold">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={startTest}
                  disabled={!selectedDifficulty || !selectedTime}
                  size="lg"
                  className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white text-lg font-semibold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  Generate AI Test 🤖
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card 
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white card-hover cursor-pointer"
              onClick={() => setLocation("/history")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Test History</h4>
                    <p className="opacity-90">View your past results</p>
                  </div>
                  <ChartLine size={48} className="opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-br from-green-500 to-teal-600 text-white card-hover cursor-pointer"
              onClick={() => setLocation("/colleges")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Find Colleges</h4>
                    <p className="opacity-90">Discover your dream college</p>
                  </div>
                  <div className="text-5xl opacity-80">🎓</div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-br from-orange-500 to-red-500 text-white card-hover cursor-pointer"
              onClick={() => setLocation("/teachers")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Book Teacher</h4>
                    <p className="opacity-90">Get personalized help</p>
                  </div>
                  <div className="text-5xl opacity-80">👨‍🏫</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
