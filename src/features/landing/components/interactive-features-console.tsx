"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BrainCircuit,
  Check,
  Circle,
  ClipboardCheck,
  ListTree,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

interface ConceptData {
  id: string;
  name: string;
  code: string;
  description: string;
  masteredLevels: number;
  totalLevels: number;
  isMastered: boolean;
  levels: {
    name: string;
    stage: string;
    status: "mastered" | "active" | "locked";
    criteria: string;
    promptMath: string;
  }[];
}

const conceptsData: ConceptData[] = [
  {
    id: "coulomb",
    name: "Coulomb's Law & Point Charges",
    code: "PHY-EM-01",
    description: "Calculate scalar and directional electrostatic forces between discrete static point charges.",
    masteredLevels: 3,
    totalLevels: 3,
    isMastered: true,
    levels: [
      {
        name: "Unistructural",
        stage: "Demonstrated",
        status: "mastered",
        criteria: "Recall scalar inverse-square relation and calculate electrostatic force magnitude.",
        promptMath: "Given $q_1 = +2.0\\,\\mu\\text{C}$ and $q_2 = -4.0\\,\\mu\\text{C}$ separated by $r = 0.50\\,\\text{m}$, calculate the electrostatic force magnitude $F = k_e \\frac{|q_1 q_2|}{r^2}$.",
      },
      {
        name: "Multistructural",
        stage: "Demonstrated",
        status: "mastered",
        criteria: "Decompose orthogonal vector forces along coordinate axes and sum resultant forces.",
        promptMath: "Three collinear point charges are situated along the $x$-axis. Determine the net electrostatic force vector $\\vec{F}_{\\text{net}} = \\sum \\vec{F}_i$ acting on the test charge.",
      },
      {
        name: "Relational",
        stage: "Demonstrated",
        status: "mastered",
        criteria: "Integrate Coulomb field definitions with work and electrostatic potential energy.",
        promptMath: "Derive the electrostatic potential energy $U = \\frac{1}{4\\pi\\varepsilon_0}\\sum_{i<j}\\frac{q_i q_j}{r_{ij}}$ for bringing discrete charges from infinity into static configuration.",
      },
    ],
  },
  {
    id: "superposition",
    name: "Electric Field Superposition",
    code: "PHY-EM-02",
    description: "Resolve two-dimensional coordinate field vectors and analyze net superposition.",
    masteredLevels: 1,
    totalLevels: 3,
    isMastered: false,
    levels: [
      {
        name: "Unistructural",
        stage: "Demonstrated",
        status: "mastered",
        criteria: "Calculate individual electric field magnitude $\\vec{E} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q}{r^2} \\hat{r}$ from a single point source.",
        promptMath: "Determine the electric field vector $\\vec{E}$ at a distance $r = 0.30\\,\\text{m}$ from an isolated point charge $q = +5.0\\,\\text{nC}$.",
      },
      {
        name: "Multistructural",
        stage: "Active Assessment",
        status: "active",
        criteria: "Compute vector components and resolve symmetric constructive/destructive cancellation.",
        promptMath: "Two identical point charges $+q$ are placed at $(-d, 0)$ and $(+d, 0)$. Formulate the net field $\\vec{E}_{\\text{net}}(0, y) = 2 E_y \\hat{j} = \\frac{2 k_e q y}{(d^2 + y^2)^{3/2}} \\hat{j}$.",
      },
      {
        name: "Relational",
        stage: "Upcoming",
        status: "locked",
        criteria: "Synthesize field continuous limits, dipole approximations, and gradient transitions for $y \\gg d$.",
        promptMath: "Analyze the asymptotic expansion of $\\vec{E}_{\\text{net}}$ when $y \\gg d$, explaining why dipole fields decay as $1/y^3$.",
      },
    ],
  },
  {
    id: "gauss",
    name: "Gauss's Flux Law on Conductors",
    code: "PHY-EM-03",
    description: "Evaluate surface flux integrals and internal boundary conditions in electrostatic equilibrium.",
    masteredLevels: 0,
    totalLevels: 3,
    isMastered: false,
    levels: [
      {
        name: "Unistructural",
        stage: "Upcoming",
        status: "locked",
        criteria: "State Gauss's Law formula $\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$.",
        promptMath: "Calculate the total electric flux $\\Phi_E$ through a closed spherical surface enclosing a net charge $Q_{\\text{enc}} = +8.85\\,\\text{nC}$.",
      },
      {
        name: "Multistructural",
        stage: "Upcoming",
        status: "locked",
        criteria: "Apply spatial symmetry (spherical, cylindrical, planar) to extract constant field magnitude from the flux integral.",
        promptMath: "Derive the electric field $\\vec{E}(r) = \\frac{\\lambda}{2\\pi\\varepsilon_0 r} \\hat{r}$ outside an infinitely long line of uniform linear charge density $\\lambda$.",
      },
      {
        name: "Relational",
        stage: "Upcoming",
        status: "locked",
        criteria: "Explain why internal $\\vec{E} = 0$ in equilibrium and prove excess charge resides strictly on conductor boundaries.",
        promptMath: "Provide a qualitative proof using Gauss's Law that any arbitrary Gaussian surface drawn inside a conductor in equilibrium encloses zero net charge.",
      },
    ],
  },
];

