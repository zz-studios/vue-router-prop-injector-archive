const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export class PropInjector { // really this is the PropInjectorPropInjector - because I'm starting all my classes with "PropInjector" and this is the "PropInjector"
	constructor(contentProp, routerProp, componentProp) { // contentProp is already an instance of PropInjectorProp

		// since all of these can be functions that return the value, I will wrap the ones that aren't in functions anyway
		if (isFunction(contentProp)) {
			this.getContentProp = contentProp
		} else {
			this.getContentProp = () => contentProp
		}

		if (isFunction(routerProp)) {
			this.getRouterProp = routerProp
		} else {
			this.getRouterProp = () => routerProp
		}

		// there can be value in the component if it's the default!
		if (isFunction(componentProp.default)) {
			this.getComponentPropDefault = componentProp.default
		} else {
			this.getComponentPropDefault = () => componentProp.default
		}
	}

	get value() {
		return this.getContentProp() ? this.getContentProp() : this.getRouterProp() ? this.getRouterProp() : this.getComponentPropDefault()
	}
}