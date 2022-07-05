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
import { mount, ReactWrapper, shallow } from 'enzyme';
import { range, times } from 'lodash';
import * as React from 'react';
import { getSources } from '../../../../api/components';
import Issue from '../../../../components/issue/Issue';
import { mockBranch, mockMainBranch } from '../../../../helpers/mocks/branch-like';
import {
  mockSnippetsByComponent,
  mockSourceLine,
  mockSourceViewerFile
} from '../../../../helpers/mocks/sources';
import { mockFlowLocation, mockIssue } from '../../../../helpers/testMocks';
import { waitAndUpdate } from '../../../../helpers/testUtils';
import { SnippetGroup } from '../../../../types/types';
import ComponentSourceSnippetGroupViewer from '../ComponentSourceSnippetGroupViewer';
import SnippetViewer from '../SnippetViewer';

jest.mock('../../../../api/components', () => ({
  getSources: jest.fn().mockResolvedValue([])
}));

/*
 * Quick & dirty fix to make the tests pass
 * this whole thing should be replaced by RTL tests!
 */
jest.mock('react-router-dom', () => {
  const routerDom = jest.requireActual('react-router-dom');

  function Link() {
    return <div>Link</div>;
  }

  return {
    ...routerDom,
    Link
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

it('should render correctly', () => {
  expect(shallowRender()).toMatchSnapshot();
});

it('should render correctly with secondary locations', () => {
  // issue with secondary locations but no flows
  const issue = mockIssue(true, {
    component: 'project:main.js',
    flows: [],
    textRange: { startLine: 7, endLine: 7, startOffset: 5, endOffset: 10 }
  });

  const snippetGroup: SnippetGroup = {
    locations: [
      mockFlowLocation({
        component: issue.component,
        textRange: { startLine: 34, endLine: 34, startOffset: 0, endOffset: 0 }
      }),
      mockFlowLocation({
        component: issue.component,
        textRange: { startLine: 74, endLine: 74, startOffset: 0, endOffset: 0 }
      })
    ],
    ...mockSnippetsByComponent('main.js', 'project', [
      ...range(2, 17),
      ...range(29, 39),
      ...range(69, 79)
    ])
  };
  const wrapper = shallowRender({ issue, snippetGroup });
  expect(wrapper.state('snippets')).toHaveLength(3);
  expect(wrapper.state('snippets')[0]).toEqual({ index: 0, start: 2, end: 16 });
  expect(wrapper.state('snippets')[1]).toEqual({ index: 1, start: 29, end: 39 });
  expect(wrapper.state('snippets')[2]).toEqual({ index: 2, start: 69, end: 79 });
});

it('should render correctly with flows', () => {
  // issue with flows but no secondary locations
  const issue = mockIssue(true, {
    component: 'project:main.js',
    secondaryLocations: [],
    textRange: { startLine: 7, endLine: 7, startOffset: 5, endOffset: 10 }
  });

  const snippetGroup: SnippetGroup = {
    locations: [
      mockFlowLocation({
        component: issue.component,
        textRange: { startLine: 34, endLine: 34, startOffset: 0, endOffset: 0 }
      }),
      mockFlowLocation({
        component: issue.component,
        textRange: { startLine: 74, endLine: 74, startOffset: 0, endOffset: 0 }
      })
    ],
    ...mockSnippetsByComponent('main.js', 'project', [
      ...range(2, 17),
      ...range(29, 39),
      ...range(69, 79)
    ])
  };
  const wrapper = shallowRender({ issue, snippetGroup });
  expect(wrapper.state('snippets')).toHaveLength(2);
  expect(wrapper.state('snippets')[0]).toEqual({ index: 0, start: 29, end: 39 });
  expect(wrapper.state('snippets')[1]).toEqual({ index: 1, start: 69, end: 79 });

  // Check that locationsByLine is defined when isLastOccurenceOfPrimaryComponent
  expect(
    wrapper
      .find(SnippetViewer)
      .at(0)
      .props().locationsByLine
  ).not.toEqual({});

  // If not, it should be an empty object:
  const snippets = shallowRender({
    isLastOccurenceOfPrimaryComponent: false,
    issue,
    snippetGroup
  }).find(SnippetViewer);

  expect(snippets.at(0).props().locationsByLine).toEqual({});
  expect(snippets.at(1).props().locationsByLine).toEqual({});
});

it('should render file-level issue correctly', () => {
  // issue with secondary locations and no primary location
  const issue = mockIssue(true, {
    component: 'project:main.js',
    flows: [],
    textRange: undefined
  });

  const wrapper = shallowRender({
    issue,
    snippetGroup: {
      locations: [
        mockFlowLocation({
          component: issue.component,
          textRange: { startLine: 34, endLine: 34, startOffset: 0, endOffset: 0 }
        })
      ],
      ...mockSnippetsByComponent('main.js', 'project', range(29, 39))
    }
  });

  expect(wrapper.find(Issue).exists()).toBe(true);
});

it('should expand block', async () => {
  (getSources as jest.Mock).mockResolvedValueOnce(
    Object.values(mockSnippetsByComponent('a', 'project', range(6, 59)).sources)
  );
  const issue = mockIssue(true, {
    textRange: { startLine: 74, endLine: 74, startOffset: 5, endOffset: 10 }
  });
  const snippetGroup: SnippetGroup = {
    locations: [
      mockFlowLocation({
        component: 'a',
        textRange: { startLine: 74, endLine: 74, startOffset: 0, endOffset: 0 }
      }),
      mockFlowLocation({
        component: 'a',
        textRange: { startLine: 107, endLine: 107, startOffset: 0, endOffset: 0 }
      })
    ],
    ...mockSnippetsByComponent('a', 'project', [...range(69, 83), ...range(102, 112)])
  };

  const wrapper = shallowRender({ issue, snippetGroup });

  wrapper.instance().expandBlock(0, 'up');
  await waitAndUpdate(wrapper);

  expect(getSources).toHaveBeenCalledWith({ from: 9, key: 'project:a', to: 68 });
  expect(wrapper.state('snippets')).toHaveLength(2);
  expect(wrapper.state('snippets')[0]).toEqual({ index: 0, start: 19, end: 83 });
  expect(Object.keys(wrapper.state('additionalLines'))).toHaveLength(53);
});

it('should expand full component', async () => {
  (getSources as jest.Mock).mockResolvedValueOnce(
    Object.values(mockSnippetsByComponent('a', 'project', times(14)).sources)
  );
  const snippetGroup: SnippetGroup = {
    locations: [
      mockFlowLocation({
        component: 'a',
        textRange: { startLine: 3, endLine: 3, startOffset: 0, endOffset: 0 }
      }),
      mockFlowLocation({
        component: 'a',
        textRange: { startLine: 12, endLine: 12, startOffset: 0, endOffset: 0 }
      })
    ],
    ...mockSnippetsByComponent('a', 'project', [1, 2, 3, 4, 5, 10, 11, 12, 13, 14])
  };

  const wrapper = shallowRender({ snippetGroup });

  wrapper.instance().expandComponent();
  await waitAndUpdate(wrapper);

  expect(getSources).toHaveBeenCalledWith({ key: 'project:a' });
  expect(wrapper.state('snippets')).toHaveLength(1);
  expect(wrapper.state('snippets')[0]).toEqual({ index: -1, start: 0, end: 13 });
});

it('should get the right branch when expanding', async () => {
  (getSources as jest.Mock).mockResolvedValueOnce(
    Object.values(
      mockSnippetsByComponent('a', 'project', [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])
        .sources
    )
  );
  const snippetGroup: SnippetGroup = {
    locations: [mockFlowLocation()],
    ...mockSnippetsByComponent('a', 'project', [1, 2, 3, 4, 5, 6, 7])
  };

  const wrapper = shallowRender({
    branchLike: mockBranch({ name: 'asdf' }),
    snippetGroup
  });

  wrapper.instance().expandBlock(0, 'down');
  await waitAndUpdate(wrapper);

  expect(getSources).toHaveBeenCalledWith({ branch: 'asdf', from: 8, key: 'project:a', to: 67 });
});

it('should handle symbol highlighting', () => {
  const wrapper = shallowRender();
  expect(wrapper.state('highlightedSymbols')).toEqual([]);
  wrapper.instance().handleSymbolClick(['foo']);
  expect(wrapper.state('highlightedSymbols')).toEqual(['foo']);
  wrapper.instance().handleSymbolClick(['foo']);
  expect(wrapper.state('highlightedSymbols')).toEqual([]);
});

it('should correctly handle lines actions', () => {
  const snippetGroup: SnippetGroup = {
    locations: [
      mockFlowLocation({
        component: 'my-project:foo/bar.ts',
        textRange: { startLine: 34, endLine: 34, startOffset: 0, endOffset: 0 }
      }),
      mockFlowLocation({
        component: 'my-project:foo/bar.ts',
        textRange: { startLine: 54, endLine: 54, startOffset: 0, endOffset: 0 }
      })
    ],
    ...mockSnippetsByComponent('foo/bar.ts', 'my-project', [32, 33, 34, 35, 36, 52, 53, 54, 55, 56])
  };
  const loadDuplications = jest.fn();
  const renderDuplicationPopup = jest.fn();

  const wrapper = shallowRender({
    loadDuplications,
    renderDuplicationPopup,
    snippetGroup
  });

  const line = mockSourceLine();
  wrapper
    .find('SnippetViewer')
    .first()
    .prop<Function>('loadDuplications')(line);
  expect(loadDuplications).toHaveBeenCalledWith('my-project:foo/bar.ts', line);

  wrapper
    .find('SnippetViewer')
    .first()
    .prop<Function>('renderDuplicationPopup')(1, 13);
  expect(renderDuplicationPopup).toHaveBeenCalledWith(
    mockSourceViewerFile('foo/bar.ts', 'my-project'),
    1,
    13
  );
});

describe('getNodes', () => {
  const snippetGroup: SnippetGroup = {
    component: mockSourceViewerFile(),
    locations: [],
    sources: []
  };
  const wrapper = mount<ComponentSourceSnippetGroupViewer>(
    <ComponentSourceSnippetGroupViewer
      branchLike={mockMainBranch()}
      highlightedLocationMessage={{ index: 0, text: '' }}
      isLastOccurenceOfPrimaryComponent={true}
      issue={mockIssue()}
      issuesByLine={{}}
      lastSnippetGroup={false}
      loadDuplications={jest.fn()}
      locations={[]}
      onIssueChange={jest.fn()}
      onIssueSelect={jest.fn()}
      onIssuePopupToggle={jest.fn()}
      onLocationSelect={jest.fn()}
      renderDuplicationPopup={jest.fn()}
      scroll={jest.fn()}
      snippetGroup={snippetGroup}
    />
  );

  it('should return undefined if any node is missing', async () => {
    await waitAndUpdate(wrapper);
    const rootNode = wrapper.instance().rootNodeRef;
    mockDom(rootNode.current!);
    expect(wrapper.instance().getNodes(0)).toBeUndefined();
    expect(wrapper.instance().getNodes(1)).toBeUndefined();
    expect(wrapper.instance().getNodes(2)).toBeUndefined();
  });

  it('should return elements if dom is correct', async () => {
    await waitAndUpdate(wrapper);
    const rootNode = wrapper.instance().rootNodeRef;
    mockDom(rootNode.current!);
    expect(wrapper.instance().getNodes(3)).not.toBeUndefined();
  });

  it('should enable cleaning the dom', async () => {
    await waitAndUpdate(wrapper);
    const rootNode = wrapper.instance().rootNodeRef;
    mockDom(rootNode.current!);

    wrapper.instance().cleanDom(3);
    const nodes = wrapper.instance().getNodes(3);
    expect(nodes!.wrapper.style.maxHeight).toBe('');
    expect(nodes!.table.style.marginTop).toBe('');
  });
});

describe('getHeight', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const snippetGroup: SnippetGroup = {
    component: mockSourceViewerFile(),
    locations: [],
    sources: []
  };
  const wrapper = mount<ComponentSourceSnippetGroupViewer>(
    <ComponentSourceSnippetGroupViewer
      branchLike={mockMainBranch()}
      highlightedLocationMessage={{ index: 0, text: '' }}
      isLastOccurenceOfPrimaryComponent={true}
      issue={mockIssue()}
      issuesByLine={{}}
      lastSnippetGroup={false}
      loadDuplications={jest.fn()}
      locations={[]}
      onIssueChange={jest.fn()}
      onIssueSelect={jest.fn()}
      onIssuePopupToggle={jest.fn()}
      onLocationSelect={jest.fn()}
      renderDuplicationPopup={jest.fn()}
      scroll={jest.fn()}
      snippetGroup={snippetGroup}
    />
  );

  it('should set maxHeight to current height', async () => {
    await waitAndUpdate(wrapper);

    const nodes = mockDomForSizes(wrapper, { wrapperHeight: 42, tableHeight: 68 });
    wrapper.instance().setMaxHeight(0);

    expect(nodes.wrapper.getAttribute('style')).toBe('max-height: 88px;');
    expect(nodes.table.getAttribute('style')).toBeNull();
  });

  it('should set margin and then maxHeight for a nice upwards animation', async () => {
    await waitAndUpdate(wrapper);

    const nodes = mockDomForSizes(wrapper, { wrapperHeight: 42, tableHeight: 68 });
    wrapper.instance().setMaxHeight(0, undefined, true);

    expect(nodes.wrapper.getAttribute('style')).toBeNull();
    expect(nodes.table.getAttribute('style')).toBe('transition: none; margin-top: -26px;');

    jest.runAllTimers();

    expect(nodes.wrapper.getAttribute('style')).toBe('max-height: 88px;');
    expect(nodes.table.getAttribute('style')).toBe('margin-top: 0px;');
  });
});

function shallowRender(props: Partial<ComponentSourceSnippetGroupViewer['props']> = {}) {
  const snippetGroup: SnippetGroup = {
    component: mockSourceViewerFile(),
    locations: [],
    sources: []
  };
  return shallow<ComponentSourceSnippetGroupViewer>(
    <ComponentSourceSnippetGroupViewer
      branchLike={mockMainBranch()}
      highlightedLocationMessage={{ index: 0, text: '' }}
      isLastOccurenceOfPrimaryComponent={true}
      issue={mockIssue()}
      issuesByLine={{}}
      lastSnippetGroup={false}
      loadDuplications={jest.fn()}
      locations={[]}
      onIssueChange={jest.fn()}
      onIssueSelect={jest.fn()}
      onIssuePopupToggle={jest.fn()}
      onLocationSelect={jest.fn()}
      renderDuplicationPopup={jest.fn()}
      scroll={jest.fn()}
      snippetGroup={snippetGroup}
      {...props}
    />
  );
}

function mockDom(refNode: HTMLDivElement) {
  refNode.querySelector = jest.fn(query => {
    const index = query.split('-').pop();

    switch (index) {
      case '0':
        return null;
      case '1':
        return mount(<div />).getDOMNode();
      case '2':
        return mount(
          <div>
            <div className="snippet" />
          </div>
        ).getDOMNode();
      case '3':
        return mount(
          <div>
            <div className="snippet">
              <div />
            </div>
          </div>
        ).getDOMNode();
      default:
        return null;
    }
  });
}

function mockDomForSizes(
  componentWrapper: ReactWrapper<{}, {}, ComponentSourceSnippetGroupViewer>,
  { wrapperHeight = 0, tableHeight = 0 }
) {
  const wrapper = mount(<div className="snippet" />).getDOMNode();
  wrapper.getBoundingClientRect = jest.fn().mockReturnValue({ height: wrapperHeight });
  const table = mount(<div />).getDOMNode();
  table.getBoundingClientRect = jest.fn().mockReturnValue({ height: tableHeight });
  componentWrapper.instance().getNodes = jest.fn().mockReturnValue({
    wrapper,
    table
  });
  return { wrapper, table };
}
