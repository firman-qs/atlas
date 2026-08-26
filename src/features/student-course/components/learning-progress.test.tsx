import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LearningProgress } from "@/features/student-course/components/learning-progress";
import type { LearningRecordProgress } from "@/features/student-course/types";

describe("LearningProgress", () => {
  it("shows SOLO mastery state without exposing the configured mastery threshold", () => {
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
              mastered_loc_level_id: "loc-level-1",
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

    expect(screen.getByText("Electric Flux")).toBeInTheDocument();

    expect(
      screen.getByText("Identify one relevant aspect."),
    ).toBeInTheDocument();

    expect(screen.getByText("Unistructural")).toBeInTheDocument();
    expect(screen.queryByText(/mastery threshold/i)).not.toBeInTheDocument();
    expect(screen.queryByText("80%")).not.toBeInTheDocument();
    expect(screen.getByText("Learning Objective 1")).toBeInTheDocument();
  });
});
