/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {$createTextLink, InputForText} from './../plugins/TextLinkPlugin';
import Button from './../ui/Button';
import useModal from './../hooks/useModal';

import {
  $applyNodeReplacement, $createParagraphNode,
  $getNodeByKey, $getRoot,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  LexicalCommand, LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';
import {Suspense,useCallback, useEffect, useState } from 'react';
import {$createBudgetLinkNode, BudgetLinkNode} from "./BudgetLinkNode";
import {INSERT_TABLE_COMMAND} from "@lexical/table";
import TextInput from "../ui/TextInput";
import {DialogActions} from "../ui/Dialog";
import {mergeRegister} from "@lexical/utils";

export type Options = ReadonlyArray<Option>;

export type Option = Readonly<{
  text: string;
  uid: string;
  votes: Array<number>;
}>;

// list of world currencies in array format, with the currency code as the key and name as the value
const currencyList: {code: string; name: string}[] = [
  {code: 'AED', name: 'United Arab Emirates Dirham'},
  {code: 'AFA', name: 'Afghan Afghani'},
  {code: 'ALL', name: 'Albanian Lek'},
  {code: 'AMD', name: 'Armenian Dram'},
  {code: 'ANG', name: 'Netherlands Antillean Guilder'},
  {code: 'AOA', name: 'Angolan Kwanza'},
  {code: 'ARS', name: 'Argentine Peso'},
  {code: 'AUD', name: 'Australian Dollar'},
  {code: 'AWG', name: 'Aruban Florin'},
  {code: 'AZN', name: 'Azerbaijani Manat'},
  {code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark'},
  {code: 'BBD', name: 'Barbadian Dollar'},
  {code: 'BDT', name: 'Bangladeshi Taka'},
  {code: 'BEF', name: 'Belgian Franc'},
  {code: 'BGN', name: 'Bulgarian Lev'},
  {code: 'BHD', name: 'Bahraini Dinar'},
  {code: 'BIF', name: 'Burundian Franc'},
  {code: 'BMD', name: 'Bermudan Dollar'},
  {code: 'BND', name: 'Brunei Dollar'},
  {code: 'BOB', name: 'Bolivian Boliviano'},
  {code: 'BRL', name: 'Brazilian Real'},
  {code: 'BSD', name: 'Bahamian Dollar'},
  {code: 'BTC', name: 'Bitcoin'},
  {code: 'BTN', name: 'Bhutanese Ngultrum'},
  {code: 'BWP', name: 'Botswanan Pula'},
  {code: 'BYR', name: 'Belarusian Ruble'},
  {code: 'BZD', name: 'Belize Dollar'},
  {code: 'CAD', name: 'Canadian Dollar'},
  {code: 'CDF', name: 'Congolese Franc'},
  {code: 'CHF', name: 'Swiss Franc'},
  {code: 'CLP', name: 'Chilean Peso'},
  {code: 'CNY', name: 'Chinese Yuan'},
  {code: 'COP', name: 'Colombian Peso'},
  {code: 'CRC', name: 'Costa Rican ColÃ³n'},
  {code: 'CUC', name: 'Cuban Convertible Peso'},
  {code: 'CVE', name: 'Cape Verdean Escudo'},
  {code: 'CZK', name: 'Czech Republic Koruna'},
  {code: 'DEM', name: 'German Mark'},
  {code: 'DJF', name: 'Djiboutian Franc'},
  {code: 'DKK', name: 'Danish Krone'},
  {code: 'DOP', name: 'Dominican Peso'},
  {code: 'DZD', name: 'Algerian Dinar'},
  {code: 'EEK', name: 'Estonian Kroon'},
  {code: 'EGP', name: 'Egyptian Pound'},
  {code: 'ERN', name: 'Eritrean Nakfa'},
  {code: 'ETB', name: 'Ethiopian Birr'},
  {code: 'EUR', name: 'Euro'},
  {code: 'FJD', name: 'Fijian Dollar'},
  {code: 'FKP', name: 'Falkland Islands Pound'},
  {code: 'GBP', name: 'British Pound Sterling'},
  {code: 'GEL', name: 'Georgian Lari'},
  {code: 'GHS', name: 'Ghanaian Cedi'},
  {code: 'GIP', name: 'Gibraltar Pound'},
  {code: 'GMD', name: 'Gambian Dalasi'},
  {code: 'GNF', name: 'Guinean Franc'},
  {code: 'GRD', name: 'Greek Drachma'},
  {code: 'GTQ', name: 'Guatemalan Quetzal'},
  {code: 'GYD', name: 'Guyanaese Dollar'},
  {code: 'HKD', name: 'Hong Kong Dollar'},
  {code: 'HNL', name: 'Honduran Lempira'},
  {code: 'HRK', name: 'Croatian Kuna'},
  {code: 'HTG', name: 'Haitian Gourde'},
  {code: 'HUF', name: 'Hungarian Forint'},
  {code: 'IDR', name: 'Indonesian Rupiah'},
  {code: 'ILS', name: 'Israeli New Sheqel'},
  {code: 'INR', name: 'Indian Rupee'},
  {code: 'IQD', name: 'Iraqi Dinar'},
  {code: 'IRR', name: 'Iranian Rial'},
  {code: 'ISK', name: 'Icelandic KrÃ³na'},
  {code: 'ITL', name: 'Italian Lira'},
  {code: 'JMD', name: 'Jamaican Dollar'},
  {code: 'JOD', name: 'Jordanian Dinar'},
  {code: 'JPY', name: 'Japanese Yen'},
  {code: 'KES', name: 'Kenyan Shilling'},
  {code: 'KGS', name: 'Kyrgystani Som'},
  {code: 'KHR', name: 'Cambodian Riel'},
  {code: 'KMF', name: 'Comorian Franc'},
  {code: 'KPW', name: 'North Korean Won'},
  {code: 'KRW', name: 'South Korean Won'},
  {code: 'KWD', name: 'Kuwaiti Dinar'},
  {code: 'KYD', name: 'Cayman Islands Dollar'},
  {code: 'KZT', name: 'Kazakhstani Tenge'},
  {code: 'LAK', name: 'Laotian Kip'},
  {code: 'LBP', name: 'Lebanese Pound'},
  {code: 'LKR', name: 'Sri Lankan Rupee'},
  {code: 'LRD', name: 'Liberian Dollar'},
  {code: 'LSL', name: 'Lesotho Loti'},
  {code: 'LTL', name: 'Lithuanian Litas'},
  {code: 'LVL', name: 'Latvian Lats'},
  {code: 'LYD', name: 'Libyan Dinar'},
  {code: 'MAD', name: 'Moroccan Dirham'},
  {code: 'MDL', name: 'Moldovan Leu'},
  {code: 'MGA', name: 'Malagasy Ariary'},
  {code: 'MKD', name: 'Macedonian Denar'},
  {code: 'MMK', name: 'Myanmar Kyat'},
  {code: 'MNT', name: 'Mongolian Tugrik'},
  {code: 'MOP', name: 'Macanese Pataca'},
  {code: 'MRO', name: 'Mauritanian Ouguiya'},
  {code: 'MUR', name: 'Mauritian Rupee'},
  {code: 'MVR', name: 'Maldivian Rufiyaa'},
  {code: 'MWK', name: 'Malawian Kwacha'},
  {code: 'MXN', name: 'Mexican Peso'},
  {code: 'MYR', name: 'Malaysian Ringgit'},
  {code: 'MZM', name: 'Mozambican Metical'},
  {code: 'NAD', name: 'Namibian Dollar'},
  {code: 'NGN', name: 'Nigerian Naira'},
  {code: 'NIO', name: 'Nicaraguan CÃ³rdoba'},
  {code: 'NOK', name: 'Norwegian Krone'},
  {code: 'NPR', name: 'Nepalese Rupee'},
  {code: 'NZD', name: 'New Zealand Dollar'},
  {code: 'OMR', name: 'Omani Rial'},
  {code: 'PAB', name: 'Panamanian Balboa'},
  {code: 'PEN', name: 'Peruvian Nuevo Sol'},
  {code: 'PGK', name: 'Papua New Guinean Kina'},
  {code: 'PHP', name: 'Philippine Peso'},
  {code: 'PKR', name: 'Pakistani Rupee'},
  {code: 'PLN', name: 'Polish Zloty'},
  {code: 'PYG', name: 'Paraguayan Guarani'},
  {code: 'QAR', name: 'Qatari Rial'},
  {code: 'RON', name: 'Romanian Leu'},
  {code: 'RSD', name: 'Serbian Dinar'},
  {code: 'RUB', name: 'Russian Ruble'},
  {code: 'RWF', name: 'Rwandan Franc'},
  {code: 'SAR', name: 'Saudi Riyal'},
  {code: 'SBD', name: 'Solomon Islands Dollar'},
  {code: 'SCR', name: 'Seychellois Rupee'},
  {code: 'SDG', name: 'Sudanese Pound'},
  {code: 'SEK', name: 'Swedish Krona'},
  {code: 'SGD', name: 'Singapore Dollar'},
  {code: 'SHP', name: 'St. Helena Pound'},
  {code: 'SKK', name: 'Slovak Koruna'},
  {code: 'SLL', name: 'Sierra Leonean Leone'},
  {code: 'SOS', name: 'Somali Shilling'},
  {code: 'SRD', name: 'Surinamese Dollar'},
  {code: 'STD', name: 'São Tomé and Príncipe Dobra'},
  {code: 'SVC', name: 'Salvadoran ColÃ³n'},
  {code: 'SYP', name: 'Syrian Pound'},
  {code: 'SZL', name: 'Swazi Lilangeni'},
  {code: 'THB', name: 'Thai Baht'},
  {code: 'TJS', name: 'Tajikistani Somoni'},
  {code: 'TMT', name: 'Turkmenistani Manat'},
  {code: 'TND', name: 'Tunisian Dinar'},
  {code: 'TOP', name: "Tongan Pa'anga"},
  {code: 'TRY', name: 'Turkish Lira'},
  {code: 'TTD', name: 'Trinidad & Tobago Dollar'},
  {code: 'TWD', name: 'New Taiwan Dollar'},
  {code: 'TZS', name: 'Tanzanian Shilling'},
  {code: 'UAH', name: 'Ukrainian Hryvnia'},
  {code: 'UGX', name: 'Ugandan Shilling'},
  {code: 'USD', name: 'US Dollar'},
  {code: 'UYU', name: 'Uruguayan Peso'},
  {code: 'UZS', name: 'Uzbekistan Som'},
  {code: 'VEF', name: 'Venezuelan BolÃvar'},
  {code: 'VND', name: 'Vietnamese Dong'},
  {code: 'VUV', name: 'Vanuatu Vatu'},
  {code: 'WST', name: 'Samoan Tala'},
  {code: 'XAF', name: 'CFA Franc BEAC'},
  {code: 'XCD', name: 'East Caribbean Dollar'},
  {code: 'XDR', name: 'Special Drawing Rights'},
  {code: 'XOF', name: 'CFA Franc BCEAO'},
  {code: 'XPF', name: 'CFP Franc'},
  {code: 'YER', name: 'Yemeni Rial'},
  {code: 'ZAR', name: 'South African Rand'},
  {code: 'ZMK', name: 'Zambian Kwacha'},
];
// list of categories ['Accommodation','Transportation'] in array format
const categories: string[] = ['Accommodation', 'Transportation','Food','Entertainment','Other'];

export function getCurrencies() {
  let map = new Map<string, string>();
  currencyList.map( (myobj) => {
    map.set(myobj.name,myobj.code);
  });

  let ar = [...map.entries()], sortedArray = ar.sort(), sortedMap = new Map(sortedArray), html = '', newObj : {code: string; name: string}[] = [] ;

  sortedMap.forEach( (key,value) => {
    newObj.push({code: key, name : value})
  });

  return newObj.map((curr) => {
    return (<option key={curr.code} value={curr.code}>{curr.name}
    </option>);
  });
}

export function getCategories() {
  return categories.map((category) => {
    return (<option key={category} value={category}>{category}
    </option>);
  });
}


function createUID(): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5);
}

