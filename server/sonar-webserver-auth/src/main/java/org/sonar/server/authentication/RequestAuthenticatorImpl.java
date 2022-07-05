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
package org.sonar.server.authentication;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.sonar.db.user.UserDto;
import org.sonar.server.user.UserSession;
import org.sonar.server.user.UserSessionFactory;
import org.sonar.server.usertoken.UserTokenAuthentication;
import org.springframework.beans.factory.annotation.Autowired;

import static java.util.Objects.nonNull;
import static org.sonar.server.authentication.UserAuthResult.AuthType.BASIC;
import static org.sonar.server.authentication.UserAuthResult.AuthType.JWT;
import static org.sonar.server.authentication.UserAuthResult.AuthType.SSO;
import static org.sonar.server.authentication.UserAuthResult.AuthType.TOKEN;

public class RequestAuthenticatorImpl implements RequestAuthenticator {

  private final JwtHttpHandler jwtHttpHandler;
  private final BasicAuthentication basicAuthentication;
  private final UserTokenAuthentication userTokenAuthentication;
  private final HttpHeadersAuthentication httpHeadersAuthentication;
  private final UserSessionFactory userSessionFactory;
  private final List<CustomAuthentication> customAuthentications;

  @Autowired(required = false)
  public RequestAuthenticatorImpl(JwtHttpHandler jwtHttpHandler, BasicAuthentication basicAuthentication, UserTokenAuthentication userTokenAuthentication,
    HttpHeadersAuthentication httpHeadersAuthentication,
    UserSessionFactory userSessionFactory, CustomAuthentication[] customAuthentications) {
    this.jwtHttpHandler = jwtHttpHandler;
    this.basicAuthentication = basicAuthentication;
    this.userTokenAuthentication = userTokenAuthentication;
    this.httpHeadersAuthentication = httpHeadersAuthentication;
    this.userSessionFactory = userSessionFactory;
    this.customAuthentications = Arrays.asList(customAuthentications);
  }

  @Autowired(required = false)
  public RequestAuthenticatorImpl(JwtHttpHandler jwtHttpHandler, BasicAuthentication basicAuthentication, UserTokenAuthentication userTokenAuthentication,
    HttpHeadersAuthentication httpHeadersAuthentication,
    UserSessionFactory userSessionFactory) {
    this(jwtHttpHandler, basicAuthentication, userTokenAuthentication, httpHeadersAuthentication, userSessionFactory, new CustomAuthentication[0]);
  }

  @Override
  public UserSession authenticate(HttpServletRequest request, HttpServletResponse response) {
    for (CustomAuthentication customAuthentication : customAuthentications) {
      Optional<UserSession> session = customAuthentication.authenticate(request, response);
      if (session.isPresent()) {
        return session.get();
      }
    }

    UserAuthResult userAuthResult = loadUser(request, response);
    if (nonNull(userAuthResult.getUserDto())) {
      if (TOKEN.equals(userAuthResult.getAuthType())) {
        return userSessionFactory.create(userAuthResult.getUserDto(), userAuthResult.getTokenDto());
      }
      return userSessionFactory.create(userAuthResult.getUserDto());
    }
    return userSessionFactory.createAnonymous();
  }

  private UserAuthResult loadUser(HttpServletRequest request, HttpServletResponse response) {
    // Try first to authenticate from SSO, then JWT token, then try from basic http header

    // SSO authentication should come first in order to update JWT if user from header is not the same is user from JWT
    Optional<UserDto> user = httpHeadersAuthentication.authenticate(request, response);
    if (user.isPresent()) {
      return new UserAuthResult(user.get(), SSO);
    }
    user = jwtHttpHandler.validateToken(request, response);
    if (user.isPresent()) {
      return new UserAuthResult(user.get(), JWT);
    }

    // Check if the authentication is token based
    Optional<UserAuthResult> userAuthResult = userTokenAuthentication.authenticate(request);
    if (userAuthResult.isPresent()) {
      return userAuthResult.get();
    }

    user = basicAuthentication.authenticate(request);
    return user.map(userDto -> new UserAuthResult(userDto, BASIC))
      .orElseGet(UserAuthResult::new);
  }

}
