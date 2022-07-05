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
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import withCurrentUserContext from '../../../app/components/current-user/withCurrentUserContext';
import { translate } from '../../../helpers/l10n';
import { save } from '../../../helpers/storage';
import { queryToSearch } from '../../../helpers/urls';
import { RawQuery } from '../../../types/types';
import { CurrentUser, isLoggedIn } from '../../../types/users';
import { PROJECTS_ALL, PROJECTS_DEFAULT_FILTER, PROJECTS_FAVORITE } from '../utils';

interface Props {
  currentUser: CurrentUser;
  query?: RawQuery;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'button button-active' : 'button';

export class FavoriteFilter extends React.PureComponent<Props> {
  handleSaveFavorite = () => {
    save(PROJECTS_DEFAULT_FILTER, PROJECTS_FAVORITE);
  };

  handleSaveAll = () => {
    save(PROJECTS_DEFAULT_FILTER, PROJECTS_ALL);
  };

  render() {
    if (!isLoggedIn(this.props.currentUser)) {
      return null;
    }

    const pathnameForFavorite = '/projects/favorite';
    const pathnameForAll = '/projects';

    const search = queryToSearch(this.props.query);

    return (
      <div className="page-header text-center">
        <div className="button-group little-spacer-top">
          <NavLink
            className={linkClass}
            id="favorite-projects"
            onClick={this.handleSaveFavorite}
            to={{ pathname: pathnameForFavorite, search }}>
            {translate('my_favorites')}
          </NavLink>
          <NavLink
            end={true}
            className={linkClass}
            id="all-projects"
            onClick={this.handleSaveAll}
            to={{ pathname: pathnameForAll, search }}>
            {translate('all')}
          </NavLink>
        </div>
      </div>
    );
  }
}

export default withCurrentUserContext(FavoriteFilter);
