import { api } from "@/lib/api";

export async function getConversations() {
  const res = await api.get("/messages/conversations");
  return res.data;
}

export async function createConversation(courseId: number) {
  const res = await api.post("/messages/conversations", { courseId });
  return res.data;
}

export async function getConversationMessages(conversationId: number) {
  const res = await api.get(`/messages/${conversationId}`);
  return res.data;
}

export async function sendStudentMessage(conversationId: number, content: string) {
  const res = await api.post(`/messages/${conversationId}/student`, { content });
  return res.data;
}

export async function sendProfessorMessage(conversationId: number, content: string) {
  const res = await api.post(`/messages/${conversationId}/professor`, { content });
  return res.data;
}

export async function shareAiMessage(conversationId: number, messageId: number) {
  const res = await api.post(`/messages/${conversationId}/share/${messageId}`);
  return res.data;
}