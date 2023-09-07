/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/* eslint sort-keys: 0 */

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
import TimelineItemEdit from '../../ui/TimelineItemEdit';

type CommandPayload = {
  tldesc: string;
  tlicon: string;
  tltime: string;
  tlcolor: string;
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
  const onTimelineConfirm = useCallback(
    (tltime: string, tlicon: string, tldesc: string, tlcolor: string) => {
      activeEditor.dispatchCommand(INSERT_TIMELINEITEM_COMMAND, {
        tldesc,
        tlicon,
        tltime,
        tlcolor
      });
      onClose();
    },
    [activeEditor, onClose],
  );

  return <TimelineItemEdit onConfirm={onTimelineConfirm} />;
}

export default function TimelineItemPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<CommandPayload>(
      INSERT_TIMELINEITEM_COMMAND,
      (payload) => {
        const {tldesc, tlicon, tltime, tlcolor} = payload;
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const focusNode = selection.focus.getNode();
        if (focusNode !== null) {
          // Create a new ParagraphNode
          const paragraphNode = $createParagraphNode();

          const tltimeFormat = tltime.length > 0 ? '#' + tltime + ' ' : tltime;
          const tliconFormat = tlicon.length > 0 ? `[${tlicon}--${tlcolor}]` : tlicon;

          // Create a new TextNode
          const textNode = $createTextNode(
            //  '#10:00 [bus--blue]: Enjoy the natural attractions of Lake Bedugul',
            tltimeFormat + tliconFormat + ': ' + tldesc,
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