const realMcqQuestion = {
  prompt:
    "Two positive point charges of equal magnitude $+q$ are fixed on the $x$-axis at $(-d, 0)$ and $(+d, 0)$. Which expression accurately represents the net electric field vector $\\vec{E}_{\\text{net}}$ at an arbitrary point $(0, y)$ on the $y$-axis?",
  options: [
    {
      id: "opt_a",
      text: "$\\vec{E}_{\\text{net}} = \\frac{2 k_e q}{d^2 + y^2} \\hat{\\imath}$",
      isCorrect: false,
      feedback:
        "The horizontal $x$-components point in opposite directions ($E_{1x} = -E_{2x}$) and destructively cancel to zero. The net field has no $\\hat{\\imath}$ component.",
    },
    {
      id: "opt_b",
      text: "$\\vec{E}_{\\text{net}} = \\frac{2 k_e q y}{(d^2 + y^2)^{3/2}} \\hat{\\jmath}$",
      isCorrect: true,
      feedback:
        "Correct. Symmetrical $x$-components cancel ($E_x = 0$) while vertical components add constructively: $E_{\\text{net}} = 2 \\left(\\frac{k_e q}{r^2}\\right) \\sin\\theta = \\frac{2 k_e q y}{(d^2 + y^2)^{3/2}} \\hat{\\jmath}$.",
    },
    {
      id: "opt_c",
      text: "$\\vec{E}_{\\text{net}} = 0$ everywhere along the $y$-axis",
      isCorrect: false,
      feedback:
        "Electrostatic field cancellation occurs only at the origin $(0, 0)$. At points $y > 0$, both upward components point in $+y$, producing a non-zero vertical vector.",
    },
    {
      id: "opt_d",
      text: "$\\vec{E}_{\\text{net}} = \\frac{k_e q}{(d^2 + y^2)^{3/2}} (\\hat{\\imath} + \\hat{\\jmath})$",
      isCorrect: false,
      feedback:
        "This option fails to account for symmetry cancellation along the horizontal coordinate axis.",
    },
  ],
};

const realEssayPrompt =
  "Two positive point charges of equal magnitude $+q$ are located at $(-d, 0)$ and $(+d, 0)$. Explain the step-by-step procedure to determine the net electric field vector $\\vec{E}_{\\text{net}}$ at an arbitrary point $(0, y)$ on the $y$-axis. Detail the vector decomposition and coordinate symmetry.";

