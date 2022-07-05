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
import classNames from 'classnames';
import * as React from 'react';
import ExpandSnippetIcon from '../../../components/icons/ExpandSnippetIcon';
import Line from '../../../components/SourceViewer/components/Line';
import { symbolsByLine } from '../../../components/SourceViewer/helpers/indexing';
import { getSecondaryIssueLocationsForLine } from '../../../components/SourceViewer/helpers/issueLocations';
import {
  optimizeHighlightedSymbols,
  optimizeLocationMessage
} from '../../../components/SourceViewer/helpers/lines';
import { translate } from '../../../helpers/l10n';
import { scrollHorizontally } from '../../../helpers/scrolling';
import {
  Duplication,
  ExpandDirection,
  FlowLocation,
  Issue,
  LinearIssueLocation,
  SourceLine,
  SourceViewerFile
} from '../../../types/types';
import './SnippetViewer.css';
import { LINES_BELOW_ISSUE } from './utils';

interface Props {
  component: SourceViewerFile;
  displayLineNumberOptions?: boolean;
  displaySCM?: boolean;
  duplications?: Duplication[];
  duplicationsByLine?: { [line: number]: number[] };
  expandBlock: (snippetIndex: number, direction: ExpandDirection) => Promise<void>;
  handleSymbolClick: (symbols: string[]) => void;
  highlightedLocationMessage: { index: number; text: string | undefined } | undefined;
  highlightedSymbols: string[];
  index: number;
  issue: Pick<Issue, 'key' | 'textRange' | 'line'>;
  lastSnippetOfLastGroup: boolean;
  loadDuplications?: (line: SourceLine) => void;
  locations: FlowLocation[];
  locationsByLine: { [line: number]: LinearIssueLocation[] };
  onLocationSelect: (index: number) => void;
  renderAdditionalChildInLine?: (line: SourceLine) => React.ReactNode | undefined;
  renderDuplicationPopup: (index: number, line: number) => React.ReactNode;
  scroll?: (element: HTMLElement, offset?: number) => void;
  snippet: SourceLine[];
}

export default class SnippetViewer extends React.PureComponent<Props> {
  snippetNodeRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.snippetNodeRef = React.createRef();
  }

  doScroll = (element: HTMLElement) => {
    if (this.props.scroll) {
      this.props.scroll(element);
    }
    const parent = this.snippetNodeRef.current as Element;

    if (parent) {
      const offset = parent.getBoundingClientRect().width / 2;

      scrollHorizontally(element, {
        leftOffset: offset,
        rightOffset: offset,
        parent
      });
    }
  };

  scrollToLastExpandedRow = () => {
    if (this.props.scroll) {
      const snippetNode = this.snippetNodeRef.current as Element;
      if (!snippetNode) {
        return;
      }
      const rows = snippetNode.querySelectorAll('tr');
      const lastRow = rows[rows.length - 1];
      this.props.scroll(lastRow, 100);
    }
  };

  expandBlock = (direction: ExpandDirection) => () =>
    this.props.expandBlock(this.props.index, direction).then(() => {
      if (direction === 'down') {
        this.scrollToLastExpandedRow();
      }
    });

  renderLine({
    displayDuplications,
    displaySCM,
    index,
    issueLocations,
    line,
    snippet,
    symbols,
    verticalBuffer
  }: {
    displayDuplications: boolean;
    displaySCM?: boolean;
    index: number;
    issueLocations: LinearIssueLocation[];
    line: SourceLine;
    snippet: SourceLine[];
    symbols: string[];
    verticalBuffer: number;
  }) {
    const secondaryIssueLocations = getSecondaryIssueLocationsForLine(line, this.props.locations);

    const { displayLineNumberOptions, duplications, duplicationsByLine } = this.props;
    const duplicationsCount = duplications ? duplications.length : 0;
    const lineDuplications =
      (duplicationsCount && duplicationsByLine && duplicationsByLine[line.line]) || [];

    const firstLineNumber = snippet && snippet.length ? snippet[0].line : 0;
    const noop = () => {};

    return (
      <Line
        displayCoverage={true}
        displayDuplications={displayDuplications}
        displayIssues={false}
        displayLineNumberOptions={displayLineNumberOptions}
        displayLocationMarkers={true}
        displaySCM={displaySCM}
        duplications={lineDuplications}
        duplicationsCount={duplicationsCount}
        firstLineNumber={firstLineNumber}
        highlighted={false}
        highlightedLocationMessage={optimizeLocationMessage(
          this.props.highlightedLocationMessage,
          secondaryIssueLocations
        )}
        highlightedSymbols={optimizeHighlightedSymbols(symbols, this.props.highlightedSymbols)}
        issueLocations={issueLocations}
        issues={[]}
        key={line.line}
        last={false}
        line={line}
        loadDuplications={this.props.loadDuplications || noop}
        onIssueSelect={noop}
        onIssueUnselect={noop}
        onIssuesClose={noop}
        onIssuesOpen={noop}
        onLocationSelect={this.props.onLocationSelect}
        onSymbolClick={this.props.handleSymbolClick}
        openIssues={false}
        previousLine={index > 0 ? snippet[index - 1] : undefined}
        renderDuplicationPopup={this.props.renderDuplicationPopup}
        scroll={this.doScroll}
        secondaryIssueLocations={secondaryIssueLocations}
        verticalBuffer={verticalBuffer}>
        {this.props.renderAdditionalChildInLine && this.props.renderAdditionalChildInLine(line)}
      </Line>
    );
  }

  render() {
    const {
      component,
      displaySCM,
      issue,
      lastSnippetOfLastGroup,
      locationsByLine,
      snippet
    } = this.props;
    const lastLine =
      component.measures && component.measures.lines && parseInt(component.measures.lines, 10);

    const symbols = symbolsByLine(snippet);

    const bottomLine = snippet[snippet.length - 1].line;
    const issueLine = issue.textRange ? issue.textRange.endLine : issue.line;

    const verticalBuffer =
      lastSnippetOfLastGroup && issueLine
        ? Math.max(0, LINES_BELOW_ISSUE - (bottomLine - issueLine))
        : 0;

    const displayDuplications =
      Boolean(this.props.loadDuplications) && snippet.some(s => !!s.duplicated);

    return (
      <div className="source-viewer-code snippet" ref={this.snippetNodeRef}>
        <div>
          {snippet[0].line > 1 && (
            <div className="expand-block expand-block-above">
              <button
                aria-label={translate('source_viewer.expand_above')}
                onClick={this.expandBlock('up')}
                type="button">
                <ExpandSnippetIcon />
              </button>
            </div>
          )}
          <table
            className={classNames('source-table', {
              'expand-up': snippet[0].line > 1,
              'expand-down': !lastLine || snippet[snippet.length - 1].line < lastLine
            })}>
            <tbody>
              {snippet.map((line, index) =>
                this.renderLine({
                  displayDuplications,
                  displaySCM,
                  index,
                  issueLocations: locationsByLine[line.line] || [],
                  line,
                  snippet,
                  symbols: symbols[line.line],
                  verticalBuffer: index === snippet.length - 1 ? verticalBuffer : 0
                })
              )}
            </tbody>
          </table>
          {(!lastLine || snippet[snippet.length - 1].line < lastLine) && (
            <div className="expand-block expand-block-below">
              <button
                aria-label={translate('source_viewer.expand_below')}
                onClick={this.expandBlock('down')}
                type="button">
                <ExpandSnippetIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
