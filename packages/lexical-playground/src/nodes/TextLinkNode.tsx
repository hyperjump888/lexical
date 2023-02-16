/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';

import {
  LinkNode,
} from '@lexical/link/LexicalLink';
import * as React from 'react';



function convertYoutubeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-youtube');
  if (videoID) {
    const node = $createTextLinkNode(videoID);
    return {node};
  }
  return null;
}

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
  return new TextLinkNode(urlID);
}

export function $isTextLinkNode(
  node: TextLinkNode | LexicalNode | null | undefined,
): node is TextLinkNode {
  return node instanceof TextLinkNode;
}
