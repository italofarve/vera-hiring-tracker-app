import { useState } from "react";
import { Link } from "wouter";
import {
  useListPositions,
  useCreatePosition,
  useDeletePosition,
  getListPositionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Briefcase, MapPin, Users, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StageBadge } from "@/components/StageBadge";
import { useToast } from "@/hooks/use-toast";

const positionSchema = z.object({
  title: z.string().min(1, "Title required"),
  department: z.string().min(1, "Department required"),
  location: z.string().min(1, "Location required"),
  type: z.string().min(1),
  status: z.string().min(1),
  headcount: z.coerce.number().min(1),
  description: z.string().optional(),
});
type PositionForm = z.infer<typeof positionSchema>;

export function Positions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: positions, isLoading } = useListPositions();
  const createPosition = useCreatePosition();
  const deletePosition = useDeletePosition();

  const form = useForm<PositionForm>({
    resolver: zodResolver(positionSchema),
    defaultValues: { title: "", department: "", location: "", type: "full-time", status: "open", headcount: 1, description: "" },
  });

  const filtered = (positions ?? []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.department.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = (data: PositionForm) => {
    createPosition.mutate(
      { data: { ...data, description: data.description || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPositionsQueryKey() });
          setDialogOpen(false);
          form.reset();
          toast({ title: "Position created" });
        },
        onError: () => toast({ title: "Failed to create position", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete position "${title}"?`)) return;
    deletePosition.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPositionsQueryKey() });
          toast({ title: "Position deleted" });
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Positions</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} open role{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Button data-testid="button-add-position" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Position
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-testid="input-search-positions"
          placeholder="Search positions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Briefcase className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No positions found</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first open role</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pos) => (
            <div
              key={pos.id}
              data-testid={`card-position-${pos.id}`}
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{pos.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{pos.department}</p>
                </div>
                <StageBadge value={pos.status} type="position-status" className="ml-2 flex-shrink-0" />
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {pos.location}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {pos.headcount} headcount · {pos.type.replace(/-/g, " ")}
                </div>
              </div>
              {pos.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{pos.description}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Link href={`/positions/${pos.id}`}>
                  <span data-testid={`link-position-detail-${pos.id}`} className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer">
                    View candidates
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
                <button
                  data-testid={`button-delete-position-${pos.id}`}
                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(pos.id, pos.title)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create New Position</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl><Input data-testid="input-position-title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl><Input data-testid="input-department" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input data-testid="input-location" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-position-type"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-position-status"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="headcount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headcount</FormLabel>
                    <FormControl><Input data-testid="input-headcount" type="number" min={1} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea data-testid="input-position-description" {...field} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none" />
                  </FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="button-submit-position" disabled={createPosition.isPending}>
                  {createPosition.isPending ? "Creating..." : "Create Position"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
