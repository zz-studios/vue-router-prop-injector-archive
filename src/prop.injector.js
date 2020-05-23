const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export class PropInjector {
	constructor(contentProp, fallbackProp) {

		if (isFunction(contentProp)) {
			this.getContentProp = contentProp
		} else {
			this.getContentProp = () => contentProp
		}


		if (isFunction(fallbackProp)) {
			this.getFallbackProp = fallbackProp
		} else {
			this.getFallbackProp = () => fallbackProp
		}
	}

	get prop() {
		return this.getContentProp() ? this.getContentProp() : this.getFallbackProp()
	}
}
