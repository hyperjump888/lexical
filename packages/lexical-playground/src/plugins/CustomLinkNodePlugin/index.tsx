// @ts-nocheck

/*
tasks:


selected url,target,classnameslist preview
*/


import {
    EditorState,
    EditorConfig,
    createCommand,
    LexicalCommand,
    COMMAND_PRIORITY_EDITOR,
    $isElementNode,
    $getSelection,
    $setSelection,
    LexicalNode,
    ElementNode,
    ParagraphNode,
    TextNode,
    RangeSelection
} from 'lexical';

import { $isAtNodeEnd } from "@lexical/selection";

import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FC, useState, useEffect, useCallback } from 'react';

import utils from "@lexical/utils";

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

type TARGET_TYPE = string;


import { LinkNode } from '@lexical/link';

const theme = {

};

console.log(TRANSFORMERS[14]);

const onError = (error : Error) => {
    console.error(error);
};

class CustomLinkNode extends LinkNode {
    __target: '_blank' | '_self';
    __classNames : Array<string>;
    __url: string;

    constructor(text: string, url : string, target: TARGET_TYPE, classNames: Array<string>, key?: NodeKey): void {
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
    }

    setTarget(target : TARGET_TYPE) {
        const self = this.getWritable();

        self.__target = target;
    }

    getTarget() : TARGET_TYPE {
        const self = this.getLatest();
        return self.__target;
    }

    setClassNames(classNamesList : Array<string>) {
        const self = this.getWritable();

        self.__classNames = classNamesList;
    }

    getClassNames() : Array<string> {
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
}

function $isCustomLinkNode(
    node: CustomLinkNode | LexicalNode | null | undefined
): node is CustomLinkNode {
    return node instanceof CustomLinkNode;
}

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

const LinkToggleButton : FC = () => {
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
            (e : ChangeEvent<InputElement>) => {
                setUrl(e.target.value);
            }
        } />

        <select type="text" value={targetAttribute} onChange={
            (e : ChangeEvent<InputElement>) => {
                setTargetAttribute(e.target.value);
            }
        }>
            {
                ['_blank', '_self'].map((optionValue : string) => <option>{optionValue}</option>)
            }
        </select>


        <select type="text" mutliple value={classNamesList} onChange={
            (e : ChangeEvent<SelectHTMLElement>) => {
                const __classNamesList = Array.from(e.target.selectedOptions, option => option.value);
                setClassNamesList(__classNamesList);
            }
        }>
            {
                ['primary', 'secondary'].map((optionValue : string) => <option>{optionValue}</option>)
            }
        </select>
        <button onClick={() => {
            editor.dispatchCommand(TOGGLE_CUSTOM_LINK_COMMAND, { url, targetAttribute, classNamesList });
        }}>Toggle link</button>
    </div>
};

const CustomLinkNodePlugin : FC = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([CustomLinkNode])) {
            throw new Error(
                "CustomLinkNodePlugin: CustomLinkNode not registered on editor"
            );
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            TOGGLE_CUSTOM_LINK_COMMAND,
            (props) => {
                console.log(props);
                toggleCustomLink(props.url, props.targetAttribute, props.classNamesList);

                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
};

function toggleCustomLink(url: string, target: TARGET_TYPE, classNamesList : Array<string>): void {

    console.log(url, target, classNamesList);

    const sel = $getSelection();

    console.log(sel);

    if (sel !== null) {
        const nodes : Array<LexicalNode> = sel.extract();

        if (url === null) {
            // remove LinkNodes
            nodes.forEach((node) => {
                console.log(node);
                const parent = node.getParent();

                if (!parent) return;

                if ($isCustomLinkNode(parent)) {
                    const children = parent.getChildren();

                    for (let i = 0; i < children.length; i++) {
                        parent.insertBefore(children[i]);
                    }

                    parent.remove();
                }
            });
        } else {
            if (nodes.length === 1) {
                const firstNode = nodes[0];

                if ($isCustomLinkNode(firstNode)) {
                    firstNode.setURL(url);

                    firstNode.setTarget(target);

                    firstNode.setClassNames(classNamesList);

                    return;
                } else {
                    const parent = firstNode.getParent();

                    console.log(parent);

                    if ($isCustomLinkNode(parent)) {
                        parent.setURL(url);

                        parent.setTarget(target);

                        parent.setClassNames(classNamesList);

                        return;
                    }
                }
            }

            let prevParent: ElementNode | null = null;
            let linkNode: CustomLinkNode | null = null;

            nodes.forEach((node) => {
                const parent = node.getParent();

                if (
                    parent === linkNode ||
                    parent === null ||
                    ($isElementNode(node) && !node.isInline())
                ) {
                    return;
                }

                if ($isCustomLinkNode(parent)) {
                    linkNode = parent;
                    parent.setURL(url);


                    parent.setTarget(target);

                    parent.setClassNames(classNamesList);
                    return;
                }

                if (!parent.is(prevParent)) {
                    prevParent = parent;

                    console.log(url, target, classNamesList);
                    linkNode = $createCustomLinkNode(node.__text, url, target, classNamesList);

                    if ($isCustomLinkNode(parent)) {
                        if (node.getPreviousSibling() === null) {
                            parent.insertBefore(linkNode);
                        } else {
                            parent.insertAfter(linkNode);
                        }
                    } else {
                        node.insertBefore(linkNode);
                    }
                }

                if ($isCustomLinkNode(node)) {
                    if (node.is(linkNode)) {
                        return;
                    }
                    if (linkNode !== null) {
                        const children = node.getChildren();

                        for (let i = 0; i < children.length; i++) {
                            linkNode.append(children[i]);
                        }

                    }

                    node.remove();
                    return;
                }

                if (linkNode !== null) {
                    linkNode.append(node);
                }
            });
        }
    }
}

const LexicalEditor : FC = () => {
    const initialConfig = {
        namespace: 'LinkTargetSelect_LinkClassnameSelect',
        theme,
        onError,
        nodes: [
            LinkNode,
            CustomLinkNode,
            TextNode,
            ParagraphNode,
            {
                replace: LinkNode,
                with: (node) => {
                    return new CustomLinkNode();
                }
            }
        ]
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <LinkToggleButton />
            <div>
                <RichTextPlugin
                    contentEditable={<ContentEditable />}
                    placeholder={<div>Type something here!</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <CustomLinkNodePlugin />
            </div>
        </LexicalComposer>
    );
}