const essaySamples = {
  sample1: {
    label: "Example Submission A",
    text: "Each charge creates an electric field pointing away from itself with magnitude $E = \\frac{k_e q}{d^2 + y^2}$. Decomposing into components along the coordinate axes:\n\n1. $E_{1x} = -E \\cos\\theta$ and $E_{2x} = +E \\cos\\theta$, so the horizontal components cancel symmetrically: $E_{\\text{net}, x} = 0$.\n2. $E_{1y} = E_{2y} = E \\sin\\theta$, where $\\sin\\theta = \\frac{y}{\\sqrt{d^2 + y^2}}$.\n\nSumming the vertical components yields $\\vec{E}_{\\text{net}} = \\frac{2 k_e q y}{(d^2 + y^2)^{3/2}} \\hat{\\jmath}$.",
    feedback:
      "**Formative Assessment Feedback**:\n- **Conceptual Demonstration**: Accurately explains vector decomposition and symmetric cancellation along the $x$-axis.\n- **Mathematical Formulation**: Complete derivation of vertical constructive interference $\\vec{E}_{\\text{net}} = \\frac{2 k_e q y}{(d^2 + y^2)^{3/2}} \\hat{\\jmath}$.\n- **Next Progression Step**: Ready to explore asymptotic behavior at large distances ($y \\gg d$) at the Relational level.",
    status: "Criteria Met",
  },
  sample2: {
    label: "Example Submission B",
    text: "The distance from each charge to $(0, y)$ is $r = \\sqrt{d^2 + y^2}$. Using Coulomb's formula $E = \\frac{k_e q}{r^2}$, the two fields cancel because both charges are positive and push against each other.",
    feedback:
      "**Formative Diagnostic Guidance**:\n- **Identified Gap**: Correctly calculates the distance $r$, but assumes fields cancel completely in all directions.\n- **Guiding Hint**: Notice that while horizontal components oppose each other, both charges produce an upward field along the $+y$ direction. How do the vertical components combine?",
    status: "Formative Cycle Active",
  },
};

const chatScenarios = [
  {
    id: "equilibrium",
    title: "Zero Field in Conductors",
    question: "Why must the electric field inside a solid conductor in electrostatic equilibrium be zero?",
    response:
      "In electrostatic equilibrium, mobile charges inside the conductor move in response to any internal electric field. Free electrons redistribute to the outer surface until they establish an induced surface field that exactly cancels the internal field, ensuring $\\vec{E} = 0$ everywhere within the interior bulk.",
    citation: "Chapter 22 · Gauss's Law on Conductors (PHYS102 Section 01)",
  },
  {
    id: "potential",
    title: "Field vs. Potential",
    question: "If the electric field is zero in a region, does the electrostatic potential also have to be zero?",
    response:
      "No. The electric field is related to potential by $\\vec{E} = -\\vec{\\nabla} V$. If $\\vec{E} = 0$ throughout a region, $V$ is spatially uniform (an equipotential region), not necessarily zero. For example, the interior of a charged conductor has constant potential $V = V_{\\text{surface}}$.",
    citation: "Chapter 23 · Electric Potential Gradients",
  },
  {
    id: "dipole",
    title: "Dipole Distance Scaling",
    question: "Why does an electric dipole field fall off as $1/r^3$ while a monopole falls off as $1/r^2$?",
    response:
      "Because the positive and negative charges $+q$ and $-q$ are separated by distance $d$, their opposing $1/r^2$ monopole fields nearly cancel at large distances. The leading non-zero term in the multipole expansion is the dipole moment $\\vec{p} = q\\vec{d}$, whose field scales as $\\frac{p}{r^3}$.",
    citation: "Chapter 21 · Dipole Vector Superposition",
  },
];

