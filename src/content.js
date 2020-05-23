const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export class PropInjectorContent {
	constructor(content) {

		// Q: what if they put functions further down on their object?
		// TODO: support that!

		// if it's not a function, make it a function
		if (isFunction(content)) {
			this.getContent = content
		} else {
			this.getContent = () => content
		}

	}

	getContentRoutes({ name, fullPath }) { // returns the stack of routes matched (with parents!)
		const content = this.getContent()

		console.log(name)
		if (!name && !fullPath) return []

		const findContentRouteRecursive = (contentRoutes, parentFullPath) => {
			for (let i = 0; i < contentRoutes.length; i++) {
				const contentRoute = contentRoutes[i]

				// if we have a full path on this item, use it - if not build it based on the parents full path so far
				const contentRouteFullPath = contentRoute.fullPath ? contentRoute.fullPath : parentFullPath + contentRoute.path

				// TODO: if it matches the path, I need to go ONE MORE LEVEL
				// - because we may have a first child situation...
				if ((name && contentRoute.name == name)) {
					// TODO: find the component, and search UPWARDS for it!!
					return [contentRoute]
				} else if (fullPath && !contentRoute.children && contentRouteFullPath == fullPath) {
					// if we don't have children, we found our path
					// - if we did have children we need it to match the first child with path = ''
					// - don't worry, if it doesn't, we'll try again later.
					// - note: we could have been more effecient by not continuing and just checking one recursion more
					// - I could set a final = true, but it's even more complex code
					return [contentRoute]
				} else if (contentRoute.children) {
					const foundRoutes = findContentRouteRecursive(contentRoute.children, contentRouteFullPath)
					if (foundRoutes.length > 0) {
						foundRoutes.unshift(contentRoute)
						return foundRoutes
					} else if (fullPath && contentRouteFullPath == fullPath) { // try one more time for fullpath, since none of the children had a ''
						return [contentRoute]
					}
				}

				return []
			}
		}

		// TODO: parhaps cache by name?
		return findContentRouteRecursive(content.routes, '')



	}

	get injectContent() {
		return this.prop
	}
}
