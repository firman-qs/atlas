import { render, screen, within } from "@/test/render";
import { describe, expect, it } from "vitest";

import { LearningProgress } from "@/features/student-course/components/learning-progress";
import type { LearningRecordProgress } from "@/features/student-course/types";

describe("LearningProgress", () => {
  it("summarizes learning-objective and required-concept mastery", () => {
    const progress: LearningRecordProgress = {
      learning_record_id: "learning-record-1",
      completed_at: null,

      learning_objectives: [
        {
          id: "lo-1",
          code: "lo1",
          description: "Explain electric flux and Gauss's law.",
          display_order: 1,
          mastered_at: "2026-08-20T00:00:00Z",

          concepts: [
            {
              learning_objective_concept_id: "loc-1",
              is_required: true,
              display_order: 1,
              mastered_loc_level_id: "loc-level-3",
              mastered_at: "2026-08-20T00:00:00Z",

              concept: {
                id: "concept-1",
                code: "em-c001",
                name: "Electric Flux",
                description: "Electric flux through surfaces.",
              },

              levels: [
                {
                  loc_level_id: "loc-level-1",
                  mastery_threshold: 0.8,
                  display_order: 1,
                  solo_level: {
                    id: "solo-1",
                    code: "unistructural",
                    description: "Identify one relevant aspect.",
                    level: 1,
                  },
                },
                {
                  loc_level_id: "loc-level-2",
                  mastery_threshold: 0.8,
                  display_order: 2,
                  solo_level: {
                    id: "solo-2",
                    code: "multistructural",
                    description: "Identify several relevant aspects.",
                    level: 2,
                  },
                },
                {
                  loc_level_id: "loc-level-3",
                  mastery_threshold: 0.8,
                  display_order: 3,
                  solo_level: {
                    id: "solo-3",
                    code: "relational",
                    description: "Integrate the relevant aspects.",
                    level: 3,
                  },
                },
              ],
            },

            {
              learning_objective_concept_id: "loc-optional",
              is_required: false,
              display_order: 2,
              mastered_loc_level_id: null,
              mastered_at: null,

              concept: {
                id: "concept-optional",
                code: "em-c999",
                name: "Optional Extension",
                description: "An optional extension concept.",
              },

              levels: [
                {
                  loc_level_id: "optional-level-1",
                  mastery_threshold: 0.9,
                  display_order: 1,
                  solo_level: {
                    id: "solo-1",
                    code: "unistructural",
                    description: "Identify one relevant aspect.",
                    level: 1,
                  },
                },
              ],
            },
          ],
        },

        {
          id: "lo-2",
          code: "lo2",
          description: "Apply Gauss's law to symmetric systems.",
          display_order: 2,
          mastered_at: null,

          concepts: [
            {
              learning_objective_concept_id: "loc-2",
              is_required: true,
              display_order: 1,
              mastered_loc_level_id: "loc-2-level-2",
              mastered_at: null,

              concept: {
                id: "concept-2",
                code: "em-c002",
                name: "Gauss's Law",
                description: "Relate electric flux to enclosed charge.",
              },

              levels: [
                {
                  loc_level_id: "loc-2-level-1",
                  mastery_threshold: 0.8,
                  display_order: 1,
                  solo_level: {
                    id: "solo-1",
                    code: "unistructural",
                    description: "Identify one relevant aspect.",
                    level: 1,
                  },
                },
                {
                  loc_level_id: "loc-2-level-2",
                  mastery_threshold: 0.8,
                  display_order: 2,
                  solo_level: {
                    id: "solo-2",
                    code: "multistructural",
                    description: "Identify several relevant aspects.",
                    level: 2,
                  },
                },
                {
                  loc_level_id: "loc-2-level-3",
                  mastery_threshold: 0.8,
                  display_order: 3,
                  solo_level: {
                    id: "solo-3",
                    code: "relational",
                    description: "Integrate the relevant aspects.",
                    level: 3,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    render(<LearningProgress progress={progress} />);

    const learningObjectiveSummary = screen.getByTestId(
      "learning-objective-summary",
    );

    expect(
      within(learningObjectiveSummary).getByText("Learning Objectives"),
    ).toBeInTheDocument();

    expect(
      within(learningObjectiveSummary).getByText("1 of 2 mastered"),
    ).toBeInTheDocument();

    const requiredConceptSummary = screen.getByTestId(
      "required-concept-summary",
    );

    expect(
      within(requiredConceptSummary).getByText("Required Concepts"),
    ).toBeInTheDocument();

    expect(
      within(requiredConceptSummary).getByText("1 of 2 mastered"),
    ).toBeInTheDocument();

    expect(screen.getByText("Optional Extension")).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("renders SOLO levels as an ordered mastery progression", () => {
    const progress: LearningRecordProgress = {
      learning_record_id: "learning-record-1",
      completed_at: null,

      learning_objectives: [
        {
          id: "lo-1",
          code: "lo1",
          description: "Explain electric flux and Gauss's law.",
          display_order: 1,
          mastered_at: null,

          concepts: [
            {
              learning_objective_concept_id: "loc-1",
              is_required: true,
              display_order: 1,
              mastered_loc_level_id: "loc-level-2",
              mastered_at: null,

              concept: {
                id: "concept-1",
                code: "em-c001",
                name: "Electric Flux",
                description: "Electric flux through surfaces.",
              },

              levels: [
                {
                  loc_level_id: "loc-level-1",
                  mastery_threshold: 0.8,
                  display_order: 1,
                  solo_level: {
                    id: "solo-1",
                    code: "unistructural",
                    description: "Identify one relevant aspect.",
                    level: 1,
                  },
                },
                {
                  loc_level_id: "loc-level-2",
                  mastery_threshold: 0.8,
                  display_order: 2,
                  solo_level: {
                    id: "solo-2",
                    code: "multistructural",
                    description: "Identify several relevant aspects.",
                    level: 2,
                  },
                },
                {
                  loc_level_id: "loc-level-3",
                  mastery_threshold: 0.8,
                  display_order: 3,
                  solo_level: {
                    id: "solo-3",
                    code: "relational",
                    description: "Integrate the relevant aspects.",
                    level: 3,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    render(<LearningProgress progress={progress} />);

    const concept = screen
      .getByText("Electric Flux")
      .closest('[data-testid="concept-progress"]');

    expect(concept).not.toBeNull();

    const scope = within(concept as HTMLElement);

    expect(scope.getByText("2 of 3 levels mastered")).toBeInTheDocument();

    expect(scope.getByTestId("solo-level-loc-level-1")).toHaveAttribute(
      "data-mastered",
      "true",
    );

    expect(scope.getByTestId("solo-level-loc-level-2")).toHaveAttribute(
      "data-mastered",
      "true",
    );

    expect(scope.getByTestId("solo-level-loc-level-3")).toHaveAttribute(
      "data-mastered",
      "false",
    );

    expect(scope.getByText("Unistructural")).toBeInTheDocument();
    expect(scope.getByText("Multistructural")).toBeInTheDocument();
    expect(scope.getByText("Relational")).toBeInTheDocument();

    expect(
      scope.getByText("Identify one relevant aspect."),
    ).toBeInTheDocument();

    expect(
      scope.getByText("Identify several relevant aspects."),
    ).toBeInTheDocument();

    expect(
      scope.getByText("Integrate the relevant aspects."),
    ).toBeInTheDocument();
  });

  it("does not expose configured mastery thresholds", () => {
    const progress: LearningRecordProgress = {
      learning_record_id: "learning-record-1",
      completed_at: null,

      learning_objectives: [
        {
          id: "lo-1",
          code: "lo1",
          description: "Explain electric flux.",
          display_order: 1,
          mastered_at: null,

          concepts: [
            {
              learning_objective_concept_id: "loc-1",
              is_required: true,
              display_order: 1,
              mastered_loc_level_id: null,
              mastered_at: null,

              concept: {
                id: "concept-1",
                code: "em-c001",
                name: "Electric Flux",
                description: "Electric flux through surfaces.",
              },

              levels: [
                {
                  loc_level_id: "loc-level-1",
                  mastery_threshold: 0.8,
                  display_order: 1,
                  solo_level: {
                    id: "solo-1",
                    code: "unistructural",
                    description: "Identify one relevant aspect.",
                    level: 1,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    render(<LearningProgress progress={progress} />);

    expect(screen.queryByText(/mastery threshold/i)).not.toBeInTheDocument();
    expect(screen.queryByText("80%")).not.toBeInTheDocument();
    expect(screen.getByText("Learning Objective 1")).toBeInTheDocument();
  });

  it("localizes progress labels without translating academic content", () => {
    const progress: LearningRecordProgress = {
      learning_record_id: "learning-record-1",
      completed_at: null,
      learning_objectives: [
        {
          id: "lo-1",
          code: "lo1",
          description: "Explain electric flux.",
          display_order: 1,
          mastered_at: null,
          concepts: [
            {
              learning_objective_concept_id: "loc-1",
              is_required: true,
              display_order: 1,
              mastered_loc_level_id: null,
              mastered_at: null,
              concept: {
                id: "concept-1",
                code: "em-c001",
                name: "Electric Flux",
                description: "Electric flux through surfaces.",
              },
              levels: [],
            },
          ],
        },
      ],
    };

    render(<LearningProgress progress={progress} />, { locale: "id" });

    expect(screen.getByText("Progres Pembelajaran")).toBeInTheDocument();
    expect(screen.getByText("Tujuan Pembelajaran 1")).toBeInTheDocument();
    expect(screen.getByText("Explain electric flux.")).toBeInTheDocument();
    expect(screen.getByText("Electric Flux")).toBeInTheDocument();
    expect(
      screen.getByText("Electric flux through surfaces."),
    ).toBeInTheDocument();
  });
});
