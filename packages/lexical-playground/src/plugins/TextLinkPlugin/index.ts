/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {LinkNode} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot, mergeRegister} from '@lexical/utils';
import {COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand,TextNode} from 'lexical';
import {useEffect} from 'react';


export const INSERT_TEXTLINK_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_TEXTLINK_COMMAND',
);

function $createTextLinkNode(urlID: string): LinkNode {
  // create link node here and then append the text node
  const textNode = new LinkNode(urlID);
  const txtwithinNode = new TextNode('foo');
  textNode.append(txtwithinNode );
  return textNode
}

export default function TextLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([LinkNode])) {
      throw new Error('TextLinkPlugin: LinkNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<string>(
        INSERT_TEXTLINK_COMMAND,
        (payload) => {
          const textLinkNode = $createTextLinkNode(payload);
          $insertNodeToNearestRoot(textLinkNode);

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
