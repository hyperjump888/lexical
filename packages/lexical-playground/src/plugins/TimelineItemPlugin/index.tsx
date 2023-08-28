/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import 'katex/dist/katex.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  LexicalEditor,
} from 'lexical';
import {useCallback, useEffect} from 'react';
import * as React from 'react';

import {$createTextNode} from '../../../../lexical/src/nodes/LexicalTextNode';
import KatexEquationAlterer from '../../ui/KatexEquationAlterer';

type CommandPayload = {
  equation: string;
  inline: boolean;
};

export const INSERT_TIMELINEITEM_COMMAND: LexicalCommand<CommandPayload> =
  createCommand('INSERT_TIMELINEITEM_COMMAND');

export function InsertTimelineItemDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const onEquationConfirm = useCallback(
    (equation: string, inline: boolean) => {
      activeEditor.dispatchCommand(INSERT_TIMELINEITEM_COMMAND, {
        equation,
        inline,
      });
      onClose();
    },
    [activeEditor, onClose],
  );

  return <KatexEquationAlterer onConfirm={onEquationConfirm} />;
}

export default function TimelineItemPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<CommandPayload>(
      INSERT_TIMELINEITEM_COMMAND,
      (payload) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const focusNode = selection.focus.getNode();
        if (focusNode !== null) {
          // Create a new ParagraphNode
          const paragraphNode = $createParagraphNode();

          // Create a new TextNode
          const textNode = $createTextNode(
            '#10:00 [bus--blue]: Enjoy the natural attractions of Lake Bedugul',
          );

          // Append the text node to the paragraph
          paragraphNode.append(textNode);

          // Finally, append the paragraph to the root
          $insertNodeToNearestRoot(paragraphNode);
          // root.append(paragraphNode);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
