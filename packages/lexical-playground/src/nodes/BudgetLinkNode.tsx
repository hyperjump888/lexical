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
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import {$applyNodeReplacement, createEditor} from 'lexical';
import { LinkNode, SerializedLinkNode } from '@lexical/link';
import * as React from 'react';
import {Suspense} from 'react';

const ImageComponent = React.lazy(
  // @ts-ignore
  () => import('./ImageComponent'),
);

export interface ImagePayload {
  altText: string;
  caption?: LexicalEditor;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  src: string;
  width?: number;
  captionsEnabled?: boolean;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const {alt: altText, src, width, height} = domNode;
    const node = $createBudgetLinkNode({altText, height, src, width});
    return {node};
  }
  return null;
}

export type SerializedBudgetLinkNode = Spread<
  {
    currency: string;
    amount: number;
    category: string;
  },
  SerializedLinkNode
>;


export class BudgetLinkNode extends LinkNode {
  __currency: 'USD' | string;
  __amount: number;
  __category: string;

  static getType(): string {
    return 'budgetlink';
  }

  static clone(node: BudgetLinkNode): BudgetLinkNode {
    return new BudgetLinkNode(
      node.__url,
      node.__currency,
      node.__amount,
      node.__category,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedBudgetLinkNode): BudgetLinkNode {
    const {altText, height, width, maxWidth, caption, src, showCaption} =
      serializedNode;
    const node = $createBudgetLinkNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
    });
    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    returimport { LinkNode } from '@lexical/link';
n {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    url: string,
    currency: string,
    amount: number,
    category: string,
    key?: NodeKey,
  ) {
    super(url, {}, key);
    this.__currency = currency;
    this.__amount = amount;
    this.__category = category;
  }

  exportJSON(): SerializedBudgetLinkNode {
    return {
      ...super.exportJSON(),
      currency: this.getCurrency(),
      amount: this.getAmount(),
      category: this.getCategory(),
      type: 'budgetlink',
      version: 1,
    };
  }

  setWidthAndHeight(
    width: 'inherit' | number,
    height: 'inherit' | number,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getCurrency(): string {
    return this.__currency;
  }

  getAmount(): number {
    return this.__amount;
  }

  getCategory(): string {
    return this.__category;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          caption={this.__caption}
          captionsEnabled={this.__captionsEnabled}
          resizable={true}
        />
      </Suspense>
    );
  }
}

export function $createBudgetLinkNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
}: ImagePayload): BudgetLinkNode {
  return $applyNodeReplacement(
    new BudgetLinkNode(
      src,
      altText,
      maxWidth,
      width,
      height,
      showCaption,
      caption,
      captionsEnabled,
      key,
    ),
  );
}

export function $isBudgetLinkNode(
  node: LexicalNode | null | undefined,
): node is BudgetLinkNode {
  return node instanceof BudgetLinkNode;
}
