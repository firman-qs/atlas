import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CourseWorkspace } from "@/features/student-course/components/course-workspace";

const useStudentEnrollment = vi.hoisted(() => vi.fn());
const useCreateLearningRecord = vi.hoisted(() => vi.fn());
const useLearningRecordProgress = vi.hoisted(() => vi.fn());
const useAssessmentOptions = vi.hoisted(() => vi.fn());

vi.mock("@/features/student-course/queries", () => ({
  useStudentEnrollment,
  useCreateLearningRecord,
  useLearningRecordProgress,
  useAssessmentOptions,
}));

vi.mock("@/features/student-course/components/learning-progress", () => ({
  LearningProgress: () => <div>Learning progress</div>,
}));

vi.mock("@/features/student-course/components/assessment-options", () => ({
  AssessmentOptionsPanel: () => <div>Assessment options</div>,
}));

const enrollment = {
  id: "enrollment-1",
  enrolled_at: "2026-08-20T00:00:00Z",

  learning_record: {
    id: "learning-record-1",
    enrollment_id: "enrollment-1",
    started_at: "2026-08-21T00:00:00Z",
    completed_at: null,
  },

  course_offering: {
    id: "offering-1",
    section: "A",

    course: {
      id: "course-1",
      code: "UM032EM000",
      title: "Electromagnetics",
      credits: 3,
    },

    instructor: {
      id: "instructor-1",
      full_name: "Electromagnetics Instructor",
    },

    academic_term: {
      id: "term-1",
      semester: "odd",
      year: 2026,
    },
  },
};

describe("CourseWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useStudentEnrollment.mockReturnValue({
      data: enrollment,
      isPending: false,
      isError: false,
      error: null,
    });

    useCreateLearningRecord.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    useLearningRecordProgress.mockReturnValue({
      data: {
        learning_record_id: "learning-record-1",
        completed_at: null,
        learning_objectives: [],
      },
      isPending: false,
      isError: false,
      error: null,
    });

    useAssessmentOptions.mockReturnValue({
      data: {
        learning_record_id: "learning-record-1",
        active_assessment: null,
        progress: null,
        review: [],
      },
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("provides the AI Tutor from an active course learning workspace", () => {
    render(<CourseWorkspace enrollmentId="enrollment-1" />);

    const aiTutorLink = screen.getByRole("link", {
      name: "Open AI Tutor",
    });

    expect(aiTutorLink).toHaveAttribute(
      "href",
      "/student/courses/enrollment-1/chat",
    );
  });

  it("moves active learning metadata into course details without a redundant workspace status card", () => {
    render(<CourseWorkspace enrollmentId="enrollment-1" />);

    expect(screen.getByText("Course details")).toBeInTheDocument();

    expect(
      screen.queryByText("Learning record active"),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Started")).toBeInTheDocument();
  });
});
