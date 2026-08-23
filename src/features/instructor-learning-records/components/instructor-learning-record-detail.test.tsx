import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InstructorLearningRecordDetail } from "@/features/instructor-learning-records/components/instructor-learning-record-detail";

const {
  mockedUseInstructorLearningRecord,
  mockedUseInstructorLearningRecordProgress,
  mockedUseInstructorLearningRecordAssessments,
} = vi.hoisted(() => ({
  mockedUseInstructorLearningRecord: vi.fn(),
  mockedUseInstructorLearningRecordProgress: vi.fn(),
  mockedUseInstructorLearningRecordAssessments: vi.fn(),
}));

vi.mock("@/features/instructor-learning-records/queries", () => ({
  useInstructorLearningRecord: mockedUseInstructorLearningRecord,
  useInstructorLearningRecordProgress:
    mockedUseInstructorLearningRecordProgress,
  useInstructorLearningRecordAssessments:
    mockedUseInstructorLearningRecordAssessments,
}));

describe("InstructorLearningRecordDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseInstructorLearningRecord.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        id: "learning-record-1",
        started_at: "2026-08-20T08:00:00+07:00",
        completed_at: null,
        enrollment: {
          id: "enrollment-1",
          enrolled_at: "2026-08-19T08:00:00+07:00",
          student: {
            id: "student-1",
            full_name: "Balanar Jr",
            email: "student@atlas.com",
          },
          course_offering: {
            id: "offering-1",
            section: "A",
            course: {
              id: "course-1",
              code: "UM032EM000",
              title: "Electromagnetics",
              credits: 4,
            },
            instructor: {
              id: "instructor-1",
              full_name: "Instructor One",
              email: "instructor@atlas.edu",
            },
            academic_term: {
              id: "term-1",
              year: 2026,
              semester: "odd",
              starts_at: "2026-08-01",
              ends_at: "2026-12-31",
            },
          },
        },
      },
    });

    mockedUseInstructorLearningRecordProgress.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        learning_record_id: "learning-record-1",
        completed_at: null,
        learning_objectives: [
          {
            id: "lo-1",
            code: "lo1",
            description: "Explain electromagnetic concepts.",
            display_order: 1,
            mastered_at: null,
            concepts: [
              {
                learning_objective_concept_id: "loc-1",
                concept: {
                  id: "concept-1",
                  code: "em-c001",
                  name: "Electric Flux",
                  description: "Electric flux through surfaces.",
                },
                is_required: true,
                display_order: 1,
                mastered_loc_level_id: "loc-level-1",
                mastered_at: null,
                levels: [
                  {
                    loc_level_id: "loc-level-1",
                    solo_level: {
                      id: "solo-1",
                      code: "unistructural",
                      level: 1,
                      description: "Identify one relevant aspect.",
                    },
                    mastery_threshold: 0.8,
                    display_order: 1,
                  },
                  {
                    loc_level_id: "loc-level-2",
                    solo_level: {
                      id: "solo-2",
                      code: "multistructural",
                      level: 2,
                      description: "Identify several relevant aspects.",
                    },
                    mastery_threshold: 0.8,
                    display_order: 2,
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    mockedUseInstructorLearningRecordAssessments.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: {
        items: [],
        page: 1,
        page_size: 100,
        total: 0,
      },
    });
  });

  it("renders the student's learning record and curriculum progress", () => {
    render(
      <InstructorLearningRecordDetail
        courseOfferingId="offering-1"
        learningRecordId="learning-record-1"
      />,
    );

    expect(mockedUseInstructorLearningRecord).toHaveBeenCalledWith(
      "offering-1",
      "learning-record-1",
    );

    expect(mockedUseInstructorLearningRecordProgress).toHaveBeenCalledWith(
      "offering-1",
      "learning-record-1",
    );

    expect(mockedUseInstructorLearningRecordAssessments).toHaveBeenCalledWith(
      "offering-1",
      "learning-record-1",
      {
        page: 1,
        pageSize: 100,
      },
    );

    expect(screen.getByText("Balanar Jr")).toBeInTheDocument();
    expect(screen.getByText("student@atlas.com")).toBeInTheDocument();

    expect(screen.getByText("Electromagnetics")).toBeInTheDocument();

    expect(screen.getByText("Learning Progress")).toBeInTheDocument();

    expect(screen.getByText("LO1")).toBeInTheDocument();
    expect(screen.getByText("Electric Flux")).toBeInTheDocument();
    expect(screen.getByText("em-c001")).toBeInTheDocument();

    expect(screen.getByText("Unistructural")).toBeInTheDocument();
    expect(screen.getByText("Multistructural")).toBeInTheDocument();

    expect(screen.getAllByText("Mastery threshold 80%")).toHaveLength(2);

    expect(screen.getByText("Assessment History")).toBeInTheDocument();
    expect(screen.getByText("No assessments yet")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /course offering/i,
      }),
    ).toHaveAttribute("href", "/instructor/course-offerings/offering-1");
  });
});
