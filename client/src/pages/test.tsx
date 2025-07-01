import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface TestConfig {
  difficulty: string;
  duration: number;
}

export default function Test() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

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

  // Load test configuration
  useEffect(() => {
    const config = sessionStorage.getItem('testConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      setTestConfig(parsedConfig);
      setTimeRemaining(parsedConfig.duration * 60); // Convert to seconds
    } else {
      // Redirect to dashboard if no test config
      setLocation("/");
    }
  }, [setLocation]);

  // Generate test questions
  const generateTestMutation = useMutation({
    mutationFn: async (config: TestConfig) => {
      const response = await apiRequest("POST", "/api/tests/generate", config);
      return await response.json();
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(-1));
      setIsLoadingQuestions(false);
    },
    onError: (error) => {
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
        description: "Failed to generate test questions. Please try again.",
        variant: "destructive",
      });
      setLocation("/");
    },
  });

  // Save test results
  const saveTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await apiRequest("POST", "/api/tests", testData);
      return await response.json();
    },
    onSuccess: (test) => {
      // Store test results for results page
      sessionStorage.setItem('testResults', JSON.stringify({
        ...test,
        questions,
        answers
      }));
      setLocation("/results");
    },
    onError: (error) => {
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
        description: "Failed to save test results.",
        variant: "destructive",
      });
    },
  });

  // Generate questions when config is loaded
  useEffect(() => {
    if (testConfig && !questions.length) {
      generateTestMutation.mutate(testConfig);
    }
  }, [testConfig]);

  // Timer
  useEffect(() => {
    if (timeRemaining > 0 && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, questions.length]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitTest = useCallback(() => {
    if (!testConfig || !questions.length) return;

    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer === questions[index]?.correct ? count + 1 : count;
    }, 0);

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = (testConfig.duration * 60) - timeRemaining;

    const testData = {
      difficulty: testConfig.difficulty,
      duration: testConfig.duration,
      questions,
      answers,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent
    };

    saveTestMutation.mutate(testData);
  }, [testConfig, questions, answers, timeRemaining, saveTestMutation]);

  if (isLoading || isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {isLoadingQuestions ? "Generating your personalized test..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-lg text-gray-600">No test questions available.</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Test Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    English Test - <span className="text-primary">
                      {testConfig?.difficulty.charAt(0).toUpperCase() + testConfig?.difficulty.slice(1)}
                    </span>
                  </h2>
                  <p className="text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary timer-pulse">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-sm text-gray-600">Time Remaining</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Progress value={progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {currentQuestion.question}
                </h3>
              </div>

              <RadioGroup 
                value={answers[currentQuestionIndex]?.toString() || ""} 
                onValueChange={handleAnswerChange}
                className="space-y-4"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index}>
                    <Label 
                      htmlFor={`option-${index}`}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <RadioGroupItem 
                        value={index.toString()} 
                        id={`option-${index}`}
                        className="mr-4"
                      />
                      <span className="text-lg">{option}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3"
            >
              <ArrowLeft className="mr-2" size={16} />
              Previous
            </Button>
            
            <div className="flex space-x-4">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-primary"
                >
                  Next
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              ) : (
                <Button
                  onClick={submitTest}
                  disabled={saveTestMutation.isPending}
                  className="px-6 py-3 bg-success"
                >
                  <Check className="mr-2" size={16} />
                  Submit Test
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
