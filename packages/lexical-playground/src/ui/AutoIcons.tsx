/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* tbody html
<tr>
                        <td>
                            <button className="btn btn-secondary btn-icon btn-warning btn-icon-selected"
                                    value="tabler-123" title="tabler-123" style=""><i className=" tabler-123"></i>
                            </button>
                        </td>
                        <td>
                            <button className="btn btn-secondary btn-icon" value="tabler-24-hours"
                                    title="tabler-24-hours" style=""><i className=" tabler-24-hours"></i></button>
                        </td>
                        <td>
                            <button className="btn btn-secondary btn-icon" value="tabler-2fa" title="tabler-2fa"
                                    style=""><i className=" tabler-2fa"></i></button>
                        </td>
                        <td>
                            <button className="btn btn-secondary btn-icon" value="tabler-360-view"
                                    title="tabler-360-view" style=""><i className=" tabler-360-view"></i></button>
                        </td>
                    </tr>

 */

import './AutoIcons.css';

import * as React from 'react';
import {useState} from 'react';

//icons collection
import tablerIcons from './AutoIconsData';
import Button from './Button';

export default function AutoIcons() {
  const [value, setValue] = useState<string>('');
  const [data, setData] = useState<JSX.Element>(<div />);

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

  const dataBody = (arr: string[]) => {
    return (
      <div className="divicons">

          {arr.map((item) => {
            const tablerItem = `tabler-${item}`;
            return (
                <button className="btn btn-secondary btn-icon" value={item}>
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
              <td colSpan={4}>
                <input
                  onChange={onChange}
                  value={value}
                  className="searchInput"
                  placeholder="Home.."
                />
              </td>
            </tr>
          </thead>
          {data}
        </table>
      </div>
    </>
  );
}
