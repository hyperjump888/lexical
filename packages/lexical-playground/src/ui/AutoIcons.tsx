/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './AutoIcons.css';

import * as React from 'react';
import {useState} from 'react';

//icons collection
import tablerIcons from './AutoIconsData';


export default function AutoIcons() {
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

  const changeIcon = (str:string) => {
      setIcon(`tabler-${str}`);
      setValue(str);
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


  return (
    <>
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
    </>
  );
}
