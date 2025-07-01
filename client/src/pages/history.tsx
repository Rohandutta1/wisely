import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, TrendingUp, Target, Trophy, Clock } from "lucide-react";

interface Test {
  id: number;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}

export default function History() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  const { data: tests = [], isLoading: isLoadingTests } = useQuery<Test[]>({
    queryKey: ["/api/tests/history"],
    enabled: isAuthenticated,
    retry: false,
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600";
    if (score >= 80) return "from-blue-500 to-cyan-600";
    if (score >= 70) return "from-yellow-500 to-orange-500";
    if (score >= 60) return "from-orange-500 to-red-500";
    return "from-red-500 to-pink-500";
  };

  const stats = {
    totalTests: tests.length,
    averageScore: tests.length > 0 
      ? Math.round(tests.reduce((sum, test) => sum + test.score, 0) / tests.length)
      : 0,
    bestScore: tests.length > 0 
      ? Math.max(...tests.map(test => test.score))
      : 0,
    totalTime: tests.reduce((sum, test) => sum + test.timeSpent, 0)
  };

  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading || isLoadingTests) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Test History 📊</h2>
            <p className="text-gray-600">Track your progress over time</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="text-2xl font-bold text-primary">{stats.totalTests}</h3>
                <p className="text-gray-600">Total Tests</p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-2xl font-bold text-success">{stats.averageScore}%</h3>
                <p className="text-gray-600">Average Score</p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-2xl font-bold text-accent">{stats.bestScore}%</h3>
                <p className="text-gray-600">Best Score</p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="text-2xl font-bold text-purple-600">{formatTotalTime(stats.totalTime)}</h3>
                <p className="text-gray-600">Total Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Test History List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Recent Tests</CardTitle>
            </CardHeader>
            <CardContent>
              {tests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No tests taken yet</h3>
                  <p className="text-gray-500 mb-6">Take your first English test to see your history here!</p>
                  <Button onClick={() => setLocation("/")} className="px-6 py-3">
                    Take Your First Test
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tests.map((test) => (
                    <div key={test.id} className="p-6 hover:bg-gray-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getScoreColor(test.score)} rounded-full flex items-center justify-center text-white font-bold`}>
                            {test.score}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)} English Test
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatTime(test.timeSpent)} • {test.totalQuestions} questions
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(test.completedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">{test.score}%</div>
                          <div className="text-sm text-gray-600">
                            {test.correctAnswers}/{test.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button 
              onClick={() => setLocation("/")}
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-2xl transform hover:scale-105 transition-all"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
