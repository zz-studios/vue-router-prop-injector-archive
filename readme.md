# About
## Vue Router Prop Injector

Injects content into props


# Install

		npm i vue-router-prop-injector

# Usage

## VueRouterPropInjector

	import Router from 'vue-router'

	import VueRouterPropInjector from 'vue-router-prop-injector'

	const router = new Router({
		mode: 'history',
		routes: [{
				path: '/',
				components: {
					default: MainView,
				},
				// props: { mainProp: 'RouterValue' }
		}]
	})

	const content = {
		routes: [{
			path: '/',
			props: { mainProp: 'ContentValue' }
		}]
	}

	Vue.use(VueRouterPropInjector, { content, router })

# Configuration Parameters

## content
TODO: make the format a callable object...?
The structure for the content follows closely with the vue-router structure.

Please note the following diferences:
While vue-router suppors both named and unnamed routes, our structure does not. That doesn't mean we will not inject content into those routes, just that the structure of the content doesn't support it.

For example, if your route has:

	const content = {
      path: '/',
      component: MainView,
      props: { mainProp: 'Value' }
	}

Our format will still be:

	const content = {
		name: 'home',
		props: {
			default: {
				mainProp: 'Value' 
			}
		}
	}

## More details examples

	const content = {
		routes: [{
			name: 'home',
			props: {
				default: {
					mainProp: 'Content',
				},
			},
		}]
	}

### With child routes

	const content = {
		routes: [{
			props: {
				default: {
					mainProp: 'Content',
				},
			},
			children: [{ // note that with child routs, the first child is path = '' and contains the name instead of the '/' parent
				name: 'home',
				props: {
					default: {
						mainProp: 'Content',
					},
				},
			},{
				name: 'firstChild',
				props: {
					default: {
						mainProp: 'Content',
					},
				},
			}]
		}]
	}


# Other useful Objects 

## PropInjectorContent
Used internally to help get the right content as-needed.

Has one function: getContentRoutes. This takes a route name and/or fullPath and returns an array of the matched routes. This is similar to what's in 'to.matched' when routing.

	import { PropInjectorContent } from 'vue-router-prop-injector'

	const content = new PropInjectorContent(content)

	content.getContentRoutes({ name: 'home' })


This object is also available at runtime via:
	
	this.$vueRouterPropInjector.content

## PropInjector
Used to inject a prop with a value. You can set a prop to it and it will inject it.

### Constructor Parameters
* contentProp - a string or function that will return a props value 
*	fallbackProp - a prop value to fallback on if the contentProp is blank

This is used internally, but won't actually be assigned if the contentProp was blank and will fallback to the routers prop value if there is no value passed.

it has one property accessor `prop` that can be assinged to a prop.

	import { PropInjector } from './prop.injector'
	import Router from 'vue-router'

	const propInjectorWithValue = new PropInjector('test1')
	const propInjectorWithFallbackValue = new PropInjector('test2', 'test2') // obviously we ARE supplying a value!
	const propInjectorWithFunctions = new PropInjector(() => 'test1', () => 'test2')

	const router = new Router({
		mode: 'history',
		routes: [{
				path: '/',
				components: {
					default: MainView,
				},
				props: { 
					propWithValue: propInjectorWithValue.prop,
					propWithFallbackValue: propInjectorWithFallbackValue.prop,
					propWithFunctions: propInjectorWithFunctions.prop,
				}
		}]
	})


# How it works


The Vue Router Prop Injector works is fairly simple. It adds or replaces props in your Vue Router that match the route name and router view name that you specify in your content object.

So if you have a component named "MainView" and it has a prop named 'title':

	export default {
		name: 'MainView',
		props: {
			title: String,
		}
	}

And you have a route that uses that component:

	const router = new Router({
		mode: 'history',
		routes: [{
			path: '/',
			name: 'home',
			components: {
				default: MainView
			},
			props: { },
		}]
	})

And you have your content object in a similar structure:

	const content =	{
		name: 'home',
		path: '/',
		props: {
			default: {
				title: 'My Title'
			}
		},
	}

You can use it as follows:

	import VueRouterPropInjector from 'vue-router-prop-injector'
	Vue.use(VueRouterPropInjector, { content, router })

And it will go through and assign every prop that matches with the props in the content object.

# Why
OK, now you may be asking yourself why do I need to do this? Why wouldn't I just put the prop values right in my router. The answer is easy - since the content object can be injected at run time, you can source your content object from ANYWHERE.

It can come from the:
* database
* a vuex store - just set it to a getter or state object!

# History
I created this project while creating the VueCMS project because we needed just that. The ability to inject our editable content into the Vue application. But once I wrote the code for it inside of the VueCMS project, I realized it could be spun off into its own solo project.




