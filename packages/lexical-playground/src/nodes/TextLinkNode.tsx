/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  LexicalNode,
} from 'lexical';

import { LinkNode } from '@lexical/link';

import { TextNode } from '../../../lexical/src/nodes/LexicalTextNode';



export class TextLinkNode extends LinkNode {

  static getType(): string {
    return 'textlink';
  }

  static clone(node: TextLinkNode): TextLinkNode {
    return new TextLinkNode(
      node.__url,
      {rel: node.getRel(), target: node.getTarget()},
      node.__key,
    );
  }


}

export function $createTextLinkNode(urlID: string): TextLinkNode {
  // create link node here and then append the text node
  const textNode = new TextLinkNode(urlID);
  const txtwithinNode = new TextNode('foo');
  textNode.append(txtwithinNode );
  return textNode
}

export function $isTextLinkNode(
  node: TextLinkNode | LexicalNode | null | undefined,
): node is TextLinkNode {
  return node instanceof TextLinkNode;
}
