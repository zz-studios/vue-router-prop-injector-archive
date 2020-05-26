import { PropInjector } from './prop.injector'

const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export class PropInjectorProp {
	constructor(contentProp) {
		// since all of these can be functions that return the value, I will wrap the ones that aren't in functions anyway
		if (isFunction(contentProp)) {
			this.getContentPropValue = contentProp
		} else {
			this.getContentPropValue = () => contentProp
		}
	}

	get value() { // note: this is the value in the conten only WITHOUT fallback
		return this.getContentPropValue()
	}

	getInjectorProp(routerProp, componentProp) { // fallbackProp = the prop value in the router
		return new PropInjector(this.value, routerProp, componentProp)
	}
}
