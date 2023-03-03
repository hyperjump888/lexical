/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {LinkNode} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {Props} from '@lexical/react/LexicalContentEditable';
import {mergeRegister} from '@lexical/utils';
import {
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_HIGH,
    createCommand,
    LexicalCommand,
    PASTE_COMMAND,
    TextNode
} from 'lexical';
import {default as React, FC, useEffect} from 'react';

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
    const textNode = new LinkNode(text,{ rel : rel});
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
            onChange={(e) => {
                onChange(e.target.value);
            }}
        />
    );
}


class CustomLinkNode extends LinkNode {
    __target: '_blank' | '_self';
    __classNames: Array<string>;
    __url: string;

    constructor(text: string, url: string, target: TARGET_TYPE, classNames: Array<string>, key?: NodeKey): void {
        super(text, key);
        console.log({text, url, target, classNames});

        const self = this.getWritable();

        self.__target = target;
        self.__classNames = classNames;
        self.__url = url;
    }

    static getType(): string {
        return 'custom-link-node';
    }

    static clone(node: CustomLinkNode): CustomLinkNode {
        return new CustomLinkNode(node.__text, node.__url, node.__target, node.__classNames);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const self = this.getWritable();
        const _self = this.getLatest();

        self.__target = _self.__target;

        self.__url = _self.__url;

        self.__classNames = _self.__classNames;

        const element = super.createDOM(config);

        element.setAttribute('target', _self.__target);
        element.setAttribute('href', _self.__url);

        utils.addClassNamesToElement(element, _self.__classNames.join(' '));

        return element;
    };

    setTarget(target: TARGET_TYPE) {
        const self = this.getWritable();

        self.__target = target;
    }

    getTarget(): TARGET_TYPE {
        const self = this.getLatest();
        return self.__target;
    }

    setClassNames(classNamesList: Array<string>) {
        const self = this.getWritable();

        self.__classNames = classNamesList;
    }

    getClassNames(): Array<string> {
        const self = this.getLatest();
        return self.__classNames;
    }

    updateDOM(prevNode: CustomLinkNode, dom: HTMLLinkElement, config: EditorConfig): boolean {
        const isUpdated = super.updateDOM(prevNode, dom, config);

        const self = this.getLatest();

        if (prevNode.__target !== self.__target) {
            dom.setAttribute('target', self.__target);
        }

        if (prevNode.__target !== self.__target) {
            dom.setAttribute('href', self.__url);
        }

        if (prevNode.__classNames !== self.__classNames) {
            utils.addClassNamesToElement(dom, self.__classNames.join(' '));
        }
        return isUpdated;
    }
};

function $isCustomLinkNode(
    node: CustomLinkNode | LexicalNode | null | undefined
): node is CustomLinkNode {
    return node instanceof CustomLinkNode;
};

const $createCustomLinkNode = (text, url, targetAttribute, classNamesList) => {
    console.log(text, url, targetAttribute, classNamesList);
    return new CustomLinkNode(text, url, targetAttribute, classNamesList);
};

const TOGGLE_CUSTOM_LINK_COMMAND: any =
    createCommand();

function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
    const anchor = selection.anchor;
    console.log(anchor);
    const focus = selection.focus;
    console.log(focus);
    const anchorNode = selection.anchor.getNode();
    console.log(anchorNode);
    const focusNode = selection.focus.getNode();
    console.log(focusNode);
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
}

const LinkToggleButton: FC = () => {
    const [editor] = useLexicalComposerContext();
    const [url, setUrl] = useState<string>('https://');

    const [targetAttribute, setTargetAttribute] = useState<TARGET_TYPE>('_self');

    const [classNamesList, setClassNamesList] = useState<Array<string>>([]);


    const updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        console.log('update');
        if ($isCustomLinkNode(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isCustomLinkNode(parent)) {
                setUrl(parent.getURL());
            } else if ($isCustomLinkNode(node)) {
                setUrl(node.getURL());
                console.log(node.getUrl());
            } else {
                setUrl("");
            }
        }

        return true;
    }, []);

    useEffect(() => {
        editor.getEditorState().read(() => {
            console.log('editor');
            updateLinkEditor();
        });
    }, [editor, updateLinkEditor]);

    return <div>
        <input type="text" value={url} onChange={
            (e: ChangeEvent<InputElement>) => {
                setUrl(e.target.value);
            }
        }/>

        <select type="text" value={targetAttribute} onChange={
            (e: ChangeEvent<InputElement>) => {
                setTargetAttribute(e.target.value);
            }
        }>
            {
                ['_blank', '_self'].map((optionValue: string) => <option>{optionValue}</option>)
            }
        </select>


        <select type="text" mutliple value={classNamesList} onChange={
            (e: ChangeEvent<SelectHTMLElement>) => {
                const __classNamesList = Array.from(e.target.selectedOptions, option => option.value);
                setClassNamesList(__classNamesList);
            }
        }>
            {
                ['primary', 'secondary'].map((optionValue: string) => <option>{optionValue}</option>)
            }
        </select>
        <button onClick={() => {
            editor.dispatchCommand(TOGGLE_CUSTOM_LINK_COMMAND, {url, targetAttribute, classNamesList});
        }}>Toggle link
        </button>
    </div>
};
