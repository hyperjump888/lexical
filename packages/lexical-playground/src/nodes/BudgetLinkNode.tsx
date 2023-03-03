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
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';

import { LinkNode, SerializedLinkNode } from '@lexical/link';
import {$applyNodeReplacement} from 'lexical';
import * as React from 'react';
import {Suspense} from 'react';
import {useState} from "react";
import {InputForText} from "../plugins/TextLinkPlugin";
import Button from "../ui/Button";
import {getCategories, getCurrencies} from "./TravelBudgetNode";

const ImageComponent = React.lazy(
  // @ts-ignore
  () => import('./ImageComponent'),
);

export interface BudgetLinkPayload {
  amount: number;
  category: string;
  currency: string;
  key?: NodeKey;
  url: string;
}

function convertBudgetLinkElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLAnchorElement) {
    const datatype = domNode.getAttribute('data-type');
    if (datatype === 'budgetlink') {
      const url = domNode.getAttribute('href') as string;
      const currency = domNode.getAttribute('currency') as string;
      const amountStr = domNode.getAttribute('amount') as string;
      const category = domNode.getAttribute('category') as string;

      const amount = parseInt(amountStr,10);

      const node = $createBudgetLinkNode({amount, category, currency, url});
      return {node};
    }
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
    const {url, currency, amount, category} =
      serializedNode;
    const node = $createBudgetLinkNode({
      amount,
      category,
      currency,
      url,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('a');
    element.setAttribute('href',this.__url);
    element.setAttribute('data-type','budgetlink');
    element.setAttribute('data-currency',this.__currency);
    element.setAttribute('data-amount',this.__amount.toString());
    element.setAttribute('data-category',this.__category);
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => ({
        conversion: convertBudgetLinkElement,
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
      amount: this.getAmount(),
      category: this.getCategory(),
      currency: this.getCurrency(),
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
  createDOM(config: EditorConfig): HTMLAnchorElement {
    const element = document.createElement('a');
    element.href = this.__url;
    if (this.__target !== null) {
      element.target = this.__target;
    }
    if (this.__rel !== null) {
      element.rel = this.__rel;
    }
    element.setAttribute('data-type','budgetlink');
    element.setAttribute('data-currency',this.__currency);
    element.setAttribute('data-amount',this.__amount.toString());
    element.setAttribute('data-category',this.__category);
    return element;
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [title, setTitle] = useState('https://disneyland.disney.go.com/destinations/disneyland');
    const [amount, setAmount] = useState(100);
    const [curr, setCurr] = useState('idr');
    const [category, setCategory] = useState('transportation');

    return (
        <div className="Modal__content">
          <div className="TravelBudgetNode__container">
            <div className="TravelBudgetNode__inner">
              <div className="TravelBudgetNode__fieldsContainer">
                <div className="TravelBudgetNode__singlefieldContainer">
                  <div className="TravelBudgetNode__textInputWrapper">
                    <InputForText className="TravelBudgetNode__optionInput TravelBudgetNode__title"
                                  placeholder={title} value={title} onChange={setTitle} />
                  </div>
                </div>

              </div>
            </div>
            <div className="TravelBudgetNode__inner">
              <div className="TravelBudgetNode__fieldsContainer">
                <div className="TravelBudgetNode__singlefieldContainer">
                  <div className="TravelBudgetNode__textInputWrapper"><select defaultValue={curr} onChange={e => setCurr(e.target.value)}
                                                                              className="TravelBudgetNode__optionInput"
                                                                              name="currency" id="currency">
                    {this.getCurrency()}
                  </select></div>
                </div>


                <div className="TravelBudgetNode__singlefieldContainer">
                  <div className="TravelBudgetNode__textInputWrapper">
                    <InputForText className="TravelBudgetNode__optionInput TravelBudgetNode__amount"
                                  placeholder={'amount'} value={amount} onChange={setAmount} />
                  </div>
                </div>
              </div>
            </div>

            <div className="TravelBudgetNode__inner">
              <div className="TravelBudgetNode__fieldsContainer">
                <div className="TravelBudgetNode__singlefieldContainer">
                  <div className="TravelBudgetNode__textInputWrapper">
                    <select defaultValue={category} onChange={e => setCategory(e.target.value)}
                            className="TravelBudgetNode__optionInput TravelBudgetNode__accomodation"
                            name="category" id="category">
                      {this.getCategory()}
                    </select></div>
                </div>

              </div>
            </div>
          </div>

          <Button
              onClick={() => {

              }}>
            Confirm
          </Button>{' '}
          <Button
              onClick={() => {

              }}>
            Cancel
          </Button>
        </div>
    );

  }
}

export function $createBudgetLinkNode({
  amount,
  category,
  currency,
  key,
  url,
}: BudgetLinkPayload): BudgetLinkNode {
  return $applyNodeReplacement(
    new BudgetLinkNode(
      url,
      currency,
      amount,
      category,
      key,
    ),
  );
}

export function $isBudgetLinkNode(
  node: LexicalNode | null | undefined,
): node is BudgetLinkNode {
  return node instanceof BudgetLinkNode;
}
