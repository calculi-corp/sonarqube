/*
 * SonarQube
 * Copyright (C) 2009-2020 SonarSource SA
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
package org.sonar.server.platform.db.migration.version.v83;

import org.sonar.server.platform.db.migration.step.MigrationStepRegistry;
import org.sonar.server.platform.db.migration.version.DbVersion;

public class DbVersion83 implements DbVersion {
  @Override
  public void addSteps(MigrationStepRegistry registry) {
    registry
      .add(3300, "Add 'summary_comment_enabled' boolean column to 'project_alm_settings'", AddSummaryEnabledColumnToAlmSettings.class)
      .add(3301, "Enable 'summary_comment_enabled' for GitHub based projects", PopulateSummaryCommentEnabledColumnForGitHub.class)
      .add(3302, "Add 'component_uuid' column to 'properties'", AddComponentUuidColumnToProperties.class)
      .add(3303, "Migrate 'resource_id' to 'component_uuid' in 'properties'", MigrateResourceIdToUuidInProperties.class)
      .add(3304, "Remove column 'resource_id' in 'properties'", DropResourceIdFromPropertiesTable.class)
      .add(3305, "Add 'component_uuid' column to 'group_roles'", AddComponentUuidColumnToGroupRoles.class)
      .add(3306, "Migrate 'resource_id' to 'component_uuid' in 'group_roles'", MigrateResourceIdToUuidInGroupRoles.class)
      .add(3307, "Remove column 'resource_id' in 'group_roles'", DropResourceIdFromGroupRolesTable.class)
      .add(3308, "Add 'component_uuid' column to 'user_roles'", AddComponentUuidColumnToUserRoles.class)
      .add(3309, "Migrate 'resource_id' to 'component_uuid' in 'user_roles'", MigrateResourceIdToUuidInUserRoles.class)
      .add(3310, "Remove column 'resource_id' in 'user_roles'", DropResourceIdFromUserRolesTable.class)
      .add(3311, "Remove column 'id' in 'components'", DropIdFromComponentsTable.class)

      // Migration on EVENTS table
      .add(3400, "Drop primary key on 'ID' column of 'EVENTS' table", DropPrimaryKeyOnIdColumnOfEventsTable.class)
      .add(3401, "Add primary key on 'UUID' column of 'EVENTS' table", AddPrimaryKeyOnUuidColumnOfEventsTable.class)
      .add(3402, "Drop column 'ID' of 'EVENTS' table", DropIdColumnOfEventsTable.class);

    ;
  }
}
