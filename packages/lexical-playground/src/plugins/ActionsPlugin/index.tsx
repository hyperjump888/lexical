/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {CLEAR_HISTORY_COMMAND, EditorState, LexicalEditor} from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';

import {$createCodeNode, $isCodeNode} from '@lexical/code';
import {exportFile, importFile} from '@lexical/file';
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
} from '@lexical/markdown';
import {useCollaborationContext} from '@lexical/react/LexicalCollaborationContext';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND} from '@lexical/yjs';
import {
    $createTextNode,
    $getRoot,
    $isParagraphNode,
    CLEAR_EDITOR_COMMAND,
    COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';

import useModal from '../../hooks/useModal';
import Button from '../../ui/Button';
import {PLAYGROUND_TRANSFORMERS} from '../MarkdownTransformers';
import {
    SPEECH_TO_TEXT_COMMAND,
    SUPPORT_SPEECH_RECOGNITION,
} from '../SpeechToTextPlugin';
import {version} from '../../../../lexical-file/package.json';

declare global {
    interface Window {
        LexicalEditor: any;
        LexicalRoot : any;
        LexicalGetContent : any;
    }
}

async function sendEditorState(editor: LexicalEditor): Promise<void> {
    const stringifiedEditorState = JSON.stringify(editor.getEditorState());
    try {
        await fetch('http://localhost:1235/setEditorState', {
            body: stringifiedEditorState,
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
            method: 'POST',
        });
    } catch {
        // NO-OP
    }
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
    const stringifiedEditorState = JSON.stringify(editor.getEditorState());
    let response = null;
    try {
        response = await fetch('http://localhost:1235/validateEditorState', {
            body: stringifiedEditorState,
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
            method: 'POST',
        });
    } catch {
        // NO-OP
    }
    if (response !== null && response.status === 403) {
        throw new Error(
            'Editor state validation failed! Server did not accept changes.',
        );
    }
}

export default function ActionsPlugin({
                                          isRichText,
                                      }: {
    isRichText: boolean;
}): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [isSpeechToText, setIsSpeechToText] = useState(false);
    const [connected, setConnected] = useState(false);
    const [isEditorEmpty, setIsEditorEmpty] = useState(true);
    const [modal, showModal] = useModal();
    const {isCollabActive} = useCollaborationContext();

    useEffect(() => {
        return mergeRegister(
            editor.registerEditableListener((editable) => {
                setIsEditable(editable);
            }),
            editor.registerCommand<boolean>(
                CONNECTED_COMMAND,
                (payload) => {
                    const isConnected = payload;
                    setConnected(isConnected);
                    return false;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(
            ({dirtyElements, prevEditorState, tags}) => {
                window.LexicalEditor = editor;
                // If we are in read only mode, send the editor state
                // to server and ask for validation if possible.
                if (
                    !isEditable &&
                    dirtyElements.size > 0 &&
                    !tags.has('historic') &&
                    !tags.has('collaboration')
                ) {
                    validateEditorState(editor);
                }
                editor.getEditorState().read(() => {
                    const root = $getRoot();
                    const children = root.getChildren();
                    window.LexicalRoot = root;
                    window.LexicalGetContent = root.getTextContent();
                    if (children.length > 1) {
                        setIsEditorEmpty(false);
                    } else {
                        if ($isParagraphNode(children[0])) {
                            const paragraphChildren = children[0].getChildren();
                            setIsEditorEmpty(paragraphChildren.length === 0);
                        } else {
                            setIsEditorEmpty(false);
                        }
                    }
                });
            },
        );
    }, [editor, isEditable]);

    const handleMarkdownToggle = useCallback(() => {
        editor.update(() => {
            const root = $getRoot();
            const firstChild = root.getFirstChild();
            if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
                $convertFromMarkdownString(
                    firstChild.getTextContent(),
                    PLAYGROUND_TRANSFORMERS,
                );
            } else {
                const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
                root
                    .clear()
                    .append(
                        $createCodeNode('markdown').append($createTextNode(markdown)),
                    );
            }
            root.selectEnd();
        });
    }, [editor]);



    return (
        <div className="actions">
            {SUPPORT_SPEECH_RECOGNITION && (
                <button
                    type="button"
                    onClick={() => {
                        editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
                        setIsSpeechToText(!isSpeechToText);
                    }}
                    className={
                        'action-button action-button-mic ' +
                        (isSpeechToText ? 'active' : '')
                    }
                    title="Speech To Text"
                    aria-label={`${
                        isSpeechToText ? 'Enable' : 'Disable'
                    } speech to text`}>
                    <i className="mic" />
                </button>
            )}
            <span className="lexsave" onClick={(e) => {
                exportingFile(e,editor);
            }}
            > </span>

            <span className="lexhtml" onClick={(e) => lexicalToHTML(e, editor)}
            > </span>


            {isCollabActive && (
                <button
                    type="button"
                    className="action-button connect"
                    onClick={() => {
                        editor.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected);
                    }}
                    title={`${
                        connected ? 'Disconnect' : 'Connect'
                    } Collaborative Editing`}
                    aria-label={`${
                        connected ? 'Disconnect from' : 'Connect to'
                    } a collaborative editing server`}>
                    <i className={connected ? 'disconnect' : 'connect'} />
                </button>
            )}
            {modal}
        </div>
    );
}

function ShowClearDialog({
                             editor,
                             onClose,
                         }: {
    editor: LexicalEditor;
    onClose: () => void;
}): JSX.Element {
    return (
        <>
            Are you sure you want to clear the editor?
            <div className="Modal__content">
                <Button
                    onClick={() => {
                        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                        editor.focus();
                        onClose();
                    }}>
                    Clear
                </Button>{' '}
                <Button
                    onClick={() => {
                        editor.focus();
                        onClose();
                    }}>
                    Cancel
                </Button>
            </div>
        </>
    );
}

type DocumentJSON = {
    editorState: EditorState;
    lastSaved: number;
    source: string | 'Lexical';
    version: typeof version;
};

export function lexicalToHTML(
    e : any,
    editor: LexicalEditor,
) {
    editor.update(() => {
        /* const editorState = editor.getEditorState();
         const jsonString = JSON.stringify(editorState);
         console.log(jsonString)*/
        const htmlString = $generateHtmlFromNodes(editor, null);
         //console.log(htmlString)
        const hasDiv = e.target.closest(`.editor-shell`).querySelector('.lexicalhtml') === null ? false : true;
        let div;
        if (!hasDiv) {
            //console.log('tidak ada div')
            div = document.createElement('div');
            div.setAttribute('class','lexicalhtml');

            div.style.display = 'none';
        } else {
            div = document.querySelector('.lexicalhtml');
        }
        if (div === null) {
            return;
        }
        div.innerHTML = htmlString;
        const parentWithClass = e.target.closest('.editor-shell');
        parentWithClass.appendChild(div);
    });
}

export function exportingFile(
    e: any,
    editor: LexicalEditor,
) {
    const now = new Date();
    const editorState = editor.getEditorState();
    const documentJSON: DocumentJSON = {
        editorState: editorState,
        lastSaved: now.getTime(),
        source: 'Playground',
        version,
    };
    const hasDiv = e.target.closest(`.editor-shell`).querySelector('.lexicalstore') === null ? false : true;
    let div;
    if (!hasDiv) {
        div = document.createElement('div');
        div.setAttribute('class','lexicalstore');
        div.style.display = 'none';
    } else {
        div = document.querySelector('.lexicalstore');
    }
    if (div === null) {
        return;
    }
    div.innerHTML = JSON.stringify(documentJSON);
    const parentWithClass = e.target.closest('.editor-shell');
    parentWithClass.appendChild(div);
    const parentId = parentWithClass.parentElement.getAttribute('id') || '';
    if (parentId) {
        div.setAttribute('id', 'lexicalstore'+parentId);
    }
}
