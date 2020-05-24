import { PropInjectorProp } from './prop'

export class PropInjectorRoute {
	constructor(contentRoute, parent) {
		this._private = {
			level: (parent && parent.level) ? parent.level + 1 : 1,
			contentRoute,
			props: null,
			children: null,
			parent, // careful: this is the PropInjectorContent above the first level (but that has no level! there eis no router level! moo.)
			nameStack: parent._private.nameStack,
			fullPathStack: parent._private.fullPathStack,
		}

		this.injected = false

		this.contentRoutes = parent.contentRoutes ? [...parent.contentRoutes, this] : [this] // the stack of my routes with parents! note: the last one will always

		// add myself to the stacks I'm needed in!
		if (this.name) {
			this._private.nameStack[this.name] = this
		}

		if (this.fullPath) { // note in the case where the child's path='', this should just replace its parent - perfect!
			this._private.fullPathStack[this.fullPath] = this
		}
	}

	get fullPath() {
		return this._private.contentRoute.fullPath
	}

	get name() {
		return this._private.contentRoute.name
	}

	get path() {
		return this._private.contentRoute.path
	}

	get props() {
		if (!this._private.props) {
			const props = {}
			if (this._private.contentRoute.props) {
				for (const contentComponentViewName in this._private.contentRoute.props) { // we loop through the props that exist on the component
					const contentProps = this._private.contentRoute.props[contentComponentViewName]
					if (!contentProps) continue // none specified, get out now, while you can

					const componentProps = props[contentComponentViewName] = {}

					for (const contentPropName in contentProps) { // we loop through the props that exist on the component
						const contentProp = contentProps[contentPropName]
						componentProps[contentPropName] = new PropInjectorProp(contentProp)
					}
				}
			}
			this._private.props = props
		}

		return this._private.props
	}

	get children() {
		if (!this._private.children) {
			if (this._private.contentRoute.children) {
				this._private.children = this._private.contentRoute.children.map(contentRoute => new PropInjectorRoute(contentRoute, this))
			} else {
				this._private.children = []
			}
		}
		return this._private.children
	}

	inject(matched, level) {
		const route = matched[level - 1]

		if (level < 0) {
			warn('contentRoute not nested the same as in the actual route. This can cause the side effects of igonore the parent\'s props.', route)
			return
		}

		if (this.injected) {
			return // we have already injected this route (it's all or nothing with the props, right?)
		}

		const components = route.component ? { default: route.component } : route.components
		if (!components) {
			warn('contentRoute is targeting a router-view that isn\'t set on this route.', this)
			return
		}

		// note: we loop through the props the component HAS
		// - we don't care what props some idjit may have put in the route
		for (const routeComponentView in components) { // for each of the components router views we have
			const routeComponent = components[routeComponentView]
			const propInjectorProps = this.props[routeComponentView]

			if (!propInjectorProps) continue // only touch what we need to

			const componentProps = routeComponent.props
			const routeProps = route.props[routeComponentView] ? route.props[routeComponentView] : route.props[routeComponentView] = {} // so it can always exists now

			for (const componentPropName in componentProps) { // we loop through the props that exist on the component
				const propInjectorProp = propInjectorProps[componentPropName]
				if (!propInjectorProp) continue // only touch what we need to

				// either of these can be undefined. That's perfectly fine. 
				// note: our component value will fall back to routeProp falls back to componentProp.default
				// - but - the coninue above these comments will prevent that from even existing!
				const componentProp = componentProps[componentPropName]
				const routeProp = routeProps[componentPropName]


				// this will set it even if it didn't already exist, perfect!
				routeProps[componentPropName] = propInjectorProp
					.getInjectorProp(routeProp, componentProp)
					.value // a getter that will actually get the value
			}
		}

		this.injected = true // no need to do all this again (right?)

		if (level > 1 && this._private.parent) { // when we have a list of matched routes, we setup the injection to the whole chain
			this._private.parent.inject(matched, level - 1)
		}
	}
}
