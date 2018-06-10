# translate-great

An experiment in translating dynamic web app user interfaces **in context**.

Similar to [Mozilla Pontoon](https://pontoon.mozilla.org/),
this is intended to help translators by giving them full context of what they're translating,
however it attempts to solve the problem of *dynamic* UIs, such as menus and error messages,
rather than just static pages.
The functionality could eventually be merged into Mozilla Pontoon (potentially).
(Or for all I know, it could have this as a feature already! But I doubt it. Wouldn't they advertise that? 😄)

### How's this supposed to work?

By simply providing a way to use a *custom function* for showing UI elements for a given translation string.

For example, for [jspaint](https://github.com/1j01/jspaint/) I might do something like this (for the menus):

```js
function findStringInUI(stringToFind){
	var el = findStringInDOM(stringToFind);
	if(el){
		var menu_container = el.closest(".menu-container");
		var menu_button = el.closest(".menu-button");
		var menu_item = el.closest(".menu-item");
		if(menu_button){
			return {
				element: menu_button,
				show: function(){
					// nothing needed except for Extras menu if it's hidden
					// TODO: how about don't hide the Extras menu
				},
			}
		}else if(menu_item){
			return {
				element: menu_item,
				show: function(){
					// Note: this might get more complicated when I split the menu popups out into a different container from the menu bar
					var menu_button = menu_container.querySelector(".menu-button");
					$(menu_button).trigger("pointerdown");
					$(menu_button).trigger("pointerup");
					// TODO: handle submenus
					// TODO: handle hidden Extras menu or just stop hiding it
				},
			};
		}
	}
}
```

Try running the code so far ([*show-string-in-user-interface.js*](show-string-in-user-interface.js))
in the devtools on [jspaint.app](https://jspaint.app/).
