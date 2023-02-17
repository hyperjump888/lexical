/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {LinkNode} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {$getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_HIGH, createCommand, LexicalCommand,PASTE_COMMAND,TextNode} from 'lexical';
import {useEffect} from 'react';

import {validateUrl} from '../../utils/url';


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
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const paste1 = 1;
          const selection = $getSelection();
  
          if (!$isRangeSelection(selection)) {
            return false;
          }

          if (event.clipboardData != null) {
            const text = event.clipboardData.getData('text/plain');
            if (text != null && validateUrl(text)) {
              console.log('IN TEXT LINK:' + text)
              const nodes = [];
              const textLinkNode = $createTextLinkNode(text);
              nodes.push(textLinkNode);
              selection.insertNodes(nodes);
              return true;
            }

            // $insertDataTransferForRichText(event.clipboardData, selection, editor);
            // const data = event.clipboardData.getData('text/plain')
            // onPasteForPlainText(event, editor);
            return false;
          }
  

        },
        COMMAND_PRIORITY_HIGH,
      ),
      // editor.registerNodeTransform(TextNode, (node) => {
      //   // const parent = node.getParent();
      //   if (node.getTextContent() === 'css') {
      //     const linkNode = new LinkNode(node.getTextContent())
      //     const txtNode = new TextNode('boo')
      //     linkNode.append(txtNode)
      //     linkNode.insertBefore(node)
      //     node.remove()

      //   }
      // }
      // ),
    );
  }, [editor]);

  return null;
}
