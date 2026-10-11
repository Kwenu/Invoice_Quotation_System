import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useData } from '../contexts/DataContext';
import type { LingoDocument } from '../types/document';
import { calculateTotals } from '../utils/calculations';
import { cleanGroups } from '../utils/lineItems';
import { clearRecovery, loadRecovery, saveRecovery, type RecoverySnapshot } from '../utils/repository';
import { validateDocument, type ValidationErrors } from '../utils/validation';

type Patch = Partial<LingoDocument>;

export function useDocumentEditor(initial: LingoDocument) {
  const { documents, saveDocument } = useData();
  const [doc, setDoc] = useState<LingoDocument>(initial);
  const [dirty, setDirty] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const allowNavRef = useRef(false);

  const isPersisted = documents.some((d) => d.id === doc.id);
  const recoveryKey = isPersisted ? `edit:${doc.id}` : `new:${doc.templateId}`;

  const [recovery, setRecovery] = useState<RecoverySnapshot | null>(() => {
    const key = documents.some((d) => d.id === initial.id) ? `edit:${initial.id}` : `new:${initial.templateId}`;
    const snapshot = loadRecovery(key);
    if (!snapshot) return null;
    if (snapshot.savedAt <= initial.updatedAt && documents.some((d) => d.id === initial.id)) return null;
    return snapshot;
  });

  const markDirty = (value: boolean) => {
    dirtyRef.current = value;
    setDirty(value);
  };

  const update = useCallback((patch: Patch) => {
    setDoc((prev) => ({ ...prev, ...patch }));
    dirtyRef.current = true;
    setDirty(true);
  }, []);

  const totals = useMemo(() => calculateTotals(doc), [doc]);
  const errors: ValidationErrors = useMemo(
    () => showErrors ? validateDocument(doc, totals) : {},
    [doc, totals, showErrors]
  );

  // Automatic draft saving: persisted drafts save to the store; everything else gets a recovery copy.
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      if (isPersisted && doc.status === 'draft') {
        const saved = saveDocument(doc, 'autosave');
        setLastSavedAt(saved.updatedAt);
        markDirty(false);
        clearRecovery(recoveryKey);
      } else {
        saveRecovery(recoveryKey, doc);
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [doc, dirty, isPersisted, recoveryKey, saveDocument]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const save = useCallback(
    (intent: 'draft' | 'final'): LingoDocument | null => {
      let candidate = doc;
      if (intent === 'final') {
        candidate = { ...doc, groups: cleanGroups(doc.groups) };
        const result = validateDocument(candidate, calculateTotals(candidate));
        if (Object.keys(result).length > 0) {
          setShowErrors(true);
          toast.error('Please fix the highlighted fields before saving.');
          return null;
        }
      }
      try {
        const saved = saveDocument(candidate, intent);
        setDoc(saved);
        markDirty(false);
        setLastSavedAt(saved.updatedAt);
        clearRecovery(`new:${saved.templateId}`);
        clearRecovery(`edit:${saved.id}`);
        setRecovery(null);
        return saved;
      } catch (error) {
        console.error(error);
        toast.error('Could not save. Your changes are still here — please try again.');
        return null;
      }
    },
    [doc, saveDocument]
  );

  const restoreRecovery = useCallback(() => {
    if (!recovery) return;
    setDoc({ ...recovery.doc, id: doc.id, number: doc.number || recovery.doc.number });
    markDirty(true);
    setRecovery(null);
    toast.success('Unsaved work restored');
  }, [recovery, doc.id, doc.number]);

  const discardRecovery = useCallback(() => {
    clearRecovery(recoveryKey);
    setRecovery(null);
  }, [recoveryKey]);

  const allowNavigation = useCallback(() => {
    allowNavRef.current = true;
  }, []);

  const shouldBlock = useCallback(() => dirtyRef.current && !allowNavRef.current, []);

  return {
    doc,
    update,
    totals,
    errors,
    dirty,
    lastSavedAt,
    isPersisted,
    save,
    recovery,
    restoreRecovery,
    discardRecovery,
    allowNavigation,
    shouldBlock
  };
}