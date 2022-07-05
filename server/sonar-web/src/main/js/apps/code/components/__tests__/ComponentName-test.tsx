/*
 * SonarQube
 * Copyright (C) 2009-2022 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { shallow } from 'enzyme';
import * as React from 'react';
import { mockMainBranch } from '../../../../helpers/mocks/branch-like';
import { mockComponentMeasure } from '../../../../helpers/mocks/component';
import { ComponentQualifier } from '../../../../types/component';
import ComponentName, { getTooltip, Props } from '../ComponentName';

describe('#getTooltip', () => {
  it('should correctly format component information', () => {
    expect(getTooltip(mockComponentMeasure(true))).toMatchSnapshot();
    expect(getTooltip(mockComponentMeasure(true, { qualifier: 'UTS' }))).toMatchSnapshot();
    expect(getTooltip(mockComponentMeasure(true, { path: undefined }))).toMatchSnapshot();
    expect(getTooltip(mockComponentMeasure(false))).toMatchSnapshot();
  });
});

describe('#ComponentName', () => {
  it('should render correctly for files', () => {
    expect(shallowRender()).toMatchSnapshot();
    expect(shallowRender({ canBrowse: true })).toMatchSnapshot();
    expect(
      shallowRender({ rootComponent: mockComponentMeasure(false, { qualifier: 'TRK' }) })
    ).toMatchSnapshot();
    expect(
      shallowRender({ rootComponent: mockComponentMeasure(false, { qualifier: 'APP' }) })
    ).toMatchSnapshot();
    expect(
      shallowRender({
        component: mockComponentMeasure(true, { branch: 'foo' }),
        rootComponent: mockComponentMeasure(false, { qualifier: 'APP' })
      })
    ).toMatchSnapshot();
    expect(shallowRender({ newCodeSelected: true })).toMatchSnapshot();
    expect(shallowRender({ newCodeSelected: false })).toMatchSnapshot();
  });

  it('should render correctly for dirs', () => {
    expect(
      shallowRender({
        component: mockComponentMeasure(false, { name: 'src/main/ts/app', qualifier: 'DIR' }),
        previous: mockComponentMeasure(false, { name: 'src/main/ts/tests', qualifier: 'DIR' })
      })
    ).toMatchSnapshot();
    expect(
      shallowRender({
        component: mockComponentMeasure(false, { name: 'src', qualifier: 'DIR' }),
        previous: mockComponentMeasure(false, { name: 'lib', qualifier: 'DIR' })
      })
    ).toMatchSnapshot();
  });

  it('should render correctly for refs', () => {
    expect(
      shallowRender({
        component: mockComponentMeasure(false, {
          branch: 'foo',
          refKey: 'src/main/ts/app',
          qualifier: ComponentQualifier.Project
        })
      })
    ).toMatchSnapshot();
    expect(
      shallowRender({
        component: mockComponentMeasure(false, {
          branch: 'foo',
          refKey: 'src/main/ts/app',
          qualifier: ComponentQualifier.Project
        }),
        rootComponent: mockComponentMeasure(false, { qualifier: ComponentQualifier.Application })
      })
    ).toMatchSnapshot();

    expect(
      shallowRender({
        component: mockComponentMeasure(false, {
          refKey: 'src/main/ts/app',
          qualifier: ComponentQualifier.Project
        }),
        rootComponent: mockComponentMeasure(false, { qualifier: ComponentQualifier.Portfolio })
      })
    ).toMatchSnapshot();
  });

  it.each([
    [ComponentQualifier.Application, 'refKey'],
    [ComponentQualifier.Portfolio, 'refKey'],
    [ComponentQualifier.SubPortfolio, 'refKey'],
    [ComponentQualifier.Project, 'refKey'],
    [ComponentQualifier.Project, undefined]
  ])('should render breadcrumb correctly for %s', (qualifier, refKey) => {
    expect(
      shallowRender({
        component: mockComponentMeasure(false, {
          refKey,
          qualifier
        }),
        unclickable: true
      })
    ).toMatchSnapshot();
  });
});

function shallowRender(props: Partial<Props> = {}) {
  return shallow(
    <ComponentName
      branchLike={mockMainBranch()}
      component={mockComponentMeasure(true)}
      rootComponent={mockComponentMeasure()}
      {...props}
    />
  );
}
