import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Users, Briefcase, ArrowRight, Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

interface Position {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  headcount: number;
  description?: string | null;
}

export function Portal() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/portal/positions")
      .then((r) => r.json())
      .then((data) => { setPositions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = positions.filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="bg-[#00205b] text-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Vera</p>
              <p className="text-xs text-white/70">Careers</p>
            </div>
          </div>
          <a href="/sign-in" className="text-xs text-white/70 hover:text-white transition-colors">HR Login</a>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-12 pt-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join Vera</h1>
          <p className="text-white/80 text-base max-w-xl">
            Build the future of finance with us. Discover open roles across our global teams.
          </p>
          <div className="mt-6 relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by title, department or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white text-foreground border-0 h-11"
            />
          </div>
        </div>
      </header>

      {/* Positions */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No open positions found</p>
            {search && <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} open position{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((pos) => (
                <div
                  key={pos.id}
                  data-testid={`portal-card-${pos.id}`}
                  className="bg-card border border-border rounded-xl p-6 hover:border-[#00205b]/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{pos.title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{pos.department}</p>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      Open
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {pos.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" /> {pos.type.replace(/-/g, " ")}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" /> {pos.headcount} {pos.headcount === 1 ? "spot" : "spots"}
                    </span>
                  </div>
                  {pos.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{pos.description}</p>
                  )}
                  <Link href={`/portal/${pos.id}`}>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00205b] group-hover:gap-2.5 transition-all cursor-pointer">
                      Apply now <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <p className="text-center text-xs text-muted-foreground">
          © 2025 Vera. All rights reserved. | Talent Acquisition Platform
        </p>
      </footer>
    </div>
  );
}
