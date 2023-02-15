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

import {BlockWithAlignableContents} from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import {
  LinkNode,
} from '@lexical/link/LexicalLink';
import * as React from 'react';

type YouTubeComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  videoID: string;
}>;

function YouTubeComponent({
  className,
  format,
  nodeKey,
  videoID,
}: YouTubeComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoID}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        title="YouTube video"
      />
    </BlockWithAlignableContents>
  );
}

export type SerializedTextLinkNode = Spread<
  {
    videoID: string;
    type: 'textlink';
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

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

export class TextLinkNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return 'youtube';
  }

  static clone(node: TextLinkNode): TextLinkNode {
    return new TextLinkNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedTextLinkNode): TextLinkNode {
    const node = $createTextLinkNode(serializedNode.videoID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedTextLinkNode {
    return {
      ...super.exportJSON(),
      type: 'youtube',
      version: 1,
      videoID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-youtube', this.__id);
    element.setAttribute('width', '560');
    element.setAttribute('height', '315');
    element.setAttribute('src', `https://www.youtube.com/embed/${this.__id}`);
    element.setAttribute('frameborder', '0');
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    );
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'YouTube video');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    returimport { LinkNode } from '../../../lexical-link/src/index';
n {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-youtube')) {
          return null;
        }
        return {
          conversion: convertYoutubeElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://www.youtube.com/watch?v=${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <YouTubeComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    );
  }

  isInline(): false {
    return false;
  }
}

export function $createTextLinkNode(urlID: string): TextLinkNode {
  return new TextLinkNode(urlID);
}

export function $isTextLinkNode(
  node: TextLinkNode | LexicalNode | null | undefined,
): node is TextLinkNode {
  return node instanceof TextLinkNode;
}
