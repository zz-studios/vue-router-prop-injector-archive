import { PropInjector } from './prop.injector'

const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export class PropInjectorProp {
	constructor(contentProp) {
		this._private = {
			contentProp,
		}
	}

	getInjectorProp(routerProp, componentProp) { // fallbackProp = the prop value in the router
		return new PropInjector(this._private.contentProp, routerProp, componentProp)
	}
}
