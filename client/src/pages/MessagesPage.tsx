import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";
import {
  createConversation,
  getConversationMessages,
  getConversations,
  sendProfessorMessage,
  sendStudentMessage,
  shareAiMessage,
} from "@/services/messages.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Conversation {
  id: number;
  course_id: number;
  course_title: string;
  professor_name?: string;
  student_name?: string;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_type: "student" | "professor" | "ai";
  sender_id: number | null;
  content: string;
  shared_with_professor: boolean;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  async function refreshConversations() {
    const data = await getConversations();
    setConversations(data);
    if (!selectedConversationId && data.length > 0) {
      setSelectedConversationId(data[0].id);
    }
  }

  async function refreshMessages(conversationId: number) {
    const data = await getConversationMessages(conversationId);
    setMessages(data);
  }

  useEffect(() => {
    refreshConversations();

    if (user?.role === "student") {
      api.get("/courses/my").then((res) => setCourses(res.data));
    }
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;

    refreshMessages(selectedConversationId);

    socket.emit("join-conversation", selectedConversationId);

    const handleNew = async () => {
  if (selectedConversationId) {
    await refreshMessages(selectedConversationId);
  }
};

const handleShared = async () => {
  if (selectedConversationId) {
    await refreshMessages(selectedConversationId);
  }
};

    socket.on("message:new", handleNew);
    socket.on("message:shared", handleShared);

    return () => {
      socket.off("message:new", handleNew);
      socket.off("message:shared", handleShared);
    };
  }, [selectedConversationId]);

  async function handleCreateConversation(courseId: number) {
    const result = await createConversation(courseId);
    await refreshConversations();
    setSelectedConversationId(result.conversationId);
    await refreshMessages(result.conversationId);
  }

  async function handleSend() {
    if (!selectedConversationId || !text.trim()) return;

    try {
      setLoadingSend(true);

      if (user?.role === "student") {
        await sendStudentMessage(selectedConversationId, text);
      } else if (user?.role === "professor") {
        await sendProfessorMessage(selectedConversationId, text);
      }

      setText("");
      await refreshMessages(selectedConversationId);
    } finally {
      setLoadingSend(false);
    }
  }

  async function handleShare(messageId: number) {
    if (!selectedConversationId) return;
    await shareAiMessage(selectedConversationId, messageId);
    await refreshMessages(selectedConversationId);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {user?.role === "student" && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Start a course conversation</p>
                {courses.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Enroll in a course first to start messaging.
                  </p>
                )}
                {courses.map((course) => (
                  <Button
                    key={course.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleCreateConversation(course.id)}
                  >
                    {course.title}
                  </Button>
                ))}
              </div>
              <div className="border-t pt-3" />
            </>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Existing conversations</p>
            {conversations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No conversations yet.
              </p>
            )}
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full rounded-md border p-3 text-left ${
                  selectedConversationId === conversation.id
                    ? "border-black bg-slate-50"
                    : ""
                }`}
              >
                <div className="font-medium">{conversation.course_title}</div>
                <div className="text-sm text-muted-foreground">
                  {user?.role === "student"
                    ? `Professor: ${conversation.professor_name || "N/A"}`
                    : `Student: ${conversation.student_name || "N/A"}`}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedConversation
              ? selectedConversation.course_title
              : "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[420px] max-h-[520px] space-y-3 overflow-y-auto rounded-md border p-4">
            {!selectedConversationId && (
              <p className="text-sm text-muted-foreground">
                Choose or create a conversation to begin messaging.
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg border p-3 ${
                  message.sender_type === "student"
                    ? "bg-blue-50"
                    : message.sender_type === "professor"
                    ? "bg-green-50"
                    : "bg-slate-50"
                }`}
              >
                <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {message.sender_type}
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {user?.role === "student" &&
                  message.sender_type === "ai" &&
                  !message.shared_with_professor && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleShare(message.id)}
                    >
                      Share with professor
                    </Button>
                  )}

                {message.shared_with_professor && (
                  <p className="mt-2 text-xs text-green-600">
                    Shared with professor
                  </p>
                )}
              </div>
            ))}
          </div>

          {selectedConversationId && (
            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  user?.role === "student"
                    ? "Ask AI about this course..."
                    : "Reply to the student..."
                }
              />
              <Button onClick={handleSend} disabled={loadingSend}>
                {loadingSend ? "Sending..." : "Send"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}