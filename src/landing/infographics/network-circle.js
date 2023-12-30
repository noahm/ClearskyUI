// @ts-check

/// <reference path="../../types.d.ts" />

import React from 'react';

import { FaceIcon } from './face-icon';

import './network-circle.css';

/**
 * @param {{
 *  activeAccounts?: number,
 *  deletedAccounts?: number,
 *  percentNumberBlocked1?: number,
 *  percentNumberBlocking1?: number,
 *  loading?: boolean
 * }} _
 */
export function NetworkCircle({
  activeAccounts = 2184714,
  deletedAccounts = 21034,
  percentNumberBlocked1 = 63.41,
  percentNumberBlocking1 = 40.05,
  loading }) {
  return (
    <div className='network-circle'>
      <div className='network-circle-circle'>
        <SvgCircles
          circles={[
            {
              percent: percentNumberBlocking1,
              caption: 'blocked at least by one',
              className: 'arc-percentNumberBlocking1'
            },
            {
              percent: percentNumberBlocked1,
              caption: 'blocking someone',
              className: 'arc-percentNumberBlocked1',
              expand: true
            }
          ]}
        />

        <div className='network-crowd network-active-crowd'>
          <div className='network-crowd-active-count-container'>
            <div className='network-crowd-active-count'>{activeAccounts.toLocaleString()}</div>
            <div className='network-crowd-active-label'>active accounts</div>
          </div>
          {/* 9 faces */}
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <br />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
          <br />
          <FaceIcon className='crowd-icon' />
          <FaceIcon className='crowd-icon' />
        </div>
        <div className='network-crowd network-deleted-crowd'>
          <div className='network-crowd-deleted-count-container'>
            <div className='network-crowd-deleted-count'>{deletedAccounts.toLocaleString()}</div>
            <div className='network-crowd-deleted-label'>deleted</div>
          </div>

          <FaceIcon removed className='crowd-icon crowd-icon-deleted' />
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *  className?: string,
 *  circles: {
 *   percent: number,
 *   caption: string,
 *   className?: string,
 *   fill?: string,
 *   expand?: boolean
 *  }[]
 * }} _
 */
function SvgCircles({ className, circles, ...rest }) {

  const expandSize = 10;

  const defPaths = [];

  const circleElements = circles.map(({ percent, caption, className, fill, expand }, index) => {
  
    const startPath = `M ${200 - expandSize},100`;
    const valueRad = Math.PI * 2 * (100 - percent) / 100;
    const valueX = Math.cos(valueRad) * (100 - expandSize) + 100;
    const valueY = Math.sin(valueRad) * (100 - expandSize) + 100;
    const largeArc = percent > 50 ? 1 : 0;

    const arcPath =
      `A ${100 - expandSize}, ${100 - expandSize} 0 ${largeArc},0 ${valueX.toFixed(4)},${valueY.toFixed(4)}`;

    const expandDirection = expand ? expandSize : -expandSize;

    const expandX = Math.cos(valueRad) * (100 - expandSize + expandDirection) + 100;
    const expandY = Math.sin(valueRad) * (100 - expandSize + expandDirection) + 100;

    const closeArcPath =
      `L ${expandX.toFixed(4)},${expandY.toFixed(4)} ` +
      `A ${100 - expandSize + expandDirection},${100 - expandSize + expandDirection} 0 ${largeArc},1 ${200 - expandSize + expandDirection},100`;

    const wholePath =
      startPath + ' ' + arcPath + ' ' + closeArcPath + ' Z';
    
    const textArc =
      `M ${valueX.toFixed(4)},${valueY.toFixed(4)} ` +
      `A ${100 - expandSize}, ${100 - expandSize} 0 ${largeArc},0 ${200 - expandSize},100`;
    const textArcPathId = 'path' + index;
    defPaths.push(<path key={index} id={textArcPathId} d={textArc} />);

    return (
      <React.Fragment key={index}>
        <path className={className} fill={fill} d={wholePath} />
        <textPath className='arc-text' href={'#' + textArcPathId}>
          {caption}
        </textPath>
      </React.Fragment>
    ); // startOffset='50%' textAnchor='middle'
  });

  return (
    <svg
      className={'arc-text-svg ' + (className || '')}
      {...rest}
      viewBox='0 0 200 200'
      aria-hidden='true'
      focusable='false'>
      <defs>
        {defPaths}
      </defs>
      {circleElements}
      <circle
        fill='none'
        className='arc-circle'
        cx='100' cy='100' r={100-expandSize} />
    </svg>
  );
}