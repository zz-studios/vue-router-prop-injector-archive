const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
 }

 export class PropInjectorContent {
	constructor(content) { // TODO: what is content? a service?

console.log('content', content)
		// Q: what if they put functions further down on their object?
		// TODO: support that!

		// if it's not a function, make it a function
		if (isFunction(content)) {
			this.getContent = content
		} else {
			this.getContent = () => content
		}

	}

	getContentRoutes(name) { // returns the stack of routes matched (with parents!)
		console.log('this', this)
		const content = this.getContent()

		if (!name) return null

		const findContentRouteRecursive = (contentRoutes) => {
			console.log('contentRoutes', contentRoutes)
			for (let i = 0; i < contentRoutes.length; i++) {
				const contentRoute = contentRoutes[i]
				// TODO: } else if (route.fullPath) {
				if (contentRoute.name == name) {
					// TODO: find the component, and search UPWARDS for it!!
					return [contentRoute]
				} else if (contentRoute.children) {
					const foundRoutes = findContentRouteRecursive(contentRoute.children)
					if (foundRoutes.length > 0) {
						foundRoutes.unshift(contentRoute)
						return foundRoutes
					}
				}

				return []
			}
		}

		// TODO: parhaps cache by name?
		return findContentRouteRecursive(content.routes)



	}

	get injectContent() {
		return this.prop
	}
}