export type TravelBudgetOption = Readonly<{
  title: string;
  time: string;
  currency: string;
  amt: number;
  category: string;
}>;

export type SerializedTravelBudgetNode = Spread<
  {
    option: TravelBudgetOption;
    type: 'travelbudget';
    version: 1;
  },
  SerializedLexicalNode
>;

export const INSERT_TRAVEL_BUDGET_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_TRAVEL_BUDGET_COMMAND',
);

function TravelBudgetComponent({nodeKey}: {nodeKey: NodeKey}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [title, setTitle] = useState('https://disneyland.disney.go.com/destinations/disneyland');
  const [amount, setAmount] = useState(100);
  const [curr, setCurr] = useState('idr');
  const [category, setCategory] = useState('transportation');


  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isTravelBudgetNode(node)) {
          node.remove();
        }
        setSelected(false);
      }
      return false;
    },
    [isSelected, nodeKey, setSelected],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const hrElem = editor.getElementByKey(nodeKey);

          if (event.target === hrElem) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

  useEffect(() => {
    const tbElem = editor.getElementByKey(nodeKey);
    if (tbElem !== null) {
      tbElem.className = isSelected ? 'selected' : '';
    }
  }, [editor, isSelected, nodeKey]);

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
                                  {getCurrencies()}
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
                                      {getCategories()}
                                </select></div>
                            </div>

                        </div>
                    </div>
                </div>


                <Button
                    onClick={() => {
                        editor.update( () => {
                           /* const rel = `${curr},${amount},${category}`;
                            const myElement = $createTextLink(title, rel);
                            console.log(rel);*/

                          //const budget = new BudgetLinkNode();

                        });
                        editor.focus();
                    }}>
                    Confirm
                </Button>{' '}
                <Button
                    onClick={() => {
                        editor.focus();
                    }}>
                    Cancel x
                </Button>
            </div>
  );
}



