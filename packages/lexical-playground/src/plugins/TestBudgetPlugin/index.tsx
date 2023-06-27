/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './index.css';

import {$isAutoLinkNode, $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$findMatchingParent, mergeRegister} from '@lexical/utils';
import {
    $createParagraphNode, $createTextNode,
    $getRoot,
    $getSelection,
    $isRangeSelection, $isRootOrShadowRoot,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    GridSelection,
    KEY_ESCAPE_COMMAND,
    LexicalEditor,
    NodeSelection,
    RangeSelection,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {Dispatch, useCallback, useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {createPortal} from 'react-dom';

import {getCategories, getCurrencies} from '../../nodes/TravelBudgetNode';
import Button from '../../ui/Button';
import LinkPreview from '../../ui/LinkPreview';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {setFloatingElemPosition} from '../../utils/setFloatingElemPosition';
import {sanitizeUrl} from '../../utils/url';
import {InputForNumber, InputForText} from '../TextLinkPlugin';
import Editor from "../../Editor";

type BudgetType = {
    title : string,
    curr : string,
    amount : string,
    category: string
}

function TestBudgetPlugin({
                              editor,
                              isLink,
                              setIsLink,
                              anchorElem,
                              titlex,
                              amountx,
                              currx,
                              categoryx


                          }: {
    editor: LexicalEditor;
    isLink: boolean;
    setIsLink: Dispatch<boolean>;
    anchorElem: HTMLElement;
    titlex : string;
    amountx : number;
    currx : string;
    categoryx : string;
}): JSX.Element {
    const editorRef = useRef<HTMLDivElement | null>(null);
    //const inputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isEditMode, setEditMode] = useState(false);
    const [title, setTitle] = useState(titlex || 'DisneyLand');
    const [mytitle, setMytitle] = useState(titlex || 'DisneyLand');

    const [amount, setAmount] = useState(amountx || 100);
    const [curr, setCurr] = useState(currx || 'USD');
    const [category, setCategory] = useState(categoryx || 'Transportation');


    const [lastSelection, setLastSelection] = useState<
        RangeSelection | GridSelection | NodeSelection | null
        >(null);

    const updateLinkEditor = useCallback(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
                setLinkUrl(parent.getURL());
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl('');
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) {
            return;
        }

        const rootElement = editor.getRootElement();
        if (
            selection !== null &&
            nativeSelection !== null &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode) &&
            editor.isEditable()
        ) {
            const domRange = nativeSelection.getRangeAt(0);
            let rect;
            if (nativeSelection.anchorNode === rootElement) {
                let inner = rootElement;
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild as HTMLElement;
                }
                rect = inner.getBoundingClientRect();
            } else {
                rect = domRange.getBoundingClientRect();
            }

            setFloatingElemPosition(rect, editorElem, anchorElem);
            setLastSelection(selection);
        } else if (!activeElement || activeElement.className !== 'link-input') {
            if (rootElement !== null) {
                setFloatingElemPosition(null, editorElem, anchorElem);
            }
            setLastSelection(null);
            setEditMode(false);
            setLinkUrl('');
        }

        return true;
    }, [anchorElem, editor]);

    useEffect(() => {
        const scrollerElem = anchorElem.parentElement;

        const update = () => {
            editor.getEditorState().read(() => {
                updateLinkEditor();
            });
        };

        window.addEventListener('resize', update);

        if (scrollerElem) {
            scrollerElem.addEventListener('scroll', update);
        }

        return () => {
            window.removeEventListener('resize', update);

            if (scrollerElem) {
                scrollerElem.removeEventListener('scroll', update);
            }
        };
    }, [anchorElem.parentElement, editor, updateLinkEditor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    updateLinkEditor();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateLinkEditor();
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    if (isLink) {
                        setIsLink(false);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [editor, updateLinkEditor, setIsLink, isLink]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateLinkEditor();
        });
    }, [editor, updateLinkEditor]);

    const amountChange = (e : any) => {
        setAmount(parseFloat(e.target.value) || 0);
    };
    const titleChange = (e : any) => {
        setMytitle(e.target.value);
    };
    const currChange = (e : any) => {
        setCurr(e.target.value);
    };

    const categoryChange = (e : any) => {
        setCategory(e.target.value);
    };

    const saveButton = (e : any) => {
        editor.update( () => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const node = getSelectedNode(selection);
                const linkParent = $findMatchingParent(node, $isLinkNode);
                const anchorNode = selection.anchor.getNode();
                anchorNode.setTextContent(mytitle);
                let element =
                    anchorNode.getKey() === 'root'
                        ? anchorNode
                        : $findMatchingParent(anchorNode, (el) => {
                            const parent = el.getParent();
                            return parent !== null && $isRootOrShadowRoot(parent);
                        });

                if (element === null) {
                    element = anchorNode.getTopLevelElementOrThrow();
                }
                const elementKey = element.getKey();
                const elementDOM = editor.getElementByKey(elementKey);
                if (elementDOM != null) {
                    const currentElement = elementDOM.querySelector('a');
                    const rel = `${curr},${amount},${category}`;
                    if (currentElement != null) {
                        currentElement.setAttribute('data-amount',amount);
                        currentElement.setAttribute('data-category',category);
                        currentElement.setAttribute('data-currency',curr);
                        //currentElement.setAttribute('href',title);
                        currentElement.setAttribute('rel',rel);
                        const writable = linkParent?.getWritable();
                        if (writable) writable.__rel = rel;
                    }
                }
            }

            e.target.style.backgroundColor ='green';
            e.target.style.color ='white';
            e.target.focus();

            changeprops();
            function changeprops() {
                setTimeout(function () {
                    e.target.style.backgroundColor = '#eee';
                    e.target.style.color = 'rgb(61, 135, 245)';
                    e.target.focus();

                }, 1200);
            }
            // const root = $getRoot();
            // const text = $createTextNode(' ');
            // const paragraph = $createParagraphNode();
            // paragraph.append(text);
            // root.append(paragraph);
            // root.selectEnd();
        });
    }

    return (
        <div ref={editorRef} key={title} className="link-editor">
            {(
                <>
                    <h2 className="title__link">Travel Budget</h2>
                    <div ref={editorRef} className="Modal__content">

                        <div className="TravelBudgetNode__container">
                            <div className="TravelBudgetNode__inner">
                                <div className="TravelBudgetNode__fieldsContainer">
                                    <div className="TravelBudgetNode__singlefieldContainer">
                                        <div className="TravelBudgetNode__textInputWrapper">
                                            <InputForText className="TravelBudgetNode__optionInput TravelBudgetNode__title"
                                                          placeholder={title} value={mytitle} onChange={titleChange} />
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="TravelBudgetNode__inner">
                                <div className="TravelBudgetNode__fieldsContainer">
                                    <div className="TravelBudgetNode__singlefieldContainer">
                                        <div className="TravelBudgetNode__textInputWrapper">
                                            <select value={curr} data-test={curr} onChange={currChange}
                                                    className="TravelBudgetNode__optionInput TravelBudgetNode__currency"
                                                    name="currency" id="currency">
                                                {getCurrencies()}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="TravelBudgetNode__singlefieldContainer">
                                        <div className="TravelBudgetNode__textInputWrapper">
                                            <InputForNumber className="TravelBudgetNode__optionInput TravelBudgetNode__amount"
                                                          placeholder={'amount'} value={amount} onChange={amountChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="TravelBudgetNode__inner">
                                <div className="TravelBudgetNode__fieldsContainer">
                                    <div className="TravelBudgetNode__singlefieldContainer">
                                        <div className="TravelBudgetNode__textInputWrapper">
                                            <select value={category} onChange={categoryChange}
                                                    className="TravelBudgetNode__optionInput TravelBudgetNode__accomodation"
                                                    name="category" id="category">
                                                {getCategories()}
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={(e) => {saveButton(e)}}>
                            Save
                        </Button>{' '}

                    </div>
                </>
            )}
        </div>
    );
}




