import { api } from "@/lib/api";

export async function getCourses() {
  const res = await api.get("/courses");
  return res.data;
}

export async function getMyCourses() {
  const res = await api.get("/courses/my");
  return res.data;
}

export async function enrollInCourse(courseId: number) {
  const res = await api.post(`/courses/${courseId}/enroll`);
  return res.data;
}

export async function createCourse(data: {
  title: string;
  description: string;
  difficulty: string;
}) {
  const res = await api.post("/courses", data);
  return res.data;
}

export async function assignProfessorToCourse(courseId: number, professorId: number) {
  const res = await api.patch(`/courses/${courseId}/assign-professor`, {
    professorId,
  });
  return res.data;
}