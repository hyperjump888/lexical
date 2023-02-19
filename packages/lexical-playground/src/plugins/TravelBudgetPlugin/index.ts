/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import {useEffect} from 'react';

import {
    $createTravelBudgetNode,
  INSERT_TRAVEL_BUDGET_COMMAND,
} from '../../nodes/TravelBudgetNode';

export function TravelBudgetPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_TRAVEL_BUDGET_COMMAND,
      (type) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const focusNode = selection.focus.getNode();

        if (focusNode !== null) {
          const travelBudgetNode = $createTravelBudgetNode();
          $insertNodeToNearestRoot(travelBudgetNode);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
