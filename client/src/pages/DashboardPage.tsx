import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [myCourses, setMyCourses] = useState<any[]>([]);

  useEffect(() => {
    api.get("/courses/my").then((res) => setMyCourses(res.data));
  }, []);

  const totalXp = myCourses.reduce((sum, c) => sum + (c.xp || 0), 0);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>Total XP</CardTitle></CardHeader>
        <CardContent><p className="text-3xl font-bold">{totalXp}</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
        <CardContent><p className="text-3xl font-bold">{myCourses.length}</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Keep learning to move up the leaderboard.</p></CardContent>
      </Card>
    </div>
  );
}