/*
 * Copyright (C) 2015  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/* Following convention at
 * http://redux.js.org/docs/recipes/ServerRendering.html
 */

import * as helpers from './helpers';
import * as propHelpers from '../../server/helpers/props';
import {applyMiddleware, compose, createStore} from 'redux';
import EntityEditor from './entity-editor';
import Immutable from 'immutable';
import Layout from '../containers/layout';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import createDebounce from 'redux-debounce';


const {
	createRootReducer, getValidator, getEntitySection, shouldDevToolsBeInjected
} = helpers;

const KEYSTROKE_DEBOUNCE_TIME = 250;

const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};
const {initialState, ...rest} = props;

const EntitySection = getEntitySection(props.entityType);

const rootReducer = createRootReducer(props.entityType);
const debouncer = createDebounce({keystroke: KEYSTROKE_DEBOUNCE_TIME});
const composeEnhancers = shouldDevToolsBeInjected() ?
	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;


const store = createStore(
	rootReducer,
	Immutable.fromJS(initialState),
	composeEnhancers(applyMiddleware(debouncer, ReduxThunk))
);

const markup = (
	<Layout {...propHelpers.extractLayoutProps(rest)}>
		<Provider store={store}>
			<EntityEditor
				validate={getValidator(props.entityType)}
				{...propHelpers.extractChildProps(rest)}
			>
				<EntitySection/>
			</EntityEditor>
		</Provider>
	</Layout>
);

ReactDOM.render(markup, document.getElementById('target'));
