import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import Layout from "@/components/layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download, Award, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock course data for demonstration
const MOCK_COURSES = {
  1: {
    id: 1,
    title: "Fall Protection Safety",
    description: "Learn essential techniques for fall prevention and protection on construction sites. This comprehensive course covers hazard identification, safety equipment use, and proper procedures for working at heights.",
    videoUrl: "https://player.vimeo.com/video/76979871", // placeholder video
    progress: 75,
    status: "in_progress",
    durationMinutes: 45,
    thumbnailUrl: "https://placehold.co/800x450/3982F7/FFF?text=Fall+Protection",
    objectives: [
      "Identify fall hazards in construction environments",
      "Understand OSHA requirements for fall protection",
      "Properly use and inspect personal fall arrest systems",
      "Implement administrative and engineering controls for fall prevention",
      "Develop and implement rescue procedures for fallen workers"
    ],
    instructor: "Michael Rodriguez",
    passingScore: 70,
    lastPosition: 450, // in seconds
    totalDuration: 2700, // 45 minutes in seconds
    questions: [
      {
        id: 1,
        question: "At what height is fall protection required on construction sites?",
        options: ["4 feet", "6 feet", "8 feet", "10 feet"],
        correctAnswer: 1 // 6 feet (index 1)
      },
      {
        id: 2,
        question: "Which of the following is NOT a component of a personal fall arrest system?",
        options: ["Anchor point", "Hard hat", "Body harness", "Connecting device"],
        correctAnswer: 1 // Hard hat (index 1)
      },
      {
        id: 3,
        question: "How often should fall protection equipment be inspected?",
        options: ["Only when first purchased", "Once a year", "Before each use", "After a fall occurs"],
        correctAnswer: 2 // Before each use (index 2)
      }
    ]
  },
  2: {
    id: 2,
    title: "Equipment Safety Basics",
    description: "Fundamentals of operating heavy machinery and equipment safely on job sites.",
    videoUrl: "https://player.vimeo.com/video/76979871", // placeholder video
    progress: 100,
    status: "completed",
    durationMinutes: 60,
    completionDate: "2025-04-15",
    thumbnailUrl: "https://placehold.co/800x450/4CAF50/FFF?text=Equipment+Safety"
  },
  3: {
    id: 3,
    title: "Confined Space Entry",
    description: "Safety procedures for working in confined spaces on construction sites.",
    videoUrl: "https://player.vimeo.com/video/76979871", // placeholder video
    progress: 30,
    status: "in_progress",
    durationMinutes: 55,
    thumbnailUrl: "https://placehold.co/800x450/FF9800/FFF?text=Confined+Space"
  }
};

