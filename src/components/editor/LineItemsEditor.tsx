import React from 'react';
import { ListPlusIcon, PlusIcon } from 'lucide-react';
import type { LineGroup } from '../../types/document';
import { addPlainItem, addSection, duplicateGroup, moveGroup, removeGroup, replaceGroup } from '../../utils/lineItems';
import { Button } from '../ui/Button';
import { EditorSection } from './EditorSection';
import { LineGroupEditor } from './LineGroupEditor';

interface LineItemsEditorProps {
  groups: LineGroup[];
  onChange: (groups: LineGroup[]) => void;
  currency: string;
  error?: string;
  allowSections: boolean;
}

export function LineItemsEditor({ groups, onChange, currency, error, allowSections }: LineItemsEditorProps) {
  return (
    <EditorSection
      title="Line items"
      description={
      allowSections ?
      'Use sections for grouped services (e.g. UI Design + Development under one price).' :
      'Line total = quantity × unit price − discount.'
      }>
      
      <div className="space-y-3">
        {groups.map((group, index) =>
        <LineGroupEditor
          key={group.id}
          group={group}
          index={index}
          count={groups.length}
          currency={currency}
          onChange={(g) => onChange(replaceGroup(groups, g))}
          onRemove={() => onChange(removeGroup(groups, group.id))}
          onDuplicate={() => onChange(duplicateGroup(groups, group.id))}
          onMove={(dir) => onChange(moveGroup(groups, group.id, dir))} />

        )}
      </div>
      {error &&
      <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      }
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" icon={PlusIcon} onClick={() => onChange(addPlainItem(groups))}>
          Add item
        </Button>
        {allowSections &&
        <Button variant="secondary" size="sm" icon={ListPlusIcon} onClick={() => onChange(addSection(groups))}>
            Add section
          </Button>
        }
      </div>
    </EditorSection>);

}