import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Upload, Video, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const trainingCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  isRequired: z.boolean().default(false),
  assignedRoles: z.array(z.string()).optional(),
  contentIds: z.array(z.number()).optional(),
  passingScore: z.number().min(0).max(100).default(70),
});

type FormValues = z.infer<typeof trainingCourseSchema>;

// Mock data for video content
const mockVideos = [
  {
    id: 1,
    title: "Fall Protection Basics",
    description: "Introduction to fall protection equipment and safety procedures",
    contentType: "video",
    videoId: "LXb3EKWsInQ", // YouTube video ID
    duration: 360, // in seconds
    language: "en",
  },
  {
    id: 2,
    title: "Harness Inspection and Usage",
    description: "How to properly inspect and wear a safety harness",
    contentType: "video",
    videoId: "dQw4w9WgXcQ", // YouTube video ID as placeholder
    duration: 480, // in seconds
    language: "en",
  },
  {
    id: 3,
    title: "Safety Harness Donning Demonstration",
    description: "Step-by-step guide to properly putting on a safety harness",
    contentType: "video",
    videoId: "6Q3uaSnRGtI", // YouTube video ID
    duration: 240, // in seconds
    language: "en",
  },
  {
    id: 4,
    title: "Construction Site PPE Requirements",
    description: "Overview of required personal protective equipment on construction sites",
    contentType: "video",
    videoId: "mJR-ClYZ1wQ", // YouTube video ID
    duration: 300, // in seconds
    language: "en",
  },
];

// User roles for the form
const userRoles = [
  { id: "employee", label: "Employee" },
  { id: "supervisor", label: "Supervisor" },
  { id: "safety_officer", label: "Safety Officer" },
  { id: "subcontractor", label: "Subcontractor" },
];

export default function CreateTrainingCourse() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [addingVideo, setAddingVideo] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDuration, setNewVideoDuration] = useState("");

  // Only safety officers and admins can create training courses
  if (user?.role !== "safety_officer" && user?.role !== "super_admin") {
    navigate("/training");
    return null;
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(trainingCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      isRequired: false,
      assignedRoles: ["employee"],
      passingScore: 70,
      contentIds: [],
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Add selected videos to the form data
      data.contentIds = selectedVideos;
      
      const res = await apiRequest("POST", "/api/training-courses", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Training course created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training-courses"] });
      navigate("/training");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create training course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (selectedVideos.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one video to the training course",
        variant: "destructive",
      });
      return;
    }
    
    createCourseMutation.mutate(data);
  };

  const toggleVideo = (videoId: number) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };

  const handleAddVideo = () => {
    // In a real app, this would make an API call to add a new video
    // For now, we just show a toast and use the mock data
    toast({
      title: "Info",
      description: "In a production app, this would upload the video to a storage service",
    });
    setAddingVideo(false);
    setNewVideoUrl("");
    setNewVideoTitle("");
    setNewVideoDuration("");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/training">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Training
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Training Course</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter course title" {...field} />
                          </FormControl>
                          <FormDescription>
                            Choose a clear, descriptive title for your training course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter course description" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide details about what workers will learn from this training
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Required Training</FormLabel>
                            <FormDescription>
                              Mark if this training is mandatory for assigned roles
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignedRoles"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Assign to Roles</FormLabel>
                            <FormDescription>
                              Select which roles should take this training
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {userRoles.map((role) => (
                              <FormField
                                key={role.id}
                                control={form.control}
                                name="assignedRoles"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={role.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(role.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value || [], role.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== role.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {role.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0}
                              max={100}
                              placeholder="70"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Set the minimum score needed to pass this course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Button
                        type="submit"
                        disabled={createCourseMutation.isPending}
                      >
                        {createCourseMutation.isPending ? "Creating..." : "Create Training Course"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - Video Content Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {mockVideos.map((video) => (
                    <div
                      key={video.id}
                      className={`p-3 border rounded-md flex items-center gap-3 cursor-pointer ${
                        selectedVideos.includes(video.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onClick={() => toggleVideo(video.id)}
                    >
                      <div className="flex-shrink-0 h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{video.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(video.duration / 60)} minutes
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={selectedVideos.includes(video.id)}
                          onCheckedChange={() => toggleVideo(video.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {addingVideo ? (
                  <div className="mt-4 space-y-3 border p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Add New Video</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setAddingVideo(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="videoTitle">Video Title</Label>
                        <Input
                          id="videoTitle"
                          value={newVideoTitle}
                          onChange={(e) => setNewVideoTitle(e.target.value)}
                          placeholder="Enter video title"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="videoUrl">YouTube Video URL or ID</Label>
                        <Input
                          id="videoUrl"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          placeholder="e.g. https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="videoDuration">Duration (in minutes)</Label>
                        <Input
                          id="videoDuration"
                          type="number"
                          value={newVideoDuration}
                          onChange={(e) => setNewVideoDuration(e.target.value)}
                          placeholder="e.g. 5"
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleAddVideo}
                        disabled={!newVideoTitle || !newVideoUrl}
                      >
                        Add Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mt-2 gap-2"
                    onClick={() => setAddingVideo(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Add New Video
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Content</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVideos.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No videos selected yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedVideos.map(videoId => {
                      const video = mockVideos.find(v => v.id === videoId);
                      return (
                        <div key={videoId} className="flex justify-between items-center p-2 border rounded-md">
                          <span className="text-sm truncate">{video?.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleVideo(videoId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 text-center text-sm">
                  <span className="font-medium">{selectedVideos.length}</span> videos selected
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}