import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [slides, setSlides] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!courseId) return;

    api.get(`/courses/${courseId}/slides`).then((res) => setSlides(res.data));
    api.get(`/courses/${courseId}/leaderboard`).then((res) => setLeaderboard(res.data));

    socket.emit("join-course", Number(courseId));

    const onLeaderboard = (data: any[]) => setLeaderboard(data);
    socket.on("leaderboard:update", onLeaderboard);

    return () => {
      socket.off("leaderboard:update", onLeaderboard);
    };
  }, [courseId]);

  async function markViewed(slideId: number) {
    await api.post(`/courses/${courseId}/slides/${slideId}/view`);
  }

  const current = slides[index];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{current?.title || "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{current?.content}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={index === 0}
              onClick={() => setIndex((v) => v - 1)}
            >
              Previous
            </Button>
            <Button
              onClick={async () => {
                if (current) await markViewed(current.id);
                if (index < slides.length - 1) setIndex((v) => v + 1);
              }}
            >
              Next Slide (+1 XP first time)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.map((row, i) => (
            <div key={row.id} className="flex items-center justify-between rounded-md border p-2">
              <span>{i + 1}. {row.name}</span>
              <span>{row.xp} XP</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}