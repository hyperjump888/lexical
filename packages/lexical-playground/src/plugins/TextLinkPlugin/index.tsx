/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$createLinkNode, $isLinkNode, LinkNode, SerializedAutoLinkNode, SerializedLinkNode} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {Serializable} from 'child_process';
import {
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_HIGH,
    createCommand,
    LexicalCommand,
    PASTE_COMMAND,
    Spread,
    TextNode
} from 'lexical';
import {isArguments} from 'lodash-es';
import {default as React, FC, useEffect} from 'react';

import FloatingLinkEditorPlugin from '../FloatingLinkEditorPlugin';
import {typeAndParent} from "typedoc/dist/lib/output/themes/default/partials/typeAndParent";

export const INSERT_TEXTLINK_COMMAND: LexicalCommand<string> = createCommand(
    'INSERT_TEXTLINK_COMMAND',
);


function capitalizeWords(str: string): string {
    let wordArr = str.split('-')
    if (wordArr.length === 1) {
        // google maps
        wordArr = str.split('+')
    }
    return wordArr.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function genericParse(args1: string): string {
    const subsection = args1.split('/');

    let longstr = ''
    let longlen = 0
    for (let i = 0; i < subsection.length; i++) {
        if (subsection[i].length > longlen) {
            longlen = subsection[i].length
            longstr = subsection[i]

            if (i === subsection.length - 1) {
                // last section
                const dotArr = longstr.split('.');
                if (dotArr.length > 1 && dotArr[0].length > 3) {
                    longstr = dotArr[0]
                }
            }
        }
    }
    return longstr
}

function getLinkText(lnk: URL): string {
    // const mapReg:(string|RegExp)[][] = [
    const mapReg: [string, RegExp][] = [
        ['agoda.com', /\/[\w\-]+\/([\w\-]+)\//],
        ['booking.com', /\/hotel\/[\w\-]+\/([\w\-\.]+)\.[\w\-]+\.html/],
        ['klook.com', /\/[\w\-]+\/[0-9]+\-([\w\-]+)\//],
        ['google.com', /\/maps\/place\/([\w\%\-\+]+)\//],
    ];

    let pathStr = ''
    // agoda ur
    for (let j = 0; j < mapReg.length; j++) {
        let findMatch = false
        if (lnk.hostname === mapReg[j][0]) {
            findMatch = true
        }
        if (!findMatch) {
            if (lnk.hostname.startsWith('www.')) {
                if (lnk.hostname.substring('www.'.length) === mapReg[j][0]) {
                    findMatch = true
                }
            }
        }
        if (findMatch) {
            const result = lnk.pathname.match(mapReg[j][1]);
            if (!result) {
                pathStr = genericParse(lnk.pathname); // <span class="my">
                break
            } else {
                pathStr = result[1]; // <span class="my">
                break
            }
        }
    }
    if (pathStr.length === 0) {
        pathStr = genericParse(lnk.pathname);
    }
    if (pathStr.length > 0) {
        return capitalizeWords(decodeURIComponent(pathStr));
    } else {
        if (lnk.hostname.startsWith('www.') && lnk.hostname.endsWith('.com')) {
            const lnkStr = lnk.hostname.split('.');
            return capitalizeWords(lnkStr[1]);
        } else {
            return lnk.hostname;
        }
    }

}


export function $createTextLinkNode(urlID: string, txt: string): LinkNode {
    // create link node here and then append the text node
    const textNode = new LinkNode(urlID);
    const txtwithinNode = new TextNode(txt);
    textNode.append(txtwithinNode);
    return textNode
}


export function $createTextLink(text: string, rel: string): LinkNode {
    // create link node here and then append the text node
    const myUrl = new URL(text);
    const txtForUrl = getLinkText(myUrl);
    const textNode = new LinkNode(text, {rel: rel});
    const txtwithinNode = new TextNode(txtForUrl);
    textNode.append(txtwithinNode);
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
                    const selection = $getSelection();

                    if (!$isRangeSelection(selection)) {
                        return false;
                    }

                    if (event.clipboardData != null) {
                        const text = event.clipboardData.getData('text/plain');
                        if (text != null) {
                            try {
                                const root = $getRoot();
                                const content = root.getTextContent();
                                const selectionContent = selection.getNodes();
                                const myUrl = new URL(text);
                                console.log('IN TEXT LINK:' + text);
                                const txtForUrl = getLinkText(myUrl);
                                const nodes = [];
                                const textLinkNode = $createTextLinkNode(text, txtForUrl);
                                nodes.push(textLinkNode);
                                let isContent = false;
                                if (content) {
                                    if (selectionContent.length && selectionContent[0].__type === 'text') {
                                        isContent = true;
                                    }
                                }
                                if (isContent) {
                                    selection.insertNodes(nodes);
                                } else {
                                    const paragraphNode = $createParagraphNode();
                                    paragraphNode.append(textLinkNode)
                                    selection.insertNodes([paragraphNode]);
                                }
                                return true;
                            } catch (error) {
                                // console.error(`Error: ${error}`);
                            }

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


type Props = Readonly<{
    'data-test-id'?: string;
    className: string,
    onChange: (val: any) => void;
    placeholder?: any;
    value: any;
}>;

export function InputForText({
                                 className = '',
                                 value,
                                 onChange,
                                 placeholder = '',
                             }: Props): JSX.Element {
    return (
        <input
            type="text"
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
}

export function InputForNumber({
                                 className = '',
                                 value,
                                 onChange,
                                 placeholder = '',
                             }: Props): JSX.Element {
    return (
        <input
            type="text"
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
}

const createDOM = LinkNode.prototype.createDOM;
LinkNode.prototype.createDOM = function () {
    const element = createDOM.apply(this, arguments);
    let rel = this.getRel() || 'USD,100,Transportation';
    let arr = ['USD','100','Transportation'];
    try {
        console.log('rel : ' + rel);
        if(rel) {
            arr = rel.split(',');
        }
        const writable = this.getWritable();
        writable.__rel = rel;
        let type,curr,amount,category = '';
        element.setAttribute('rel', rel);
        element.setAttribute('data-type', 'budgetlink');
        element.setAttribute('data-currency', arr[0]);
        element.setAttribute('data-amount', arr[1]);
        element.setAttribute('data-category', arr[2]);
        console.log("urlnya :" + this.getURL());
    } catch(err) {
        console.log("ada err");
        //extract rel for import
        rel = element.getAttribute('rel') as string;
        arr = rel.split(',');
        if (arr.length) {
            element.setAttribute('data-type', 'budgetlink');
            element.setAttribute('data-currency', arr[0]);
            element.setAttribute('data-amount', arr[1]);
            element.setAttribute('data-category', arr[2]);
        }
    }


    return element;
}
