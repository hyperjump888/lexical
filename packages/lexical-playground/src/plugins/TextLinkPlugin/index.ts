/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand} from 'lexical';
import {useEffect} from 'react';

import {$createTextLinkNode, TextLinkNode} from '../../nodes/TextLinkNode';

export const INSERT_TEXTLINK_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_TEXTLINK_COMMAND',
);

export default function YouTubePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TextLinkNode])) {
      throw new Error('TextLinkPlugin: TextLinkNode not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_TEXTLINK_COMMAND,
      (payload) => {
        const textLinkNode = $createTextLinkNode(payload);
        $insertNodeToNearestRoot(textLinkNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
