"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, type Student, type Lesson, type Media } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, MicIcon, ImageIcon, FileIcon } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function StudentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, [params.id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const studentId = params.id as string;

      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("student_id", studentId)
        .order("lesson_date", { ascending: false });

      const { data: mediaData } = await supabase
        .from("media")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      setStudent(studentData);
      setLessons(lessonsData || []);
      setMedia(mediaData || []);
    } catch (error) {
      console.error("Failed to load student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !student) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("studentId", student.id);

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
      }

      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully.`,
      });

      loadStudentData();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRecordLesson = async (audioFile: File) => {
    if (!student) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("studentId", student.id);
      formData.append("studentName", student.name);

      const response = await fetch("/api/lessons/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      toast({
        title: "Lesson processed",
        description: "AI notes generated successfully!",
      });

      loadStudentData();
    } catch (error) {
      console.error("Lesson error:", error);
      toast({
        title: "Error",
        description: "Failed to process lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Student not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-sm text-muted-foreground">Training Space</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <label className="flex-1">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleRecordLesson(e.target.files[0])}
              className="hidden"
              disabled={uploading}
            />
            <Button className="w-full" disabled={uploading} asChild>
              <span>
                <MicIcon className="w-4 h-4 mr-2" />
                {uploading ? "Processing..." : "Record Lesson"}
              </span>
            </Button>
          </label>

          <label className="flex-1">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            <Button variant="outline" className="w-full" disabled={uploading} asChild>
              <span>
                <ImageIcon className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Add Media"}
              </span>
            </Button>
          </label>
        </div>

        <div className="space-y-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Lesson Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(lesson.lesson_date)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  lesson.status === 'completed' ? 'bg-green-500/20 text-green-700' :
                  lesson.status === 'processing' ? 'bg-yellow-500/20 text-yellow-700' :
                  'bg-red-500/20 text-red-700'
                }`}>
                  {lesson.status}
                </span>
              </div>
              {lesson.ai_notes && (
                <div className="prose prose-sm max-w-none lesson-notes" dangerouslySetInnerHTML={{ __html: lesson.ai_notes.replace(/\n/g, '<br />').replace(/##/g, '<h2>').replace(/<h2>/g, '</p><h2>').replace(/<\/h2>/g, '</h2><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^•/gm, '<br />•') }} />
              )}
            </Card>
          ))}

          {media.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start gap-4">
                {item.file_type === 'photo' && item.thumbnail_url && (
                  <img src={item.thumbnail_url} alt={item.file_name || 'Photo'} className="w-32 h-32 object-cover rounded" />
                )}
                {item.file_type === 'video' && (
                  <video src={item.file_url} controls className="w-full max-w-md rounded" />
                )}
                {item.file_type === 'pdf' && (
                  <div className="flex items-center gap-2">
                    <FileIcon className="w-8 h-8 text-primary" />
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {item.file_name}
                    </a>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </p>
                  {item.caption && <p className="mt-2">{item.caption}</p>}
                </div>
              </div>
            </Card>
          ))}

          {lessons.length === 0 && media.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No lessons or media yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Record a lesson or add media to get started
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
