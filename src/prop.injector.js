const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export class PropInjector { // really this is the PropInjectorPropInjector - because I'm starting all my classes with "PropInjector" and this is the "PropInjector"
	constructor(contentProp, routerProp, componentProp) { // contentProp is already an instance of PropInjectorProp

		// since all of these can be functions that return the value, I will wrap the ones that aren't in functions anyway
		if (isFunction(contentProp)) { // note: this one is always a function now, when used internally, since I'm passing it
			this.getContentPropValue = contentProp
		} else {
			this.getContentPropValue = () => contentProp
		}

		if (isFunction(routerProp)) {
			this.getRouterPropValue = routerProp
		} else {
			this.getRouterPropValue = () => routerProp
		}

		// there can be value in the component if it's the default!
		if (isFunction(componentProp.default)) {
			this.getComponentPropDefaultValue = componentProp.default
		} else {
			this.getComponentPropDefaultValue = () => componentProp.default
		}
	}

	get value() {
		return this.getContentPropValue() ? this.getContentPropValue() : this.getRouterPropValue() ? this.getRouterPropValue() : this.getComponentPropDefaultValue()
	}
}