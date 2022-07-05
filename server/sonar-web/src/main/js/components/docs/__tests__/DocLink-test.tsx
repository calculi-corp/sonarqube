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
import { mockAppState } from '../../../helpers/testMocks';
import { DocLink } from '../DocLink';

it('should render simple link', () => {
  expect(
    shallow(
      <DocLink appState={mockAppState({ canAdmin: false })} href="http://sample.com">
        link text
      </DocLink>
    )
  ).toMatchSnapshot();
});

it('should render documentation link', () => {
  expect(
    shallow(
      <DocLink appState={mockAppState({ canAdmin: false })} href="/foo/bar">
        link text
      </DocLink>
    )
  ).toMatchSnapshot();
});

it('should render sonarqube link on sonarqube', () => {
  const wrapper = shallow(
    <DocLink appState={mockAppState({ canAdmin: false })} href="/#sonarqube#/foo/bar">
      link text
    </DocLink>
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.find('SonarQubeLink').dive()).toMatchSnapshot();
});

it('should render sonarqube admin link on sonarqube for admin', () => {
  const wrapper = shallow(
    <DocLink appState={mockAppState({ canAdmin: true })} href="/#sonarqube-admin#/foo/bar">
      link text
    </DocLink>
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.find('SonarQubeAdminLink').dive()).toMatchSnapshot();
});

it('should not render sonarqube admin link on sonarqube for non-admin', () => {
  const wrapper = shallow(
    <DocLink appState={mockAppState({ canAdmin: false })} href="/#sonarqube-admin#/foo/bar">
      link text
    </DocLink>
  );
  expect(wrapper.find('SonarQubeAdminLink').dive()).toMatchSnapshot();
});

it('should render documentation anchor', () => {
  expect(
    shallow(
      <DocLink appState={mockAppState({ canAdmin: false })} href="#quality-profiles">
        link text
      </DocLink>
    )
  ).toMatchSnapshot();
});
