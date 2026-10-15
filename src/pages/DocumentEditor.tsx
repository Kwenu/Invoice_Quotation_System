import React, { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FileXIcon, LockIcon } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { EditorWorkspace } from "../components/editor/EditorWorkspace";
import { buttonClasses } from "../components/ui/buttonStyles";
import { EmptyState } from "../components/ui/EmptyState";
import type { LingoDocument } from "../types/document";
import {
  createBlankDocument,
  isDivisionId,
  isDocumentType,
  resolveTemplate,
  snapshotFromClient,
} from "../utils/documentFactory";
import { getEditLock } from "../utils/status";

export function DocumentEditor() {
  const { id, division, type } = useParams();
  const [params] = useSearchParams();
  const { documents, clients, settings } = useData();
  const existing = id ? documents.find((d) => d.id === id) : undefined;
  const [lock] = useState(() => (existing ? getEditLock(existing) : null));

  const initial = useMemo<LingoDocument | null>(() => {
    if (id)
      return existing
        ? (JSON.parse(JSON.stringify(existing)) as LingoDocument)
        : null;
    if (
      !isDivisionId(division) ||
      !isDocumentType(type) ||
      !resolveTemplate(division, type)
    )
      return null;
    const blank = createBlankDocument(division, type, settings);
    const client = clients.find((c) => c.id === params.get("clientId"));
    return client ? { ...blank, client: snapshotFromClient(client) } : blank;
  }, [id, division, type]);

  if (!initial) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={FileXIcon}
          title={id ? "Document not found" : "No template for this combination"}
          description={
            id
              ? "It may have been removed from this browser's prototype storage."
              : "Choose a division and document type that has a configured template."
          }
          action={
            <Link to="/documents/new" className={buttonClasses("primary")}>
              Create a document
            </Link>
          }
        />
      </div>
    );
  }

  if (lock && existing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={LockIcon}
          title={`${existing.number} can't be edited`}
          description={lock}
          action={
            <Link
              to={`/documents/${existing.id}`}
              className={buttonClasses("primary")}
            >
              View document
            </Link>
          }
        />
      </div>
    );
  }

  return <EditorWorkspace key={initial.id} initial={initial} />;
}
