import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  createCourse,
  enrollInCourse,
  getCourses,
} from "@/services/courses.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");

  async function loadCourses() {
    const data = await getCourses();
    setCourses(data);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleEnroll(courseId: number) {
    await enrollInCourse(courseId);
    alert("Enrolled successfully");
  }

  async function handleCreateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createCourse({ title, description, difficulty });
    setTitle("");
    setDescription("");
    setDifficulty("Beginner");
    await loadCourses();
  }

  return (
    <div className="space-y-6">
      {user?.role === "professor" && (
        <Card>
          <CardHeader>
            <CardTitle>Create a Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <Button>Create Course</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{course.description}</p>
              <p className="text-sm">Difficulty: {course.difficulty}</p>
              <p className="text-sm">Professor: {course.professor_name || "Unassigned"}</p>
              <p className="text-sm">Slides: {course.slide_count || 0}</p>

              {user?.role === "student" && (
                <Button className="w-full" onClick={() => handleEnroll(course.id)}>
                  Enroll
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}