function useTestFloatingLinkEditorToolbar(
    editor: LexicalEditor,
    anchorElem: HTMLElement,
): JSX.Element | null {
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isLink, setIsLink] = useState(false);
    const [title, setTitle] = useState('Disney Land');
    const [amount, setAmount] = useState('');
    const [curr, setCurr] = useState('USD');
    const [category, setCategory] = useState('Transportation');
    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkParent = $findMatchingParent(node, $isLinkNode);
            const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);
            // We don't want this menu to open for auto links.
            if (linkParent != null && autoLinkParent == null) {
                setIsLink(true);
                setTitle(linkParent.getTextContent());
                //console.log(linkParent.getTextContent())
                const elementKey = linkParent.getKey();
                const currentElement = editor.getElementByKey(elementKey);
                const rel = currentElement?.getAttribute('rel');
                console.log(rel);
                if (rel) {
                    const arr = rel.split(',');
                    if (arr.length) {
                        setCurr(arr[0]);
                        setAmount(arr[1]);
                        setCategory(arr[2]);
                    }
                }
            } else {
                setIsLink(false);
            }
        }
    }, []);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    updateToolbar();
                    setActiveEditor(newEditor);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
        );
    }, [editor, updateToolbar]);

    return isLink
        ? createPortal(
            <TestBudgetPlugin
                editor={activeEditor}
                isLink={isLink}
                anchorElem={anchorElem}
                setIsLink={setIsLink}
                titlex={title}
                amountx={amount}
                currx={curr}
                categoryx={category}

            />,
            anchorElem,
        )
        : null;
}

export default function TestBudgetPluginEditor({
                                                   anchorElem = document.body,
                                               }: {
    anchorElem?: HTMLElement;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    return useTestFloatingLinkEditorToolbar(editor, anchorElem);
}
