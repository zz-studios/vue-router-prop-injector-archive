import OurVue from './utils/vue'
import { warn } from './utils/warn'

import { PropInjector } from './prop.injector'
import { PropInjectorContent } from './content'
import { PropInjectorConfig } from './config'

const NAME = 'VueRouterPropInjector'
const PROP_NAME = '$vueRouterPropInjector'

const checkMultipleVue = (() => {
	let checkMultipleVueWarned = false

	const MULTIPLE_VUE_WARNING = [
		'Multiple instances of Vue detected!',
		'You may need to set up an alias for Vue in your bundler config.'
	].join('\n')
	return Vue => {
		/* istanbul ignore next */
		if (!checkMultipleVueWarned && OurVue !== Vue && !isJSDOM) {
			warn(MULTIPLE_VUE_WARNING)
		}
		checkMultipleVueWarned = true
	}
})()



// config:
// TODO: do we need/care about the STORE?
// - no, it should be outside of this project!
// var vueRouterPropInjectorConfig = {
//   content,
//   router,
// }
const setConfig = (config, Vue = OurVue) => {
	// Ensure we have a $bvConfig Object on the Vue prototype.
	// We set on Vue and OurVue just in case consumer has not set an alias of `vue`.

	if (config) {
		Vue.prototype[PROP_NAME] = OurVue.prototype[PROP_NAME] =
			Vue.prototype[PROP_NAME] || OurVue.prototype[PROP_NAME] || {}
		// Apply the config values

		Vue.prototype[PROP_NAME].config = new PropInjectorConfig(Vue, config)
	}
}



export const getConfig = (Vue) => Vue.prototype[PROP_NAME].config

const setContentInjector = (Vue) => {
	const config = getConfig(Vue)
	Vue.prototype[PROP_NAME].content = new PropInjectorContent(config.content)
}

export const getContent = (Vue) => Vue.prototype[PROP_NAME].content


export const getRouter = (Vue) => {
	const config = getConfig(Vue)
	const router = (config && config.router) ? config.router : Vue.prototype.$router

	if (!router) {
		throw new Error('Please either initialize a router first, or pass it to the configuration object.');
	}

	return router
}

const registerWaits = (Vue, waits) => {
	if (!waits || waits.length == 0 || !Vue) return

	if (!waits || waits.length == 0) return
	const router = getRouter(Vue)
	
	waits.forEach(wait => {
		router.beforeEach(async (to, from, next) => {
			if (!wait.ifNot({ Vue, router, to, from, next })) {
				await wait.waitFor({ Vue, router, to, from, next })
			}
			next()

		})
	})

	// TODO: move somewhere else?
	// registerContentInjection(Vue)
}

// for this attempt, the first time we hit a route, it checks
const waitForContentInjectionRoute = { // another attempte
	ifNot: () => false, // we check and get out in the waitFor because it's more complex and we don't want to do it twice!
	waitFor: ({ Vue, to }) => {

		const routes = to.matched
		const name = to.name // thanks to VueRouter for setting it on here always!


		// TODO: THIS should be what they passed in! Not our funciton.
		// - though VueCms will inject THIS as the content store!

		// TODO: pass "content" to config?
		// - or even a function?

		console.log('Vue.prototype[PROP_NAME]', Vue.prototype[PROP_NAME])

		const contentRoutes = getContent(Vue).getContentRoutes(name)

		console.log('routes', routes)
		console.log('contentRoutes', contentRoutes)
		

		if (contentRoutes.length == 0) return // we don't have any content for this route, leave it alone!


		// wait, this has to be per-routerview!
		for (let i = 0; i < routes.length; i++) {
			const route = routes[i]
			const contentRoute = contentRoutes[i]

			if (!contentRoute) {
				warn('contentRoute not nested the same as in the actual route. This can cause the side effects of igonore the parent\'s props.', route)
				break
			}

			if (contentRoute.injected) {
				// TODO: if we're basing content on a function, this may not be the case
				// - but the object we got back (which we're changing by adding injected=true, would be new anyway?)
				break // we have already injected this route (it's all or nothing with the props, right?)
			}

			const components = route.component ? { default: route.component } : route.components
			if (!components) {
				warn('contentRoute is targeting a router-view that isn\'t set on this route.', contentRoute)
				continue
			}

			// note: we loop through the props the component HAS
			// - we don't care what props some idjit may have put in the route
			for (const routeComponentView in components) { // for each of the components router views we have
				const routeComponent = components[routeComponentView]
				const contentRouteViewProps = contentRoute.props[routeComponentView]

				if (!contentRouteViewProps) continue // only touch what we need to

				const componentProps = routeComponent.props
				const routeViewProps = route.props[routeComponentView] ? route.props[routeComponentView] : route.props[routeComponentView] = {} // so it can always exists now

				for (const componentPropName in componentProps) { // we loop through the props that exist on the component
					const contentRouteViewProp = contentRouteViewProps[componentPropName]

					if (!contentRouteViewProp) continue // only touch what we need to

					// this will set it even if it didn't already exist, perfect!
					routeViewProps[componentPropName] =
						new PropInjector(
							contentRouteViewProp,
							routeViewProps[componentPropName]
						).prop
				}
			}

			contentRoute.injected = true
		}
	}
}


const waits = [waitForContentInjectionRoute]

// TODO: where t p

// TODO: my install is so simple, do I even need the factory here?

const install = (Vue, config) => {

	install.installed = true

	checkMultipleVue(Vue)
	setConfig(config, Vue)

	setContentInjector(Vue)
	// registerVuexModules(Vue, vuexModules)
	// registerRoutes(Vue, routes)
	registerWaits(Vue, waits)

	// registerComponents(Vue, components)
	// registerDirectives(Vue, directives)
	// registerPlugins(Vue, plugins)
}


// TODO: what I loaded on Vue - needs to replace theirs on the CMS routes

// new Vue({
// 	router,
// 	store,
// 	render: h => h(App),
// }).$mount('#app')


// note: we are exporting both VueRouterPropInjector AND install because in the future we may have individual features we want to be able to intall separately if need be.
const VueRouterPropInjector = {
	install,
	NAME
}


export {
	install,
	NAME,
	VueRouterPropInjector,
	PropInjector,
	PropInjectorContent,
}

export default VueRouterPropInjector