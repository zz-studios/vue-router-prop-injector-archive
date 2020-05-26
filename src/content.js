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
			// these stacks keep a value/pair of the routes for easy finding the second time around
			nameStack: {},
			pathStack: {},
		}

		// if it's not a function, make it a function
		if (isFunction(content)) {
			this.getContent = content
		} else {
			this.getContent = () => content
		}

	}

	get routes() {
		if (!this._private.routes) { // note: routes = our PropInjectorRoute, content.routes is the raw content
			if (this._private.content.routes) { // should always have at least one route, right?
				this._private.routes = this._private.content.routes.map(contentRoute => new PropInjectorRoute(contentRoute, this))
			} else {
				this._private.routes = []
			}
		}
		return this._private.routes

	}

	inject(matched) { // the to.matched!
		if (matched) {
			matched.forEach(route => {
				const contentRoute = this.getContentRoute(route)// we want our route object for the last in the mached chain
				if (contentRoute) {
					contentRoute.inject(route)
				}
			})
		}
	}


	// this searches for a route in our content by name or path (note: in matches and our content path IS the fullPath)
	getContentRoute({ name, path }) {
		// note: this is not available the first time through since the child routes are lazy-loaded
		// - this is because we don't want to load ALL routes on every page
		// - note: it's highly recommened to user something like vuex-persist to hold this injector so it'll stay between page loads!
		let route = name ? this._private.nameStack[name] : path ? this._private.pathStack[path] : null

		if (!route) { // haven't found it in the stacks, so start really searching for it! (note: it builds the stacks when I do!)
			const findContentRouteRecursive = (contentRoutes) => {
				for (let i = 0; i < contentRoutes.length; i++) {
					const contentRoute = contentRoutes[i]
					if (name != undefined && contentRoute.name == name) { // we found it by name - that's unique, so we found it!
						return contentRoute
					} else if (contentRoute.path == path) { // we found it by path (here path is fullPath) - that's unique, so we found it!
						return contentRoute
					} else if (contentRoute.children && contentRoute.children.length > 0) { // nothing found yet, search children
						const foundChild = findContentRouteRecursive(contentRoute.children)
						if (foundChild) {
							return foundChild
						}
					}
				}
				return null // we didn't find anything at all
			}
			route = findContentRouteRecursive(this.routes)
		}
		return route
	}
}