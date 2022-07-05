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
package org.sonar.server.pushapi.qualityprofile;

import java.util.ArrayList;
import java.util.List;
import org.sonar.api.server.ServerSide;
import org.sonar.core.util.rule.RuleActivationListener;
import org.sonar.core.util.rule.RuleSetChangedEvent;

@ServerSide
public class StandaloneRuleActivatorEventsDistributor implements RuleActivatorEventsDistributor {

  private List<RuleActivationListener> listeners = new ArrayList<>();

  @Override
  public void subscribe(RuleActivationListener listener) {
    listeners.add(listener);
  }

  @Override
  public void pushEvent(RuleSetChangedEvent event) {
    listeners.forEach(l -> l.listen(event));
  }
}
