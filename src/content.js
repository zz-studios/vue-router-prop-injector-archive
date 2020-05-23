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

		if (!name && !fullPath) return []

		const findContentRouteRecursive = (contentRoutes, parentFullPath) => {
			for (let i = 0; i < contentRoutes.length; i++) {
				const contentRoute = contentRoutes[i]

				// if we have a full path on this item, use it - if not build it based on the parents full path so far
				const contentRouteFullPath = contentRoute.fullPath ? contentRoute.fullPath : parentFullPath + contentRoute.path
				if ((name && contentRoute.name == name) || (fullPath && contentRouteFullPath == fullPath)) {
					// TODO: find the component, and search UPWARDS for it!!
					return [contentRoute]
				} else if (contentRoute.children) {
					const foundRoutes = findContentRouteRecursive(contentRoute.children, contentRouteFullPath)
					if (foundRoutes.length > 0) {
						foundRoutes.unshift(contentRoute)
						return foundRoutes
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
