import { useParams, useLocation } from "wouter";
import { useState as useStateReact, useEffect, useRef } from "react";
import {
  useGetCandidate,
  useUpdateCandidate,
  useListInterviews,
  useListFeedback,
  useCreateInterview,
  useCreateFeedback,
  getGetCandidateQueryKey,
  getListInterviewsQueryKey,
  getListFeedbackQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, Calendar, MessageSquare, Plus, FileText, Brain, Upload, CheckCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StageBadge } from "@/components/StageBadge";
import { StarRating } from "@/components/StarRating";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const STAGES = ["applied","screening","technical","hr_interview","final_interview","offer","hired","rejected","withdrawn"];
const INTERVIEW_TYPES = ["screening","technical","hr_interview","final_interview","case_study"];
const RECOMMENDATIONS = ["strong_yes","yes","neutral","no","strong_no"];

const interviewSchema = z.object({
  type: z.string().min(1),
  scheduledAt: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
  interviewerName: z.string().optional(),
  interviewerEmail: z.string().optional(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  notes: z.string().optional(),
});
type InterviewForm = z.infer<typeof interviewSchema>;

const feedbackSchema = z.object({
  interviewId: z.coerce.number().min(1, "Select an interview"),
  reviewerName: z.string().min(1, "Reviewer name required"),
  reviewerEmail: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
  technicalScore: z.coerce.number().min(1).max(5).optional(),
  culturalScore: z.coerce.number().min(1).max(5).optional(),
  communicationScore: z.coerce.number().min(1).max(5).optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  recommendation: z.string().min(1),
  notes: z.string().optional(),
});
type FeedbackForm = z.infer<typeof feedbackSchema>;

function CvSection({ candidateId }: { candidateId: number }) {
  const [cvAnalysis, setCvAnalysis] = useStateReact<Record<string, unknown> | null>(null);
  const [cvPath, setCvPath] = useStateReact<string | null>(null);
  const [uploading, setUploading] = useStateReact(false);
  const [analyzing, setAnalyzing] = useStateReact(false);
  const [extracting, setExtracting] = useStateReact(false);
  const [cvText, setCvText] = useStateReact("");
  const [expanded, setExpanded] = useStateReact(false);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/cv-analysis`)
      .then(r => r.json())
      .then(data => { setCvAnalysis(data.analysis); setCvPath(data.cvPath); })
      .catch(() => {});
  }, [candidateId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);
    const res = await fetch(`/api/candidates/${candidateId}/cv`, { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setCvPath(data.cvPath);
      toast({ title: "CV subido correctamente" });
    } else {
      toast({ title: "Error al subir el CV", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleExtractText = async () => {
    setExtracting(true);
    const res = await fetch(`/api/candidates/${candidateId}/cv-text`);
    if (res.ok) {
      const data = await res.json();
      setCvText(data.text);
      toast({ title: "Texto extraido del CV. Revisa y pulsa Analizar con IA." });
    } else {
      const data = await res.json().catch(() => ({}));
      toast({
        title: data.error || "No se pudo extraer el texto del fichero",
        variant: "destructive",
      });
    }
    setExtracting(false);
  };

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      toast({ title: "Primero extrae o pega el texto del CV", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    const res = await fetch(`/api/candidates/${candidateId}/analyze-cv`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvText }),
    });
    if (res.ok) {
      const data = await res.json();
      setCvAnalysis(data.analysis);
      toast({ title: "Analisis completado" });
    } else {
      toast({ title: "Error al analizar el CV", variant: "destructive" });
    }
    setAnalyzing(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" />
          CV & AI Analysis
        </h2>
        {cvAnalysis && (
          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => setExpanded(e => !e)}>
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide</> : <><ChevronDown className="w-3.5 h-3.5" />Show Analysis</>}
          </button>
        )}
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            data-testid="button-upload-cv"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Subiendo..." : cvPath ? "Reemplazar CV" : "Subir CV"}
          </button>
          {cvPath && (
            <>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> CV adjunto
              </span>
              {!cvAnalysis && (
                <button
                  onClick={handleExtractText}
                  disabled={extracting}
                  className="flex items-center gap-2 px-3 py-1.5 border border-purple-300 text-purple-700 bg-purple-50 rounded-lg text-xs hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {extracting ? "Extrayendo texto..." : "Extraer texto del fichero"}
                </button>
              )}
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
        </div>

        {!cvAnalysis && (
          <div className="border border-border rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-500" /> Analizar CV con IA
            </p>
            <p className="text-xs text-muted-foreground">
              {cvPath
                ? "Pulsa \"Extraer texto del fichero\" para leer el CV automaticamente, o pega el texto manualmente."
                : "Sube el CV del candidato (PDF o Word) o pega el texto directamente para analizarlo con IA."}
            </p>
            <textarea
              data-testid="input-cv-text"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={4}
              placeholder="El texto del CV aparecera aqui tras extraerlo, o puedes pegarlo manualmente..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            <button
              data-testid="button-analyze-cv"
              onClick={handleAnalyze}
              disabled={analyzing || !cvText.trim()}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {analyzing ? "Analizando..." : "Analizar con IA"}
            </button>
          </div>
        )}

        {cvAnalysis && (expanded || !cvPath) && (
          <div className="space-y-3 text-sm" data-testid="cv-analysis-result">
            {typeof cvAnalysis.summary === "string" && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1.5"><Sparkles className="w-3 h-3" />AI Summary</p>
                <p className="text-sm text-foreground">{cvAnalysis.summary}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {cvAnalysis.yearsExperience != null && (
                <div className="p-3 bg-muted/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-semibold text-foreground">{String(cvAnalysis.yearsExperience)} years</p>
                </div>
              )}
              {typeof cvAnalysis.fitForFinancialServices === "string" && (
                <div className="p-3 bg-muted/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Finance Fit</p>
                  <p className={`font-semibold ${cvAnalysis.fitForFinancialServices === "High" ? "text-emerald-600" : cvAnalysis.fitForFinancialServices === "Medium" ? "text-amber-600" : "text-red-600"}`}>
                    {cvAnalysis.fitForFinancialServices}
                  </p>
                </div>
              )}
              {typeof cvAnalysis.suggestedRating === "number" && (
                <div className="p-3 bg-muted/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Suggested Rating</p>
                  <p className="font-semibold text-foreground">{cvAnalysis.suggestedRating}/5</p>
                </div>
              )}
              {typeof cvAnalysis.education === "string" && (
                <div className="p-3 bg-muted/40 rounded-lg">
                  <p className="text-xs text-muted-foreground">Education</p>
                  <p className="font-semibold text-foreground text-xs">{cvAnalysis.education}</p>
                </div>
              )}
            </div>
            {Array.isArray(cvAnalysis.topSkills) && cvAnalysis.topSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Top Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(cvAnalysis.topSkills as string[]).map(s => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(cvAnalysis.strengths) && cvAnalysis.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-700 mb-1">Strengths</p>
                <ul className="space-y-0.5">
                  {(cvAnalysis.strengths as string[]).map(s => (
                    <li key={s} className="text-xs text-foreground flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">+</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(cvAnalysis.areasToExplore) && cvAnalysis.areasToExplore.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-700 mb-1">Areas to Explore</p>
                <ul className="space-y-0.5">
                  {(cvAnalysis.areasToExplore as string[]).map(s => (
                    <li key={s} className="text-xs text-foreground flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">?</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {typeof cvAnalysis.recommendedNextStep === "string" && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">Recommended Next Step</p>
                <p className="text-sm text-foreground">{cvAnalysis.recommendedNextStep}</p>
              </div>
            )}
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => { setCvAnalysis(null); setCvText(""); setExpanded(false); }}
            >
              Re-analyze
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const candidateId = parseInt(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const { data: candidate, isLoading } = useGetCandidate(candidateId, { query: { enabled: !!candidateId, queryKey: getGetCandidateQueryKey(candidateId) } });
  const { data: interviews } = useListInterviews({ candidateId });
  const { data: feedback } = useListFeedback({ candidateId });

  const updateCandidate = useUpdateCandidate();
  const createInterview = useCreateInterview();
  const createFeedback = useCreateFeedback();

  const interviewForm = useForm<InterviewForm>({
    resolver: zodResolver(interviewSchema),
    defaultValues: { type: "screening", interviewerName: "", interviewerEmail: "", location: "video_call", notes: "" },
  });
  const feedbackForm = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { reviewerName: "", rating: 3, recommendation: "yes" },
  });

  const handleStageChange = (stage: string) => {
    updateCandidate.mutate(
      { id: candidateId, data: { stage } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(candidateId) });
          toast({ title: `Stage updated to ${stage}` });
        },
      }
    );
  };

  const onSubmitInterview = (data: InterviewForm) => {
    createInterview.mutate(
      { data: { ...data, candidateId, status: "scheduled", scheduledAt: data.scheduledAt || null, durationMinutes: data.durationMinutes || null, interviewerName: data.interviewerName || null, interviewerEmail: data.interviewerEmail || null, location: data.location || null, meetingUrl: data.meetingUrl || null, notes: data.notes || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey({ candidateId }) });
          setInterviewDialogOpen(false);
          interviewForm.reset();
          toast({ title: "Interview scheduled" });
        },
      }
    );
  };

  const onSubmitFeedback = (data: FeedbackForm) => {
    createFeedback.mutate(
      { data: { ...data, candidateId, reviewerEmail: data.reviewerEmail || null, strengths: data.strengths || null, weaknesses: data.weaknesses || null, notes: data.notes || null, technicalScore: data.technicalScore || null, culturalScore: data.culturalScore || null, communicationScore: data.communicationScore || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey({ candidateId }) });
          setFeedbackDialogOpen(false);
          feedbackForm.reset();
          toast({ title: "Feedback submitted" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/candidates")}>Back to Candidates</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div>
        <button
          data-testid="button-back"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          onClick={() => setLocation("/candidates")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates
        </button>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">
                  {candidate.firstName[0]}{candidate.lastName[0]}
                </span>
              </div>
              <div>
                <h1 data-testid="text-candidate-name" className="text-xl font-bold text-foreground">
                  {candidate.firstName} {candidate.lastName}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                    <Mail className="w-3.5 h-3.5" />
                    {candidate.email}
                  </a>
                  {candidate.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {candidate.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StageBadge value={candidate.stage} type="stage" />
                  <StageBadge value={candidate.status} type="status" />
                  {candidate.source && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {candidate.source.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <StarRating value={candidate.rating} size="md" />
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Move to stage:</p>
                <Select value={candidate.stage} onValueChange={handleStageChange}>
                  <SelectTrigger data-testid="select-update-stage" className="w-[180px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {candidate.positionTitle && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Applied for</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{candidate.positionTitle}</p>
              {candidate.department && <p className="text-xs text-muted-foreground">{candidate.department}</p>}
            </div>
          )}

          {candidate.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Notes</p>
              <p className="text-sm text-foreground">{candidate.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* CV & AI Analysis */}
      <CvSection candidateId={candidateId} />

      {/* Interviews */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Interviews ({interviews?.length ?? 0})
          </h2>
          <Button size="sm" onClick={() => setInterviewDialogOpen(true)} data-testid="button-add-interview">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Schedule
          </Button>
        </div>
        {!interviews || interviews.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No interviews scheduled yet</div>
        ) : (
          <div className="divide-y divide-border">
            {interviews.map((interview) => (
              <div key={interview.id} data-testid={`interview-row-${interview.id}`} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {interview.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {interview.scheduledAt && (
                      <span>{format(new Date(interview.scheduledAt), "MMM d, yyyy h:mm a")}</span>
                    )}
                    {interview.interviewerName && <span>with {interview.interviewerName}</span>}
                    {interview.location && <span className="capitalize">{interview.location.replace(/_/g, " ")}</span>}
                  </div>
                </div>
                <StageBadge value={interview.status} type="interview-status" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback ({feedback?.length ?? 0})
          </h2>
          <Button size="sm" onClick={() => setFeedbackDialogOpen(true)} data-testid="button-add-feedback">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Feedback
          </Button>
        </div>
        {!feedback || feedback.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No feedback submitted yet</div>
        ) : (
          <div className="divide-y divide-border">
            {feedback.map((fb) => (
              <div key={fb.id} data-testid={`feedback-row-${fb.id}`} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{fb.reviewerName}</p>
                    {fb.interviewType && (
                      <p className="text-xs text-muted-foreground capitalize">{fb.interviewType.replace(/_/g, " ")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating value={fb.rating} size="md" />
                    <StageBadge value={fb.recommendation} type="recommendation" />
                  </div>
                </div>
                {(fb.technicalScore || fb.culturalScore || fb.communicationScore) && (
                  <div className="flex items-center gap-4 mb-2">
                    {fb.technicalScore && <span className="text-xs text-muted-foreground">Technical: <strong>{fb.technicalScore}/5</strong></span>}
                    {fb.culturalScore && <span className="text-xs text-muted-foreground">Culture: <strong>{fb.culturalScore}/5</strong></span>}
                    {fb.communicationScore && <span className="text-xs text-muted-foreground">Communication: <strong>{fb.communicationScore}/5</strong></span>}
                  </div>
                )}
                {fb.strengths && <p className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1 mb-1">+ {fb.strengths}</p>}
                {fb.weaknesses && <p className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 mb-1">- {fb.weaknesses}</p>}
                {fb.notes && <p className="text-xs text-muted-foreground mt-1">{fb.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
          <Form {...interviewForm}>
            <form onSubmit={interviewForm.handleSubmit(onSubmitInterview)} className="space-y-4">
              <FormField control={interviewForm.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-interview-type"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INTERVIEW_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={interviewForm.control} name="scheduledAt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl><Input data-testid="input-scheduled-at" type="datetime-local" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={interviewForm.control} name="interviewerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interviewer</FormLabel>
                    <FormControl><Input data-testid="input-interviewer-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={interviewForm.control} name="durationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl><Input data-testid="input-duration" type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={interviewForm.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-interview-location"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="video_call">Video Call</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="on_site">On Site</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="button-submit-interview" disabled={createInterview.isPending}>
                  {createInterview.isPending ? "Scheduling..." : "Schedule"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Submit Feedback</DialogTitle></DialogHeader>
          <Form {...feedbackForm}>
            <form onSubmit={feedbackForm.handleSubmit(onSubmitFeedback)} className="space-y-4">
              <FormField control={feedbackForm.control} name="interviewId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview</FormLabel>
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-feedback-interview"><SelectValue placeholder="Select interview" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(interviews ?? []).map(i => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          {i.scheduledAt ? ` — ${format(new Date(i.scheduledAt), "MMM d")}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={feedbackForm.control} name="reviewerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl><Input data-testid="input-reviewer-name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={feedbackForm.control} name="rating" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Rating (1-5)</FormLabel>
                    <FormControl><Input data-testid="input-rating" type="number" min={1} max={5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={feedbackForm.control} name="recommendation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommendation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-recommendation"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RECOMMENDATIONS.map(r => (
                          <SelectItem key={r} value={r}>{r.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField control={feedbackForm.control} name="technicalScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technical</FormLabel>
                    <FormControl><Input data-testid="input-technical-score" type="number" min={1} max={5} {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={feedbackForm.control} name="culturalScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Culture</FormLabel>
                    <FormControl><Input data-testid="input-cultural-score" type="number" min={1} max={5} {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={feedbackForm.control} name="communicationScore" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comm.</FormLabel>
                    <FormControl><Input data-testid="input-comm-score" type="number" min={1} max={5} {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={feedbackForm.control} name="strengths" render={({ field }) => (
                <FormItem>
                  <FormLabel>Strengths</FormLabel>
                  <FormControl>
                    <textarea data-testid="input-strengths" {...field} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[60px] resize-none" />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={feedbackForm.control} name="weaknesses" render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas to Improve</FormLabel>
                  <FormControl>
                    <textarea data-testid="input-weaknesses" {...field} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[60px] resize-none" />
                  </FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="button-submit-feedback" disabled={createFeedback.isPending}>
                  {createFeedback.isPending ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
