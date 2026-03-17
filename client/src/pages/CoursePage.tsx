import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    api.get("/courses").then((res) => setCourses(res.data));
  }, []);

  async function enroll(courseId: number) {
    await api.post(`/courses/${courseId}/enroll`);
    alert("Enrolled successfully");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{course.description}</p>
            <p className="text-sm">Difficulty: {course.difficulty}</p>
            <p className="text-sm">Professor: {course.professor_name || "N/A"}</p>
            <p className="text-sm">10 slides</p>
            <Button className="w-full" onClick={() => enroll(course.id)}>Enroll</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}