export function InteractiveFeaturesConsole() {
  // Tab 1: Concept & SOLO Stepper state
  const [selectedConceptId, setSelectedConceptId] = useState<string>("superposition");
  const [selectedSoloStage, setSelectedSoloStage] = useState<number>(1);

  // Tab 2: Assessment Mode & Evaluation state
  const [assessmentType, setAssessmentType] = useState<"essay" | "mcq">("essay");
  const [activeEssayKey, setActiveEssayKey] = useState<"sample1" | "sample2">("sample1");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(true);
  const [selectedMcqId, setSelectedMcqId] = useState<string | null>(null);

  // Tab 3: Chat Scenario state
  const [activeChatIndex, setActiveChatIndex] = useState<number>(0);
  const [userCustomFollowUp, setUserCustomFollowUp] = useState<string>("");

  // Tab 4: Instructor Filter state
  const [cohortFilter, setCohortFilter] = useState<"all" | "support" | "mastered">("all");

  const currentConcept =
    conceptsData.find((c) => c.id === selectedConceptId) ?? conceptsData[1];

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setShowFeedback(true);
    }, 500);
  };

  return (
    <section id="capabilities" className="relative scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">
            Platform Capabilities
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Built for deep conceptual progression
          </h2>

          <p className="mt-3 text-base text-muted-foreground">
            Explore authentic ATLAS interfaces for conceptual progress tracking,
            formative assessment with KaTeX math, course-grounded AI tutoring, and curriculum governance.
          </p>
        </ScrollReveal>

        {/* Shadcn Tabs Navigation */}
        <Tabs defaultValue="progress" className="mt-10">
          <ScrollReveal delayMs={100} className="flex justify-center">
            <TabsList className="h-10 p-1 bg-muted/80 backdrop-blur-sm">
              <TabsTrigger value="progress" className="gap-2 text-xs font-medium">
                <ListTree className="size-3.5" />
                <span>Learning Progress</span>
              </TabsTrigger>

              <TabsTrigger value="assessment" className="gap-2 text-xs font-medium">
                <ClipboardCheck className="size-3.5" />
                <span>Formative Assessment</span>
              </TabsTrigger>

              <TabsTrigger value="chat" className="gap-2 text-xs font-medium">
                <Image
                  src="/mascot.png"
                  alt="ATLAS AI Companion Mascot"
                  width={16}
                  height={16}
                  className="size-4 object-contain"
                />
                <span>AI Learning Assistant</span>
              </TabsTrigger>

              <TabsTrigger value="instructor" className="gap-2 text-xs font-medium">
                <BrainCircuit className="size-3.5" />
                <span>Instructor Governance</span>
              </TabsTrigger>
            </TabsList>
          </ScrollReveal>

          {/* TAB 1: AUTHENTIC LEARNING PROGRESS SLICE */}
          <TabsContent value="progress" id="progression" className="mt-6">
            <ScrollReveal delayMs={150}>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          PHYS102
                        </Badge>
                        <Badge variant="secondary">In Progress</Badge>
                      </div>
                      <CardTitle className="mt-1.5 text-lg font-semibold">
                        General Physics II: Electromagnetism
                      </CardTitle>
                      <CardDescription>
                        Learning Objective 01: Electrostatic Fields and Vector Superposition
                      </CardDescription>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">Objective Mastery</p>
                      <p className="text-base font-semibold tabular-nums">
                        {currentConcept.isMastered ? "2 of 3" : "1 of 3"} Concepts Mastered
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <Progress
                      value={
                        selectedConceptId === "coulomb"
                          ? 100
                          : selectedConceptId === "superposition"
                          ? 50
                          : 15
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Selectable Concept Rows */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ordered Concepts (Click to Inspect)
                    </p>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {conceptsData.map((concept) => {
                        const isSelected = selectedConceptId === concept.id;

                        return (
                          <button
                            key={concept.id}
                            type="button"
                            onClick={() => {
                              setSelectedConceptId(concept.id);
                              setSelectedSoloStage(concept.isMastered ? 2 : 1);
                            }}
                            className={`flex flex-col justify-between rounded-lg border p-3 text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                                : "bg-card hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="font-mono text-[10px]">
                                {concept.code}
                              </Badge>
                              {concept.isMastered ? (
                                <Badge className="gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-600 text-white">
                                  <Check className="size-2.5" />
                                  Mastered
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">
                                  In Progress
                                </Badge>
                              )}
                            </div>

                            <p className="mt-2 text-xs font-semibold text-foreground line-clamp-1">
                              {concept.name}
                            </p>

                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {concept.masteredLevels} of {concept.totalLevels} levels mastered
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configured SOLO Stepper & Math Problem Preview */}
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {currentConcept.name} — Configured SOLO Levels
                        </p>
                        <p className="text-xs text-muted-foreground">{currentConcept.description}</p>
                      </div>

                      <span className="text-[11px] font-mono text-muted-foreground">
                        Click level to view math prompt
                      </span>
                    </div>

                    {/* Stepper Buttons */}
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {currentConcept.levels.map((lvl, idx) => {
                        const isStageActive = selectedSoloStage === idx;

                        return (
                          <button
                            key={lvl.name}
                            type="button"
                            onClick={() => setSelectedSoloStage(idx)}
                            className={`flex items-start gap-2.5 rounded-md border p-2.5 text-left transition-all ${
                              isStageActive
                                ? "border-primary bg-background shadow-xs ring-1 ring-primary/30"
                                : "bg-background/80 hover:bg-background"
                            }`}
                          >
                            <div className="mt-0.5">
                              {lvl.status === "mastered" ? (
                                <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                  <Check className="size-3" />
                                </div>
                              ) : lvl.status === "active" ? (
                                <div className="flex size-5 items-center justify-center rounded-full border-2 border-primary bg-background">
                                  <span className="size-1.5 rounded-full bg-primary" />
                                </div>
                              ) : (
                                <div className="flex size-5 items-center justify-center rounded-full border bg-muted">
                                  <Circle className="size-2 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">
                                {idx + 1}. {lvl.name}
                              </p>
                              <p
                                className={`text-[10px] font-medium ${
                                  lvl.status === "mastered"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : lvl.status === "active"
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {lvl.stage}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Rich Text KaTeX Math Viewer */}
                    <div className="rounded-md border bg-background p-4 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {currentConcept.levels[selectedSoloStage]?.name} Level Assessment Focus:
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          KaTeX Math Render
                        </Badge>
                      </div>

                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Rubric Criteria: </span>
                        {currentConcept.levels[selectedSoloStage]?.criteria}
                      </p>

                      <div className="border-t pt-2.5">
                        <p className="font-medium text-foreground mb-1 text-[11px]">Representative Prompt:</p>
                        <AtlasRichTextViewer
                          value={currentConcept.levels[selectedSoloStage]?.promptMath ?? ""}
                          className="text-xs leading-relaxed text-foreground bg-muted/30 p-2.5 rounded border"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>

          {/* TAB 2: AUTHENTIC FORMATIVE ASSESSMENT RUNNER SLICE */}
          <TabsContent value="assessment" className="mt-6">
            <ScrollReveal delayMs={150}>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-3 border-b">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-base">Assessment Question</h3>
                      <Badge variant="secondary">
                        {assessmentType === "mcq" ? "Multiple Choice" : "Essay"}
                      </Badge>
                      <Badge variant="outline">Cycle 1</Badge>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 rounded-md border p-0.5 bg-muted/40">
                      <Button
                        variant={assessmentType === "essay" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => setAssessmentType("essay")}
                      >
                        Essay Question
                      </Button>
                      <Button
                        variant={assessmentType === "mcq" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => setAssessmentType("mcq")}
                      >
                        Multiple Choice (MCQ)
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-5">
                  {/* Question Workspace with AtlasRichTextViewer */}
                  <section className="rounded-xl border bg-muted/20 p-4 sm:p-5">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Question
                    </p>
                    <AtlasRichTextViewer
                      value={assessmentType === "essay" ? realEssayPrompt : realMcqQuestion.prompt}
                      className="text-sm leading-relaxed"
                    />
                  </section>

                  {/* Answer Section */}
                  {assessmentType === "essay" ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-medium text-foreground">
                          Sample Student Submissions:
                        </p>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant={activeEssayKey === "sample1" ? "secondary" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setActiveEssayKey("sample1");
                              setShowFeedback(true);
                            }}
                          >
                            {essaySamples.sample1.label}
                          </Button>
                          <Button
                            variant={activeEssayKey === "sample2" ? "secondary" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setActiveEssayKey("sample2");
                              setShowFeedback(true);
                            }}
                          >
                            {essaySamples.sample2.label}
                          </Button>
                        </div>
                      </div>

                      {/* Submitted Essay with Math Viewer */}
                      <div className="rounded-lg border bg-card p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
                          Student Written Response
                        </p>
                        <AtlasRichTextViewer
                          value={essaySamples[activeEssayKey].text}
                          className="text-xs leading-relaxed"
                        />
                      </div>

                      {/* Submit / Re-evaluate Button */}
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          onClick={handleRunEvaluation}
                          disabled={isEvaluating}
                          className="gap-1.5 text-xs"
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              Evaluating response...
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-3.5" />
                              Submit response
                            </>
                          )}
                        </Button>

                        <Badge
                          variant="outline"
                          className={
                            essaySamples[activeEssayKey].status === "Criteria Met"
                              ? "text-emerald-600 border-emerald-500/40"
                              : "text-amber-600 border-amber-500/40"
                          }
                        >
                          {essaySamples[activeEssayKey].status}
                        </Badge>
                      </div>

                      {/* Formative Feedback Card rendered with AtlasRichTextViewer */}
                      {showFeedback && (
                        <div className="rounded-xl border bg-muted/30 p-4 space-y-2 animate-in fade-in duration-300">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-primary" />
                            Formative Evaluation & Feedback
                          </p>
                          <AtlasRichTextViewer
                            value={essaySamples[activeEssayKey].feedback}
                            className="text-xs text-muted-foreground leading-relaxed"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Authentic MCQ Runner */
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Choose the best answer, then inspect diagnostic feedback:
                      </p>

                      <div className="space-y-2.5">
                        {realMcqQuestion.options.map((opt) => {
                          const isSelected = selectedMcqId === opt.id;

                          return (
                            <div
                              key={opt.id}
                              onClick={() => setSelectedMcqId(opt.id)}
                              className={`cursor-pointer rounded-lg border p-3 text-xs transition-all ${
                                isSelected
                                  ? opt.isCorrect
                                    ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                                    : "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30"
                                  : "bg-card hover:bg-muted/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <AtlasRichTextViewer value={opt.text} className="text-xs" />
                                </div>

                                {isSelected && (
                                  <Badge
                                    className={`shrink-0 text-[10px] ${
                                      opt.isCorrect
                                        ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                        : "bg-amber-600 hover:bg-amber-600 text-white"
                                    }`}
                                  >
                                    {opt.isCorrect ? "Correct Option" : "Distractor"}
                                  </Badge>
                                )}
                              </div>

                              {isSelected && (
                                <div className="mt-2.5 border-t pt-2 text-[11px] text-muted-foreground leading-relaxed">
                                  <span className="font-semibold text-foreground">Diagnostic Feedback: </span>
                                  {opt.feedback}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>

          {/* TAB 3: AUTHENTIC COURSE-GROUNDED AI TUTOR SLICE */}
          <TabsContent value="chat" className="mt-6">
            <ScrollReveal delayMs={150}>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-3 border-b">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative size-8 overflow-hidden rounded-lg">
                        <Image
                          src="/mascot.png"
                          alt="ATLAS AI Companion Mascot"
                          width={32}
                          height={32}
                          className="size-full object-contain drop-shadow-xs"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          ATLAS Course Learning Assistant
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Grounded in: PHYS102 · Section 01 Electromagnetism Course Offering
                        </CardDescription>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-xs">
                      Verified Curriculum
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-5">
                  {/* Interactive Prompt Chips */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Sample Student Inquiries (Click to Switch):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {chatScenarios.map((sc, idx) => (
                        <Button
                          key={sc.id}
                          variant={activeChatIndex === idx ? "secondary" : "outline"}
                          size="sm"
                          className="h-7 text-xs font-medium"
                          onClick={() => setActiveChatIndex(idx)}
                        >
                          {sc.title}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Dialogue Conversation */}
                  <div className="space-y-3 rounded-lg border bg-muted/10 p-4">
                    {/* Student Question */}
                    <div className="flex items-start justify-end gap-2.5">
                      <div className="max-w-md rounded-lg bg-primary px-3.5 py-2 text-xs text-primary-foreground">
                        {chatScenarios[activeChatIndex].question}
                      </div>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="size-3.5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* AI Tutor Response with Math Rendering */}
                    <div className="flex items-start gap-2.5">
                      <div className="relative size-7 shrink-0 overflow-hidden">
                        <Image
                          src="/mascot.png"
                          alt="ATLAS AI Mascot Avatar"
                          width={28}
                          height={28}
                          className="size-full object-contain drop-shadow-xs"
                        />
                      </div>
                      <div className="max-w-lg space-y-2 rounded-lg border bg-card p-3.5 text-xs leading-relaxed">
                        <AtlasRichTextViewer
                          value={chatScenarios[activeChatIndex].response}
                          className="text-xs leading-relaxed"
                        />
                        <div className="border-t pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">Grounding Source:</span>
                          <span>{chatScenarios[activeChatIndex].citation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Input Mockup */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask a clarifying question about electric fields..."
                      value={userCustomFollowUp}
                      onChange={(e) => setUserCustomFollowUp(e.target.value)}
                      className="flex-1 rounded-md border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:border-primary"
                    />
                    <Button size="sm" className="h-8 gap-1.5 text-xs">
                      <Send className="size-3" />
                      Ask Tutor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>

          {/* TAB 4: AUTHENTIC INSTRUCTOR GOVERNANCE SLICE */}
          <TabsContent value="instructor" className="mt-6">
            <ScrollReveal delayMs={150}>
              <div className="space-y-4">
                {/* Interactive Metric Cards */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card
                    onClick={() => setCohortFilter("all")}
                    className={`cursor-pointer transition-all ${
                      cohortFilter === "all" ? "border-primary bg-primary/5 shadow-xs" : "hover:bg-muted/30"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Enrolled Students</span>
                        <Badge variant="outline" className="text-[10px]">Active</Badge>
                      </div>
                      <p className="mt-1 text-2xl font-semibold">42</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Section 01 · Odd 2025/2026</p>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setCohortFilter("support")}
                    className={`cursor-pointer transition-all ${
                      cohortFilter === "support" ? "border-amber-500 bg-amber-500/5 shadow-xs" : "hover:bg-muted/30"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Formative Cycles Active</span>
                        <Badge variant="outline" className="text-[10px] text-amber-600">Pending</Badge>
                      </div>
                      <p className="mt-1 text-2xl font-semibold">18</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Diagnostic intervention in progress</p>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setCohortFilter("mastered")}
                    className={`cursor-pointer transition-all ${
                      cohortFilter === "mastered" ? "border-emerald-500 bg-emerald-500/5 shadow-xs" : "hover:bg-muted/30"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Concept Mastery Rate</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-600">Progressing</Badge>
                      </div>
                      <p className="mt-1 text-2xl font-semibold">76%</p>
                      <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Above target milestone
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Question Bank Authoring Table */}
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          Curriculum & Question Bank Repositories
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Calibrated question items linked to configured SOLO objectives
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">3 Repositories Active</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between rounded-md border p-3 bg-card hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground">PHY-EM-01: Coulomb&apos;s Law</p>
                        <p className="text-[11px] text-muted-foreground">6 MCQ Items · 2 Qualitative Essay Prompts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Published</Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Edit Bank
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3 bg-card hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground">PHY-EM-02: Field Superposition</p>
                        <p className="text-[11px] text-muted-foreground">8 MCQ Items · 4 Qualitative Essay Prompts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Published</Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Edit Bank
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3 bg-card hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground">PHY-EM-03: Gauss&apos;s Flux Law</p>
                        <p className="text-[11px] text-muted-foreground">5 MCQ Items · 3 Qualitative Essay Prompts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Drafting</Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Edit Bank
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollReveal>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