export function InsertBudget({
                                    editor,
                                    onClose,
                                  }: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
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
                  {getCurrencies()}
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
                    {getCategories()}
                  </select></div>
              </div>

            </div>
          </div>
        </div>

        <Button
            onClick={() => {
              editor.update( () => {
                /*
                const elBudget =$createBudgetLinkNode({
                  amount:amount,
                  category:category,
                  currency:curr,
                  url:title
                });
                const root = $getRoot();
                const paragraphNode = $createParagraphNode();
                paragraphNode.append(elBudget);
                // Finally, append the paragraph to the root
                root.append(paragraphNode);
                */
              });
              editor.focus();
              onClose();
            }}>
          Confirm
        </Button>{' '}
        <Button
            onClick={() => {
              editor.focus();
              onClose();
            }}>
          Cancel
        </Button>
      </div>
  );
}

export class TravelBudgetNode extends DecoratorNode<JSX.Element> {
  __options: TravelBudgetOption;

  constructor(options: TravelBudgetOption, key?: NodeKey) {
    super(key);
    this.__options = options;
  }

  static getType(): string {
    return 'travelbudget';
  }

  static clone(node: TravelBudgetNode): TravelBudgetNode {
    return new TravelBudgetNode(node.__options, node.__key);
  }

  static importJSON(
    serializedNode: SerializedTravelBudgetNode,
  ): TravelBudgetNode {
    return $createTravelBudgetNode();
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: () => ({
        conversion: convertTravelBudgetElement,
        priority: 0,
      }),
    };
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: 'travelbudget',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    return {element: document.createElement('span')};
  }

  createDOM(): HTMLElement {
    return document.createElement('span');
  }

  getTextContent(): '\n' {
    return '\n';
  }

  isInline(): false {
    return false;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return <TravelBudgetComponent nodeKey={this.__key} />;
  }
}

function convertTravelBudgetElement(): DOMConversionOutput {
  return {node: $createTravelBudgetNode()};
}

export function $createTravelBudgetNode(): TravelBudgetNode {
  return $applyNodeReplacement(new TravelBudgetNode());
}

export function $isTravelBudgetNode(
  node: LexicalNode | null | undefined,
): node is TravelBudgetNode {
  return node instanceof TravelBudgetNode;
}
