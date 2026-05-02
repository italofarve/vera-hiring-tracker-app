import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, MapPin, Briefcase, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Position {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description?: string | null;
}

export function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    fetch(`/api/portal/positions/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => { setPosition(data); setLoading(false); })
      .catch(() => { setError("Position not found"); setLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/portal/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        positionId: id,
        source: "portal",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to submit application. Please try again.");
      setSubmitting(false);
      return;
    }

    const { id: candidateId } = await res.json();

    if (cvFile && candidateId) {
      const formData = new FormData();
      formData.append("cv", cvFile);
      await fetch(`/api/candidates/${candidateId}/cv`, { method: "POST", body: formData }).catch(() => {});
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00205b] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-dvh bg-background">
        <header className="bg-[#00205b] py-4 px-6">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Vera Careers</span>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you, <strong>{form.firstName}</strong>! Your application for <strong>{position?.title}</strong> has been received.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            You will receive a confirmation email at <strong>{form.email}</strong>. Our team will review your application and be in touch soon.
          </p>
          <button
            className="text-sm text-[#00205b] hover:underline"
            onClick={() => setLocation("/portal")}
          >
            ← View other positions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="bg-[#00205b] py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Vera Careers</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          onClick={() => setLocation("/portal")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to positions
        </button>

        {error && !position ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
            <button className="text-sm text-[#00205b] hover:underline mt-4" onClick={() => setLocation("/portal")}>
              View all positions
            </button>
          </div>
        ) : position && (
          <>
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h1 className="text-xl font-bold text-foreground mb-1">{position.title}</h1>
              <p className="text-sm text-muted-foreground mb-3">{position.department}</p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{position.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3" />{position.type.replace(/-/g, " ")}</span>
              </div>
              {position.description && (
                <p className="text-sm text-foreground mt-4 pt-4 border-t border-border">{position.description}</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-5">Your Information</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      data-testid="input-portal-first-name"
                      value={form.firstName}
                      onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      data-testid="input-portal-last-name"
                      value={form.lastName}
                      onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-portal-email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    data-testid="input-portal-phone"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cv">CV / Resume</Label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="cv-upload"
                      className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {cvFile ? cvFile.name : "Upload PDF or Word document"}
                    </label>
                    <input
                      id="cv-upload"
                      data-testid="input-portal-cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                    />
                    {cvFile && (
                      <button type="button" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => setCvFile(null)}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Cover Letter / Additional Notes</Label>
                  <textarea
                    id="notes"
                    data-testid="input-portal-notes"
                    value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="Tell us about yourself and why you're interested in this role..."
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="button-portal-submit"
                  className="w-full bg-[#00205b] hover:bg-[#00205b]/90 text-white"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By submitting this form, you agree to Vera's Privacy Policy. Your data will be processed for recruitment purposes only.
                </p>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
