import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useDocuments } from "@/lib/queries";

const CATEGORIES = ["Call documents", "Templates", "Partner profiles", "Letters of support", "Drafts", "Other"];

export function LibraryPanel({ projectId }: { projectId: string }) {
  const { data: documents = [] } = useDocuments(projectId);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    const path = `${projectId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error } = await supabase.storage.from("project-documents").upload(path, file);
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    const { error: dbError } = await supabase.from("documents").insert({
      project_id: projectId,
      name: file.name,
      storage_path: path,
      category,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: auth.user?.id ?? null,
    });
    setBusy(false);
    if (dbError) return toast.error(dbError.message);
    toast.success("Document uploaded");
    queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
  }

  async function download(path: string) {
    const { data, error } = await supabase.storage.from("project-documents").createSignedUrl(path, 60);
    if (error || !data) return toast.error(error?.message ?? "Could not open file");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <SectionCard
      title="Document library"
      description="Shared repository of call documents, templates and partner files."
      actions={
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={busy}>
            <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload"}
          </Button>
        </div>
      }
    >
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {documents.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.category} · {Math.round(Number(doc.size_bytes ?? 0) / 1024)} KB ·{" "}
                    {new Date(doc.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => download(doc.storage_path)}>
                <Download className="h-4 w-4" /> Open
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
