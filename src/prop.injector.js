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


		if (isFunction(contentProp)) {
			this.getFallbackProp = contentProp
		} else {
			this.getFallbackProp = () => contentProp
		}
	}

	get prop() {
		return this.getContentProp() ? this.getContentProp() : this.getFallbackProp()
	}
}
