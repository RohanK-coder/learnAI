import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    api.get("/courses/my").then((res) => setCourses(res.data));
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{course.description}</p>
            <p className="text-sm">XP: {course.xp || 0}</p>
            <Button asChild className="w-full">
              <Link to={`/courses/${course.id}`}>Continue</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}