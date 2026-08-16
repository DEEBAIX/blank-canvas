import { createFileRoute } from "@tanstack/react-router";

import { CountryTag } from "@/components/app/brand";
import { EmptyState, PageHeader } from "@/components/app/ui-bits";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizations } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/organizations")({
  head: () => ({
    meta: [
      { title: "Organisations — SSD Consortium OS" },
      { name: "description", content: "Directory of partner organisations, PIC numbers and expertise profiles." },
      { property: "og:title", content: "Organisations — SSD Consortium OS" },
      { property: "og:description", content: "Directory of partner organisations, PIC numbers and expertise profiles." },
    ],
  }),
  component: Organizations,
});

function Organizations() {
  const { data: orgs, isLoading } = useOrganizations();

  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="Partner organisations"
        description="Profiles, PIC numbers and capabilities of every organisation in the SSD network."
      />
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (orgs ?? []).length === 0 ? (
        <EmptyState title="No organisations yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(orgs ?? []).map((org) => (
            <article key={org.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold">{org.name}</h2>
                  <p className="text-xs text-muted-foreground">{org.org_type || "Organisation"}</p>
                </div>
                <CountryTag code={org.country_code} country={org.country} />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">PIC</dt>
                  <dd className="font-mono">{org.pic_number || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd className="truncate">{org.contact_person || org.contact_email || "—"}</dd>
                </div>
              </dl>
              {org.expertise && <p className="mt-3 text-sm text-muted-foreground">{org.expertise}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
