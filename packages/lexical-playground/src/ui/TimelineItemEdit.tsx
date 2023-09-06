/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// import './TimelineItemEdit.css';

import * as React from 'react';
import {useCallback, useState} from 'react';

import AutoIcons from './AutoIcons';
import Button from './Button';

type Props = {
  onConfirm: (tltime: string, tlicon: string, tldesc: string) => void;
};

export default function TimelineItemEdit({onConfirm}: Props): JSX.Element {
  const [tltime, setTltime] = useState<string>('');
  const [tlicon, setTlicon] = useState<string>('');
  const [tldesc, setTldesc] = useState<string>('');

  const onClick = useCallback(() => {
    onConfirm(tltime, tlicon, tldesc);
  }, [onConfirm, tltime, tlicon, tldesc]);

  return (
    <>
      <div className="TimelineItemEdit_defaultRow">Time </div>
      <div className="TimelineItemEdit_centerRow">
        <input
          onChange={(event) => {
            setTltime(event.target.value);
          }}
          value={tltime}
          className="TimelineItemEdit_textArea"
        />
      </div>
      <div className="TimelineItemEdit_defaultRow">Icon (optional) </div>
      <AutoIcons />

      <div className="TimelineItemEdit_centerRow">
        <input
          onChange={(event) => {
            setTlicon(event.target.value);
          }}
          value={tlicon}
          className="TimelineItemEdit_textArea"
        />
      </div>
      <div className="TimelineItemEdit_defaultRow">Description </div>
      <div className="TimelineItemEdit_centerRow">
        <textarea
          onChange={(event) => {
            setTldesc(event.target.value);
          }}
          value={tldesc}
          className="TimelineItemEdit_textArea"
        />
      </div>

      <div className="TimelineItemEdit_dialogActions">
        <Button onClick={onClick}>Confirm</Button>
      </div>
    </>
  );
}
