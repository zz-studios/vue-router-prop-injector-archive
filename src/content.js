import { PropInjectorRoute } from './route'

const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export class PropInjectorContent {
	constructor(content) {

		// Q: what if they put functions further down on their object?
		// TODO: support that!
		this._private = {
			content,
			routes: null,
			// these stacks keep a value/pair of the reoutes for easy finding
			nameStack: {},
			fullPathStack: {},
		}

		// if it's not a function, make it a function
		if (isFunction(content)) {
			this.getContent = content
		} else {
			this.getContent = () => content
		}

	}

	get routes() {
		if (!this._private.routses) { // note: routes = our PropInjectorRoute, content.routes is the raw content
			if (this._private.content.routes) { // should always have at least one route, right?
				this._private.routes = this._private.content.routes.map(contentRoute => new PropInjectorRoute(contentRoute, this))
			} else {
				this._private.routes = []
			}
		}
		return this._private.routes

	}

	inject(matched) { // the to.matched!
		if (matched && matched.length > 0) {
			const route = this.getContentRoute(matched[matched.length - 1])// we want our route object for the last in the mached chain
			if (route) {
				route.inject(matched, matched.length)
			}
		}
	}


	// this searches for a route in our content by name or fullPath
	getContentRoute({ name, fullPath }) {
		// this checks our nameStack and fullPath for routes we've already searched/loaded. That way we can just look them up.
		// note: this is not available the first time throughm since the child routes are lazy-loaded
		let route = name ? this._private.nameStack[name] : fullPath ? this._private.nameStack[name] : null

		if (!route) { // haven't found it in the stacks, so start really searching for it! (note: it builds the stacks when I do!)
			const findContentRouteRecursive = (contentRoutes, parentFullPath) => {
				for (let i = 0; i < contentRoutes.length; i++) {
					const contentRoute = contentRoutes[i]

					// if we have a full path on this item, use it - if not build it based on the parents full path so far
					const contentRouteFullPath = contentRoute.fullPath ? contentRoute.fullPath : parentFullPath + contentRoute.path

					if ((name && contentRoute.name == name)) { // we found it by name
						return contentRoute
					} else if (fullPath && !contentRoute.children && contentRouteFullPath == fullPath) { // we may have found it by route, but it could have a first child of path: '', and in that case we want to return that instead (and it has no children)
						return contentRoute
					} else if (contentRoute.children && contentRoute.children.length > 0) { // nothing found yet, search children
						return findContentRouteRecursive(contentRoute.children, contentRouteFullPath)
					}
				}
				return null // we didn't find anything at all
			}
			route = findContentRouteRecursive(this.routes, '')
		}

		return route
	}
}