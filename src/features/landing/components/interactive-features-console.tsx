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

import { useTranslations } from "next-intl";
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
  const t = useTranslations("landing.capabilities");

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
    <section id="features" className="relative scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">
            {t("badge")}
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>

          <p className="mt-3 text-base text-muted-foreground">
            {t("description")}
          </p>
        </ScrollReveal>

        {/* Shadcn Tabs Navigation */}
        <Tabs defaultValue="progress" className="mt-10">
          <ScrollReveal delayMs={100} className="flex justify-center">
            <TabsList className="h-11 p-1 bg-muted/80 backdrop-blur-sm">
              <TabsTrigger value="progress" className="gap-2 text-xs sm:text-sm font-medium px-3.5">
                <ListTree className="size-4" />
                <span>{t("tabs.progress")}</span>
              </TabsTrigger>

              <TabsTrigger value="assessment" className="gap-2 text-xs sm:text-sm font-medium px-3.5">
                <ClipboardCheck className="size-4" />
                <span>{t("tabs.assessment")}</span>
              </TabsTrigger>

              <TabsTrigger value="chat" className="gap-2 text-xs sm:text-sm font-medium px-3.5">
                <Image
                  src="/mascot.png"
                  alt="ATLAS AI Companion Mascot"
                  width={18}
                  height={18}
                  className="size-4.5 object-contain"
                />
                <span>{t("tabs.chat")}</span>
              </TabsTrigger>

              <TabsTrigger value="instructor" className="gap-2 text-xs sm:text-sm font-medium px-3.5">
                <BrainCircuit className="size-4" />
                <span>{t("tabs.instructor")}</span>
              </TabsTrigger>
            </TabsList>
          </ScrollReveal>

          {/* TAB 1: AUTHENTIC LEARNING PROGRESS SLICE */}
          <TabsContent value="progress" className="mt-6">
            <ScrollReveal delayMs={150}>
              <Card className="border border-border/80 bg-background/60 dark:bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 shadow-xs transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-5 border-b">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          PHYS102
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800">{t("progress.inProgress")}</Badge>
                      </div>
                      <CardTitle className="mt-2 text-xl font-semibold">
                        {t("progress.courseTitle")}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {t("progress.objectiveTitle")}
                      </CardDescription>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm text-muted-foreground">{t("progress.objectiveMastery")}</p>
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {t("progress.conceptsMastered", {
                          mastered: currentConcept.isMastered ? 2 : 1,
                          total: 3,
                        })}
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

                <CardContent className="space-y-5 p-5 sm:p-6">
                  {/* Selectable Concept Rows */}
                  <div className="space-y-2.5">
                    <p className="text-sm font-semibold text-foreground">
                      {t("progress.orderedConcepts")}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3">
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
                            className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-500/30"
                                : "bg-card/50 hover:bg-muted/40 backdrop-blur-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {concept.code}
                              </Badge>
                              {concept.isMastered ? (
                                <Badge className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-600 text-white">
                                  <Check className="size-3" />
                                  {t("progress.mastered")}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {t("progress.inProgress")}
                                </Badge>
                              )}
                            </div>

                            <p className="mt-3 text-sm font-semibold text-foreground line-clamp-1">
                              {concept.name}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {t("progress.levelsMastered", {
                                mastered: concept.masteredLevels,
                                total: concept.totalLevels,
                              })}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configured SOLO Stepper & Math Problem Preview */}
                  <div className="rounded-xl border bg-muted/20 backdrop-blur-xs p-5 space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t("progress.configuredSoloLevels", { name: currentConcept.name })}
                        </p>
                        <p className="text-sm text-muted-foreground">{currentConcept.description}</p>
                      </div>

                      <span className="text-xs font-mono text-muted-foreground">
                        {t("progress.clickLevelHint")}
                      </span>
                    </div>

                    {/* Stepper Buttons */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      {currentConcept.levels.map((lvl, idx) => {
                        const isStageActive = selectedSoloStage === idx;

                        const stageLabel =
                          lvl.status === "mastered"
                            ? t("progress.demonstrated")
                            : lvl.status === "active"
                            ? t("progress.activeAssessment")
                            : t("progress.upcoming");

                        return (
                          <button
                            key={lvl.name}
                            type="button"
                            onClick={() => setSelectedSoloStage(idx)}
                            className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all ${
                              isStageActive
                                ? "border-primary bg-background/80 shadow-xs ring-1 ring-primary/30"
                                : "bg-background/60 hover:bg-background/80"
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
                              <p className="text-sm font-semibold text-foreground">
                                {idx + 1}. {lvl.name}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  lvl.status === "mastered"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : lvl.status === "active"
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {stageLabel}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Rich Text KaTeX Math Viewer */}
                    <div className="rounded-lg border bg-background/70 backdrop-blur-xs p-4 sm:p-5 text-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          {t("progress.levelAssessmentFocus", {
                            level: currentConcept.levels[selectedSoloStage]?.name ?? "",
                          })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {t("progress.katexMathRender")}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">{t("progress.rubricCriteria")} </span>
                        {currentConcept.levels[selectedSoloStage]?.criteria}
                      </p>

                      <div className="border-t border-border/60 pt-3">
                        <p className="font-medium text-foreground mb-1.5 text-xs sm:text-sm">{t("progress.representativePrompt")}</p>
                        <AtlasRichTextViewer
                          value={currentConcept.levels[selectedSoloStage]?.promptMath ?? ""}
                          className="text-sm leading-relaxed text-foreground bg-muted/30 p-3.5 rounded-lg border"
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
              <Card className="border border-border/80 bg-background/60 dark:bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 shadow-xs transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-4 border-b">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-semibold text-lg">{t("assessment.questionTitle")}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {assessmentType === "mcq" ? t("assessment.multipleChoice") : t("assessment.essay")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{t("assessment.cycle1")}</Badge>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/40 backdrop-blur-xs">
                      <Button
                        variant={assessmentType === "essay" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 text-xs sm:text-sm px-3 font-medium"
                        onClick={() => setAssessmentType("essay")}
                      >
                        {t("assessment.essayQuestion")}
                      </Button>
                      <Button
                        variant={assessmentType === "mcq" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 text-xs sm:text-sm px-3 font-medium"
                        onClick={() => setAssessmentType("mcq")}
                      >
                        {t("assessment.mcqOption")}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-5 sm:p-6">
                  {/* Question Workspace with AtlasRichTextViewer */}
                  <section className="rounded-xl border bg-muted/20 backdrop-blur-xs p-4 sm:p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("assessment.questionLabel")}
                    </p>
                    <AtlasRichTextViewer
                      value={assessmentType === "essay" ? realEssayPrompt : realMcqQuestion.prompt}
                      className="text-sm sm:text-base leading-relaxed"
                    />
                  </section>

                  {/* Answer Section */}
                  {assessmentType === "essay" ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          {t("assessment.sampleSubmissions")}
                        </p>

                        <div className="flex items-center gap-2">
                          <Button
                            variant={activeEssayKey === "sample1" ? "secondary" : "outline"}
                            size="sm"
                            className="h-8 text-xs sm:text-sm px-3 font-medium"
                            onClick={() => {
                              setActiveEssayKey("sample1");
                              setShowFeedback(true);
                            }}
                          >
                            {t("assessment.sample1Label")}
                          </Button>
                          <Button
                            variant={activeEssayKey === "sample2" ? "secondary" : "outline"}
                            size="sm"
                            className="h-8 text-xs sm:text-sm px-3 font-medium"
                            onClick={() => {
                              setActiveEssayKey("sample2");
                              setShowFeedback(true);
                            }}
                          >
                            {t("assessment.sample2Label")}
                          </Button>
                        </div>
                      </div>

                      {/* Submitted Essay with Math Viewer */}
                      <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                          {t("assessment.studentWrittenResponse")}
                        </p>
                        <AtlasRichTextViewer
                          value={essaySamples[activeEssayKey].text}
                          className="text-sm sm:text-base leading-relaxed text-foreground"
                        />
                      </div>

                      {/* Submit / Re-evaluate Button */}
                      <div className="flex items-center justify-between pt-1">
                        <Button
                          size="default"
                          onClick={handleRunEvaluation}
                          disabled={isEvaluating}
                          className="gap-2 text-sm font-medium"
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              {t("assessment.evaluating")}
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-4" />
                              {t("assessment.submitResponse")}
                            </>
                          )}
                        </Button>

                        <Badge
                          variant="outline"
                          className={`text-xs sm:text-sm font-medium ${
                            essaySamples[activeEssayKey].status === "Criteria Met"
                              ? "text-emerald-600 border-emerald-500/40"
                              : "text-amber-600 border-amber-500/40"
                          }`}
                        >
                          {essaySamples[activeEssayKey].status === "Criteria Met"
                            ? t("assessment.criteriaMet")
                            : t("assessment.formativeCycleActive")}
                        </Badge>
                      </div>

                      {/* Formative Feedback Card rendered with AtlasRichTextViewer */}
                      {showFeedback && (
                        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 backdrop-blur-xs p-4 sm:p-5 space-y-2.5 animate-in fade-in duration-300">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
                            {t("assessment.formativeEvaluationFeedback")}
                          </p>
                          <AtlasRichTextViewer
                            value={essaySamples[activeEssayKey].feedback}
                            className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Authentic MCQ Runner */
                    <div className="space-y-3.5">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("assessment.mcqChooseInstruction")}
                      </p>

                      <div className="space-y-3">
                        {realMcqQuestion.options.map((opt) => {
                          const isSelected = selectedMcqId === opt.id;

                          return (
                            <div
                              key={opt.id}
                              onClick={() => setSelectedMcqId(opt.id)}
                              className={`cursor-pointer rounded-xl border p-4 text-sm transition-all ${
                                isSelected
                                  ? opt.isCorrect
                                    ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                                    : "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30"
                                  : "bg-card/50 hover:bg-muted/40 backdrop-blur-xs"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <AtlasRichTextViewer value={opt.text} className="text-sm sm:text-base" />
                                </div>

                                {isSelected && (
                                  <Badge
                                    className={`shrink-0 text-xs ${
                                      opt.isCorrect
                                        ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                        : "bg-amber-600 hover:bg-amber-600 text-white"
                                    }`}
                                  >
                                    {opt.isCorrect ? t("assessment.correctOption") : t("assessment.distractor")}
                                  </Badge>
                                )}
                              </div>

                              {isSelected && (
                                <div className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground leading-relaxed">
                                  <span className="font-semibold text-foreground">{t("assessment.diagnosticFeedbackLabel")} </span>
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
              <Card className="border border-border/80 bg-background/60 dark:bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 shadow-xs transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-4 border-b">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative size-9 overflow-hidden rounded-lg">
                        <Image
                          src="/mascot.png"
                          alt="ATLAS AI Companion Mascot"
                          width={36}
                          height={36}
                          className="size-full object-contain drop-shadow-xs"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {t("chat.title")}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {t("chat.groundedIn")}
                        </CardDescription>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {t("chat.verifiedCurriculum")}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-5 sm:p-6">
                  {/* Interactive Prompt Chips */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("chat.sampleInquiries")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chatScenarios.map((sc, idx) => (
                        <Button
                          key={sc.id}
                          variant={activeChatIndex === idx ? "secondary" : "outline"}
                          size="sm"
                          className="h-8 text-xs sm:text-sm font-medium px-3"
                          onClick={() => setActiveChatIndex(idx)}
                        >
                          {sc.title}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Dialogue Conversation */}
                  <div className="space-y-4 rounded-xl border bg-muted/10 backdrop-blur-xs p-4 sm:p-5">
                    {/* Student Question */}
                    <div className="flex items-start justify-end gap-3">
                      <div className="max-w-lg rounded-2xl bg-primary px-4 py-2.5 text-sm sm:text-base text-primary-foreground leading-relaxed">
                        {chatScenarios[activeChatIndex].question}
                      </div>
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="size-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* AI Tutor Response with Math Rendering */}
                    <div className="flex items-start gap-3">
                      <div className="relative size-8 shrink-0 overflow-hidden">
                        <Image
                          src="/mascot.png"
                          alt="ATLAS AI Mascot Avatar"
                          width={32}
                          height={32}
                          className="size-full object-contain drop-shadow-xs"
                        />
                      </div>
                      <div className="max-w-xl space-y-3 rounded-2xl border bg-card/60 backdrop-blur-xs p-4 sm:p-5 text-sm sm:text-base leading-relaxed">
                        <AtlasRichTextViewer
                          value={chatScenarios[activeChatIndex].response}
                          className="text-sm sm:text-base leading-relaxed"
                        />
                        <div className="border-t border-border/60 pt-2.5 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{t("chat.groundingSource")}</span>
                          <span>{chatScenarios[activeChatIndex].citation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Input Mockup */}
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      placeholder={t("chat.inputPlaceholder")}
                      value={userCustomFollowUp}
                      onChange={(e) => setUserCustomFollowUp(e.target.value)}
                      className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-hidden focus:border-primary"
                    />
                    <Button size="default" className="gap-2 text-sm font-medium">
                      <Send className="size-3.5" />
                      {t("chat.askButton")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>

          {/* TAB 4: AUTHENTIC INSTRUCTOR GOVERNANCE SLICE */}
          <TabsContent value="instructor" className="mt-6">
            <ScrollReveal delayMs={150}>
              <div className="space-y-5">
                {/* Interactive Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card
                    onClick={() => setCohortFilter("all")}
                    className={`cursor-pointer transition-all border border-border/80 bg-background/60 dark:bg-background/40 backdrop-blur-md ${
                      cohortFilter === "all" ? "border-primary bg-primary/5 shadow-xs" : "hover:bg-muted/30"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>{t("instructor.enrolledStudents")}</span>
                        <Badge variant="outline" className="text-xs">{t("instructor.active")}</Badge>
                      </div>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">42</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t("instructor.sectionTerm")}</p>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setCohortFilter("support")}
                    className={`cursor-pointer transition-all border border-border/80 bg-background/60 dark:bg-background/40 backdrop-blur-md ${
                      cohortFilter === "support" ? "border-amber-500 bg-amber-500/5 shadow-xs" : "hover:bg-muted/30"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>{t("instructor.formativeCyclesActive")}</span>
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/40">{t("instructor.pending")}</Badge>
                      </div>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">18</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t("instructor.interventionInProgress")}</p>
                    </CardContent>
                  </Card>

                  <Card
                    onClick={() => setCohortFilter("mastered")}
                    className={`cursor-pointer transition-all border border-border/80 bg-background/60 dark:bg-background/40 backdrop-blur-md ${
                      cohortFilter === "mastered" ? "border-emerald-500 bg-emerald-500/5 shadow-xs" : "hover:bg-muted/30"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                        <span>{t("instructor.conceptMasteryRate")}</span>
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/40">{t("instructor.progressing")}</Badge>
                      </div>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">76%</p>
                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {t("instructor.aboveTargetMilestone")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Question Bank Authoring Table */}
                <Card className="border border-border/80 bg-background/60 dark:bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 shadow-xs">
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {t("instructor.repoTitle")}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {t("instructor.repoDescription")}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">{t("instructor.repositoriesActive")}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 text-sm space-y-3">
                    <div className="flex items-center justify-between rounded-xl border p-4 bg-card hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">PHY-EM-01: Coulomb&apos;s Law</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("instructor.coulombStats")}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="text-xs">{t("instructor.published")}</Badge>
                        <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm">
                          {t("instructor.editBank")}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border p-4 bg-card hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">PHY-EM-02: Field Superposition</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("instructor.superpositionStats")}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="text-xs">{t("instructor.published")}</Badge>
                        <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm">
                          {t("instructor.editBank")}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border p-4 bg-card hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">PHY-EM-03: Gauss&apos;s Flux Law</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t("instructor.gaussStats")}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Badge variant="secondary" className="text-xs">{t("instructor.drafting")}</Badge>
                        <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm">
                          {t("instructor.editBank")}
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
