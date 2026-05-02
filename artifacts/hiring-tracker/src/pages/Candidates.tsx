import { useState } from "react";
import { Link } from "wouter";
import {
  useListCandidates,
  useCreateCandidate,
  useDeleteCandidate,
  useListPositions,
  getListCandidatesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StageBadge } from "@/components/StageBadge";
import { StarRating } from "@/components/StarRating";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const STAGES = ["applied","screening","technical","hr_interview","final_interview","offer","hired","rejected","withdrawn"];
const SOURCES = ["linkedin","referral","job_board","direct","agency"];

const candidateSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  positionId: z.number().optional(),
  stage: z.string().min(1),
  status: z.string().min(1),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type CandidateForm = z.infer<typeof candidateSchema>;

export function Candidates() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = {
    ...(stageFilter !== "all" && { stage: stageFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };
  const { data: candidates, isLoading } = useListCandidates(params);
  const { data: positions } = useListPositions();
  const createCandidate = useCreateCandidate();
  const deleteCandidate = useDeleteCandidate();

  const form = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", stage: "applied", status: "active", notes: "", source: "" },
  });

  const filtered = (candidates ?? []).filter(c => {
    if (!search) return true;
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
  });

  const onSubmit = (data: CandidateForm) => {
    createCandidate.mutate(
      { data: { ...data, phone: data.phone || null, source: data.source || null, notes: data.notes || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
          setDialogOpen(false);
          form.reset();
          toast({ title: "Candidate added successfully" });
        },
        onError: () => toast({ title: "Failed to add candidate", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    deleteCandidate.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
          toast({ title: "Candidate removed" });
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} candidate{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <Button data-testid="button-add-candidate" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-candidates"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger data-testid="select-stage-filter" className="w-[160px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map(s => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="select-status-filter" className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading candidates...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No candidates found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new candidate</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Added</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((candidate) => (
                <tr
                  key={candidate.id}
                  data-testid={`row-candidate-${candidate.id}`}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${candidate.id}`}>
                      <span className="flex items-center gap-3 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {candidate.firstName[0]}{candidate.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            {candidate.firstName} {candidate.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{candidate.email}</p>
                        </div>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-foreground">{candidate.positionTitle ?? "—"}</p>
                    {candidate.department && <p className="text-xs text-muted-foreground">{candidate.department}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge value={candidate.stage} type="stage" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <StarRating value={candidate.rating} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/candidates/${candidate.id}`}>
                        <Button data-testid={`link-candidate-detail-${candidate.id}`} variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        data-testid={`button-delete-candidate-${candidate.id}`}
                        onClick={() => handleDelete(candidate.id, `${candidate.firstName} ${candidate.lastName}`)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input data-testid="input-first-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input data-testid="input-last-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input data-testid="input-email" type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input data-testid="input-phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="stage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-stage">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAGES.map(s => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="source" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCES.map(s => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="positionId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(positions ?? []).map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      data-testid="input-notes"
                      {...field}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="button-submit-candidate" disabled={createCandidate.isPending}>
                  {createCandidate.isPending ? "Adding..." : "Add Candidate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
