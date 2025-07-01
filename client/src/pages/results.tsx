import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trophy, CheckCircle, XCircle, RotateCcw, History, Home } from "lucide-react";

interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface TestResults {
  id: number;
  difficulty: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  questions: TestQuestion[];
  answers: number[];
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<TestResults | null>(null);

  useEffect(() => {
    const savedResults = sessionStorage.getItem('testResults');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    } else {
      // Redirect to dashboard if no results
      setLocation("/");
    }
  }, [setLocation]);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent Performance!", color: "text-green-600" };
    if (score >= 80) return { level: "Great Job!", color: "text-blue-600" };
    if (score >= 70) return { level: "Good Work!", color: "text-yellow-600" };
    if (score >= 60) return { level: "Keep Practicing!", color: "text-orange-600" };
    return { level: "Need More Practice", color: "text-red-600" };
  };

  const performance = getPerformanceLevel(results.score);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-success to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 bounce-slow">
              <Trophy className="text-white text-4xl" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Test Completed! 🎉</h2>
            <p className="text-gray-600 text-lg">Here are your results</p>
          </div>

          {/* Score Overview */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold text-primary mb-2">{results.score}%</div>
                  <p className="text-gray-600">Your Score</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-2">
                    {results.correctAnswers}/{results.totalQuestions}
                  </div>
                  <p className="text-gray-600">Correct Answers</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">
                    {formatTime(results.timeSpent)}
                  </div>
                  <p className="text-gray-600">Time Taken</p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Badge variant="secondary" className={`text-lg px-6 py-3 ${performance.color}`}>
                  <Trophy className="mr-2" size={20} />
                  {performance.level}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.questions.map((question, index) => {
                  const userAnswer = results.answers[index];
                  const isCorrect = userAnswer === question.correct;
                  
                  return (
                    <div 
                      key={question.id}
                      className={`border-l-4 p-4 rounded-lg ${
                        isCorrect 
                          ? "border-success bg-green-50" 
                          : "border-error bg-red-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-2">
                            Question {index + 1}: {question.question}
                          </p>
                          
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className={`font-semibold ${isCorrect ? "text-success" : "text-error"}`}>
                                Your answer: {userAnswer >= 0 ? `${String.fromCharCode(65 + userAnswer)}) ${question.options[userAnswer]}` : "Not answered"}
                                {isCorrect ? " ✓" : " ✗"}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-success">
                                Correct answer: {String.fromCharCode(65 + question.correct)}) {question.options[question.correct]}
                              </p>
                            )}
                            {question.explanation && (
                              <p className="text-gray-600 mt-2">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {isCorrect ? (
                            <CheckCircle className="text-success text-2xl" />
                          ) : (
                            <XCircle className="text-error text-2xl" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-x-4">
            <Button 
              onClick={() => setLocation("/dashboard")}
              size="lg"
              className="px-8 py-4 bg-primary text-white rounded-2xl hover:bg-blue-600 transform hover:scale-105 transition-all"
            >
              <RotateCcw className="mr-2" size={20} />
              Take Another Test
            </Button>
            
            <Button 
              onClick={() => setLocation("/history")}
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-2xl transform hover:scale-105 transition-all"
            >
              <History className="mr-2" size={20} />
              View History
            </Button>
            
            <Button 
              onClick={() => setLocation("/")}
              variant="outline"
              size="lg"
              className="px-8 py-4 rounded-2xl transform hover:scale-105 transition-all"
            >
              <Home className="mr-2" size={20} />
              Dashboard
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