export default function TrainingCourse() {
  const { id } = useParams();
  const courseId = parseInt(id || "1");
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState("video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Simulating data loading with react-query
  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/training/courses/${courseId}`],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_COURSES[courseId as keyof typeof MOCK_COURSES];
    }
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ courseId, progress, position }: { courseId: number, progress: number, position: number }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, progress, position };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/training/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
    }
  });

  // Complete course mutation
  const completeCourseAndQuizMutation = useMutation({
    mutationFn: async ({ courseId, answers }: { courseId: number, answers: number[] }) => {
      // Simulate API call to submit quiz and complete course
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Calculate score based on correct answers for this demo
      const course = MOCK_COURSES[courseId as keyof typeof MOCK_COURSES];
      if (!course.questions) return { success: false };
      
      const correctCount = course.questions.reduce((acc, q, idx) => {
        return acc + (q.correctAnswer === answers[idx] ? 1 : 0);
      }, 0);
      
      const score = Math.round((correctCount / course.questions.length) * 100);
      const passed = score >= (course.passingScore || 70);
      
      return { success: true, score, passed };
    },
    onSuccess: (data) => {
      if (data.passed) {
        setQuizPassed(true);
      }
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/training/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
    }
  });

  // Update current time periodically to simulate progress
  useEffect(() => {
    if (!course || !isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        
        // Update progress in the backend every 30 seconds
        if (newTime % 30 === 0) {
          const newProgress = Math.min(Math.round((newTime / course.totalDuration) * 100), 100);
          updateProgressMutation.mutate({ courseId, progress: newProgress, position: newTime });
        }
        
        // Show quiz when completed
        if (newTime >= course.totalDuration && course.status !== "completed") {
          setIsPlaying(false);
          setShowQuiz(true);
        }
        
        return Math.min(newTime, course.totalDuration);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, course, courseId]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const seek = (seconds: number) => {
    setCurrentTime(prev => {
      const newTime = Math.max(0, Math.min(prev + seconds, course?.totalDuration || 0));
      return newTime;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    completeCourseAndQuizMutation.mutate({ courseId, answers });
  };

  if (isLoading || !course) {
    return (
      <Layout title="Loading Course..." description="Please wait while the training content loads">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading course content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={course.title} 
      description={course.description}
      backLink="/training"
    >
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/training">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training Center
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.durationMinutes} minutes</p>
          </div>
          
          <div className="flex items-center gap-2">
            {course.status === "completed" ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="mr-1 h-4 w-4" />
                Completed
              </Badge>
            ) : (
              <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
            )}
            
            {course.status === "completed" && (
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {!showQuiz ? (
        <Card className="overflow-hidden shadow-sm">
          <Tabs defaultValue="video" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="video">Video Training</TabsTrigger>
                <TabsTrigger value="objectives">Learning Objectives</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-4">
              <TabsContent value="video" className="mt-0">
                <div className="space-y-4">
                  {/* Video player with custom controls */}
                  <div className="relative aspect-video overflow-hidden rounded-md bg-black">
                    <iframe 
                      ref={videoRef}
                      src={`${course.videoUrl}?title=0&byline=0&portrait=0&controls=0${isMuted ? '&muted=1' : ''}`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    
                    {/* Custom video controls overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(course.totalDuration)}</span>
                        </div>
                        <Progress 
                          value={(currentTime / course.totalDuration) * 100} 
                          className="h-1 bg-gray-500"
                        />
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-white hover:bg-white/20"
                              onClick={() => seek(-10)}
                            >
                              <SkipBack className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-white hover:bg-white/20"
                              onClick={togglePlay}
                            >
                              {isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-white hover:bg-white/20"
                              onClick={() => seek(10)}
                            >
                              <SkipForward className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-white hover:bg-white/20"
                            onClick={toggleMute}
                          >
                            {isMuted ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress tracking */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Your Progress</span>
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="objectives" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Learning Objectives</h3>
                    <ul className="space-y-2">
                      {course.objectives?.map((objective, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t">
                    <h3 className="font-semibold text-lg mb-2">Course Information</h3>
                    <dl className="space-y-2">
                      <div className="flex">
                        <dt className="w-32 font-medium">Instructor:</dt>
                        <dd>{course.instructor}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 font-medium">Duration:</dt>
                        <dd>{course.durationMinutes} minutes</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-32 font-medium">Passing Score:</dt>
                        <dd>{course.passingScore}%</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-2">Downloadable Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Fall Protection Safety Checklist.pdf</span>
                      </Button>
                    </li>
                    <li>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Download className="mr-2 h-4 w-4" />
                        <span>OSHA Fall Protection Guidelines.pdf</span>
                      </Button>
                    </li>
                    <li>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Equipment Inspection Form.pdf</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      ) : (
        // Quiz section
        <Card className="overflow-hidden shadow-sm">
          <CardHeader>
            <CardTitle>Course Completion Quiz</CardTitle>
            <CardDescription>
              Complete this quiz to finish the course. You need {course.passingScore}% to pass.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!quizSubmitted ? (
              <div className="space-y-6">
                {course.questions?.map((q, qIndex) => (
                  <div key={qIndex} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">
                      {qIndex + 1}. {q.question}
                    </h3>
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => (
                        <label 
                          key={oIndex}
                          className={cn(
                            "flex items-center p-3 rounded-md border hover:bg-muted/50 cursor-pointer",
                            answers[qIndex] === oIndex ? "bg-primary/10 border-primary" : ""
                          )}
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            className="mr-2"
                            checked={answers[qIndex] === oIndex}
                            onChange={() => handleAnswerSelect(qIndex, oIndex)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                {quizPassed ? (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-600">Congratulations!</h3>
                    <p>You have successfully completed this course.</p>
                    <div className="py-4">
                      <Button variant="outline" asChild className="mx-auto">
                        <Link href="/training/certificates">
                          <Award className="mr-2 h-4 w-4" />
                          View Certificate
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-600">Almost There</h3>
                    <p>You didn't reach the passing score. Please review the course material and try again.</p>
                    <div className="py-4">
                      <Button 
                        onClick={() => {
                          setQuizSubmitted(false);
                          setShowQuiz(false);
                          setAnswers([]);
                        }}
                      >
                        Return to Course
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
          
          {!quizSubmitted && (
            <CardFooter className="flex justify-end border-t p-4">
              <Button 
                onClick={handleQuizSubmit}
                disabled={answers.length !== (course.questions?.length || 0)}
              >
                Submit Quiz
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </Layout>
  );
}