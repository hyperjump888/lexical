/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './setupEnv';
import './index.css';

import * as React from 'react';
import {createRoot} from 'react-dom/client';

import App from './App';
import {exportFile,importFile} from "@lexical/file";
import {CLEAR_HISTORY_COMMAND, LexicalEditor} from "lexical";

// Handle runtime errors
const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get('vite-error-overlay');
  if (!ErrorOverlay) {
    return;
  }
  const overlay = new ErrorOverlay(err);
  const body = document.body;
  if (body !== null) {
    body.appendChild(overlay);
  }
};

window.addEventListener('error', showErrorOverlay);
window.addEventListener('unhandledrejection', ({reason}) =>
  showErrorOverlay(reason),
);


declare global {
  interface Window {
    buildLexicalEditor: any;
      importFile : any;
  }
}

window.importFile = function(editor: LexicalEditor, text:string) {
    const json = JSON.parse(text);
    const editorState = editor.parseEditorState(
        JSON.stringify(json.editorState),
    );
    editor.setEditorState(editorState);
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
}

window.buildLexicalEditor = function(elementId:string) {
  return createRoot(document.getElementById(elementId) as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
  );
}
