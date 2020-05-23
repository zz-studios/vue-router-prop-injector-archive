export class PropInjectorConfig {
	constructor(Vue, { content, router }) {
		this.router = router ? router : Vue.prototype.$router

		if (!this.router) {
			throw new Error('Please either initialize a router first, or pass it to the configuration object.');
		}

		this.content = content

		if (!this.content) {
			throw new Error('Please pass a content object or function to the configuration object.');
		}


	}



}