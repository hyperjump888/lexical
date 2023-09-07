/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// import './TimelineItemEdit.css';

import './AutoIcons.css';

import * as React from 'react';
import {useCallback, useState} from 'react';

//icons collection
import tablerIcons from './AutoIconsData';
import Button from './Button';

type Props = {
  onConfirm: (tltime: string, tlicon: string, tldesc: string, tlcolor: string) => void;
};

export default function TimelineItemEdit({onConfirm}: Props): JSX.Element {
    const [tltime, setTltime] = useState<string>('');
    const [tlicon, setTlicon] = useState<string>('');
    const [tldesc, setTldesc] = useState<string>('');
    const [tlcolor, setTlcolor] = useState<string>('green');

    const [value, setValue] = useState<string>('');
    const [data, setData] = useState<JSX.Element>(<div />);
    const [icon, setIcon] = useState<string>('tabler-question-mark');

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        const query = value.toLowerCase();
        const icons = tablerIcons.filter(
            (item) => item.toLowerCase().indexOf(query) >= 0,
        );
        //test UI
        if (icons.length > 25) {
            icons.length = 25;
        }
        setData(dataBody(icons));
    };

    // green,yellow,red,blue,black,white
    const colors: {value: string; text: string}[] = [
        {text: 'Green',value: 'green'},
        {text: 'Yellow',value: 'yellow'},
        {text: 'Red',value: 'red'},
        {text: 'Blue', value: 'blue'},
        {text: 'Black',value: 'black'},
        {text: 'White',value: 'white'}
    ];

    const changeIcon = (str:string) => {
        setIcon(`tabler-${str}`);
        setValue(str);
        setTlicon(str);
    };

    const dataBody = (arr: string[]) => {
        return (
            <div className="divicons">
                {arr.map((item) => {
                    const tablerItem = `tabler-${item} tabler-set-icon`;
                    return (
                        <button key={item} onClick={() => changeIcon(item)} className="btn btn-secondary btn-icon" title={item}>
                            <i className={tablerItem} />
                        </button>
                    );
                })}
            </div>
        );
    };

    const onClick = useCallback(() => {
    onConfirm(tltime, tlicon, tldesc, tlcolor);
  }, [onConfirm, tltime, tlicon, tldesc, tlcolor]);

  return (
    <>
      <div className="TimelineItemEdit_defaultRow">Time </div>
      <div className="TimelineItemEdit_centerRow">
        <input
          onChange={(event) => {
            setTltime(event.target.value);
          }}
          value={tltime}
          className="input-text-field"
        />
      </div>
      <div className="TimelineItemEdit_defaultRow">Icon </div>
        <div className="auto-icons">
            <table className="table-icons">
                <thead>
                <tr>
                    <td>
                        <div className="input-group">
                            <input
                                onChange={onChange}
                                value={value}
                                className="input-text-field"
                                placeholder="Home.."
                            />
                            <button className="btn btn-secondary btn-icon" ><i className={ icon ? icon + ' tabler-set-icon' : 'tabler-set-icon'} /></button>
                        </div>

                    </td>
                </tr>
                </thead>
                {data}
            </table>
        </div>

        <div className="TimelineItemEdit_defaultRow">Color </div>
        <div className="TimelineItemEdit_centerRow">
            <select className="form-select" value={tlcolor} onChange={(e) => setTlcolor(e.target.value)}>
                {colors.map((item)=>{
                    return (<option key={item.value} value={item.value}>{item.text}</option>)
                })}
            </select>
        </div>

        <div className="TimelineItemEdit_defaultRow">Description </div>
      <div className="TimelineItemEdit_centerRow">
        <textarea
          onChange={(event) => {
            setTldesc(event.target.value);
          }}
          value={tldesc}
          className="input-text-field"
        />
      </div>

      <div className="TimelineItemEdit_dialogActions">
        <Button onClick={onClick}>Confirm</Button>
      </div>
    </>
  );
}
