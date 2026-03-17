import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    api.get("/messages/conversations").then((res) => {
      setConversations(res.data);
      if (res.data.length > 0) setSelectedId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    api.get(`/messages/${selectedId}`).then((res) => setMessages(res.data));
    socket.emit("join-conversation", selectedId);

    const refresh = async () => {
      const res = await api.get(`/messages/${selectedId}`);
      setMessages(res.data);
    };

    socket.on("message:new", refresh);
    socket.on("message:shared", refresh);

    return () => {
      socket.off("message:new", refresh);
      socket.off("message:shared", refresh);
    };
  }, [selectedId]);

  async function send() {
    if (!selectedId || !text.trim()) return;

    if (user?.role === "student") {
      await api.post(`/messages/${selectedId}/student`, { content: text });
    } else if (user?.role === "professor") {
      await api.post(`/messages/${selectedId}/professor`, { content: text });
    }

    setText("");
    const res = await api.get(`/messages/${selectedId}`);
    setMessages(res.data);
  }

  async function share(messageId: number) {
    if (!selectedId) return;
    await api.post(`/messages/${selectedId}/share/${messageId}`);
    const res = await api.get(`/messages/${selectedId}`);
    setMessages(res.data);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="w-full rounded-md border p-3 text-left"
            >
              <div className="font-medium">{c.course_title}</div>
              <div className="text-sm text-muted-foreground">
                {c.professor_name || c.student_name}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[500px] space-y-3 overflow-y-auto rounded-md border p-3">
            {messages.map((m) => {
              const visibleToProfessor =
                m.sender_type !== "ai" || m.shared_with_professor || user?.role !== "professor";

              if (!visibleToProfessor) return null;

              return (
                <div key={m.id} className="rounded-md border p-3">
                  <div className="mb-1 text-xs uppercase text-muted-foreground">
                    {m.sender_type}
                  </div>
                  <p className="text-sm">{m.content}</p>

                  {user?.role === "student" &&
                    m.sender_type === "ai" &&
                    !m.shared_with_professor && (
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => share(m.id)}
                      >
                        Share with professor
                      </Button>
                    )}

                  {m.shared_with_professor && (
                    <p className="mt-2 text-xs text-green-600">
                      Shared with professor
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask a question..."
            />
            <Button onClick={send}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}