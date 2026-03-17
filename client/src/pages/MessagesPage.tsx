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

const COURSE_COLORS = [
  "#534AB7", "#1D9E75", "#D85A30", "#185FA5",
  "#854F0B", "#993556", "#3B6D11", "#A32D2D",
];

function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderContent(text: string) {
  // Convert **bold** markdown and newlines to readable format
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} style={{
        margin: "2px 0", fontSize: 14, lineHeight: 1.65,
        color: "inherit"
      }}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} style={{ fontWeight: 500 }}>{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [courses, setCourses]       = useState<Course[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [text, setText]             = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [shareNote, setShareNote]   = useState("");
  const [sharingId, setSharingId]   = useState<number | null>(null);
  const [toast, setToast]           = useState("");

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

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
      api.get("/courses/my").then(res => setCourses(res.data));
    }
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;
    refreshMessages(selectedConversationId);
    socket.emit("join-conversation", selectedConversationId);
    const handleNew    = async () => { if (selectedConversationId) await refreshMessages(selectedConversationId); };
    const handleShared = async () => { if (selectedConversationId) await refreshMessages(selectedConversationId); };
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
    setLoadingSend(true);
    try {
      if (user?.role === "student") await sendStudentMessage(selectedConversationId, text);
      else if (user?.role === "professor") await sendProfessorMessage(selectedConversationId, text);
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
    setSharingId(null);
    setShareNote("");
    showToast("Shared with your professor!");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 14,
    border: "0.5px solid #D3D1C7", borderRadius: 8,
    outline: "none", fontFamily: "inherit",
    background: "#fff", color: "#1a1a1a", resize: "none"
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px", fontFamily: "Inter, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: "#EAF3DE", color: "#27500A",
          border: "0.5px solid #97C459",
          borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500
        }}>{toast}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, height: "calc(100vh - 120px)" }}>

        {/* ── Left sidebar ── */}
        <div style={{
          background: "#fff", border: "0.5px solid #E8E6DF",
          borderRadius: 12, overflow: "hidden",
          display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: "16px 18px", borderBottom: "0.5px solid #F1EFE8" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>Messages</div>
            <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>
              {user?.role === "professor" ? "Student conversations" : "Course conversations"}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>

            {/* Student: start new conversation */}
            {user?.role === "student" && courses.length > 0 && (
              <div style={{ padding: "0 12px 10px", borderBottom: "0.5px solid #F1EFE8", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>
                  Start conversation
                </div>
                {courses.map((course, i) => (
                  <button key={course.id} onClick={() => handleCreateConversation(course.id)} style={{
                    width: "100%", textAlign: "left", padding: "8px 10px",
                    marginBottom: 4, borderRadius: 8, border: "0.5px solid #E8E6DF",
                    background: "transparent", cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background .15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F8F7FF"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: COURSE_COLORS[i % COURSE_COLORS.length]
                    }} />
                    <span style={{ fontSize: 13, color: "#3d3d3a" }}>{course.title}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#B4B2A9" }}>+</span>
                  </button>
                ))}
              </div>
            )}

            {/* Conversations list */}
            <div style={{ padding: "0 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#B4B2A9", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>
                Conversations
              </div>
              {conversations.length === 0 ? (
                <div style={{ fontSize: 13, color: "#B4B2A9", padding: "8px 0" }}>
                  No conversations yet.
                </div>
              ) : (
                conversations.map((conv, i) => {
                  const isSelected = selectedConversationId === conv.id;
                  const color = COURSE_COLORS[i % COURSE_COLORS.length];
                  return (
                    <button key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      style={{
                        width: "100%", textAlign: "left", padding: "10px 12px",
                        marginBottom: 4, borderRadius: 8, cursor: "pointer",
                        fontFamily: "inherit", border: isSelected ? "none" : "0.5px solid transparent",
                        background: isSelected ? "#EEEDFE" : "transparent",
                        borderLeft: isSelected ? `3px solid #534AB7` : "3px solid transparent",
                        transition: "all .15s"
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#F8F7FF"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <div style={{ fontSize: 13, fontWeight: isSelected ? 500 : 400, color: isSelected ? "#3C3489" : "#1a1a1a" }}>
                          {conv.course_title}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#888780", paddingLeft: 14 }}>
                        {user?.role === "student"
                          ? `Prof. ${conv.professor_name || "N/A"}`
                          : `Student: ${conv.student_name || "N/A"}`}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div style={{
          background: "#fff", border: "0.5px solid #E8E6DF",
          borderRadius: 12, overflow: "hidden",
          display: "flex", flexDirection: "column"
        }}>

          {/* Chat header */}
          <div style={{
            padding: "14px 20px", borderBottom: "0.5px solid #F1EFE8",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>
                {selectedConversation ? selectedConversation.course_title : "Select a conversation"}
              </div>
              {selectedConversation && (
                <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>
                  {user?.role === "student"
                    ? `Prof. ${selectedConversation.professor_name || "N/A"} · AI-powered`
                    : `Student: ${selectedConversation.student_name || "N/A"}`}
                </div>
              )}
            </div>
            {selectedConversation && user?.role === "student" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 10px", borderRadius: 20,
                background: "#EEEDFE", fontSize: 12, color: "#3C3489", fontWeight: 500
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                AI agent active
              </div>
            )}
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {!selectedConversationId ? (
              <div style={{ textAlign: "center", paddingTop: 60, color: "#B4B2A9" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#5F5E5A", marginBottom: 6 }}>
                  No conversation selected
                </div>
                <div style={{ fontSize: 13 }}>Choose a course conversation from the left</div>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 60, color: "#B4B2A9" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#5F5E5A", marginBottom: 6 }}>
                  Ask the AI anything
                </div>
                <div style={{ fontSize: 13 }}>Type a question below to get started</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map(message => {
                  const isStudent   = message.sender_type === "student";
                  const isProfessor = message.sender_type === "professor";
                  const isAI        = message.sender_type === "ai";
                  const isSharingThis = sharingId === message.id;

                  return (
                    <div key={message.id} style={{
                      display: "flex",
                      flexDirection: isStudent ? "row-reverse" : "row",
                      alignItems: "flex-start", gap: 10
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 500,
                        background: isStudent ? "#534AB7" : isProfessor ? "#1D9E75" : "#F1EFE8",
                        color: isStudent || isProfessor ? "#fff" : "#888780"
                      }}>
                        {isStudent ? "S" : isProfessor ? "P" : "AI"}
                      </div>

                      {/* Bubble */}
                      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{
                          padding: "10px 14px", borderRadius: 10,
                          background: isStudent ? "#EEEDFE"
                            : isProfessor ? "#E1F5EE"
                            : "#F8F8F6",
                          border: `0.5px solid ${
                            isStudent ? "#AFA9EC"
                            : isProfessor ? "#9FE1CB"
                            : "#E8E6DF"
                          }`,
                          color: isStudent ? "#26215C"
                            : isProfessor ? "#04342C"
                            : "#3d3d3a"
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6, opacity: 0.6 }}>
                            {isStudent ? "You" : isProfessor ? "Professor" : "AI Agent"}
                          </div>
                          {renderContent(message.content)}
                        </div>

                        {/* Timestamp + share status */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
                          <span style={{ fontSize: 11, color: "#B4B2A9" }}>
                            {formatTime(message.created_at)}
                          </span>
                          {message.shared_with_professor && (
                            <span style={{
                              fontSize: 11, fontWeight: 500,
                              color: "#0F6E56", background: "#E1F5EE",
                              padding: "1px 7px", borderRadius: 10
                            }}>✓ Shared with professor</span>
                          )}
                        </div>

                        {/* Share with professor button */}
                        {user?.role === "student" && isAI && !message.shared_with_professor && (
                          <div>
                            {!isSharingThis ? (
                              <button
                                onClick={() => setSharingId(message.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 5,
                                  padding: "5px 11px", fontSize: 12, fontWeight: 500,
                                  background: "transparent", color: "#534AB7",
                                  border: "0.5px solid #AFA9EC", borderRadius: 6,
                                  cursor: "pointer", fontFamily: "inherit"
                                }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                  stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                Share with professor
                              </button>
                            ) : (
                              <div style={{
                                background: "#FAFAF8", border: "0.5px solid #E8E6DF",
                                borderRadius: 8, padding: "10px 12px", marginTop: 4
                              }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: "#5F5E5A", marginBottom: 6 }}>
                                  Add a note for your professor (optional)
                                </div>
                                <textarea
                                  value={shareNote}
                                  onChange={e => setShareNote(e.target.value)}
                                  placeholder="e.g. I'm not sure I understood step 2 — can you clarify?"
                                  rows={2}
                                  style={{ ...inputStyle, marginBottom: 8 }}
                                />
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    onClick={() => handleShare(message.id)}
                                    style={{
                                      padding: "6px 14px", fontSize: 12, fontWeight: 500,
                                      background: "#534AB7", color: "#fff",
                                      border: "none", borderRadius: 6,
                                      cursor: "pointer", fontFamily: "inherit"
                                    }}>Share now</button>
                                  <button
                                    onClick={() => { setSharingId(null); setShareNote(""); }}
                                    style={{
                                      padding: "6px 12px", fontSize: 12,
                                      background: "transparent", color: "#888780",
                                      border: "0.5px solid #D3D1C7", borderRadius: 6,
                                      cursor: "pointer", fontFamily: "inherit"
                                    }}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input area */}
          {selectedConversationId && (
            <div style={{ padding: "12px 20px", borderTop: "0.5px solid #F1EFE8" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={user?.role === "student"
                    ? "Ask the AI about this course..."
                    : "Reply to the student..."}
                  rows={2}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = "#534AB7"}
                  onBlur={e => e.target.style.borderColor = "#D3D1C7"}
                />
                <button
                  onClick={handleSend}
                  disabled={loadingSend || !text.trim()}
                  style={{
                    padding: "10px 18px", fontSize: 13, fontWeight: 500,
                    background: loadingSend || !text.trim() ? "#AFA9EC" : "#534AB7",
                    color: "#fff", border: "none", borderRadius: 8,
                    cursor: loadingSend || !text.trim() ? "not-allowed" : "pointer",
                    fontFamily: "inherit", flexShrink: 0
                  }}>
                  {loadingSend ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Thinking...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      Send
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="2" strokeLinecap="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </span>
                  )}
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6 }}>
                Press Enter to send · Shift+Enter for new line
                {user?.role === "student" && " · AI responses can be shared with your professor"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}